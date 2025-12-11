const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

async function createYamlCurriculum() {
  try {
    console.log('📚 AX CAMP カリキュラムのYAML構造化を開始...\n');

    // 抽出済みのJSONデータを読み込み
    const jsonPath = path.join('curriculum-text', 'all-chapters.json');
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const chapters = JSON.parse(jsonData);

    // YAML構造を作成
    const curriculumData = {
      ax_camp_curriculum: {
        version: 'v3',
        last_updated: new Date().toISOString().split('T')[0],
        total_chapters: 12,
        chapters: []
      }
    };

    // 各章のデータを構造化
    for (const chapter of chapters) {
      if (chapter.error) continue;

      // テキストから重要な要素を抽出
      const text = chapter.textContent || '';
      const lines = text.split('\n').filter(line => line.trim());

      // アジェンダ・目次を抽出
      const agendaIndex = lines.findIndex(line => line.includes('AGENDA'));
      const agenda = [];
      if (agendaIndex !== -1) {
        for (let i = agendaIndex + 1; i < Math.min(agendaIndex + 10, lines.length); i++) {
          if (lines[i] && lines[i].length > 2 && !lines[i].includes('©')) {
            agenda.push(lines[i].trim());
          }
        }
      }

      // ゴールを抽出
      const goalIndex = lines.findIndex(line => line.includes('カリキュラムのゴール'));
      const goals = [];
      if (goalIndex !== -1) {
        for (let i = goalIndex + 1; i < Math.min(goalIndex + 5, lines.length); i++) {
          if (lines[i] && lines[i].length > 5 && !lines[i].includes('©')) {
            goals.push(lines[i].trim());
          }
        }
      }

      // キーワード抽出（重要な用語）
      const keywords = extractKeywords(text);

      // 章データを構造化
      const chapterData = {
        chapter_id: chapter.chapter,
        title: chapter.title,
        page_count: chapter.pageCount,
        learning_objectives: goals,
        agenda: agenda.filter(item => item && item !== ''),
        key_concepts: keywords,
        search_tags: generateSearchTags(chapter.title, keywords),
        content_summary: generateSummary(chapter.title, chapter.chapter)
      };

      curriculumData.ax_camp_curriculum.chapters.push(chapterData);
    }

    // 検索用インデックスを追加
    curriculumData.ax_camp_curriculum.search_index = createSearchIndex(curriculumData.ax_camp_curriculum.chapters);

    // YAMLファイルとして保存
    const yamlContent = yaml.dump(curriculumData, {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });

    await fs.writeFile('ax-camp-curriculum.yaml', yamlContent, 'utf8');

    // エージェント用の簡易版も作成
    const agentData = createAgentReference(curriculumData.ax_camp_curriculum.chapters);
    await fs.writeFile('curriculum-reference.json', JSON.stringify(agentData, null, 2), 'utf8');

    console.log('✅ YAML構造化完了！');
    console.log('📄 出力ファイル:');
    console.log('  - ax-camp-curriculum.yaml (完全版)');
    console.log('  - curriculum-reference.json (エージェント用)');

    return curriculumData;

  } catch (error) {
    console.error('❌ エラー:', error.message);
    throw error;
  }
}

// キーワード抽出関数
function extractKeywords(text) {
  const keywords = new Set();
  const patterns = [
    /AI[^\s]{0,10}/g,
    /プロンプト[^\s]{0,10}/g,
    /エージェント/g,
    /ChatGPT/g,
    /Claude/g,
    /API/g,
    /ワークフロー/g,
    /バイブコーディング/g,
    /テクニック/g,
    /自動化/g
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => keywords.add(match));
  });

  return Array.from(keywords).slice(0, 15);
}

// 検索タグ生成
function generateSearchTags(title, keywords) {
  const tags = new Set();

  // タイトルベースのタグ
  if (title.includes('プロンプト')) tags.add('prompt-engineering');
  if (title.includes('エージェント')) tags.add('ai-agent');
  if (title.includes('API')) tags.add('api-development');
  if (title.includes('ChatGPT')) tags.add('chatgpt');
  if (title.includes('エラー')) tags.add('error-handling');
  if (title.includes('戦略')) tags.add('ai-strategy');
  if (title.includes('基礎')) tags.add('fundamentals');
  if (title.includes('活用')) tags.add('practical-use');

  // キーワードベースのタグ
  keywords.forEach(keyword => {
    if (keyword.length > 2) {
      tags.add(keyword.toLowerCase().replace(/\s+/g, '-'));
    }
  });

  return Array.from(tags);
}

// サマリー生成
function generateSummary(title, chapterNum) {
  const summaries = {
    1: "AI活用における基本的な考え方とマインドセットを学習。成功事例と失敗パターンを理解し、組織でのAI導入の心構えを習得。",
    2: "AIの仕組み、機械学習、深層学習、生成AIの基本原理を解説。技術的な基礎知識を固め、AIの可能性と限界を理解。",
    3: "効果的なプロンプトの作成方法、7つの要素、言語化テクニックを習得。実践的なプロンプトエンジニアリングスキルを身につける。",
    4: "組織におけるAI活用の戦略立案、ROI評価、導入プロセスを学習。ビジネス価値を最大化するためのAI戦略を構築。",
    5: "AIエージェントの概念、設計方法、実装パターンを理解。自律的に動作するAIシステムの構築方法を習得。",
    6: "業務プロセスの分解方法、自動化ポイントの特定、ワークフロー設計を学習。効率的な業務自動化を実現。",
    7: "音声入力を活用した高速コーディング手法。バイブコーディングによる開発効率の劇的な向上を実現。",
    8: "APIを使用したAIエージェントの実装方法。OpenAI API、Claude APIの活用と統合方法を実践的に学習。",
    9: "実践的なプロンプトテクニック集。Few-shot learning、Chain of Thought、その他の高度なテクニックを習得。",
    10: "入力の最適化と出力の制御方法。構造化入出力、フォーマット制御、品質向上のテクニックを学習。",
    11: "ChatGPTの実践的な活用方法。カスタムインストラクション、プラグイン活用、業務への応用を習得。",
    12: "開発時のエラー対処法とデバッグテクニック。トラブルシューティングのベストプラクティスを学習。"
  };

  return summaries[chapterNum] || `第${chapterNum}章: ${title}の内容を学習します。`;
}

// 検索インデックス作成
function createSearchIndex(chapters) {
  const index = {};

  chapters.forEach(chapter => {
    // タグベースのインデックス
    chapter.search_tags.forEach(tag => {
      if (!index[tag]) index[tag] = [];
      index[tag].push(chapter.chapter_id);
    });

    // キーワードベースのインデックス
    chapter.key_concepts.forEach(concept => {
      const key = concept.toLowerCase();
      if (!index[key]) index[key] = [];
      if (!index[key].includes(chapter.chapter_id)) {
        index[key].push(chapter.chapter_id);
      }
    });
  });

  return index;
}

// エージェント用リファレンス作成
function createAgentReference(chapters) {
  return {
    quick_reference: chapters.map(ch => ({
      id: ch.chapter_id,
      title: ch.title,
      summary: ch.content_summary,
      tags: ch.search_tags
    })),
    keyword_map: chapters.reduce((map, ch) => {
      ch.key_concepts.forEach(concept => {
        if (!map[concept]) map[concept] = [];
        map[concept].push({
          chapter: ch.chapter_id,
          title: ch.title
        });
      });
      return map;
    }, {})
  };
}

// 実行
if (require.main === module) {
  createYamlCurriculum().catch(console.error);
}

module.exports = createYamlCurriculum;