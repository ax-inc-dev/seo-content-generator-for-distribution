#!/usr/bin/env python3
"""
Google Drive outputsフォルダに直接OAuth2でアクセス（プロジェクト不要）
"""

import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import json

# スコープ
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# フォルダID
OUTPUTS_FOLDER_ID = '1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-'

def authenticate():
    """OAuth2認証"""
    creds = None
    token_path = 'drive_token.pickle'
    
    # 保存されたトークンがあれば読み込む
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)
    
    # 認証が必要な場合
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # OAuth2 クライアント設定（Google APIコンソールで作成）
            client_config = {
                "installed": {
                    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
                    "client_secret": "YOUR_CLIENT_SECRET",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": ["http://localhost:8080"]
                }
            }
            
            flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            creds = flow.run_local_server(port=8080)
        
        # トークンを保存
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)
    
    return build('drive', 'v3', credentials=creds)

def read_outputs_folder():
    """outputsフォルダを読む"""
    service = authenticate()
    
    try:
        # フォルダ内のファイル一覧を取得
        results = service.files().list(
            q=f"'{OUTPUTS_FOLDER_ID}' in parents",
            pageSize=100,
            fields="files(id, name, mimeType)"
        ).execute()
        
        files = results.get('files', [])
        
        print(f"outputsフォルダ内のファイル数: {len(files)}")
        
        companies = {}
        for file in files:
            print(f"- {file['name']}")
            
            # PDFファイル名から企業情報を抽出
            if '.pdf' in file['name'].lower():
                if 'グラシズ' in file['name']:
                    companies['グラシズ社'] = 'PDFから業種を確認'
                elif 'Route66' in file['name']:
                    companies['Route66社'] = 'PDFから業種を確認'
                elif 'WISDOM' in file['name']:
                    companies['WISDOM社'] = 'PDFから業種を確認'
                elif 'C社' in file['name']:
                    companies['C社'] = 'PDFから業種を確認'
        
        return companies
        
    except Exception as e:
        print(f"エラー: {e}")
        return {}

if __name__ == '__main__':
    result = read_outputs_folder()
    print(f"\n企業情報: {json.dumps(result, ensure_ascii=False, indent=2)}")