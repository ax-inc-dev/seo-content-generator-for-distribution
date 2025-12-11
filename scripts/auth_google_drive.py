#!/usr/bin/env python3
"""
Google Drive API の認証を行い、トークンを保存
"""

import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# スコープの設定
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def authenticate_google_drive():
    """Google Drive APIの認証を行う"""
    creds = None
    token_file = 'token.pickle'
    
    # トークンファイルが存在する場合は読み込む
    if os.path.exists(token_file):
        with open(token_file, 'rb') as token:
            creds = pickle.load(token)
    
    # 認証が無効または存在しない場合
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # OAuth 2.0 フローを開始
            # client_secretsファイルを作成
            client_config = {
                "installed": {
                    "client_id": "764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com",
                    "client_secret": "d-FL95Q19q7MQmFpd7hHD0Ty",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": ["http://localhost:8080"]
                }
            }
            
            flow = InstalledAppFlow.from_client_config(
                client_config, SCOPES)
            creds = flow.run_local_server(port=8080)
        
        # トークンを保存
        with open(token_file, 'wb') as token:
            pickle.dump(creds, token)
    
    return creds

if __name__ == '__main__':
    print("Google Drive API の認証を開始します...")
    creds = authenticate_google_drive()
    
    # 認証が成功したか確認
    service = build('drive', 'v3', credentials=creds)
    
    # テスト: ルートフォルダのファイルを取得
    try:
        results = service.files().list(
            pageSize=10,
            fields="files(id, name)"
        ).execute()
        items = results.get('files', [])
        
        if not items:
            print('ファイルが見つかりませんでした。')
        else:
            print('認証成功！見つかったファイル:')
            for item in items:
                print(f"  {item['name']} ({item['id']})")
    except Exception as e:
        print(f"エラー: {e}")