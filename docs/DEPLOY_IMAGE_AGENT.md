# 画像生成エージェント Cloud Run デプロイ手順

このドキュメントでは、画像生成エージェント（ai-article-imager-for-wordpress）をGoogle Cloud Runにデプロイする手順を説明します。

## 前提条件

- GCPプロジェクトが作成済み
- gcloud CLIがインストール済み（Cloud Shellを使用する場合は不要）
- 以下のAPIキー・設定を取得済み：
  - Gemini APIキー（複数キー対応: `API_KEY`, `API_KEY_2`, `API_KEY_3`）
  - バックエンドサーバーURL
  - 内部API認証キー（`INTERNAL_API_KEY`）
- Secret Managerに必要なシークレットが登録済み

## 必要なファイル

デプロイには以下のファイルが必要です：

### 0. Secret Managerにシークレットを登録

以下のシークレットをSecret Managerに登録してください：

| シークレット名 | 説明 |
|---------------|------|
| `GEMINI_API_KEY` | Gemini API認証キー（メイン） |
| `GEMINI_API_KEY_2` | Gemini API認証キー（予備1） |
| `GEMINI_API_KEY_3` | Gemini API認証キー（予備2） |
| `INTERNAL_API_KEY` | 内部API認証用キー |

> **注意**: 複数のGemini APIキーはレート制限対策として使用されます。

### 1. Dockerfile

`ai-article-imager-for-wordpress/Dockerfile`:

```dockerfile
# 画像生成エージェント用 Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 依存関係インストール
COPY package*.json ./
RUN npm ci

# ソースコードをコピー
COPY . .

# ビルド時の環境変数
ARG VITE_GEMINI_API_KEY
ARG VITE_GEMINI_API_KEY_2
ARG VITE_GEMINI_API_KEY_3
ARG VITE_API_URL
ARG VITE_INTERNAL_API_KEY
ARG VITE_MAIN_APP_URL
ARG VITE_WP_DEFAULT_POST_STATUS

# .envファイルを作成（Viteが読み込めるように）
RUN echo "GEMINI_API_KEY=${VITE_GEMINI_API_KEY}" > .env && \
    echo "API_KEY_2=${VITE_GEMINI_API_KEY_2}" >> .env && \
    echo "API_KEY_3=${VITE_GEMINI_API_KEY_3}" >> .env && \
    echo "VITE_API_URL=${VITE_API_URL}" >> .env && \
    echo "VITE_INTERNAL_API_KEY=${VITE_INTERNAL_API_KEY}" >> .env && \
    echo "VITE_MAIN_APP_URL=${VITE_MAIN_APP_URL}" >> .env && \
    echo "VITE_WP_DEFAULT_POST_STATUS=${VITE_WP_DEFAULT_POST_STATUS}" >> .env

# ビルド
RUN npm run build

# 本番用イメージ
FROM nginx:alpine

# ビルド成果物をコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

### 2. nginx.conf

`ai-article-imager-for-wordpress/nginx.conf`:

```nginx
server {
    listen 8080;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # gzip圧縮
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPAのルーティング対応
    location / {
        try_files $uri $uri/ /index.html;
    }

    # キャッシュ設定
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. cloudbuild.yaml

`ai-article-imager-for-wordpress/cloudbuild.yaml`:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'VITE_GEMINI_API_KEY=$_GEMINI_API_KEY'
      - '--build-arg'
      - 'VITE_GEMINI_API_KEY_2=$_GEMINI_API_KEY_2'
      - '--build-arg'
      - 'VITE_GEMINI_API_KEY_3=$_GEMINI_API_KEY_3'
      - '--build-arg'
      - 'VITE_API_URL=$_API_URL'
      - '--build-arg'
      - 'VITE_INTERNAL_API_KEY=$_INTERNAL_API_KEY'
      - '--build-arg'
      - 'VITE_MAIN_APP_URL=$_MAIN_APP_URL'
      - '--build-arg'
      - 'VITE_WP_DEFAULT_POST_STATUS=$_WP_DEFAULT_POST_STATUS'
      - '-t'
      - 'asia-northeast1-docker.pkg.dev/${PROJECT_ID}/seo-app/ai-article-imager'
      - '.'
images:
  - 'asia-northeast1-docker.pkg.dev/${PROJECT_ID}/seo-app/ai-article-imager'
```

> **注意**: `${PROJECT_ID}` は実際のプロジェクトIDに置き換えてください（例: `seo-agent-476808`）

### 環境変数の説明

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_API_URL` | バックエンドサーバーのURL | `https://backend-server-xxx.run.app/api` |
| `VITE_INTERNAL_API_KEY` | バックエンドAPI認証キー | Secret Managerから取得 |
| `VITE_MAIN_APP_URL` | SEOエージェントのURL（記事連携用） | `https://seo-frontend-xxx.run.app` |
| `VITE_WP_DEFAULT_POST_STATUS` | WordPress投稿のデフォルトステータス | `draft` または `publish` |

---

## デプロイ手順

### ステップ1: Cloud Shellを開く

1. [GCPコンソール](https://console.cloud.google.com)にアクセス
2. 右上の **Cloud Shellアイコン**（`>_` マーク）をクリック

### ステップ2: プロジェクトを確認

```bash
gcloud config get-value project
```

正しいプロジェクトでない場合：
```bash
gcloud config set project YOUR_PROJECT_ID
```

### ステップ3: ソースコードをアップロード（初回のみ）

#### 方法A: GitHubからクローン
```bash
git clone YOUR_REPOSITORY_URL
cd seo-content-generator
```

#### 方法B: ZIPでアップロード
1. Cloud Shell右上の「︙」メニュー → 「アップロード」
2. ZIPファイルを選択してアップロード
3. 解凍:
```bash
unzip seo-content-generator.zip
cd seo-content-generator
```

### ステップ4: Artifact Registryリポジトリを作成（初回のみ）

1. GCPコンソール → 「Artifact Registry」
2. 「リポジトリを作成」をクリック
3. 以下を設定：
   - 名前: `seo-app`
   - 形式: `Docker`
   - リージョン: `asia-northeast1`
4. 「作成」をクリック

### ステップ5: イメージをビルド

```bash
cd ai-article-imager-for-wordpress

# Secret Managerからキーを取得
export GEMINI_KEY=$(gcloud secrets versions access latest --secret=GEMINI_API_KEY)
export GEMINI_KEY_2=$(gcloud secrets versions access latest --secret=GEMINI_API_KEY_2)
export GEMINI_KEY_3=$(gcloud secrets versions access latest --secret=GEMINI_API_KEY_3)
export INTERNAL_KEY=$(gcloud secrets versions access latest --secret=INTERNAL_API_KEY)

# 他のサービスのURL（デプロイ後に設定）
export API_URL="https://backend-server-xxxxx-an.a.run.app/api"
export MAIN_APP_URL="https://seo-frontend-xxxxx-an.a.run.app"
export WP_STATUS="draft"

# ビルド実行
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_GEMINI_API_KEY="$GEMINI_KEY",_GEMINI_API_KEY_2="$GEMINI_KEY_2",_GEMINI_API_KEY_3="$GEMINI_KEY_3",_API_URL="$API_URL",_INTERNAL_API_KEY="$INTERNAL_KEY",_MAIN_APP_URL="$MAIN_APP_URL",_WP_DEFAULT_POST_STATUS="$WP_STATUS"
```

> **重要**: `API_URL` と `MAIN_APP_URL` は、それぞれバックエンドサーバーとSEOエージェントをデプロイした後のURLに置き換えてください。

成功すると以下のように表示されます：
```
STATUS: SUCCESS
```

### ステップ6: Cloud Runにデプロイ（GUI）

1. GCPコンソール → **「Cloud Run」**

2. **「サービスを作成」** をクリック

3. **「既存のコンテナイメージから1つのリビジョンをデプロイする」** を選択

4. **「選択」** → **「Artifact Registry」** タブ → 以下を展開：
   - `asia-northeast1`
   - `seo-app`
   - `ai-article-imager`
   - 最新のイメージを選択

5. 設定：

| 項目 | 値 |
|------|-----|
| サービス名 | `ai-article-imager` |
| リージョン | `asia-northeast1（東京）` |
| 認証 | 「未認証の呼び出しを許可」にチェック |

6. **「作成」** をクリック

### ステップ7: 動作確認

デプロイ完了後、表示されるURL（例: `https://ai-article-imager-xxxxx-an.a.run.app`）にアクセス。

画像生成エージェントの画面が表示されれば成功です。

---

## 更新時のデプロイ手順

コードを更新した場合は、以下の手順で再デプロイします：

### 1. 再ビルド

```bash
cd ~/seo-content-generator/ai-article-imager-for-wordpress

# Secret Managerからキーを取得
export GEMINI_KEY=$(gcloud secrets versions access latest --secret=GEMINI_API_KEY)
export GEMINI_KEY_2=$(gcloud secrets versions access latest --secret=GEMINI_API_KEY_2)
export GEMINI_KEY_3=$(gcloud secrets versions access latest --secret=GEMINI_API_KEY_3)
export INTERNAL_KEY=$(gcloud secrets versions access latest --secret=INTERNAL_API_KEY)
export API_URL="https://backend-server-xxxxx-an.a.run.app/api"
export MAIN_APP_URL="https://seo-frontend-xxxxx-an.a.run.app"
export WP_STATUS="draft"

gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_GEMINI_API_KEY="$GEMINI_KEY",_GEMINI_API_KEY_2="$GEMINI_KEY_2",_GEMINI_API_KEY_3="$GEMINI_KEY_3",_API_URL="$API_URL",_INTERNAL_API_KEY="$INTERNAL_KEY",_MAIN_APP_URL="$MAIN_APP_URL",_WP_DEFAULT_POST_STATUS="$WP_STATUS"
```

### 2. 新しいリビジョンをデプロイ（GUI）

1. Cloud Run → `ai-article-imager` サービスをクリック
2. **「新しいリビジョンの編集とデプロイ」** をクリック
3. コンテナイメージの **「選択」** をクリック
4. 最新のイメージを選択
5. **「デプロイ」** をクリック

---

## トラブルシューティング

### エラー: `npm ci` で失敗

```
npm error A complete log of this run can be found in...
```

**解決方法**: `package-lock.json` を再生成
```bash
rm package-lock.json
npm install
```

### エラー: `gcr.io repo does not exist`

```
denied: gcr.io repo does not exist
```

**解決方法**: Artifact Registryリポジトリを作成（ステップ4参照）

### エラー: `An API Key must be set when running in a browser`

ブラウザコンソールに表示される場合。

**原因**: APIキーがビルド時に埋め込まれていない

**解決方法**:
1. Dockerfileに `.env` ファイル作成の行があるか確認
2. `cloudbuild.yaml` で `--build-arg` が正しく設定されているか確認
3. Secret Managerの `GEMINI_API_KEY` が正しく設定されているか確認

### エラー: `--build-arg unrecognized arguments`

```
ERROR: (gcloud.builds.submit) unrecognized arguments: --build-arg
```

**原因**: `gcloud builds submit` では `--build-arg` は直接使えない

**解決方法**: `cloudbuild.yaml` を使用してビルド

---

## 関連ドキュメント

- [SEOエージェント デプロイ手順](./DEPLOY_SEO_AGENT.md)
- [バックエンドサーバー デプロイ手順](./DEPLOY_BACKEND_SERVER.md)

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-05 | 初版作成 |
