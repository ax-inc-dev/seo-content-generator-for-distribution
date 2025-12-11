#!/usr/bin/env python3
"""
Google Drive outputsフォルダを定期的に同期・確認するスクリプト
"""

import gdown
import os
import tempfile
import pandas as pd
import json
from datetime import datetime

# フォルダURL
OUTPUTS_FOLDER_URL = 'https://drive.google.com/drive/folders/1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-'

# ローカル保存先
LOCAL_OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'drive_outputs')

def sync_outputs_folder():
    """outputsフォルダを同期"""
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Google Drive同期開始...")
    
    # ローカルディレクトリを作成
    os.makedirs(LOCAL_OUTPUTS_DIR, exist_ok=True)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = os.path.join(tmpdir, 'outputs')
        
        try:
            # フォルダをダウンロード
            gdown.download_folder(url=OUTPUTS_FOLDER_URL, output=output_path, quiet=True)
            
            # segments_index.csvをコピー
            src_csv = os.path.join(output_path, 'outputs', 'segments_index.csv')
            if os.path.exists(src_csv):
                dst_csv = os.path.join(LOCAL_OUTPUTS_DIR, 'segments_index.csv')
                import shutil
                shutil.copy2(src_csv, dst_csv)
                print(f"  ✅ segments_index.csv を更新")
                
                # 企業情報を分析
                companies = analyze_companies(dst_csv)
                
                # 企業情報をJSONで保存
                companies_json = os.path.join(LOCAL_OUTPUTS_DIR, 'companies.json')
                with open(companies_json, 'w', encoding='utf-8') as f:
                    json.dump(companies, f, ensure_ascii=False, indent=2)
                print(f"  ✅ companies.json を更新")
                
                return companies
            else:
                print("  ⚠️ segments_index.csv が見つかりません")
                return {}
                
        except Exception as e:
            print(f"  ❌ エラー: {e}")
            return {}

def analyze_companies(csv_path):
    """企業情報を分析"""
    df = pd.read_csv(csv_path)
    
    companies = {}
    pdf_files = df[df['file_name'].str.contains('.pdf', case=False, na=False)]
    
    for _, row in pdf_files.iterrows():
        filename = row['file_name']
        text = f"{row.get('transcript', '')} {row.get('summary', '')} {row.get('title', '')}"
        
        if 'グラシズ' in filename:
            # LPライティング、マーケティング関連のキーワードを探す
            if 'LP' in text or 'ライティング' in text or 'マーケ' in text:
                companies['グラシズ社'] = {
                    'type': 'マーケティング支援企業',
                    'detail': 'LPライティング外注費10万円→0円',
                    'keywords': ['LP', 'ライティング', 'マーケティング']
                }
                
        elif 'Route66' in filename:
            if '原稿' in text or '執筆' in text or 'コンテンツ' in text:
                companies['Route66社'] = {
                    'type': 'コンテンツ制作企業', 
                    'detail': '原稿執筆時間24時間→10秒',
                    'keywords': ['原稿', '執筆', 'コンテンツ']
                }
                
        elif 'WISDOM' in filename:
            # WISDOM社の業種を詳しく分析
            if '採用' in text:
                companies['WISDOM社'] = {
                    'type': '採用関連サービス企業',
                    'detail': '採用予定2名分の業務をAI代替、毎日2時間の調整業務を自動化',
                    'keywords': ['採用', '調整', '業務']
                }
            elif '人材' in text or 'HR' in text:
                companies['WISDOM社'] = {
                    'type': '人材サービス企業',
                    'detail': '採用予定2名分の業務をAI代替',
                    'keywords': ['人材', 'HR']
                }
            else:
                companies['WISDOM社'] = {
                    'type': '業務支援サービス企業',
                    'detail': '毎日2時間の調整業務を自動化',
                    'keywords': ['調整', '業務', '自動化']
                }
                
        elif 'C社' in filename:
            if 'imp' in text or 'メディア' in text or '広告' in text:
                companies['C社'] = {
                    'type': 'メディア運営企業',
                    'detail': '月間1,000万impを自動化',
                    'keywords': ['メディア', 'imp', '広告']
                }
    
    return companies

def get_latest_companies():
    """最新の企業情報を取得"""
    companies_json = os.path.join(LOCAL_OUTPUTS_DIR, 'companies.json')
    
    if os.path.exists(companies_json):
        with open(companies_json, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        # ファイルがない場合は同期を実行
        return sync_outputs_folder()

if __name__ == '__main__':
    # 同期を実行
    companies = sync_outputs_folder()
    
    print("\n========== 企業情報 ==========")
    for company, info in companies.items():
        print(f"\n{company}:")
        print(f"  業種: {info['type']}")
        print(f"  詳細: {info['detail']}")
        print(f"  キーワード: {', '.join(info['keywords'])}")