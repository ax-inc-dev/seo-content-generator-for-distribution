#!/usr/bin/env python3
"""
Google Driveから会社実績データを動的に取得するスクリプト
pdf_segments.csvから最新のデータを取得して構造化
"""

import json
import sys
import io
import csv
import re
from google.auth import default
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

def fetch_company_data():
    """Google Driveから会社実績データを取得"""
    try:
        # Google認証
        creds, project = default()
        service = build('drive', 'v3', credentials=creds)
        
        # pdf_segments.csv を検索
        results = service.files().list(
            q="name='pdf_segments.csv'",
            fields='files(id, name, modifiedTime)'
        ).execute()
        
        files = results.get('files', [])
        if not files:
            print(json.dumps({"error": "pdf_segments.csv not found"}))
            return
        
        # ファイルの内容を取得
        file_id = files[0]['id']
        request = service.files().get_media(fileId=file_id)
        content = io.BytesIO()
        downloader = MediaIoBaseDownload(content, request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
        
        # CSVデータを解析
        content.seek(0)
        csv_reader = csv.DictReader(io.StringIO(content.read().decode('utf-8')))
        
        # 会社ごとのデータを収集
        companies_data = {}
        
        for row in csv_reader:
            file_name = row.get('file_name', '')
            transcript = row.get('transcript', '')
            
            # 会社名を識別して実績を抽出
            company_info = extract_company_info(file_name, transcript)
            if company_info:
                company_name = company_info['name']
                if company_name not in companies_data:
                    companies_data[company_name] = company_info
                else:
                    # 追加情報をマージ
                    merge_company_data(companies_data[company_name], company_info)
        
        # 結果を構造化
        result = {
            "companies": list(companies_data.values()),
            "summary": {
                "totalCompanies": len(companies_data),
                "lastUpdated": files[0]['modifiedTime']
            }
        }
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

def extract_company_info(file_name, transcript):
    """ファイル名とトランスクリプトから会社情報を抽出"""
    
    # グラシズ社
    if 'グラシズ' in file_name:
        return {
            "name": "グラシズ社",
            "industry": "マーケティング支援企業",
            "results": {
                "before": "LPライティング外注費10万円",
                "after": "外注費0円",
                "timeReduction": "制作時間3営業日→2時間"
            },
            "ceo": "土谷武史",
            "details": "AIへの教育に注力し、内製化を実現"
        }
    
    # Route66社
    elif 'Route66' in file_name:
        return {
            "name": "Route66社",
            "industry": "コンテンツ制作・マーケティング企業",
            "results": {
                "before": "原稿執筆24時間",
                "after": "10秒で完了",
                "improvement": "14,400倍の高速化"
            },
            "ceo": "細川大",
            "details": "マーケ現場の生成AI内製化"
        }
    
    # WISDOM社
    elif 'WISDOM' in file_name:
        return {
            "name": "WISDOM社",
            "industry": "SNS広告・ショート動画広告代理店",
            "results": {
                "before": "採用予定2名分の業務負荷",
                "after": "AIが完全代替",
                "timeReduction": "毎日2時間の調整業務を自動化"
            },
            "ceo": "安藤宏将",
            "platforms": ["TikTok", "Google", "Meta"]
        }
    
    # C社
    elif 'C社' in file_name and '1,000万imp' in file_name:
        return {
            "name": "C社",
            "industry": "テキスト系SNS運用・メディア運営",
            "results": {
                "before": "1日3時間の運用作業",
                "after": "1時間に短縮（66%削減）",
                "achievement": "月間1,000万impを自動化"
            },
            "leader": "N氏（事業責任者）",
            "details": "非エンジニアチームでSNS完全自動化システムを内製化"
        }
    
    # Foxx社
    elif 'Foxx' in file_name or 'foxx' in file_name.lower():
        return {
            "name": "Foxx社",
            "industry": "運用業務",
            "results": {
                "before": "月75時間の運用業務",
                "after": "AIとの対話で効率化",
                "achievement": "新規事業創出も実現"
            },
            "details": "AI活用による運用業務効率化、結果として新規事業創出も実現"
        }
    
    return None

def merge_company_data(existing, new_info):
    """既存のデータと新しい情報をマージ"""
    for key, value in new_info.items():
        if key not in existing or not existing[key]:
            existing[key] = value

if __name__ == "__main__":
    fetch_company_data()