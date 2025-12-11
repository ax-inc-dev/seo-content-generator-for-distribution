#!/usr/bin/env python3
"""
Google Drive API を使用して認証済みアクセスでoutputsフォルダを読み取る
"""

import os
import json
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

# スコープの設定
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# フォルダID
FOLDER_ID = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR'
OUTPUTS_FOLDER_ID = '1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-'

def authenticate():
    """Google Drive APIの認証"""
    creds = None
    
    # application_default_credentials.jsonを使用
    if os.path.exists('/Users/motoki/.config/gcloud/application_default_credentials.json'):
        with open('/Users/motoki/.config/gcloud/application_default_credentials.json', 'r') as f:
            cred_data = json.load(f)
            # OAuth2 credentials として使用
            from google.oauth2 import credentials
            creds = credentials.Credentials(
                token=cred_data.get('access_token'),
                refresh_token=cred_data.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=cred_data.get('client_id'),
                client_secret=cred_data.get('client_secret')
            )
    
    return build('drive', 'v3', credentials=creds)

def list_files_in_folder(service, folder_id):
    """フォルダ内のファイル一覧を取得"""
    try:
        results = service.files().list(
            q=f"'{folder_id}' in parents",
            pageSize=100,
            fields="files(id, name, mimeType, size)"
        ).execute()
        
        files = results.get('files', [])
        return files
    except Exception as e:
        print(f"Error listing files: {e}")
        return []

def read_csv_file(service, file_id, file_name):
    """CSVファイルの内容を読み取る"""
    try:
        request = service.files().get_media(fileId=file_id)
        file_content = io.BytesIO()
        downloader = MediaIoBaseDownload(file_content, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        
        file_content.seek(0)
        content = file_content.read().decode('utf-8')
        return content
    except Exception as e:
        print(f"Error reading {file_name}: {e}")
        return None

def analyze_outputs_folder():
    """outputsフォルダの内容を分析"""
    service = authenticate()
    
    # まずメインフォルダの内容を確認
    print(f"メインフォルダ (ID: {FOLDER_ID}) の内容:")
    main_files = list_files_in_folder(service, FOLDER_ID)
    for f in main_files:
        print(f"  - {f['name']} ({f['mimeType']})")
    
    # outputsフォルダの内容を確認
    print(f"\noutputsフォルダ (ID: {OUTPUTS_FOLDER_ID}) の内容:")
    outputs_files = list_files_in_folder(service, OUTPUTS_FOLDER_ID)
    
    result = {
        'csv_files': [],
        'parquet_files': [],
        'other_files': [],
        'company_info': {}
    }
    
    for f in outputs_files:
        print(f"  - {f['name']} ({f['mimeType']}, {f.get('size', 'N/A')} bytes)")
        
        if 'csv' in f['name'].lower():
            result['csv_files'].append(f['name'])
            
            # segments_index.csv を読み取る
            if f['name'] == 'segments_index.csv':
                print(f"\n{f['name']} を読み取り中...")
                content = read_csv_file(service, f['id'], f['name'])
                if content:
                    # CSVの最初の数行を表示
                    lines = content.split('\n')[:10]
                    print("最初の10行:")
                    for line in lines:
                        print(f"    {line[:200]}")  # 長い行は200文字で切る
                    
                    # 企業名を探す
                    import csv
                    import io
                    csv_reader = csv.DictReader(io.StringIO(content))
                    companies = set()
                    for row in csv_reader:
                        # PDFファイル名から企業名を抽出
                        if 'file_name' in row and '.pdf' in row.get('file_name', '').lower():
                            filename = row['file_name']
                            if 'グラシズ' in filename:
                                companies.add('グラシズ社')
                            elif 'Route66' in filename:
                                companies.add('Route66社')
                            elif 'WISDOM' in filename:
                                companies.add('WISDOM社')
                            elif 'C社' in filename:
                                companies.add('C社')
                        
                        # transcript や summary から業種情報を抽出
                        text = f"{row.get('transcript', '')} {row.get('summary', '')}"
                        if 'WISDOM' in text:
                            # WISDOM社の業種を特定
                            if '人材' in text or 'HR' in text:
                                result['company_info']['WISDOM社'] = '人材関連企業'
                            elif 'コンサル' in text:
                                result['company_info']['WISDOM社'] = 'コンサルティング企業'
                    
                    print(f"\n見つかった企業: {companies}")
        
        elif 'parquet' in f['name'].lower():
            result['parquet_files'].append(f['name'])
        else:
            result['other_files'].append(f['name'])
    
    return result

if __name__ == '__main__':
    result = analyze_outputs_folder()
    print(f"\n分析結果:")
    print(json.dumps(result, ensure_ascii=False, indent=2))