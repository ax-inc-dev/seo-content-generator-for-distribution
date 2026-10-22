"""Build real Dockerfiles and smoke-test without credentials or external traffic."""

import json
import os
import platform
import subprocess
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
RESULTS = {}
NODE = "v24.22.1"
FIXTURE_KEY = "node24-validation-fixture"


def docker(*args, capture=True, check=True):
    return subprocess.run(
        ["docker", *args], cwd=ROOT, text=True, capture_output=capture, check=check
    )


def build(app, context, builder=False):
    tag = f"node24-{app}:ci"
    if builder:
        builder_tag = f"node24-{app}-builder:ci"
        docker("build", "--platform", "linux/amd64", "--target", "builder",
               "--tag", builder_tag, context, capture=False)
        probe = docker("run", "--rm", "--network", "none", "--entrypoint", "node",
                       builder_tag, "-e",
                       "console.log(process.version);"
                       f"if(process.version!=={json.dumps(NODE)})process.exit(1)")
        RESULTS[app]["builderNode"] = probe.stdout.strip()
    docker("build", "--platform", "linux/amd64", "--tag", tag, context, capture=False)
    info = json.loads(docker("image", "inspect", tag, "--format", "{{json .}}").stdout)
    assert info["Architecture"] == "amd64" and info["Os"] == "linux", info
    RESULTS[app].update(imageId=info["Id"], architecture=info["Architecture"], os=info["Os"])
    return tag


def running(name):
    return docker("inspect", name, "--format", "{{.State.Running}}").stdout.strip() == "true"


def frontend_smoke(name):
    while True:
        probe = docker("exec", name, "wget", "-q", "-O", "-", "http://127.0.0.1:8080/", check=False)
        if probe.returncode == 0:
            assert "<html" in probe.stdout.lower(), "Frontend did not return HTML"
            return {"httpStatus": 200, "htmlBytes": len(probe.stdout.encode())}
        if "Connection refused" not in probe.stderr or not running(name):
            raise RuntimeError(probe.stderr or "Frontend exited before becoming ready")
        time.sleep(1)


HEALTH = r"""(async()=>{
  const health=await fetch('http://127.0.0.1:8080/api/health');
  const data=await health.json();
  const auth=await fetch('http://127.0.0.1:8080/api/scrape',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:'https://example.invalid'})});
  const result={node:process.version,arch:process.arch,health:health.status,healthStatus:data.status,unauthorizedStatus:auth.status};
  console.log(JSON.stringify(result));
  if(process.version!=='v24.22.1'||process.arch!=='x64'||health.status!==200||data.status!=='ok'||auth.status!==401)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});"""

PUPPETEER = r"""(async()=>{
  const fs=require('node:fs'),vm=require('node:vm'),puppeteer=require('puppeteer');
  const source=fs.readFileSync('/app/scraping-server-full.js','utf8');
  const launch=source.match(/browser = await puppeteer\.launch\((\{[\s\S]*?\n\s*\})\);/);
  if(!launch)throw Error('Cannot find the actual server launch options');
  const options=vm.runInNewContext('('+launch[1]+')');
  const browser=await puppeteer.launch(options);
  try{
    const page=await browser.newPage();let external=0;
    await page.setRequestInterception(true);
    page.on('request',r=>{if(/^(about:|data:)/.test(r.url()))r.continue();else{external++;r.abort();}});
    await page.setContent('<!doctype html><html><body><h1>Node24 Linux smoke</h1><script>window.node24Smoke=42</script></body></html>');
    const title=await page.$eval('h1',e=>e.textContent),value=await page.evaluate(()=>window.node24Smoke);
    console.log(JSON.stringify({node:process.version,arch:process.arch,browser:await browser.version(),title,value,externalRequests:external,launchOptionsSource:'scraping-server-full.js:initBrowser'}));
    if(title!=='Node24 Linux smoke'||value!==42||external!==0)process.exitCode=1;
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});"""


def server_smoke(name):
    while True:
        logs = docker("logs", name)
        if "Server is listening on port" in logs.stdout:
            break
        if not running(name):
            raise RuntimeError("Server exited during startup: " + logs.stdout + logs.stderr)
        time.sleep(1)
    assert "PUPPETEER_SKIP_DOWNLOAD: true" in logs.stdout, "Download setting is missing from startup diagnostics"
    health = docker("exec", name, "node", "-e", HEALTH)
    browser = docker("exec", name, "node", "-e", PUPPETEER)
    return {"http": json.loads(health.stdout), "puppeteer": json.loads(browser.stdout)}


def smoke(app, tag):
    name = f"node24-smoke-{app}-{os.getpid()}"
    args = ["run", "--platform", "linux/amd64", "--pull", "never", "--network", "none", "-d", "--name", name]
    if app == "server":
        args += ["-e", f"INTERNAL_API_KEY={FIXTURE_KEY}"]
    docker(*args, tag)
    try:
        RESULTS[app].update(server_smoke(name) if app == "server" else frontend_smoke(name))
        RESULTS[app]["passed"] = True
    finally:
        logs = docker("logs", name, check=False)
        print(logs.stdout, end="")
        print(logs.stderr, end="")
        docker("rm", "-f", name)


def main():
    assert platform.system() == "Linux" and platform.machine() == "x86_64", "Native Linux amd64 is required"
    print(json.dumps({"hostOs": platform.system(), "hostArch": platform.machine()}), flush=True)
    for app, context, builder in [("frontend", ".", True), ("imager", "ai-article-imager-for-wordpress", True), ("server", "server", False)]:
        RESULTS[app] = {"passed": False, "network": "none"}
        tag = build(app, context, builder)
        smoke(app, tag)
        print(json.dumps({app: RESULTS[app]}), flush=True)


if __name__ == "__main__":
    try:
        main()
    finally:
        result = json.dumps(RESULTS, ensure_ascii=False, indent=2)
        print(result, flush=True)
        output = Path(os.environ.get("RUNNER_TEMP", "/tmp")) / "node24-docker-results.json"
        output.write_text(result)
        if os.environ.get("GITHUB_STEP_SUMMARY"):
            with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as summary:
                summary.write("## Native Linux amd64 Docker smoke\n\n```json\n" + result + "\n```\n")
