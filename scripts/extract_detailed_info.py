#!/usr/bin/env python3
"""
pdf_segments_index.csv から詳細な企業情報を抽出
"""

import gdown
import os
import tempfile
import pandas as pd
import json

OUTPUTS_FOLDER_URL = 'https://drive.google.com/drive/folders/1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-'

def extract_detailed_info():
    """詳細な企業情報を抽出"""
    print("Google Drive から詳細情報を取得中...")
    
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
                        print(f"✅ pdf_segments_index.csv を発見")
                        
                        # CSVを読み込み
                        df = pd.read_csv(csv_path)
                        
                        # 詳細な分析
                        return analyze_in_detail(df)
            
            print("❌ pdf_segments_index.csv が見つかりません")
            return {}
            
        except Exception as e:
            print(f"❌ エラー: {e}")
            return {}

def analyze_in_detail(df):
    """詳細な分析"""
    companies = {
        'グラシズ社': {
            'company': 'グラシズ社',
            'industry': 'マーケティング支援企業',
            'details': [],
            'challenges': [],
            'solutions': [],
            'results': [],
            'keywords': set()
        },
        'Route66社': {
            'company': 'Route66社', 
            'industry': 'コンテンツ制作企業',
            'details': [],
            'challenges': [],
            'solutions': [],
            'results': [],
            'keywords': set()
        },
        'WISDOM社': {
            'company': 'WISDOM社',
            'industry': 'コンサルティング企業',
            'details': [],
            'challenges': [],
            'solutions': [],
            'results': [],
            'keywords': set()
        },
        'C社': {
            'company': 'C社',
            'industry': 'メディア運営企業',
            'details': [],
            'challenges': [],
            'solutions': [],
            'results': [],
            'keywords': set()
        }
    }
    
    # 各行を詳細分析
    for _, row in df.iterrows():
        file_name = str(row.get('file_name', ''))
        text = str(row.get('text', ''))
        summary = str(row.get('summary', ''))
        title = str(row.get('title', ''))
        
        # 全テキストを結合
        full_text = f"{title} {text} {summary}"
        
        # 企業別に情報を振り分け
        for company_key, company_data in companies.items():
            if company_key.replace('社', '') in file_name or company_key in full_text:
                
                # 課題を抽出
                if '課題' in full_text or '問題' in full_text or '悩み' in full_text:
                    if text and len(text) > 10:
                        company_data['challenges'].append(text[:200])
                
                # 解決策を抽出
                if 'AI' in full_text and ('導入' in full_text or '活用' in full_text):
                    if text and len(text) > 10:
                        company_data['solutions'].append(text[:200])
                
                # 成果を抽出
                if '成果' in full_text or '削減' in full_text or '向上' in full_text or '改善' in full_text:
                    if text and len(text) > 10:
                        company_data['results'].append(text[:200])
                
                # 具体的な数値を抽出
                import re
                numbers = re.findall(r'\d+[万千億百]?[円時間人名%]', full_text)
                if numbers:
                    company_data['details'].extend(numbers)
                
                # キーワードを抽出
                keywords = [
                    'LP', 'ライティング', '外注', '内製化', 'マーケティング',
                    '原稿', '執筆', 'コンテンツ', '制作', '自動化',
                    '採用', '調整', '業務', '人材', 'HR',
                    'imp', 'インプレッション', 'メディア', '広告', '運用',
                    'ChatGPT', 'Claude', 'Gemini', 'Python', 'API',
                    'Google Apps Script', 'GAS', 'スプレッドシート',
                    'プロンプト', 'エンジニアリング', 'RAG'
                ]
                
                for kw in keywords:
                    if kw in full_text:
                        company_data['keywords'].add(kw)
    
    # set を list に変換
    for company in companies.values():
        company['keywords'] = list(company['keywords'])
        # 重複を削除
        company['details'] = list(set(company['details']))
        company['challenges'] = list(set([c[:100] for c in company['challenges']]))[:3]
        company['solutions'] = list(set([s[:100] for s in company['solutions']]))[:3]
        company['results'] = list(set([r[:100] for r in company['results']]))[:3]
    
    return companies

def save_to_json(companies):
    """JSON形式で保存"""
    output_path = 'data/drive_detailed_info.json'
    
    # データを整形
    formatted_data = {
        'extracted_at': pd.Timestamp.now().isoformat(),
        'source': 'Google Drive pdf_segments_index.csv',
        'companies': companies
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(formatted_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 詳細情報を {output_path} に保存しました")
    return output_path

if __name__ == '__main__':
    companies = extract_detailed_info()
    
    print("\n========== 詳細分析結果 ==========")
    for company_name, info in companies.items():
        print(f"\n【{company_name}】")
        print(f"  業種: {info['industry']}")
        print(f"  抽出した数値: {', '.join(info['details'][:5])}")
        print(f"  キーワード: {', '.join(info['keywords'][:10])}")
        
        if info['challenges']:
            print(f"  課題: {info['challenges'][0][:50]}...")
        if info['solutions']:
            print(f"  解決策: {info['solutions'][0][:50]}...")
        if info['results']:
            print(f"  成果: {info['results'][0][:50]}...")
    
    # JSONファイルに保存
    if companies:
        save_to_json(companies)