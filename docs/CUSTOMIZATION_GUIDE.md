# SEOコンテンツ生成ツール カスタマイズガイド

このガイドでは、配布版SEOエージェントを自社用にカスタマイズする方法を説明します。

---

## 目次

1. [カスタマイズの概要](#カスタマイズの概要)
2. [フル自動モード・スプシモードの仕組み](#フル自動モードスプシモードの仕組み)
3. [STEP 1: 基本設定（環境変数）](#step-1-基本設定環境変数)
4. [STEP 2: 自社ブランド設定](#step-2-自社ブランド設定)
5. [STEP 3: 自社実績データの登録](#step-3-自社実績データの登録)
6. [STEP 4: デフォルト画像の差し替え](#step-4-デフォルト画像の差し替え)
7. [STEP 5: 出典URL優先順位の設定](#step-5-出典url優先順位の設定)
8. [STEP 6: スプレッドシートのセットアップ](#step-6-スプレッドシートのセットアップ)
9. [STEP 7: 一次情報DB（Supabase）のセットアップ（オプション）](#step-7-一次情報dbsupabaseのセットアップオプション)
10. [オプション: 高度なカスタマイズ](#オプション-高度なカスタマイズ)
11. [カスタマイズ項目一覧](#カスタマイズ項目一覧)
12. [元プロジェクトとの詳細差分](#元プロジェクトとの詳細差分)

---

## カスタマイズの概要

### 配布版の特徴

配布版SEOエージェントは、特定企業の情報を削除し、環境変数で設定可能な汎用版です。

| 項目 | 配布版の状態 | カスタマイズ方法 |
|------|-------------|-----------------|
| サービス名 | 「当社サービス」 | 環境変数で設定 |
| 会社名 | 「当社」 | 環境変数で設定 |
| 自社実績データ | サンプルデータ（A社、B社等） | Google Drive連携 or コード修正 |
| デフォルト画像 | 汎用画像 | 画像ファイル差し替え |
| 出典優先URL | 未設定 | 環境変数で設定 |

### カスタマイズレベル

1. **レベル1（環境変数のみ）**: `.env`ファイルの編集だけで完了
2. **レベル2（ファイル差し替え）**: 画像ファイル等の差し替え
3. **レベル3（コード修正）**: TypeScript/JavaScriptファイルの編集

---

## フル自動モード・スプシモードの仕組み

記事生成の流れと、各ステップで自社データがどう使われるかを理解しておくと、カスタマイズの効果がわかりやすくなります。

### 記事生成フロー

```
1. キーワード入力（手動 or スプレッドシートから取得）
   ↓
2. 競合調査（Google検索で上位記事を分析）
   ↓
3. 構成生成（H2/H3の見出し構成を作成）
   ├─ 自社サービス訴求セクションを含む
   └─ VITE_SERVICE_NAME が使用される
   ↓
4. 記事執筆（セクションごとに執筆）
   ├─ 自社実績データが引用される（companyDataService）
   └─ 出典URLの優先順位が適用される（citationUtils）
   ↓
5. 最終校閲（ファクトチェック）
   ├─ 自社情報は外部裏取り不要と判定
   └─ VITE_COMPANY_NAME で自社判定
   ↓
6. 画像生成・WordPress投稿
   ├─ デフォルト画像が使用される
   └─ スプレッドシートに結果を書き戻し
```

### 自社データが使われる箇所

| ステップ | 使用データ | 設定方法 |
|----------|-----------|----------|
| 構成生成 | サービス名 | `VITE_SERVICE_NAME` |
| 記事執筆 | 自社実績データ | `companyMasterData.ts` or Google Drive |
| 記事執筆 | 出典URL優先順位 | `VITE_COMPANY_NOTE_URL` 等 |
| 最終校閲 | 自社判定 | `VITE_COMPANY_NAME` |
| 画像生成 | デフォルト画像 | `default-images/` フォルダ |

### スプレッドシートモードの動作

スプレッドシートモードでは、Google Sheetsからキーワードを読み込み、処理結果を書き戻します。

**配布版のスプレッドシートフォーマット:**

| 列 | 内容 | 読取/書込 |
|----|------|----------|
| A列 | No.（連番） | - |
| B列 | KW（キーワード） | 読取 |
| C列 | 編集用URL / マーカー | 読取(`1`or`１`) → 書込(URL) |
| D列 | Slug | 書込 |
| E列 | タイトル | 書込 |
| F列 | 公開用URL | 読取（内部リンク用） |
| G列 | メタディスクリプション | 書込 |

> **処理対象の指定**: C列に `1`（半角）または `１`（全角）を入力

---

## STEP 1: 基本設定（環境変数）

### 1.1 .envファイルの作成

```bash
cp .env.example .env
```

### 1.2 必須設定

```env
# Gemini API Key（Google AI Studio で取得）
GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Google Search API（競合調査用）
GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

---

## STEP 2: 自社ブランド設定

### 2.1 サービス名・会社名の設定

`.env`ファイルに以下を追加：

```env
# 自社サービス名（記事内の「自社サービス訴求」セクションで使用）
VITE_SERVICE_NAME=〇〇サービス

# 自社会社名（ファクトチェック等で使用）
VITE_COMPANY_NAME=株式会社〇〇
```

### 2.2 使用箇所

| 環境変数 | 使用箇所 | 例 |
|----------|---------|-----|
| `VITE_SERVICE_NAME` | 記事内のサービス訴求セクション | 「〇〇サービスで業務効率化」 |
| `VITE_COMPANY_NAME` | ファクトチェック時の自社判定 | 自社情報は外部裏取り不要と判定 |

---

## STEP 3: 自社実績データの登録

自社の導入実績・成功事例を記事に反映させる方法です。

### 方法A: Google Drive連携（推奨）

Google Driveに実績データCSVを配置し、API経由で取得します。

#### 3.1 CSVファイルの作成

以下の形式でCSVファイルを作成：

```csv
segment_id,source_id,file_name,title,text,summary,labels
001,doc1,実績資料.pdf,A社導入事例,"A社では当サービス導入により...",LP制作時間93%削減,導入事例
002,doc2,実績資料.pdf,B社導入事例,"B社では原稿執筆時間が...",原稿執筆99%削減,導入事例
```

#### 3.2 Google Driveにアップロード

1. Google Driveに専用フォルダを作成
2. CSVファイル（`pdf_segments_index.csv`）をアップロード
3. フォルダIDを取得（URLの`/folders/`以降の文字列）

#### 3.3 環境変数の設定

```env
# Google DriveフォルダID
COMPANY_DATA_FOLDER_ID=your_folder_id_here
```

#### 3.4 サービスアカウントの共有設定

フォルダをサービスアカウントに共有（詳細は`DEPLOY_MANUAL.md`参照）

### 方法B: コード直接編集

`services/companyMasterData.ts`を編集して実績データを登録：

```typescript
export const COMPANY_MASTER: Record<string, CompanyInfo> = {
  '導入企業A社': {
    fullName: '株式会社A',
    displayName: 'A社',
    industry: 'マーケティング支援',
    ceo: '山田太郎',
    results: {
      before: 'LP制作外注費10万円/月',
      after: 'LP制作費0円',
      timeReduction: '制作時間3日→2時間',
      improvement: 'LP制作の内製化を実現、93%削減'
    },
    details: 'AIへの教育に注力し、内製化を実現',
    noteUrl: 'https://note.com/yourcompany/n/xxxxx'
  },
  // 他の企業も同様に追加...
};
```

### 方法C: フォールバックデータの編集

Google Drive連携を使わない場合、`services/companyDataService.ts`の`getFallbackData()`を編集：

```typescript
private getFallbackData(): CompanyData[] {
  return [
    {
      company: "導入企業A社",
      industry: "マーケティング支援",
      challenge: "LP制作の外注費用と制作時間の削減",
      actions: "当サービスを導入し、LP制作の内製化を実現",
      result: {
        before: "LP外注費10万円/月、制作時間3営業日",
        after: "LP制作費0円、制作時間2時間",
        delta: "LP制作の内製化を実現、制作時間93%削減",
      },
      source: {
        title: "導入事例インタビュー",
        page: 1,
      },
    },
    // 他の実績も追加...
  ];
}
```

---

## STEP 4: デフォルト画像の差し替え

記事内で使用するデフォルト画像を自社用に差し替えます。

### 4.1 画像ファイルの場所

```
ai-article-imager-for-wordpress/public/default-images/
├── サービス訴求.png      ← 自社サービス訴求セクション用
├── とは・概要.jpg        ← 概要説明セクション用
├── メリット・おすすめ.png ← メリット紹介セクション用
├── デメリット・リスク.jpg ← デメリット説明セクション用
├── 解決策・ポイント.png   ← 解決策セクション用
├── よくある質問・FAQ.png  ← FAQセクション用
└── manifest.json         ← 画像マッピング設定
```

### 4.2 画像の差し替え

1. 同じファイル名で自社画像を用意
2. 既存ファイルを上書き

### 4.3 manifest.jsonの編集（必要に応じて）

新しい画像カテゴリを追加する場合：

```json
{
  "version": "1.0",
  "images": {
    "サービス訴求": "サービス訴求.png",
    "とは・概要": "とは・概要.jpg",
    "メリット・おすすめ": "メリット・おすすめ.png",
    "新カテゴリ": "新カテゴリ.png"
  }
}
```

---

## STEP 5: 出典URL優先順位の設定

記事内で出典を引用する際、自社URLを優先させる設定です。

### 5.1 環境変数の設定

```env
# 自社noteアカウントURL（最優先）
VITE_COMPANY_NOTE_URL=note.com/yourcompany

# 自社メディアサイトURL（次点）
VITE_COMPANY_MEDIA_URL=media.yourcompany.com

# 自社コーポレートサイトURL
VITE_COMPANY_SITE_URL=yourcompany.com
```

### 5.2 動作

設定後、出典URLは以下の優先順位で選択されます：

1. `VITE_COMPANY_NOTE_URL` に一致するURL
2. `VITE_COMPANY_MEDIA_URL` に一致するURL
3. その他のURL

---

## STEP 6: スプレッドシートのセットアップ

フル自動モード・スプシモードで記事を量産するための設定です。

### 6.1 スプレッドシートの作成

Google Sheetsで新規スプレッドシートを作成し、以下のフォーマットで設定：

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| No. | KW | 編集用URL | Slug | タイトル | 公開用URL | メタディスク |
| 1 | AI研修 助成金 | 1 | | | | |
| 2 | 生成AI 業務効率化 | 1 | | | | |
| 3 | ChatGPT 社内研修 | | | | | |

- **処理したい行**: C列に `1` を入力
- **処理しない行**: C列は空欄のまま

### 6.2 内部リンク用URLの設定（オプション）

記事内に内部リンクを自動挿入したい場合、F列に公開URLを入力：

| B | F |
|---|---|
| AI研修 助成金 | https://example.com/ai-training-subsidy |
| 生成AI 業務効率化 | https://example.com/ai-efficiency |

執筆時、記事内に該当キーワードが出現すると、自動でリンクが挿入されます。

### 6.3 環境変数の設定

```env
# スプレッドシートID（URLの /d/ と /edit の間）
SPREADSHEET_ID=1ABC123xyz...
```

### 6.4 サービスアカウントの設定

詳細は `DEPLOY_MANUAL.md` の「スプレッドシート機能の設定」を参照。

---

## STEP 7: 一次情報DB（Supabase）のセットアップ（オプション）

Supabaseを使った一次情報データベース機能は**オプション**です。設定しなくても記事生成は動作しますが、設定すると自社の専門知識・ノウハウを記事に反映できます。

### 7.1 機能概要

Supabaseは一次情報（自社ノウハウ、専門知識、FAQ等）を蓄積・検索するために使用されます。

**使用箇所:**
- `services/outlineGeneratorV2.ts` - 構成生成時に関連情報を検索
- `services/writingAgentV3.ts` - 記事執筆時に関連情報を検索

**未設定時の動作:**
環境変数が未設定の場合、警告ログが出力されますが、エラーにはならず記事生成は継続されます。

```
[Supabase] 環境変数が設定されていません。Supabase機能は無効化されます。
[PrimaryData] Supabase未設定のため、検索をスキップします
```

### 7.2 環境変数の設定

Supabaseを使用する場合、以下の環境変数を設定：

```env
# Supabase接続情報
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 7.3 テーブル構造

本ツールは以下のテーブル構造を前提としています（`services/supabaseClient.ts`より）：

| テーブル | 用途 |
|---------|------|
| `sources` | ソース文書の管理（PDF、動画、Webページ等） |
| `documents` | ドキュメント（セクション単位） |
| `chunks` | 実際のコンテンツ（文単位、全文検索用） |

**chunksテーブルの主要カラム:**
- `sentence`: 検索対象のテキスト
- `category`: カテゴリ（絞り込み用）
- `tags`: タグ配列（絞り込み用）
- `source_ref_url`: 出典URL

### 7.4 検索の仕組み

`primaryDataService.ts`で提供される検索機能：

- **キーワード検索**: `sentence`カラムに対するILIKE部分一致検索
- **カテゴリ絞り込み**: `category`カラムで絞り込み
- **タグ絞り込み**: `tags`配列に対するAND条件検索

検索結果はマークダウン形式に整形され、AIへのプロンプトに追加されます。

---

## オプション: 高度なカスタマイズ

### 記事構成テンプレートの変更

`services/outlineGeneratorV2.ts`を編集して、H2/H3の構成パターンを変更できます。

### 執筆プロンプトの調整

`services/writingAgentV3.ts`内のYAML形式プロンプトを編集して、執筆スタイルを調整できます。

### ファクトチェック設定

`services/finalProofreadingAgent.ts`を編集して、ファクトチェックの厳格度を調整できます。

---

## カスタマイズ項目一覧

### 環境変数一覧

| 環境変数 | 必須 | 説明 | 例 |
|----------|------|------|-----|
| `VITE_SERVICE_NAME` | - | 自社サービス名 | `AI研修サービス` |
| `VITE_COMPANY_NAME` | - | 自社会社名 | `株式会社〇〇` |
| `VITE_COMPANY_NOTE_URL` | - | 自社noteURL | `note.com/yourcompany` |
| `VITE_COMPANY_MEDIA_URL` | - | 自社メディアURL | `media.yourcompany.com` |
| `VITE_COMPANY_SITE_URL` | - | 自社サイトURL | `yourcompany.com` |
| `COMPANY_DATA_FOLDER_ID` | - | 実績データフォルダID | `1ABC...xyz` |
| `VITE_SUPABASE_URL` | - | Supabase URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | - | Supabase匿名キー | `eyJhbGci...` |

### ファイル一覧

| ファイル | カスタマイズ内容 |
|----------|-----------------|
| `.env` | 環境変数設定 |
| `services/companyMasterData.ts` | 自社クライアント実績データ |
| `services/companyDataService.ts` | フォールバック実績データ |
| `ai-article-imager-for-wordpress/public/default-images/` | デフォルト画像 |
| `services/outlineGeneratorV2.ts` | 記事構成テンプレート |
| `services/writingAgentV3.ts` | 執筆プロンプト |
| `services/supabaseClient.ts` | Supabase接続設定 |
| `services/primaryDataService.ts` | 一次情報検索サービス |

---

## トラブルシューティング

### 実績データが反映されない

1. Google Drive連携の場合：フォルダ共有設定を確認
2. コード直接編集の場合：ビルドを再実行（`npm run build`）

### サービス名が「当社サービス」のまま

1. `.env`ファイルに`VITE_SERVICE_NAME`が設定されているか確認
2. 本番環境の場合：Cloud Runの環境変数を確認
3. ビルドを再実行（Viteは環境変数をビルド時に埋め込む）

### 画像が表示されない

1. ファイル名が正確か確認（日本語ファイル名に注意）
2. manifest.jsonの設定を確認
3. ブラウザキャッシュをクリア

---

## 元プロジェクトとの詳細差分

配布版を作成するにあたり、以下の変更が行われました。自社用にカスタマイズする際の参考にしてください。

### 1. companyMasterData.ts（自社クライアント実績）

**元プロジェクト（実データあり）:**
```typescript
export const COMPANY_MASTER: Record<string, CompanyInfo> = {
  'グラシズ': {
    fullName: '株式会社グラシズ',
    displayName: 'グラシズ社',
    industry: 'リスティング広告運用企業',
    ceo: '土谷武史',
    results: {
      before: 'LPライティング外注費10万円/月',
      after: 'LP制作費0円',
      timeReduction: '制作時間3営業日→2時間',
      improvement: 'LP制作の内製化を実現、制作時間93%削減'
    },
    details: 'AIへの教育に注力し、内製化を実現',
    noteUrl: 'https://note.com/onte/n/n5e82ea313e40'
  },
  'Route66': { ... },
  'WISDOM': { ... },
  // 合計10社以上の実績データ
};
```

**配布版（空のスタブ）:**
```typescript
export const COMPANY_MASTER: Record<string, CompanyInfo> = {};
```

→ **カスタマイズ**: 自社クライアントの実績を同じ形式で追加

### 2. citationUtils.ts（出典URL優先順位）

**元プロジェクト（ハードコード）:**
```typescript
// note.com/onte を最優先
const noteUrl = urls.find((url) => url.includes("note.com/onte"));
if (noteUrl) return noteUrl;

// フォールバック: media.a-x.inc
const mediaUrl = urls.find((url) => url.includes("media.a-x.inc"));
```

**配布版（環境変数化）:**
```typescript
const COMPANY_NOTE_URL = import.meta.env.VITE_COMPANY_NOTE_URL || "";
const COMPANY_MEDIA_URL = import.meta.env.VITE_COMPANY_MEDIA_URL || "";

if (COMPANY_NOTE_URL) {
  const noteUrl = urls.find((url) => url.includes(COMPANY_NOTE_URL));
  if (noteUrl) return noteUrl;
}
```

→ **カスタマイズ**: 環境変数で自社URLを設定するだけでOK

### 3. companyDataService.ts（フォールバック実績）

**元プロジェクト（実企業名）:**
```typescript
private getFallbackData(): CompanyData[] {
  return [
    {
      company: "グラシズ",
      industry: COMPANY_MASTER["グラシズ"].industry,
      challenge: "LP制作の外注費用と制作時間の削減",
      actions: "AX CAMPの研修を受講し、AI活用によるLP制作の内製化を実現",
      // ...
    },
  ];
}
```

**配布版（匿名サンプル）:**
```typescript
private getFallbackData(): CompanyData[] {
  return [
    {
      company: "A社",
      industry: "マーケティング支援",
      challenge: "LP制作の外注費用と制作時間の削減",
      actions: "業務効率化プログラムを導入し、LP制作の内製化を実現",
      // ...
    },
  ];
}
```

→ **カスタマイズ**: 自社の実績データに書き換え

### 4. スプレッドシートフォーマット

**元プロジェクト（14列）:**
| 列 | 内容 |
|----|------|
| B列 | KW |
| C列 | （未使用） |
| D列 | マーカー（■） |
| G列 | Slug |
| H列 | タイトル |
| M列 | 公開用URL |
| N列 | メタディスク |

**配布版（7列・簡略化）:**
| 列 | 内容 |
|----|------|
| A列 | No. |
| B列 | KW |
| C列 | マーカー（1）/ 編集URL |
| D列 | Slug |
| E列 | タイトル |
| F列 | 公開用URL |
| G列 | メタディスク |

→ **カスタマイズ**: 配布版のフォーマットをそのまま使用推奨

### 5. ファイル名の変更

| 元プロジェクト | 配布版 | 内容 |
|---------------|--------|------|
| `axCampService.ts` | `companyService.ts` | 自社サービス情報 |
| `axCampDataReader.ts` | `companyDataReader.ts` | データ読み込み |
| `AxCampAgent.ts` | `CompanyAgent.ts` | 校閲エージェント |
| `AX CAMP.png` | `サービス訴求.png` | デフォルト画像 |

### 6. 削除されたファイル

- `curriculum-pdfs/` - 研修資料PDF（13ファイル）
- `scripts/*.py` - Python処理スクリプト（11ファイル）
- `ax-camp-curriculum-optimized.yaml` - カリキュラムデータ
- `data/ax-camp-*.json` - 専用データファイル

### 7. 環境変数化された項目

| 項目 | 元の値 | 環境変数 |
|------|--------|----------|
| サービス名 | `AX CAMP` | `VITE_SERVICE_NAME` |
| 会社名 | `AX` | `VITE_COMPANY_NAME` |
| noteURL | `note.com/onte` | `VITE_COMPANY_NOTE_URL` |
| メディアURL | `media.a-x.inc` | `VITE_COMPANY_MEDIA_URL` |
| DriveフォルダID | 固定ID | `COMPANY_DATA_FOLDER_ID` |
| スプレッドシートID | 固定ID | `SPREADSHEET_ID` |

---

## まとめ: カスタマイズの優先順位

フル自動モード・スプシモードで記事を量産する場合、以下の順序でカスタマイズすることを推奨：

1. **必須**: 環境変数の設定（`.env`）
2. **推奨**: 自社実績データの登録（Google Drive or コード）
3. **推奨**: 出典URL優先順位の設定
4. **任意**: デフォルト画像の差し替え
5. **任意**: スプレッドシートのセットアップ
