#!/usr/bin/env python3
"""
pdf_segments_index.csv から各企業の事業内容を詳細分析
"""

import gdown
import os
import tempfile
import pandas as pd
import json

OUTPUTS_FOLDER_URL = 'https://drive.google.com/drive/folders/1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-'

def analyze_business():
    """事業内容を詳細分析"""
    print("事業内容の詳細分析を開始...")
    
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
                        print(f"✅ CSVファイルを発見\n")
                        
                        # CSVを読み込み
                        df = pd.read_csv(csv_path)
                        
                        # 各企業の事業内容を詳細分析
                        analyze_each_company(df)
                        return
            
        except Exception as e:
            print(f"エラー: {e}")

def analyze_each_company(df):
    """各企業の詳細を分析"""
    
    companies = {
        'グラシズ': [],
        'Route66': [],
        'WISDOM': [],
        'C社': []
    }
    
    # 各行のテキストを企業別に収集
    for _, row in df.iterrows():
        file_name = str(row.get('file_name', ''))
        text = str(row.get('text', ''))
        summary = str(row.get('summary', ''))
        
        for company_name in companies.keys():
            if company_name in file_name:
                # 事業内容を示すキーワードがあるテキストを収集
                if any(keyword in text for keyword in ['事業内容', '代表', '社長', 'CEO', '主力', 'サービス', '広告', 'SNS', 'マーケ', 'コンテンツ', 'メディア']):
                    companies[company_name].append({
                        'text': text[:500],
                        'summary': summary[:200]
                    })
    
    # 分析結果を表示
    print("=" * 60)
    print("各企業の事業内容（PDFから抽出）")
    print("=" * 60)
    
    for company_name, texts in companies.items():
        print(f"\n【{company_name}社】")
        print("-" * 40)
        
        # 事業内容を含むテキストを探す
        business_found = False
        for item in texts:
            text = item['text']
            
            # "事業内容" を含むテキストを優先表示
            if '事業内容' in text:
                print("📌 事業内容の記載を発見:")
                # 事業内容の部分を抽出
                start_idx = text.find('事業内容')
                end_idx = min(start_idx + 200, len(text))
                print(f"  {text[start_idx:end_idx]}")
                business_found = True
                break
        
        # 事業内容が見つからない場合は、他の手がかりを表示
        if not business_found and texts:
            print("📌 関連情報:")
            for i, item in enumerate(texts[:3]):  # 最初の3件まで
                if len(item['text']) > 50:
                    print(f"  [{i+1}] {item['text'][:150]}...")
    
    # WISDOM社の詳細を特に分析
    print("\n" + "=" * 60)
    print("WISDOM社の詳細分析")
    print("=" * 60)
    
    wisdom_texts = []
    for _, row in df.iterrows():
        if 'WISDOM' in str(row.get('file_name', '')):
            text = str(row.get('text', ''))
            summary = str(row.get('summary', ''))
            
            # SNS、広告、ショート動画などのキーワードを探す
            if any(kw in text + summary for kw in ['SNS', 'ショート', '動画', '広告', 'TikTok', 'Instagram', 'YouTube']):
                wisdom_texts.append(text[:300])
    
    if wisdom_texts:
        print("\nWISDOM社の事業に関する記述:")
        for i, text in enumerate(wisdom_texts[:5]):
            if len(text) > 20:
                print(f"\n[{i+1}] {text}")
    
    # Route66社の詳細分析
    print("\n" + "=" * 60)
    print("Route66社の詳細分析")
    print("=" * 60)
    
    route66_texts = []
    for _, row in df.iterrows():
        if 'Route66' in str(row.get('file_name', '')):
            text = str(row.get('text', ''))
            if '事業' in text or 'マーケ' in text or 'コンテンツ' in text or '制作' in text:
                route66_texts.append(text[:300])
    
    if route66_texts:
        print("\nRoute66社の事業に関する記述:")
        for i, text in enumerate(route66_texts[:5]):
            if len(text) > 20:
                print(f"\n[{i+1}] {text}")
    
    # C社の詳細分析
    print("\n" + "=" * 60)
    print("C社の詳細分析")
    print("=" * 60)
    
    c_texts = []
    for _, row in df.iterrows():
        if 'C社' in str(row.get('file_name', '')):
            text = str(row.get('text', ''))
            if 'メディア' in text or '運営' in text or 'imp' in text or '広告' in text:
                c_texts.append(text[:300])
    
    if c_texts:
        print("\nC社の事業に関する記述:")
        for i, text in enumerate(c_texts[:5]):
            if len(text) > 20:
                print(f"\n[{i+1}] {text}")

if __name__ == '__main__':
    analyze_business()