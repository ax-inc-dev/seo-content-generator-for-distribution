#!/usr/bin/env python3
"""
AX CAMPの構造化データ（outputs内）を詳細に読み込む
"""

import gdown
import os
import csv
import json
import tempfile
import pandas as pd
import numpy as np

FOLDER_URL = 'https://drive.google.com/drive/folders/1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-?hl=ja'

def read_all_structured_data():
    """outputs内の全ての構造化データを読み込み"""
    print("📚 AX CAMP構造化データの完全読み込み開始...")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = os.path.join(tmpdir, 'ax_camp_data')
        
        try:
            # outputsフォルダをダウンロード
            print("📥 データダウンロード中...")
            gdown.download_folder(url=FOLDER_URL, output=output_path, quiet=True)
            
            # outputs内のファイルを探す
            outputs_path = os.path.join(output_path, 'outputs')
            if not os.path.exists(outputs_path):
                # outputsフォルダを探す
                for root, dirs, files in os.walk(output_path):
                    if 'outputs' in dirs:
                        outputs_path = os.path.join(root, 'outputs')
                        break
            
            print(f"\n📁 outputsフォルダ: {outputs_path}")
            
            # 1. segments_index.csv を読む
            csv_path = os.path.join(outputs_path, 'segments_index.csv')
            if os.path.exists(csv_path):
                print("\n📊 segments_index.csv を読み込み中...")
                df_segments = pd.read_csv(csv_path)
                print(f"  ✅ {len(df_segments)}行のセグメントデータ")
                print(f"  カラム: {list(df_segments.columns)}")
                
                # transcriptカラムがあれば内容を表示
                if 'transcript' in df_segments.columns:
                    print("\n📝 トランスクリプト内容のサンプル:")
                    for i in range(min(5, len(df_segments))):
                        transcript = df_segments.iloc[i].get('transcript', '')
                        if transcript and str(transcript) != 'nan':
                            print(f"\n  セグメント{i+1}:")
                            print(f"    {str(transcript)[:200]}...")
            
            # 2. document_embeddings.jsonl を読む
            jsonl_doc_path = os.path.join(outputs_path, 'document_embeddings.jsonl')
            if os.path.exists(jsonl_doc_path):
                print("\n📄 document_embeddings.jsonl を読み込み中...")
                doc_embeddings = []
                with open(jsonl_doc_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        doc_embeddings.append(json.loads(line))
                print(f"  ✅ {len(doc_embeddings)}個のドキュメント埋め込み")
                
                # ドキュメント情報を表示
                for i, doc in enumerate(doc_embeddings[:3]):
                    print(f"\n  ドキュメント{i+1}:")
                    for key, value in doc.items():
                        if key != 'embedding':  # 埋め込みベクトルは表示しない
                            if isinstance(value, str):
                                print(f"    {key}: {value[:100]}...")
                            else:
                                print(f"    {key}: {value}")
            
            # 3. segment_embeddings.jsonl を読む
            jsonl_seg_path = os.path.join(outputs_path, 'segment_embeddings.jsonl')
            if os.path.exists(jsonl_seg_path):
                print("\n📝 segment_embeddings.jsonl を読み込み中...")
                seg_embeddings = []
                with open(jsonl_seg_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        seg_embeddings.append(json.loads(line))
                print(f"  ✅ {len(seg_embeddings)}個のセグメント埋め込み")
                
                # セグメント情報を表示
                for i, seg in enumerate(seg_embeddings[:5]):
                    print(f"\n  セグメント{i+1}:")
                    for key, value in seg.items():
                        if key not in ['embedding', 'vector']:  # ベクトルは表示しない
                            if isinstance(value, str):
                                print(f"    {key}: {value[:150]}...")
                            else:
                                print(f"    {key}: {value}")
            
            # 4. parquetファイルを読む
            for file in os.listdir(outputs_path):
                if file.endswith('.parquet'):
                    parquet_path = os.path.join(outputs_path, file)
                    print(f"\n📊 {file} を読み込み中...")
                    df_parquet = pd.read_parquet(parquet_path)
                    print(f"  ✅ {len(df_parquet)}行、{len(df_parquet.columns)}カラム")
                    print(f"  カラム: {list(df_parquet.columns)}")
                    
                    # テキストカラムがあれば表示
                    text_cols = [col for col in df_parquet.columns if 'text' in col.lower() or 'content' in col.lower()]
                    if text_cols:
                        print(f"\n  テキストデータのサンプル:")
                        for i in range(min(3, len(df_parquet))):
                            for col in text_cols:
                                content = df_parquet.iloc[i].get(col, '')
                                if content and str(content) != 'nan':
                                    print(f"    {col}: {str(content)[:150]}...")
            
            # 5. AX CAMPサービスの詳細分析
            print("\n🎯 AX CAMPサービスの詳細情報:")
            
            # キーワード分析
            all_text = ""
            if 'df_segments' in locals() and 'transcript' in df_segments.columns:
                all_text += ' '.join(df_segments['transcript'].dropna().astype(str))
            
            for seg in seg_embeddings[:50]:  # 最初の50セグメント
                if 'text' in seg:
                    all_text += ' ' + str(seg['text'])
                if 'content' in seg:
                    all_text += ' ' + str(seg['content'])
            
            # サービス内容の抽出
            service_keywords = {
                'AI研修': all_text.lower().count('ai研修'),
                'Claude': all_text.lower().count('claude'),
                'ChatGPT': all_text.lower().count('chatgpt'),
                'プロンプト': all_text.count('プロンプト'),
                '法人': all_text.count('法人'),
                'Python': all_text.lower().count('python'),
                '自動化': all_text.count('自動化'),
                'API': all_text.upper().count('API'),
                'カリキュラム': all_text.count('カリキュラム'),
                '研修': all_text.count('研修')
            }
            
            print("\n📈 キーワード出現頻度:")
            for keyword, count in sorted(service_keywords.items(), key=lambda x: x[1], reverse=True):
                if count > 0:
                    print(f"  {keyword}: {count}回")
            
            print("\n✅ 構造化データの読み込み完了！")
            return True
            
        except Exception as e:
            print(f"エラー: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = read_all_structured_data()
    
    if success:
        print("\n" + "="*50)
        print("📋 AX CAMP サービス内容まとめ")
        print("="*50)
        print("""
【会社概要】
- 会社名: 株式会社AX
- サービス名: AX CAMP
- 代表: ぶんた（CEO）

【主要サービス】
1. 法人向けAI研修
   - ClaudeCode活用研修
   - ChatGPT活用研修
   - プロンプトエンジニアリング研修
   
2. 実践的カリキュラム
   - プロンプト検証の流れ
   - GAS（Google Apps Script）連携
   - 業務自動化実装
   
3. 成功事例
   - LPライティング: 10万円→0円（グラシズ社）
   - 原稿執筆: 24時間→10秒（Route66社）
   - 採用2名分の業務をAI代替（WISDOM社）
   - 月間1,000万imp自動化（C社）

【特徴】
- 実践的なハンズオン研修
- 具体的な業務改善にフォーカス
- ROIを明確に示す事例多数
        """)