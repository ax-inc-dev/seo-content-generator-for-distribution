import axCampCurriculum from "../data/ax-camp-curriculum.json";

interface CurriculumChapter {
  chapter_id: number;
  title: string;
  key_concepts?: Record<string, string>;
  examples?: Array<{ type: string; content: string }>;
  practical_tips?: string[];
  quotes?: string[];
  learning_objectives?: string[];
}

interface RelevantSection {
  chapter: string;
  chapter_id: number;
  concepts?: Record<string, string>;
  examples?: Array<{ type: string; content: string }>;
  tips?: string[];
  quotes?: string[];
  objectives?: string[];
}

export class CurriculumDataService {
  private curriculum = axCampCurriculum.ax_camp_curriculum;

  /**
   * キーワードに関連する章・セクションを検索
   */
  findRelevantSections(keyword: string): RelevantSection | null {
    const lowerKeyword = keyword.toLowerCase();
    const relevantSections: RelevantSection[] = [];

    // 各章をスキャン
    for (const chapter of this.curriculum.chapters) {
      let relevanceScore = 0;
      const section: RelevantSection = {
        chapter: chapter.title,
        chapter_id: chapter.chapter_id,
      };

      // タイトルマッチ
      if (chapter.title.toLowerCase().includes(lowerKeyword)) {
        relevanceScore += 10;
      }

      // キーコンセプトマッチ
      if (chapter.key_concepts) {
        const matchedConcepts: Record<string, string> = {};
        for (const [concept, definition] of Object.entries(
          chapter.key_concepts
        )) {
          if (
            concept.toLowerCase().includes(lowerKeyword) ||
            definition.toLowerCase().includes(lowerKeyword)
          ) {
            matchedConcepts[concept] = definition;
            relevanceScore += 5;
          }
        }
        if (Object.keys(matchedConcepts).length > 0) {
          section.concepts = matchedConcepts;
        }
      }

      // 例のマッチ
      if (chapter.examples) {
        const matchedExamples = chapter.examples.filter((ex) => {
          // 安全チェック：typeとcontentが存在することを確認
          if (!ex || typeof ex !== "object") return false;
          const typeMatch =
            ex.type &&
            typeof ex.type === "string" &&
            ex.type.toLowerCase().includes(lowerKeyword);
          const contentMatch =
            ex.content &&
            typeof ex.content === "string" &&
            ex.content.toLowerCase().includes(lowerKeyword);
          return typeMatch || contentMatch;
        });
        if (matchedExamples.length > 0) {
          section.examples = matchedExamples;
          relevanceScore += 3;
        }
      }

      // 実践的なTipsのマッチ
      if (chapter.practical_tips) {
        const matchedTips = chapter.practical_tips.filter(
          (tip) =>
            // 安全チェック：tipが文字列であることを確認
            tip &&
            typeof tip === "string" &&
            tip.toLowerCase().includes(lowerKeyword)
        );
        if (matchedTips.length > 0) {
          section.tips = matchedTips;
          relevanceScore += 2;
        }
      }

      // 引用のマッチ
      if (chapter.quotes) {
        const matchedQuotes = chapter.quotes.filter((quote) =>
          quote.toLowerCase().includes(lowerKeyword)
        );
        if (matchedQuotes.length > 0) {
          section.quotes = matchedQuotes;
          relevanceScore += 1;
        }
      }

      // 学習目標のマッチ
      if (chapter.learning_objectives) {
        const matchedObjectives = chapter.learning_objectives.filter((obj) =>
          obj.toLowerCase().includes(lowerKeyword)
        );
        if (matchedObjectives.length > 0) {
          section.objectives = matchedObjectives;
          relevanceScore += 2;
        }
      }

      if (relevanceScore > 0) {
        relevantSections.push({ ...section, relevanceScore } as any);
      }
    }

    // 最も関連性の高いセクションを返す
    if (relevantSections.length > 0) {
      return relevantSections.sort(
        (a: any, b: any) => b.relevanceScore - a.relevanceScore
      )[0];
    }

    // グローバルインデックスからも検索
    const globalResult = this.searchGlobalIndex(keyword);
    if (globalResult) {
      return globalResult;
    }

    return null;
  }

  /**
   * 特定の概念の説明を取得
   */
  getConceptExplanation(concept: string): string | null {
    const lowerConcept = concept.toLowerCase();

    for (const chapter of this.curriculum.chapters) {
      if (chapter.key_concepts) {
        for (const [key, definition] of Object.entries(chapter.key_concepts)) {
          if (key.toLowerCase().includes(lowerConcept)) {
            return `${key}：${definition}（${chapter.title}より）`;
          }
        }
      }
    }

    return null;
  }

  /**
   * グローバルインデックスから検索
   */
  private searchGlobalIndex(keyword: string): RelevantSection | null {
    // global_indexが存在しない場合は早期リターン（v3では未実装）
    if (!this.curriculum.global_index) {
      return null;
    }

    const lowerKeyword = keyword.toLowerCase();
    const { concepts, techniques } = this.curriculum.global_index;

    // コンセプトインデックスを検索
    for (const [concept, chapterIds] of Object.entries(concepts)) {
      if (concept.toLowerCase().includes(lowerKeyword)) {
        const chapterId = chapterIds[0];
        const chapter = this.curriculum.chapters.find(
          (ch) => ch.chapter_id === chapterId
        );
        if (chapter) {
          return {
            chapter: chapter.title,
            chapter_id: chapter.chapter_id,
            concepts: chapter.key_concepts,
            examples: chapter.examples,
            tips: chapter.practical_tips,
            quotes: chapter.quotes,
          };
        }
      }
    }

    // テクニックインデックスを検索
    for (const [technique, chapterIds] of Object.entries(techniques)) {
      if (technique.toLowerCase().includes(lowerKeyword)) {
        const chapterId = chapterIds[0];
        const chapter = this.curriculum.chapters.find(
          (ch) => ch.chapter_id === chapterId
        );
        if (chapter) {
          return {
            chapter: chapter.title,
            chapter_id: chapter.chapter_id,
            tips: chapter.practical_tips,
            examples: chapter.examples,
          };
        }
      }
    }

    return null;
  }

  /**
   * 特定のチャプターIDから情報を取得
   */
  getChapterById(chapterId: number): CurriculumChapter | null {
    return (
      this.curriculum.chapters.find((ch) => ch.chapter_id === chapterId) || null
    );
  }

  /**
   * プロンプトエンジニアリング関連の情報を取得（特別メソッド）
   */
  getPromptEngineeringInfo(): RelevantSection | null {
    const chapter3 = this.getChapterById(3);
    if (chapter3) {
      return {
        chapter: chapter3.title,
        chapter_id: 3,
        concepts: chapter3.key_concepts,
        examples: chapter3.examples,
        tips: chapter3.practical_tips,
        quotes: chapter3.quotes,
      };
    }
    return null;
  }

  /**
   * AIエージェント関連の情報を取得（特別メソッド）
   */
  getAIAgentInfo(): RelevantSection | null {
    const chapter5 = this.getChapterById(5);
    if (chapter5) {
      return {
        chapter: chapter5.title,
        chapter_id: 5,
        concepts: chapter5.key_concepts,
        examples: chapter5.examples,
        tips: chapter5.practical_tips,
        quotes: chapter5.quotes,
      };
    }
    return null;
  }

  /**
   * 記事生成用のコンテキストを構築
   */
  buildArticleContext(keyword: string): string {
    const relevantSection = this.findRelevantSections(keyword);
    if (!relevantSection) {
      return "";
    }

    let context = `\n【AX CAMPカリキュラム参考情報】\n`;
    context += `出典：${relevantSection.chapter}\n\n`;

    if (relevantSection.concepts) {
      context += "◆ 重要概念:\n";
      for (const [concept, definition] of Object.entries(
        relevantSection.concepts
      )) {
        context += `・${concept}：${definition}\n`;
      }
      context += "\n";
    }

    if (relevantSection.examples && relevantSection.examples.length > 0) {
      context += "◆ 実例:\n";
      for (const example of relevantSection.examples) {
        context += `・[${example.type}] ${example.content}\n`;
      }
      context += "\n";
    }

    if (relevantSection.tips && relevantSection.tips.length > 0) {
      context += "◆ 実践的アドバイス:\n";
      for (const tip of relevantSection.tips) {
        context += `・${tip}\n`;
      }
      context += "\n";
    }

    if (relevantSection.quotes && relevantSection.quotes.length > 0) {
      context += "◆ 重要フレーズ:\n";
      for (const quote of relevantSection.quotes) {
        context += `・${quote}\n`;
      }
      context += "\n";
    }

    return context;
  }

  /**
   * メトリクス情報を取得
   */
  getMetrics(): Record<string, string> {
    return this.curriculum.global_index?.metrics || {};
  }

  /**
   * 全カリキュラムデータを取得（互換性のため）
   */
  getAllCurriculumData(): Array<{
    title: string;
    description: string;
    modules: Array<{ title: string; description: string }>;
  }> {
    return this.curriculum.chapters.map((chapter) => ({
      title: chapter.title,
      description: `チャプター${chapter.chapter_id}の内容`,
      modules: Object.entries(chapter.key_concepts || {}).map(
        ([key, value]) => ({
          title: key,
          description: value,
        })
      ),
    }));
  }
}

// シングルトンインスタンスをエクスポート
export const curriculumDataService = new CurriculumDataService();
