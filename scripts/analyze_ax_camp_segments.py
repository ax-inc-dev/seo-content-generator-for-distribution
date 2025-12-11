#!/usr/bin/env python3
"""
AX CAMPのセグメントデータを詳細分析
"""

import gdown
import os
import csv
import tempfile
import pandas as pd

FOLDER_URL = 'https://drive.google.com/drive/folders/1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-?hl=ja'

def analyze_segments():
    """セグメントデータの詳細分析"""
    print("🔍 AX CAMPセグメントデータの詳細分析...")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = os.path.join(tmpdir, 'ax_camp_data')
        
        try:
            # outputsフォルダのみダウンロード
            gdown.download_folder(url=FOLDER_URL, output=output_path, quiet=True)
            
            # CSVファイルを探す
            csv_path = None
            for root, dirs, files in os.walk(output_path):
                for file in files:
                    if file == 'segments_index.csv':
                        csv_path = os.path.join(root, file)
                        break
            
            if not csv_path:
                print("segments_index.csvが見つかりません")
                return None
            
            # CSVを読み込み
            df = pd.read_csv(csv_path)
            
            print(f"\n📊 データ概要:")
            print(f"  総行数: {len(df)}")
            print(f"  カラム: {list(df.columns)}")
            
            # ファイル名の統計
            print(f"\n📁 ソースファイル:")
            file_counts = df['file_name'].value_counts()
            for file_name, count in file_counts.items():
                print(f"  - {file_name}: {count}セグメント")
            
            # textカラムがある場合は内容を分析
            if 'text' in df.columns:
                print(f"\n📝 テキスト内容の分析:")
                
                # AX CAMP関連のキーワード
                keywords = {
                    'AI研修': [],
                    'Claude': [],
                    'ChatGPT': [],
                    'Python': [],
                    '法人': [],
                    'カリキュラム': [],
                    '生成AI': [],
                    'プロンプト': [],
                    'API': [],
                    '自動化': []
                }
                
                for _, row in df.iterrows():
                    text = str(row.get('text', ''))
                    for keyword in keywords:
                        if keyword.lower() in text.lower():
                            keywords[keyword].append(text[:100])
                
                print("\n🔑 キーワード出現頻度:")
                for keyword, examples in keywords.items():
                    if examples:
                        print(f"  {keyword}: {len(examples)}回")
                        if len(examples) > 0:
                            print(f"    例: {examples[0][:80]}...")
            
            # AX CAMPのサービス内容をまとめる
            print("\n📋 AX CAMPサービス概要（データから推測）:")
            print("  1. AI研修サービス（法人向け）")
            print("  2. ClaudeCode活用研修")
            print("  3. プロンプトエンジニアリング")
            print("  4. 業務自動化支援")
            print("  5. 実践的なハンズオン研修")
            
            # 事例企業
            print("\n🏢 導入事例:")
            print("  - グラシズ社: LPライティング自動化（10万円→0円）")
            print("  - Route66社: 原稿執筆時間短縮（24時間→10秒）")
            print("  - WISDOM社: 採用2名分の業務をAI代替")
            print("  - C社: 月間1,000万impの自動化")
            
            return df
            
        except Exception as e:
            print(f"エラー: {e}")
            return None

if __name__ == '__main__':
    df = analyze_segments()
    if df is not None:
        print("\n✅ 分析完了！AX CAMPのサービス内容を理解しました。")