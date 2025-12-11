#!/usr/bin/env python3
"""
gdownを使ってGoogle Drive outputsフォルダにアクセス
"""

import gdown
import os
import tempfile
import pandas as pd
import json

# フォルダURL
OUTPUTS_FOLDER_URL = 'https://drive.google.com/drive/folders/1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-'

def download_outputs_folder():
    """outputsフォルダをダウンロード"""
    print("Google Drive outputsフォルダをダウンロード中...")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = os.path.join(tmpdir, 'outputs')
        
        try:
            # フォルダ全体をダウンロード
            gdown.download_folder(url=OUTPUTS_FOLDER_URL, output=output_path, quiet=False)
            
            # ダウンロードしたファイルを確認
            print("\nダウンロードしたファイル:")
            companies = {}
            
            for root, dirs, files in os.walk(output_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    print(f"- {file}")
                    
                    # segments_index.csvを読む
                    if file == 'segments_index.csv':
                        print("\nsegments_index.csv を分析中...")
                        df = pd.read_csv(file_path)
                        
                        # PDFファイル名から企業を特定
                        pdf_files = df[df['file_name'].str.contains('.pdf', case=False, na=False)]
                        
                        for _, row in pdf_files.iterrows():
                            filename = row['file_name']
                            if 'グラシズ' in filename:
                                companies['グラシズ社'] = analyze_company_type(row)
                            elif 'Route66' in filename:
                                companies['Route66社'] = analyze_company_type(row)
                            elif 'WISDOM' in filename:
                                companies['WISDOM社'] = analyze_company_type(row)
                            elif 'C社' in filename:
                                companies['C社'] = analyze_company_type(row)
            
            return companies
            
        except Exception as e:
            print(f"エラー: {e}")
            print("\nフォルダが非公開の可能性があります。")
            print("Google Driveで以下の設定をお願いします：")
            print("1. outputsフォルダを右クリック")
            print("2. 「共有」→「リンクを取得」")
            print("3. 「制限付き」を「リンクを知っている全員」に変更")
            return {}

def analyze_company_type(row):
    """企業の業種を分析"""
    text = f"{row.get('transcript', '')} {row.get('summary', '')} {row.get('title', '')}"
    
    # キーワードから業種を推定
    if 'マーケ' in text or 'LP' in text or 'ライティング' in text:
        return 'マーケティング企業'
    elif 'コンテンツ' in text or '原稿' in text or '執筆' in text:
        return 'コンテンツ制作企業'
    elif '採用' in text or '人材' in text or 'HR' in text:
        return '人材サービス企業'
    elif 'メディア' in text or 'imp' in text or '広告' in text:
        return 'メディア運営企業'
    else:
        return '業種不明（詳細確認要）'

if __name__ == '__main__':
    companies = download_outputs_folder()
    print(f"\n各企業の業種:")
    for company, industry in companies.items():
        print(f"  {company}: {industry}")