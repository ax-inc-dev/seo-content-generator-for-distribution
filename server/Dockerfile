# Cloud Run用 Dockerfile (scraping-server-full.js対応)
FROM node:24.22.1-bookworm-slim

# Puppeteer用の依存関係をインストール
RUN apt-get update \
    && apt-get install -y ca-certificates wget gnupg \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリを設定
WORKDIR /app

# 本番環境フラグとPuppeteerのダウンロードをスキップ
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Lockfileに従ってインストール（Cloud Runはlinux/amd64を使用）
COPY package*.json check-node.cjs .npmrc ./
RUN PUPPETEER_SKIP_DOWNLOAD=true npm ci --omit=dev

# アプリケーションのソースコードをコピー
COPY . .

# Puppeteerがインストール済みのChromiumを使用するように設定
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# ポートを環境変数から取得（Cloud Runのデフォルト）
ENV PORT=8080

# 非rootユーザーを作成してセキュリティを向上
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads /home/pptruser/.cache \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Chrome用の追加設定
RUN chmod 755 /usr/bin/google-chrome-stable

# 非rootユーザーに切り替え
USER pptruser

# アプリケーションを起動
CMD ["node", "scraping-server-full.js"]
