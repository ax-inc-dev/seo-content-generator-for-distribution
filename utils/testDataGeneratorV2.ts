// テスト用構成データジェネレーター Ver.2
import type { SeoOutlineV2, CompetitorResearchResult } from '../types';

// テスト用の競合分析データ
const testCompetitorResearch: CompetitorResearchResult = {
  keyword: "SEO対策",
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
    { word: "サイト", count: 75, articleCount: 9, articles: [1,2,3,4,5,6,7,8,9] }
  ]
};

export const testOutlinesV2 = {
  // 「とは」系の記事構成
  whatIs: {
    keyword: "SEO対策とは",
    outline: {
      title: "【2025年最新】SEO対策とは？基本から実践まで徹底解説",
      metaDescription: "SEO対策の基本概念から具体的な実践方法まで、初心者にもわかりやすく解説。内部対策・外部対策・テクニカルSEOの違いや、今すぐ始められる施策を紹介します。",
      introductions: {
        conclusionFirst: "",
        empathy: "SEO対策に興味はあるけれど、何から始めればいいか分からない。専門用語が多くて理解が難しい。そんな悩みを持つ方も多いのではないでしょうか。本記事では、SEO対策の基本概念から具体的な実践方法まで、初心者の方にもわかりやすく解説していきます。"
      },
      targetAudience: "SEO対策について初めて学ぶWebサイト運営者、マーケティング担当者、これからWeb集客を始めたい方",
      outline: [
        {
          heading: "SEO対策の基本概念と仕組み",
          subheadings: [
            { text: "SEOとは何か？Search Engine Optimizationの意味", writingNote: "略称の説明、検索エンジンの仕組みを初心者向けに解説" },
            { text: "なぜSEO対策が重要なのか？ビジネスへの影響", writingNote: "集客向上、ブランド認知度向上、費用対効果の高さを説明" }
          ],
          writingNote: "初心者にもわかりやすく、専門用語を避けて説明。図解を活用して理解を促進",
          imageSuggestion: "検索エンジンの仕組みを示すインフォグラフィック"
        },
        {
          heading: "SEO対策の3つの主要カテゴリー",
          subheadings: [
            { text: "内部対策：サイト内部の最適化", writingNote: "コンテンツ最適化、メタタグ、内部リンクについて解説" },
            { text: "外部対策：外部からの評価獲得", writingNote: "被リンク、サイテーション、ブランド言及の重要性" },
            { text: "テクニカルSEO：技術的な最適化", writingNote: "サイト速度、モバイル対応、クローラビリティ改善" }
          ],
          writingNote: "各カテゴリーの特徴と重要性を具体例を交えて解説。バランスの重要性も強調",
          imageSuggestion: "3つのSEO対策の関係性を示すベン図"
        },
        {
          heading: "SEO対策のメリットとデメリット",
          subheadings: [
            { text: "SEO対策の5つのメリット", writingNote: "長期的な集客効果、費用対効果、信頼性向上、ブランディング効果、競合優位性を説明" },
            { text: "SEO対策の3つのデメリットと対処法", writingNote: "即効性の低さ、継続的な作業の必要性、アルゴリズム変更リスクと、それぞれの対処法" }
          ],
          writingNote: "公平な視点で両面を解説し、デメリットには必ず対処法を提示",
          imageSuggestion: "メリット・デメリットの比較表"
        },
        {
          heading: "今すぐ始められるSEO対策5選",
          subheadings: [
            { text: "1. キーワード調査と選定", writingNote: "無料ツールの使い方、選定基準、ロングテールキーワードの重要性" },
            { text: "2. タイトルタグとメタディスクリプションの最適化", writingNote: "文字数、キーワード配置、クリック率向上のコツ" },
            { text: "3. 高品質なコンテンツの作成", writingNote: "E-E-A-T、独自性、ユーザーニーズへの対応" },
            { text: "4. 内部リンクの戦略的な配置", writingNote: "関連性の高いページへのリンク、アンカーテキストの最適化" },
            { text: "5. ページ表示速度の改善", writingNote: "画像最適化、キャッシュ活用、不要なコードの削除" }
          ],
          writingNote: "実践的で具体的なアクションを、優先順位をつけて提示",
          imageSuggestion: "5つの施策のチェックリスト"
        },
        {
          heading: "SEO対策のプロフェッショナルサポートなら当社サービス",
          subheadings: [
            { text: "豊富な実績とAI活用の最新ノウハウ", writingNote: "企業向けAI研修やコンサルティング実績を紹介" },
            { text: "無料相談で最適な戦略をご提案", writingNote: "まずは気軽に相談できることを強調" }
          ],
          writingNote: "自社サービスを自然に紹介",
          imageSuggestion: "サービス紹介のイメージ図"
        },
        {
          heading: "まとめ：SEO対策で成果を出すための第一歩",
          subheadings: [],
          writingNote: "記事の要点をまとめ、読者が次に取るべきアクションを明確に提示",
          imageSuggestion: ""
        }
      ],
      conclusion: "SEO対策は継続的な取り組みが必要ですが、基本を理解して正しい方法で実践すれば必ず成果につながります。まずは今回紹介した5つの施策から始めてみましょう。",
      keywords: ["SEO", "検索エンジン", "対策", "最適化", "Google", "コンテンツ", "キーワード"],
      characterCountAnalysis: {
        average: 5000,
        median: 4800,
        min: 3500,
        max: 6500,
        analyzedArticles: 10
      },
      competitorComparison: {
        averageH2Count: 6,
        averageH3Count: 10,
        ourH2Count: 6,
        ourH3Count: 10,
        freshnessRisks: [],
        differentiators: [
          "具体的な5つの実践方法を優先順位付きで提示",
          "デメリットに対する対処法も含めた公平な解説",
          "プロサービス活用のタイミングも含めた包括的な内容"
        ]
      },
      searchIntent: {
        primary: "KNOW",
        secondary: "DO"
      },
      freshnessData: {
        lastUpdated: "2025年最新",
        hasOutdatedInfo: false
      }
    } as SeoOutlineV2,
    competitorResearch: testCompetitorResearch
  },
  
  // 「方法」系の記事構成
  howTo: {
    keyword: "SEO対策 やり方",
    outline: {
      title: "SEO対策のやり方完全ガイド｜初心者でも成果を出せる実践手法",
      metaDescription: "SEO対策の具体的なやり方を初心者向けに解説。キーワード選定からコンテンツ作成、効果測定まで、実践的な手順を優先順位付きで紹介します。",
      introductions: {
        conclusionFirst: "",
        empathy: "SEO対策をやりたいけど、具体的に何から始めればいいかわからない。情報が多すぎて、どれが本当に効果的なのか判断できない。そんな悩みを解決するため、実際に成果が出やすい施策を優先順位付きでご紹介します。"
      },
      targetAudience: "SEO対策を実践したいが具体的な方法がわからない初心者〜中級者、効果的な施策の優先順位を知りたい方",
      outline: [
        {
          heading: "SEO対策を始める前の準備",
          subheadings: [
            { text: "現状分析：自社サイトの課題を把握する", writingNote: "Google Analytics、Search Consoleの基本的な見方" },
            { text: "目標設定：達成可能なKPIを決める", writingNote: "現実的な目標設定の方法、期間の考え方" },
            { text: "競合調査：上位サイトから学ぶ", writingNote: "無料ツールを使った競合分析方法" }
          ],
          writingNote: "準備の重要性を強調し、基礎固めの大切さを伝える",
          imageSuggestion: "準備段階のチェックリスト"
        },
        {
          heading: "キーワード戦略の立て方",
          subheadings: [
            { text: "キーワードリサーチの具体的手順", writingNote: "ツールの使い方、選定基準、検索ボリュームの見方" },
            { text: "ロングテールキーワードの活用法", writingNote: "競合が少ないキーワードで確実に順位を取る戦略" },
            { text: "検索意図の分析と対応", writingNote: "Know・Do・Go・Buyクエリの違いと対応方法" }
          ],
          writingNote: "具体的なツールの操作方法も含めて解説",
          imageSuggestion: "キーワードマッピングの例"
        },
        {
          heading: "コンテンツSEOの実践方法",
          subheadings: [
            { text: "SEOに強い記事構成の作り方", writingNote: "見出し構造、キーワード配置、文字数の目安" },
            { text: "E-E-A-Tを満たすコンテンツ作成術", writingNote: "専門性、権威性、信頼性を高める具体的方法" },
            { text: "リライトによる順位改善テクニック", writingNote: "既存記事の改善ポイント、更新頻度の目安" }
          ],
          writingNote: "実例を交えながら、すぐに実践できる内容を提供",
          imageSuggestion: "記事構成のテンプレート"
        },
        {
          heading: "テクニカルSEOの基本設定",
          subheadings: [
            { text: "ページ速度の改善方法", writingNote: "PageSpeed Insightsの使い方、具体的な改善施策" },
            { text: "モバイル対応の必須ポイント", writingNote: "レスポンシブデザイン、タップターゲットの最適化" },
            { text: "XMLサイトマップとrobots.txtの設定", writingNote: "正しい設定方法と注意点" }
          ],
          writingNote: "技術的な内容も初心者にわかりやすく解説",
          imageSuggestion: "テクニカルSEOのチェックリスト"
        },
        {
          heading: "リンク対策の正しい進め方",
          subheadings: [
            { text: "内部リンクの最適化手法", writingNote: "効果的な内部リンク戦略、アンカーテキストの使い方" },
            { text: "被リンク獲得の健全な方法", writingNote: "コンテンツマーケティング、PR活動、パートナーシップ" },
            { text: "有害なリンクの見分け方と対処法", writingNote: "ペナルティリスクの回避方法" }
          ],
          writingNote: "ホワイトハットSEOの重要性を強調",
          imageSuggestion: ""
        },
        {
          heading: "効果測定と改善サイクル",
          subheadings: [
            { text: "重要指標のモニタリング方法", writingNote: "順位、流入数、CTR、CVRの追跡" },
            { text: "PDCAサイクルの回し方", writingNote: "月次レビューの進め方、改善施策の優先順位付け" }
          ],
          writingNote: "継続的な改善の重要性を強調",
          imageSuggestion: "効果測定ダッシュボードの例"
        },
        {
          heading: "SEO対策の課題解決なら当社サービス",
          subheadings: [
            { text: "最新のAI技術を活用した効果的なSEO戦略", writingNote: "AIツール活用の優位性を説明" },
            { text: "実績豊富な専門家による個別サポート", writingNote: "具体的な成功事例を交えて信頼性を訴求" },
            { text: "無料相談で貴社に最適なプランをご提案", writingNote: "行動を促すCTAとして機能させる" }
          ],
          writingNote: "自然な流れで当社サービスのサービス価値を訴求",
          imageSuggestion: "サービスの特徴を示すインフォグラフィック"
        },
        {
          heading: "まとめ：継続的なSEO対策で確実に成果を出す",
          subheadings: [],
          writingNote: "実践のハードルを下げ、最初の一歩を踏み出せるよう促す",
          imageSuggestion: ""
        }
      ],
      conclusion: "SEO対策は一度やれば終わりではなく、継続的な取り組みが重要です。まずは今回紹介した中から、自社の課題に合った施策を3つ選んで実践してみましょう。",
      keywords: ["SEO対策", "やり方", "方法", "手順", "キーワード", "コンテンツ", "実践"],
      characterCountAnalysis: {
        average: 8000,
        median: 7500,
        min: 6000,
        max: 10000,
        analyzedArticles: 10
      },
      competitorComparison: {
        averageH2Count: 7,
        averageH3Count: 15,
        ourH2Count: 8,
        ourH3Count: 17,
        freshnessRisks: [],
        differentiators: [
          "準備段階から効果測定まで網羅的にカバー",
          "優先順位を明確にした実践的な内容",
          "初心者でも理解できる具体的な手順を提示"
        ]
      },
      searchIntent: {
        primary: "DO",
        secondary: "KNOW"
      },
      freshnessData: {
        lastUpdated: "2025年最新",
        hasOutdatedInfo: false
      }
    } as SeoOutlineV2,
    competitorResearch: testCompetitorResearch
  },
  
  // 包括的な記事構成（30K文字想定）
  comprehensive: {
    keyword: "SEO対策 完全ガイド",
    outline: {
      title: "SEO対策完全ガイド2025｜基礎から応用まで網羅的に解説",
      metaDescription: "SEO対策の全てを網羅した完全ガイド。基礎知識から最新トレンド、実践的なテクニックまで、この1記事で包括的に理解できます。",
      introductions: {
        conclusionFirst: "",
        empathy: "SEO対策について体系的に学びたいが、情報が散在していて全体像がつかめない。基礎から応用まで、一通り理解したい。そんな方のために、SEO対策の全てを1つの記事にまとめました。この記事を読めば、SEO対策の基礎から最新トレンドまで包括的に理解できます。"
      },
      targetAudience: "SEO対策を本格的に学びたい全ての人（初心者から中級者、包括的な知識を求める上級者まで）",
      outline: [
        {
          heading: "第1章：SEO対策の基礎知識",
          subheadings: [
            { text: "SEOの歴史と変遷", writingNote: "検索エンジンの進化、アルゴリズムの変遷" },
            { text: "検索エンジンの仕組み", writingNote: "クロール、インデックス、ランキングの詳細" },
            { text: "Googleのアルゴリズム理解", writingNote: "主要なアルゴリズムアップデートと影響" },
            { text: "SEO対策の種類と分類", writingNote: "ホワイトハット、グレーハット、ブラックハット" }
          ],
          writingNote: "SEOの本質を深く理解できるよう、歴史的背景から丁寧に解説",
          imageSuggestion: "SEOの歴史年表"
        },
        {
          heading: "第2章：キーワード戦略の完全ガイド",
          subheadings: [
            { text: "キーワードリサーチの基本", writingNote: "ツール活用、検索ボリューム分析" },
            { text: "競合分析とギャップ分析", writingNote: "競合の強み弱みを見つける方法" },
            { text: "キーワードマッピング", writingNote: "サイト構造とキーワードの対応" },
            { text: "ロングテール戦略", writingNote: "ニッチキーワードでの勝ち方" },
            { text: "検索意図の4分類と対応", writingNote: "情報収集、取引、案内、ローカル" }
          ],
          writingNote: "実践的なキーワード戦略を、具体例を交えて解説",
          imageSuggestion: "キーワードマッピングのフレームワーク"
        },
        {
          heading: "第3章：コンテンツSEOの実践",
          subheadings: [
            { text: "E-E-A-Tの完全理解", writingNote: "経験、専門性、権威性、信頼性の高め方" },
            { text: "SEOライティングの技術", writingNote: "読みやすさと検索エンジン最適化の両立" },
            { text: "構造化データの実装", writingNote: "リッチスニペット獲得方法" },
            { text: "画像・動画SEO", writingNote: "ビジュアルコンテンツの最適化" },
            { text: "コンテンツの更新戦略", writingNote: "フレッシュネスの維持方法" }
          ],
          writingNote: "コンテンツ作成の具体的なノウハウを網羅",
          imageSuggestion: "E-E-A-Tチェックリスト"
        },
        {
          heading: "第4章：テクニカルSEOの詳細",
          subheadings: [
            { text: "サイト構造の最適化", writingNote: "URL構造、階層、パンくずリスト" },
            { text: "Core Web Vitalsの改善", writingNote: "LCP、FID、CLSの具体的改善方法" },
            { text: "モバイルファーストインデックス対応", writingNote: "レスポンシブデザインの実装" },
            { text: "JavaScriptとSEO", writingNote: "SPAサイトのSEO対策" },
            { text: "国際SEOとhreflang", writingNote: "多言語サイトの最適化" },
            { text: "サイトセキュリティとHTTPS", writingNote: "SSL証明書の重要性" }
          ],
          writingNote: "技術的な内容も、実装方法を含めて詳細に解説",
          imageSuggestion: "テクニカルSEO診断フローチャート"
        },
        {
          heading: "第5章：リンク戦略とオーソリティ構築",
          subheadings: [
            { text: "内部リンクの最適化戦略", writingNote: "サイロ構造、トピッククラスター" },
            { text: "外部リンク獲得の戦略", writingNote: "リンクベイト、ゲスト投稿、PR" },
            { text: "リンクの品質評価", writingNote: "良いリンク、悪いリンクの見分け方" },
            { text: "ペナルティ回避と回復", writingNote: "不自然なリンクの対処" },
            { text: "ブランド言及とサイテーション", writingNote: "リンクなし言及の価値" }
          ],
          writingNote: "安全で効果的なリンク戦略を包括的に解説",
          imageSuggestion: "リンクプロファイル分析の例"
        },
        {
          heading: "第6章：ローカルSEOとビジネス展開",
          subheadings: [
            { text: "Googleビジネスプロフィール最適化", writingNote: "登録から運用まで完全ガイド" },
            { text: "ローカルパックへの表示方法", writingNote: "地域検索での上位表示戦略" },
            { text: "口コミマネジメント", writingNote: "レビュー獲得と対応方法" },
            { text: "地域特化コンテンツ戦略", writingNote: "地域性を活かしたコンテンツ作成" }
          ],
          writingNote: "実店舗ビジネスに特化したSEO戦略",
          imageSuggestion: "ローカルSEOチェックリスト"
        },
        {
          heading: "第7章：SEOツールの活用法",
          subheadings: [
            { text: "Google公式ツールマスター", writingNote: "Search Console、Analytics、PageSpeed Insights" },
            { text: "有料SEOツール比較", writingNote: "Ahrefs、SEMrush、Moz等の特徴" },
            { text: "無料ツールの効果的活用", writingNote: "Ubersuggest、ラッコキーワード等" },
            { text: "自動化とレポーティング", writingNote: "効率的な運用方法" }
          ],
          writingNote: "ツールの選び方から活用方法まで実践的に解説",
          imageSuggestion: "SEOツール比較表"
        },
        {
          heading: "第8章：業界別SEO戦略",
          subheadings: [
            { text: "EC・通販サイトのSEO", writingNote: "商品ページ、カテゴリページの最適化" },
            { text: "BtoBサイトのSEO", writingNote: "リード獲得に特化した戦略" },
            { text: "メディアサイトのSEO", writingNote: "大量コンテンツの管理と最適化" },
            { text: "個人ブログのSEO", writingNote: "限られたリソースでの戦略" }
          ],
          writingNote: "業界特有の課題と対策を具体的に提示",
          imageSuggestion: ""
        },
        {
          heading: "第9章：最新SEOトレンドと未来予測",
          subheadings: [
            { text: "AI検索とSGEへの対応", writingNote: "生成AI時代のSEO戦略" },
            { text: "音声検索最適化", writingNote: "会話型クエリへの対応" },
            { text: "ビジュアル検索の可能性", writingNote: "画像検索の重要性増大" },
            { text: "ゼロクリック検索への対策", writingNote: "フィーチャードスニペット獲得" }
          ],
          writingNote: "最新トレンドと将来を見据えた戦略を提示",
          imageSuggestion: "SEOトレンド予測図"
        },
        {
          heading: "第10章：SEO対策の実践計画",
          subheadings: [
            { text: "3ヶ月・6ヶ月・1年の目標設定", writingNote: "現実的なロードマップ作成" },
            { text: "チーム体制と役割分担", writingNote: "効果的な組織作り" },
            { text: "予算配分と費用対効果", writingNote: "投資判断の基準" },
            { text: "外注と内製の判断基準", writingNote: "メリットデメリット比較" }
          ],
          writingNote: "実践的な計画立案をサポート",
          imageSuggestion: "SEO実践ロードマップ"
        },
        {
          heading: "SEO対策に関するよくある質問（FAQ）",
          subheadings: [
            { text: "Q1. SEO対策の効果が出るまでどのくらいかかりますか？", writingNote: "一般的に3-6ヶ月、競合性により変動することを説明" },
            { text: "Q2. 自社でSEO対策をする場合の必要な時間は？", writingNote: "週に最低10時間程度の作業時間が必要なことを説明" },
            { text: "Q3. SEO対策にかかる費用の目安は？", writingNote: "自社対応と外注の費用比較を提示" }
          ],
          writingNote: "読者の疑問を解消し、不安を取り除く",
          imageSuggestion: "FAQ形式のアイコン付きレイアウト"
        },
        {
          heading: "SEO対策の専門的サポートなら当社サービス",
          subheadings: [
            { text: "AIツール活用で効率的なSEO戦略を実現", writingNote: "ChatGPT/Claude活用による効率化を訴求" },
            { text: "大手企業の実績多数！信頼できるパートナー", writingNote: "実績企業名を挙げて信頼性を高める" },
            { text: "まずは無料相談から始めてみませんか", writingNote: "具体的な問い合わせ方法を案内" }
          ],
          writingNote: "プロフェッショナルサービスの価値を適切に訴求",
          imageSuggestion: "実績企業のロゴ一覧"
        },
        {
          heading: "まとめ：SEO対策マスターへの道",
          subheadings: [],
          writingNote: "全体を総括し、読者が実践に移せるよう背中を押す",
          imageSuggestion: ""
        }
      ],
      conclusion: "SEO対策は奥が深く、常に進化し続ける分野です。この完全ガイドで得た知識を基に、まずは自社の課題を明確にし、優先順位をつけて実践していきましょう。継続的な学習と実践が、必ず成果につながります。",
      keywords: ["SEO対策", "完全ガイド", "検索エンジン", "最適化", "Google", "コンテンツ", "テクニカルSEO", "リンク"],
      characterCountAnalysis: {
        average: 30000,
        median: 28000,
        min: 25000,
        max: 35000,
        analyzedArticles: 5
      },
      competitorComparison: {
        averageH2Count: 10,
        averageH3Count: 30,
        ourH2Count: 12,
        ourH3Count: 39,
        freshnessRisks: [],
        differentiators: [
          "基礎から最新トレンドまで完全網羅",
          "業界別の具体的な戦略を提示",
          "実践的な計画立案までサポート"
        ]
      },
      searchIntent: {
        primary: "KNOW",
        secondary: "DO"
      },
      freshnessData: {
        lastUpdated: "2025年最新",
        hasOutdatedInfo: false
      }
    } as SeoOutlineV2,
    competitorResearch: testCompetitorResearch
  }
};

export function getTestOutlineV2(type: 'whatIs' | 'howTo' | 'comprehensive' | 'aiTraining') {
  if (type === 'aiTraining') {
    return getAiTrainingTestOutline();
  }
  return testOutlinesV2[type];
}

// AI研修のテスト構成を生成
function getAiTrainingTestOutline() {
  return {
    keyword: "AI研修 助成金",
    outline: {
      title: "AI研修 助成金活用の完全ガイド｜最大75%補助でコスト削減",
      metaDescription: "AI研修の導入に使える助成金制度を8つ厳選してご紹介。人材開発支援助成金なら最大75%の補助率で、中小企業でも負担を抑えてAI人材育成が可能です。申請方法から活用事例まで詳しく解説します。",
      targetAudience: "AI研修の導入を検討している中小企業の経営者・人事担当者で、コスト面での不安から導入を躊躇している方",
      introductions: {
        empathy: "「AI研修を導入したいけど、費用が高くて踏み切れない…」そんな悩みを抱えていませんか？実は、AI研修には最大75%の費用が補助される助成金制度があることをご存知でしょうか。本記事では、2025年最新のAI研修で活用できる助成金を8つ厳選し、申請方法から実際の活用事例まで詳しく解説します。",
        curiosity: "AI研修の費用、実は最大75%も補助してもらえることをご存知ですか？2025年、政府はAI人材育成に本腰を入れており、様々な助成金制度が充実しています。この記事では、あなたの会社で使える助成金とその活用法を徹底解説します。"
      },
      outline: [
        {
          heading: "AI研修に助成金が使える理由と2025年の最新動向",
          subheadings: [
            { text: "なぜ今、AI研修への助成金が充実しているのか", writingNote: "リスキリング推進と産業競争力強化の観点から説明" },
            { text: "2025年度から変わった助成金制度のポイント", writingNote: "補助率アップ、対象範囲拡大、申請手続き簡素化の3点を解説" }
          ],
          writingNote: "DX推進の国策としての位置づけと、AI人材育成への政府の本気度を数値データとともに説明。2025年度の予算拡充情報も含める",
          imageSuggestion: "助成金制度の概要を示すインフォグラフィック"
        },
        {
          heading: "AI研修で使える助成金8選",
          subheadings: [
            { text: "1. 人材開発支援助成金（事業展開等リスキリング支援コース）", writingNote: "最大75%補助、年間1億円まで。DX・AI研修に特化した最も使いやすい制度" },
            { text: "2. ものづくり補助金（デジタル枠）", writingNote: "AI導入と研修をセットで支援。最大1,250万円補助" },
            { text: "3. IT導入補助金2025", writingNote: "AIツールの導入研修に活用可能。最大450万円" },
            { text: "4. キャリアアップ助成金（正社員化コース）", writingNote: "非正規社員のAI研修を経て正社員化する場合に活用。最大72万円/人" },
            { text: "5. DX投資促進税制", writingNote: "AI研修を含むDX投資の税額控除。投資額の3～5%控除" },
            { text: "6. 地域雇用開発助成金", writingNote: "地方でのAI人材育成に特化。設備投資と雇用で最大800万円" },
            { text: "7. 産業雇用安定助成金（スキルアップ支援コース）", writingNote: "在籍型出向でAI研修を受ける場合の支援。最大1万円/日" },
            { text: "8. 東京都DXリスキリング助成金", writingNote: "東京都独自の制度。AI研修費用の2/3補助、最大100万円" }
          ],
          writingNote: "各助成金の特徴を簡潔に整理し、どの企業にどの助成金が適しているかを明確に示す",
          imageSuggestion: "8つの助成金を比較できる一覧表"
        },
        {
          heading: "人材開発支援助成金でAI研修を受ける方法",
          subheadings: [
            { text: "申請に必要な3つの要件と準備書類", writingNote: "事業内職業能力開発計画、訓練実施計画、賃金助成の要件を詳説" },
            { text: "申請から受給までの5ステップ", writingNote: "計画提出→研修実施→支給申請の流れを時系列で説明" },
            { text: "よくある申請ミスと対策方法", writingNote: "書類不備、期限超過、対象外経費の計上などの失敗例と回避方法" }
          ],
          writingNote: "最も活用されている人材開発支援助成金に絞って、具体的な申請手順を解説",
          imageSuggestion: "申請から受給までのフローチャート"
        },
        {
          heading: "助成金を活用してAI研修を導入した企業3社",
          subheadings: [
            { text: "A社（リスティング広告運用）：外注費10万円→0円、制作時間3営業日→2時間", writingNote: "AI研修によりLP制作内製化を実現" },
            { text: "B社（マーケティング支援）：原稿執筆時間24時間→数分に短縮", writingNote: "AI活用により原稿執筆を大幅効率化" },
            { text: "SNS広告代理店C社：月1,000万impを自動化、業務時間66%削減", writingNote: "非エンジニアチームでSNS完全自動化システムを内製化" }
          ],
          writingNote: "実際の企業事例を通じて、助成金活用の具体的なイメージを持ってもらう",
          imageSuggestion: "導入企業の成果を示すビフォーアフター図"
        },
        {
          heading: "助成金を最大限活用するための研修会社の選び方",
          subheadings: [
            { text: "助成金申請サポートの充実度で選ぶ", writingNote: "書類作成代行、申請アドバイスの有無を確認" },
            { text: "実績とカリキュラムの質で選ぶ", writingNote: "助成金活用実績が豊富で、実務直結型のカリキュラムを持つ会社を推奨" }
          ],
          writingNote: "助成金申請をサポートしてくれる研修会社の見極め方を解説",
          imageSuggestion: "研修会社選定のチェックリスト"
        },
        {
          heading: "AI研修の助成金申請でよくある質問（Q&A）",
          subheadings: [
            { text: "中小企業でも本当に助成金は受けられる？", writingNote: "むしろ中小企業の方が有利な制度設計になっている点を強調" },
            { text: "オンライン研修でも助成金の対象になる？", writingNote: "2025年からオンライン研修も完全対象化された点を説明" },
            { text: "助成金の審査はどのくらい厳しい？", writingNote: "要件を満たせば原則支給される点と、審査通過率のデータを提示" }
          ],
          writingNote: "読者の疑問を先回りして解消し、申請への心理的ハードルを下げる",
          imageSuggestion: "Q&Aのアイコン付きリスト"
        },
        {
          heading: "AI研修の助成金活用なら当社サービスへご相談を",
          subheadings: [
            { text: "助成金申請を完全サポートする充実の体制", writingNote: "書類作成から申請まで専任担当者がフルサポート、過去の申請実績と高い通過率" },
            { text: "実践型カリキュラムで即戦力を育成", writingNote: "A社、B社、C社などの具体的成果を引用" },
            { text: "無料相談で最適な助成金プランをご提案", writingNote: "30分の無料相談で、貴社に最適な助成金と研修プランを診断" }
          ],
          writingNote: "助成金を活用したAI研修の実績と当社サービスの強みを訴求",
          imageSuggestion: "当社サービスのサービス概要図"
        },
        {
          heading: "まとめ：AI研修 助成金を活用して人材育成を加速させよう",
          subheadings: [],
          writingNote: "本記事の重要ポイントを振り返り、助成金を活用したAI研修の価値を再確認。最大75%の補助率を活用して、コストを抑えながら即戦力のAI人材を育成できることを強調。当社サービスへの無料相談を最後にもう一度促す",
          imageSuggestion: "記事のポイントまとめ図"
        }
      ],
      conclusion: "AI研修への助成金活用は、中小企業にとって大きなチャンスです。最大75%の補助を受けられる今だからこそ、AI人材育成に踏み出しましょう。まずは本記事の比較表から自社に合った助成金を選定し、研修会社への相談から始めてください。",
      keywords: ["AI研修", "助成金", "人材開発支援助成金", "補助金", "リスキリング", "DX", "中小企業", "申請方法"],
      characterCountAnalysis: {
        average: 5000,
        median: 4800,
        min: 4000,
        max: 6000,
        analyzedArticles: 5
      },
      competitorComparison: {
        averageH2Count: 6,
        averageH3Count: 12,
        ourH2Count: 8,
        ourH3Count: 21,
        freshnessRisks: [
          "2024年の情報を使用している競合サイトが多い",
          "助成金の補助率が古い情報のまま"
        ],
        differentiators: [
          "2025年最新の助成金情報と補助率を反映",
          "実際の当社サービス受講企業の成功事例を具体的数値で提示",
          "助成金申請サポート付き研修会社の選び方まで網羅"
        ]
      },
      searchIntent: {
        primary: "KNOW",
        secondary: "DO"
      },
      freshnessData: {
        lastUpdated: "2025年1月",
        hasOutdatedInfo: false
      }
    } as SeoOutlineV2,
    competitorResearch: testCompetitorResearch
  };
}