import React, { useState } from "react";
import type { SeoOutline } from "../types";

interface ArticleDisplayProps {
  article: {
    title: string;
    metaDescription: string;
    htmlContent: string;
    plainText: string;
  };
  keyword: string;
  outline: SeoOutline | null;
  onEditClick?: () => void;
  onOpenImageAgent?: (articleData: {
    title: string;
    content: string;
    keyword: string;
    autoMode?: boolean;
  }) => void;
}

const ArticleDisplay: React.FC<ArticleDisplayProps> = ({
  article,
  keyword,
  outline,
  onEditClick,
  onOpenImageAgent,
}) => {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copyButtonText, setCopyButtonText] = useState("HTMLコピー");

  const handleCopyHtml = () => {
    navigator.clipboard
      .writeText(article.htmlContent)
      .then(() => {
        setCopyButtonText("コピーしました！");
        setTimeout(() => {
          setCopyButtonText("HTMLコピー");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("コピーに失敗しました");
      });
  };

  const handleDownloadText = () => {
    const content = `タイトル: ${article.title}

メタディスクリプション: ${article.metaDescription}

---

${article.plainText}`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${keyword.replace(/\s+/g, "_")}_article.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenImageGenerator = () => {
    // 画像生成エージェントに記事データを渡す
    // 修正済みの最新記事を優先的に使用
    const articleData = {
      title: article.title,
      htmlContent: article.htmlContent, // 常に最新の記事内容を使用
      metaDescription: article.metaDescription,
      keyword: keyword,
      slug: (article as any).slug || "auto-generated",
    };

    console.log("🎨 画像生成エージェントへデータを送信");
    console.log(`  - タイトル: ${articleData.title}`);
    console.log(`  - 記事文字数: ${articleData.htmlContent.length}文字`);
    console.log(`  - キーワード: ${articleData.keyword}`);

    // localStorageにデータを保存（AI Article Imager for WordPressが読み込み用）
    localStorage.setItem("articleDataForImageGen", JSON.stringify(articleData));

    // iframe版で開く
    if (onOpenImageAgent) {
      console.log("🖼️ 画像生成エージェントをiframeで開きます...");
      onOpenImageAgent({
        title: articleData.title,
        content: articleData.htmlContent,
        keyword: articleData.keyword,
        autoMode: false, // 手動なのでautoModeはfalse
        metaDescription: articleData.metaDescription,
        slug: articleData.slug,
        isTestMode: false,
      });
      console.log("✅ iframe起動完了");
    } else {
      // フォールバック: 別タブで開く
      const imageGenUrl =
        import.meta.env.VITE_IMAGE_GEN_URL ||
        "https://ai-article-imager-for-wordpress.vercel.app";
      const imageGenOrigin = new URL(imageGenUrl).origin;

      console.log(`🚀 AI Article Imager for WordPressを開きます: ${imageGenUrl}`);
      const newWindow = window.open(imageGenUrl, "_blank");

      if (newWindow) {
        setTimeout(() => {
          console.log(
            "📮 AI Article Imager for WordPressにpostMessageでデータを送信中..."
          );
          newWindow.postMessage(
            {
              type: "ARTICLE_DATA",
              data: articleData,
            },
            imageGenOrigin
          );
          console.log("✅ postMessage送信完了");
        }, 3000);
      }
    }
  };

  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${article.metaDescription}">
  <title>${article.title}</title>
  <style>
    body { font-family: sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
    h1 { color: #1e40af; border-bottom: 3px solid #0066cc; padding-bottom: 15px; font-size: 2em; margin-bottom: 30px; }
    h2 { color: #1e3a8a; margin-top: 40px; margin-bottom: 20px; font-size: 1.5em; font-weight: bold; padding-bottom: 10px; border-bottom: 2px solid #ddd; }
    h3 { color: #1d4ed8; margin-top: 30px; margin-bottom: 15px; font-size: 1.25em; font-weight: bold; }
    p { margin: 15px 0; }
    strong, b { color: #1e3a8a; font-weight: bold; }
    ul, ol { margin: 20px 0; padding-left: 30px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <h1>${article.title}</h1>
  ${article.htmlContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${keyword.replace(/\s+/g, "_")}_article.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            生成された記事
            <span className="text-sm text-gray-500">- {keyword}</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("preview")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "preview"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              プレビュー
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "code"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              HTMLコード
            </button>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2 justify-end flex-wrap">
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2"
              title="記事編集モーダルを開く"
            >
              編集を再開
            </button>
          )}
          <button
            onClick={handleCopyHtml}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-200"
          >
            {copyButtonText}
          </button>
          <button
            onClick={handleDownloadText}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            テキストDL
          </button>
          <button
            onClick={handleDownloadHtml}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            HTML DL
          </button>
          <button
            onClick={handleOpenImageGenerator}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all flex items-center gap-2 font-semibold shadow-sm animate-pulse"
            title="画像生成エージェントで記事に画像を挿入"
          >
            画像生成へ
          </button>
        </div>
      </div>

      {/* 記事情報 */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-600 mb-3">記事情報</h3>
        <div className="space-y-2">
          <div>
            <span className="text-gray-500">タイトル:</span>
            <p className="text-gray-800 mt-1">{article.title}</p>
          </div>
          <div>
            <span className="text-gray-500">メタディスクリプション:</span>
            <p className="text-gray-800 mt-1">{article.metaDescription}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <span className="text-gray-500">文字数:</span>
              <span className="ml-2 text-gray-800">
                {article.plainText.length.toLocaleString()}文字
              </span>
            </div>
            {outline?.characterCountAnalysis && (
              <div>
                <span className="text-gray-500">推奨文字数:</span>
                <span className="ml-2 text-gray-800">
                  {outline.characterCountAnalysis.average.toLocaleString()}文字
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {viewMode === "preview" ? (
          // プレビューモード
          <div className="bg-white rounded-lg p-8 text-gray-900">
            <h1 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-blue-600">
              {article.title}
            </h1>
            <div
              className="prose prose-lg max-w-none
                prose-h2:text-2xl prose-h2:font-bold prose-h2:text-blue-900 prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b-2 prose-h2:border-blue-200
                prose-h3:text-xl prose-h3:font-bold prose-h3:text-blue-700 prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:text-blue-900 prose-strong:font-bold
                prose-ul:my-4 prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: article.htmlContent }}
            />
          </div>
        ) : (
          // コードモード
          <div className="p-4">
            <pre className="bg-gray-50 text-gray-800 font-mono text-sm p-4 rounded-lg overflow-auto max-h-[600px] border border-gray-200">
              <code>{article.htmlContent}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDisplay;
