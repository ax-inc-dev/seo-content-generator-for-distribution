#!/usr/bin/env python3
"""
gdownを使用してAX CAMPのGoogle Driveデータを参照
"""

import gdown
import os
import csv
import tempfile

# Google DriveフォルダのURL
FOLDER_URL = 'https://drive.google.com/drive/folders/1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-?hl=ja'

def download_and_read_csv():
    """gdownでCSVファイルをダウンロードして読み込み"""
    try:
        print("🚀 gdownでAX CAMPデータにアクセス中...")
        
        # 一時ディレクトリを作成
        with tempfile.TemporaryDirectory() as tmpdir:
            print(f"📂 一時フォルダ: {tmpdir}")
            
            # フォルダ内のファイルをダウンロード（最初の数ファイルのみ）
            # 注: gdownはフォルダ全体のダウンロードに制限がある場合があります
            output_path = os.path.join(tmpdir, 'ax_camp_data')
            
            try:
                # フォルダのダウンロードを試みる
                gdown.download_folder(url=FOLDER_URL, output=output_path, quiet=False)
                
                # ダウンロードしたファイルを確認
                for root, dirs, files in os.walk(output_path):
                    for file in files:
                        if file.endswith('.csv'):
                            file_path = os.path.join(root, file)
                            print(f"\n📄 CSVファイル発見: {file}")
                            
                            # CSVを読み込み
                            with open(file_path, 'r', encoding='utf-8') as f:
                                reader = csv.DictReader(f)
                                rows = list(reader)
                                
                                print(f"  ✅ {len(rows)}行のデータ")
                                
                                # 最初の数行を表示
                                if rows:
                                    print(f"  📊 データサンプル:")
                                    for i, row in enumerate(rows[:3]):
                                        print(f"    行{i+1}: {dict(list(row.items())[:3])}...")
                                
                                # AX CAMP関連の情報を探す
                                analyze_ax_camp_content(rows)
                                
            except Exception as e:
                print(f"フォルダダウンロードエラー: {e}")
                print("\n代替案: 個別ファイルのダウンロードを試みます...")
                
                # 個別ファイルのIDを指定してダウンロード（IDが分かれば）
                # ここにファイルIDを追加できます
                
    except Exception as e:
        print(f"エラー: {e}")

def analyze_ax_camp_content(rows):
    """AX CAMPのサービス内容を分析"""
    print("\n🔍 AX CAMPサービス内容の分析:")
    
    keywords = ['AI', '研修', 'CAMP', '法人', 'カリキュラム', 'Python', 'ChatGPT', '生成AI']
    
    for keyword in keywords:
        count = 0
        examples = []
        
        for row in rows:
            row_text = ' '.join(str(v) for v in row.values())
            if keyword.lower() in row_text.lower():
                count += 1
                if len(examples) < 2:
                    # 最初の100文字を保存
                    examples.append(row_text[:100])
        
        if count > 0:
            print(f"  '{keyword}': {count}件")
            for ex in examples:
                print(f"    例: {ex}...")

if __name__ == '__main__':
    download_and_read_csv()