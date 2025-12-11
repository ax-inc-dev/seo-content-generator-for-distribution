#!/usr/bin/env python3
"""
pdf_segments_index.csv を読み込んで企業情報を分析
"""

import gdown
import os
import tempfile
import pandas as pd
import json

# フォルダURL
OUTPUTS_FOLDER_URL = 'https://drive.google.com/drive/folders/1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-'

def download_and_analyze():
    """pdf_segments_index.csvをダウンロードして分析"""
    print("Google Drive outputsフォルダからpdf_segments_index.csvを取得中...")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = os.path.join(tmpdir, 'outputs')
        
        try:
            # フォルダをダウンロード
            gdown.download_folder(url=OUTPUTS_FOLDER_URL, output=output_path, quiet=True)
            
            # pdf_segments_index.csvを探す
            for root, dirs, files in os.walk(output_path):
                for file in files:
                    if file == 'pdf_segments_index.csv':
                        csv_path = os.path.join(root, file)
                        print(f"✅ pdf_segments_index.csv を発見: {csv_path}")
                        
                        # CSVを読み込んで分析
                        df = pd.read_csv(csv_path)
                        
                        print(f"\n総レコード数: {len(df)}")
                        print(f"カラム: {list(df.columns)}")
                        
                        # 企業情報を分析
                        companies = analyze_company_details(df)
                        
                        return companies
            
            print("❌ pdf_segments_index.csv が見つかりません")
            return {}
            
        except Exception as e:
            print(f"❌ エラー: {e}")
            return {}

def analyze_company_details(df):
    """詳細な企業情報を分析"""
    companies = {}
    
    # 各行を確認
    print("\n=== 企業情報の詳細分析 ===")
    
    for _, row in df.iterrows():
        file_name = row.get('file_name', '')
        title = row.get('title', '')
        transcript = row.get('transcript', '')
        summary = row.get('summary', '')
        text = f"{title} {transcript} {summary}"
        
        # グラシズ社
        if 'グラシズ' in file_name or 'グラシズ' in text:
            if 'グラシズ社' not in companies:
                companies['グラシズ社'] = {
                    'file': file_name,
                    'title': title,
                    'type': '',
                    'keywords': []
                }
            
            # キーワードから業種を特定
            if 'LP' in text or 'ライティング' in text:
                companies['グラシズ社']['type'] = 'マーケティング支援企業'
                companies['グラシズ社']['keywords'].append('LPライティング')
            if '外注' in text:
                companies['グラシズ社']['keywords'].append('外注削減')
        
        # Route66社
        elif 'Route66' in file_name or 'Route66' in text:
            if 'Route66社' not in companies:
                companies['Route66社'] = {
                    'file': file_name,
                    'title': title,
                    'type': '',
                    'keywords': []
                }
            
            # キーワードから業種を特定
            if '原稿' in text or '執筆' in text:
                companies['Route66社']['type'] = 'コンテンツ制作企業'
                companies['Route66社']['keywords'].append('原稿執筆')
            if 'マーケ' in text:
                companies['Route66社']['keywords'].append('マーケティング')
        
        # WISDOM社
        elif 'WISDOM' in file_name or 'WISDOM' in text:
            if 'WISDOM社' not in companies:
                companies['WISDOM社'] = {
                    'file': file_name,
                    'title': title,
                    'type': '',
                    'keywords': []
                }
            
            # テキストから業種を詳しく分析
            print(f"\nWISDOM社の詳細テキスト:")
            print(f"  Title: {title[:100]}")
            print(f"  Summary: {summary[:200]}")
            print(f"  Transcript: {transcript[:200]}")
            
            # キーワードから業種を特定
            if '採用' in text:
                companies['WISDOM社']['keywords'].append('採用')
            if '調整' in text:
                companies['WISDOM社']['keywords'].append('調整業務')
            if '人材' in text or 'HR' in text:
                companies['WISDOM社']['type'] = '人材サービス企業'
            elif 'コンサル' in text:
                companies['WISDOM社']['type'] = 'コンサルティング企業'
            elif '教育' in text:
                companies['WISDOM社']['type'] = '教育サービス企業'
            elif 'マーケ' in text:
                companies['WISDOM社']['type'] = 'マーケティング企業'
            else:
                companies['WISDOM社']['type'] = '（業種特定要追加情報）'
        
        # C社
        elif 'C社' in file_name or 'C社' in text:
            if 'C社' not in companies:
                companies['C社'] = {
                    'file': file_name,
                    'title': title,
                    'type': '',
                    'keywords': []
                }
            
            # キーワードから業種を特定
            if 'imp' in text or 'インプレッション' in text:
                companies['C社']['type'] = 'メディア運営企業'
                companies['C社']['keywords'].append('imp自動化')
            if 'メディア' in text:
                companies['C社']['keywords'].append('メディア')
    
    return companies

if __name__ == '__main__':
    companies = download_and_analyze()
    
    print("\n========== 分析結果 ==========")
    for company, info in companies.items():
        print(f"\n{company}:")
        print(f"  業種: {info['type']}")
        print(f"  ファイル: {info['file']}")
        print(f"  キーワード: {', '.join(info['keywords'])}")