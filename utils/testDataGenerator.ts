// テスト用構成データジェネレーター
import type { SeoOutline } from '../types';

export const testOutlines = {
  // 「とは」系の記事構成
  whatIs: {
    keyword: "SEO対策とは",
    outline: {
      title: "【2025年最新】SEO対策とは？基本から実践まで徹底解説",
      targetAudience: "SEO対策について初めて学ぶWebサイト運営者、マーケティング担当者",
      introduction: "SEO対策に興味はあるけれど、何から始めればいいか分からない。そんな悩みを持つ方に向けて、SEO対策の基本概念から具体的な実践方法まで、わかりやすく解説します。",
      outline: [
        {
          heading: "SEO対策の基本概念",
          subheadings: [
            { text: "SEOとは", writingNote: "Search Engine Optimizationの略称説明、検索エンジンの仕組み" },
            { text: "SEO対策の目的", writingNote: "集客向上、ブランド認知、売上向上について" }
          ],
          writingNote: "初心者にもわかりやすく、専門用語を噛み砕いて説明",
          imageSuggestion: "検索エンジンの仕組みを示す図解"
        },
        {
          heading: "SEO対策の3つの種類",
          subheadings: [
            { text: "1. 内部対策", writingNote: "サイト構造、コンテンツ最適化、メタタグ設定" },
            { text: "2. 外部対策", writingNote: "被リンク獲得、サイテーション、ブランド言及" },
            { text: "3. テクニカルSEO", writingNote: "サイト速度、モバイル対応、構造化データ" }
          ],
          writingNote: "各対策の重要性と具体例を交えて解説",
          imageSuggestion: "3つの対策の関係性を示すベン図"
        },
        {
          heading: "SEO対策のメリット・デメリット",
          subheadings: [
            { text: "SEO対策のメリット", writingNote: "長期的な集客効果、費用対効果、信頼性向上" },
            { text: "SEO対策のデメリット", writingNote: "即効性の低さ、継続的な作業、アルゴリズム変更リスク" }
          ],
          writingNote: "公平な視点で両面を解説",
        },
        {
          heading: "今すぐ始められるSEO対策",
          subheadings: [
            { text: "キーワード選定", writingNote: "ツールの使い方、選定基準、競合分析" },
            { text: "コンテンツ作成", writingNote: "ユーザーファースト、E-E-A-T、独自性" },
            { text: "内部リンク最適化", writingNote: "効果的な内部リンクの張り方、アンカーテキスト" }
          ],
          writingNote: "実践的で具体的なアクションを提示"
        },
        {
          heading: "まとめ：SEO対策で成果を出すために",
          subheadings: [],
          writingNote: "記事の要点をまとめ、次のアクションを促す"
        }
      ],
      conclusion: "SEO対策は一朝一夕では成果が出ませんが、正しい知識と継続的な取り組みにより、必ず成果につながります。まずは基本を理解し、できることから始めていきましょう。",
      keywords: ["SEO", "検索エンジン", "対策", "最適化", "Google", "コンテンツ", "キーワード", "順位", "上位表示", "内部対策"],
      characterCountAnalysis: {
        average: 5000,
        median: 4800,
        min: 3500,
        max: 6500,
        analyzedArticles: 10
      },
      competitorResearch: {
        keyword: "SEO対策とは",
        analyzedAt: new Date().toISOString(),
        totalArticlesScanned: 10,
        validArticles: [],
        excludedCount: 0,
        commonTopics: ["基本概念", "種類", "メリット", "実践方法"],
        recommendedWordCount: {
          min: 3500,
          max: 6500,
          optimal: 5000
        },
        frequencyWords: [
          { word: "SEO", count: 150, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
          { word: "対策", count: 120, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
          { word: "検索", count: 100, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
          { word: "コンテンツ", count: 80, articleCount: 9, articles: [1,2,3,4,5,6,7,8,9] },
          { word: "サイト", count: 75, articleCount: 9, articles: [1,2,3,4,5,6,7,8,9] },
          { word: "Google", count: 70, articleCount: 8, articles: [1,2,3,4,5,6,7,8] },
          { word: "キーワード", count: 65, articleCount: 8, articles: [1,2,3,4,5,6,7,8] },
          { word: "順位", count: 60, articleCount: 7, articles: [1,2,3,4,5,6,7] },
          { word: "ユーザー", count: 55, articleCount: 7, articles: [1,2,3,4,5,6,7] },
          { word: "最適化", count: 50, articleCount: 6, articles: [1,2,3,4,5,6] }
        ]
      }
    } as SeoOutline
  },
  
  // 「方法」系の記事構成
  howTo: {
    keyword: "SEO対策 やり方",
    outline: {
      title: "SEO対策のやり方15選！初心者でも実践できる具体的手法",
      targetAudience: "SEO対策を実践したいが、具体的な方法がわからない初心者〜中級者",
      introduction: "SEO対策をやりたいけど、何から手をつければいいかわからない。そんな悩みを解決するため、今すぐ実践できる15の具体的な方法を優先順位付きでご紹介します。",
      outline: [
        {
          heading: "SEO対策を始める前の準備",
          subheadings: [
            { text: "目標設定", writingNote: "KPI設定、期間設定、現状分析の方法" },
            { text: "ツール導入", writingNote: "Google Analytics、Search Console、その他ツール" },
            { text: "競合分析", writingNote: "競合サイトの特定、分析方法、ツール活用" }
          ],
          writingNote: "準備の重要性を強調し、具体的なステップを提示"
        },
        {
          heading: "コンテンツSEO対策5選",
          subheadings: [
            { text: "1. キーワードリサーチ", writingNote: "ツール紹介、選定基準、ロングテール戦略" },
            { text: "2. タイトル最適化", writingNote: "文字数、キーワード配置、クリック率向上テクニック" },
            { text: "3. 見出し構成", writingNote: "H1-H6の使い方、階層構造、キーワード配置" },
            { text: "4. コンテンツ品質向上", writingNote: "E-E-A-T、独自性、網羅性、読みやすさ" },
            { text: "5. 内部リンク戦略", writingNote: "リンクジュース、アンカーテキスト、サイト構造" }
          ],
          writingNote: "各手法の具体例と実装方法を詳しく解説"
        },
        {
          heading: "テクニカルSEO対策5選",
          subheadings: [
            { text: "1. ページ速度改善", writingNote: "Core Web Vitals、画像最適化、キャッシュ活用" },
            { text: "2. モバイル最適化", writingNote: "レスポンシブデザイン、AMP、モバイルファースト" },
            { text: "3. クローラビリティ向上", writingNote: "robots.txt、sitemap.xml、URL構造" },
            { text: "4. 構造化データ実装", writingNote: "リッチスニペット、schema.org、実装方法" },
            { text: "5. HTTPS化", writingNote: "SSL証明書、リダイレクト設定、セキュリティ向上" }
          ],
          writingNote: "技術的な内容を初心者にもわかりやすく説明"
        },
        {
          heading: "外部SEO対策5選",
          subheadings: [
            { text: "1. 被リンク獲得", writingNote: "ホワイトハット手法、リンクビルディング戦略" },
            { text: "2. SNS活用", writingNote: "ソーシャルシグナル、拡散戦略、エンゲージメント" },
            { text: "3. ローカルSEO", writingNote: "Googleビジネスプロフィール、NAP統一、レビュー獲得" },
            { text: "4. ブランド言及増加", writingNote: "PR戦略、プレスリリース、インフルエンサー活用" },
            { text: "5. ゲスト投稿", writingNote: "投稿先選定、コンテンツ作成、リンク獲得" }
          ],
          writingNote: "実践的で倫理的な手法のみを紹介"
        },
        {
          heading: "まとめ：優先順位をつけて実践しよう",
          subheadings: [],
          writingNote: "15の手法の優先順位と実践スケジュールを提案"
        }
      ],
      conclusion: "SEO対策は多岐にわたりますが、まずは自社サイトの状況を分析し、優先順位をつけて取り組むことが重要です。コンテンツSEOから始め、徐々にテクニカル・外部対策へと展開していきましょう。",
      keywords: ["SEO対策", "やり方", "方法", "手法", "実践", "コンテンツ", "テクニカル", "外部対策", "キーワード", "最適化"],
      characterCountAnalysis: {
        average: 8000,
        median: 7500,
        min: 6000,
        max: 10000,
        analyzedArticles: 10
      },
      competitorResearch: {
        keyword: "SEO対策 やり方",
        analyzedAt: new Date().toISOString(),
        totalArticlesScanned: 10,
        validArticles: [],
        excludedCount: 0,
        commonTopics: ["準備", "コンテンツSEO", "テクニカルSEO", "外部SEO"],
        recommendedWordCount: {
          min: 6000,
          max: 10000,
          optimal: 8000
        },
        frequencyWords: [
          { word: "SEO対策", count: 180, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
          { word: "方法", count: 150, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
          { word: "実践", count: 120, articleCount: 9, articles: [1,2,3,4,5,6,7,8,9] },
          { word: "コンテンツ", count: 100, articleCount: 9, articles: [1,2,3,4,5,6,7,8,9] },
          { word: "キーワード", count: 90, articleCount: 8, articles: [1,2,3,4,5,6,7,8] },
          { word: "最適化", count: 85, articleCount: 8, articles: [1,2,3,4,5,6,7,8] },
          { word: "テクニカル", count: 80, articleCount: 7, articles: [1,2,3,4,5,6,7] },
          { word: "外部", count: 75, articleCount: 7, articles: [1,2,3,4,5,6,7] },
          { word: "手法", count: 70, articleCount: 6, articles: [1,2,3,4,5,6] },
          { word: "やり方", count: 65, articleCount: 6, articles: [1,2,3,4,5,6] }
        ]
      }
    } as SeoOutline
  }
};

// ランダムなテスト構成を生成
export function generateRandomTestOutline(): SeoOutline {
  const templates = Object.values(testOutlines);
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  return randomTemplate.outline;
}

// 特定のタイプのテスト構成を取得
export function getTestOutline(type: 'whatIs' | 'howTo' | 'comprehensive'): SeoOutline {
  if (type === 'comprehensive') {
    return generateComprehensiveTestOutline();
  }
  return testOutlines[type].outline;
}

// 30,000文字の大規模テスト構成を生成
export function generateComprehensiveTestOutline(): SeoOutline {
  const sections = [
    // 第1部：基礎編（約6,000文字）
    { heading: "SEO対策とは？基本概念と仕組み", subheadings: [
      { text: "検索エンジンの仕組み", writingNote: "クローリング、インデックス、ランキングの詳細説明" },
      { text: "SEOの歴史と変遷", writingNote: "Googleアルゴリズムの進化を時系列で" },
      { text: "なぜSEO対策が重要なのか", writingNote: "ビジネスへの影響を数値で示す" }
    ]},
    { heading: "SEO対策の種類と分類", subheadings: [
      { text: "内部対策の全体像", writingNote: "技術面とコンテンツ面を網羅" },
      { text: "外部対策の戦略", writingNote: "リンクビルディングの現在" },
      { text: "テクニカルSEOの重要性", writingNote: "Core Web Vitalsを中心に" }
    ]},
    
    // 第2部：内部対策編（約8,000文字）
    { heading: "キーワード戦略の立て方", subheadings: [
      { text: "キーワードリサーチの手法", writingNote: "ツールの使い方と選定基準" },
      { text: "検索意図の分析方法", writingNote: "KNOW/DO/GO/BUYの詳細" },
      { text: "キーワードマッピング", writingNote: "サイト全体での配置戦略" },
      { text: "ロングテールキーワード戦略", writingNote: "競合が少ない領域の攻め方" }
    ]},
    { heading: "コンテンツSEOの実践", subheadings: [
      { text: "E-E-A-Tを高める方法", writingNote: "専門性、権威性、信頼性の具体例" },
      { text: "検索意図に応える記事構成", writingNote: "ユーザーニーズの把握方法" },
      { text: "競合分析と差別化", writingNote: "独自性の出し方" },
      { text: "コンテンツの更新戦略", writingNote: "リライトのタイミングと方法" }
    ]},
    { heading: "タイトルとメタディスクリプション最適化", subheadings: [
      { text: "クリック率を上げるタイトル作成", writingNote: "心理学的アプローチ" },
      { text: "メタディスクリプションの書き方", writingNote: "120文字で伝える技術" },
      { text: "構造化データの実装", writingNote: "リッチスニペットの獲得方法" }
    ]},
    
    // 第3部：テクニカルSEO編（約6,000文字）
    { heading: "サイト構造の最適化", subheadings: [
      { text: "URL構造の設計", writingNote: "階層とパーマリンクの考え方" },
      { text: "内部リンクの戦略", writingNote: "リンクジュースの流し方" },
      { text: "パンくずリストの重要性", writingNote: "ユーザビリティとSEO効果" }
    ]},
    { heading: "ページ速度の改善", subheadings: [
      { text: "Core Web Vitalsの改善", writingNote: "LCP、FID、CLSの具体的対策" },
      { text: "画像最適化の手法", writingNote: "WebP、遅延読み込み、圧縮" },
      { text: "キャッシュ戦略", writingNote: "ブラウザキャッシュとCDN活用" },
      { text: "JavaScriptの最適化", writingNote: "レンダリングブロックの解消" }
    ]},
    { heading: "モバイル最適化", subheadings: [
      { text: "モバイルファーストインデックス対応", writingNote: "Googleの評価基準" },
      { text: "レスポンシブデザインの実装", writingNote: "ブレイクポイントの設定" },
      { text: "AMPの導入判断", writingNote: "メリットとデメリット" }
    ]},
    
    // 第4部：外部対策編（約4,000文字）
    { heading: "被リンク獲得戦略", subheadings: [
      { text: "ホワイトハットリンクビルディング", writingNote: "安全な手法のみ紹介" },
      { text: "コンテンツマーケティングとPR", writingNote: "自然なリンク獲得" },
      { text: "ゲスト投稿の活用", writingNote: "質の高いサイトの選び方" }
    ]},
    { heading: "ローカルSEO対策", subheadings: [
      { text: "Googleビジネスプロフィール最適化", writingNote: "完全設定ガイド" },
      { text: "地域キーワードの攻略", writingNote: "地名×サービスの戦略" },
      { text: "口コミ獲得と管理", writingNote: "レビューの重要性" }
    ]},
    
    // 第5部：分析と改善編（約3,000文字）
    { heading: "SEO効果測定と分析", subheadings: [
      { text: "Google Analytics 4の活用", writingNote: "重要指標の見方" },
      { text: "Search Consoleの使い方", writingNote: "エラーの発見と修正" },
      { text: "順位トラッキングツール", writingNote: "おすすめツールと使い方" }
    ]},
    { heading: "SEOのトラブルシューティング", subheadings: [
      { text: "順位下落の原因と対策", writingNote: "アルゴリズム変更への対応" },
      { text: "ペナルティからの回復", writingNote: "手動ペナルティの解除方法" },
      { text: "重複コンテンツの解消", writingNote: "カニバリゼーション対策" }
    ]},
    
    // 第6部：最新トレンド編（約3,000文字）
    { heading: "AI時代のSEO対策", subheadings: [
      { text: "SGE（Search Generative Experience）への対応", writingNote: "AIによる検索体験の変化" },
      { text: "ChatGPTとSEOの関係", writingNote: "AIツールの活用方法" },
      { text: "音声検索最適化", writingNote: "会話型クエリへの対応" }
    ]},
    
    // まとめ
    { heading: "まとめ：SEO対策マスターへの道", subheadings: [] }
  ];

  return {
    title: "【完全版】SEO対策マスターガイド｜基礎から最新トレンドまで網羅的に解説",
    targetAudience: "SEO対策を本格的に学びたい全ての人（初心者から中級者まで）",
    introduction: "SEO対策の全てを網羅した完全ガイド。基礎理論から最新のAI対応まで、実践的な知識を体系的に解説します。",
    outline: sections,
    conclusion: "本ガイドでSEO対策の全体像を理解できました。継続的な学習と実践により、検索上位表示を実現しましょう。",
    keywords: ["SEO対策", "検索エンジン最適化", "内部対策", "外部対策", "テクニカルSEO", "コンテンツSEO", "E-E-A-T", "Core Web Vitals", "AI", "SGE"],
    characterCountAnalysis: {
      average: 30000,
      median: 30000,
      min: 28000,
      max: 32000,
      analyzedArticles: 10
    },
    competitorResearch: {
      keyword: "SEO対策 完全ガイド",
      analyzedAt: new Date().toISOString(),
      totalArticlesScanned: 10,
      validArticles: [],
      excludedCount: 0,
      commonTopics: ["基礎", "内部対策", "外部対策", "テクニカル", "分析", "AI"],
      recommendedWordCount: {
        min: 28000,
        max: 32000,
        optimal: 30000
      },
      frequencyWords: [
        { word: "SEO", count: 500, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
        { word: "対策", count: 400, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
        { word: "検索", count: 350, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
        { word: "コンテンツ", count: 300, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
        { word: "Google", count: 280, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
        { word: "サイト", count: 250, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
        { word: "キーワード", count: 240, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
        { word: "ユーザー", count: 220, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
        { word: "ページ", count: 200, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] },
        { word: "最適化", count: 180, articleCount: 10, articles: [1,2,3,4,5,6,7,8,9,10] }
      ]
    }
  } as SeoOutline;
}