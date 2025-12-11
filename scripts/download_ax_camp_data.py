#!/usr/bin/env python3
"""
AX CAMPのGoogle Driveデータをダウンロードするスクリプト
"""

import os
import io
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import json

# フォルダID
FOLDER_ID = '1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-'

# 認証スコープ
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def authenticate():
    """Google Drive APIの認証"""
    creds = None
    
    # トークンファイルが存在する場合は読み込む
    token_path = os.path.expanduser('~/.config/gcloud/application_default_credentials.json')
    
    if os.path.exists(token_path):
        try:
            with open(token_path, 'r') as token:
                creds_data = json.load(token)
                # application_default_credentialsの形式をチェック
                print(f"認証情報を読み込みました: {token_path}")
                return build('drive', 'v3', credentials=None)
        except Exception as e:
            print(f"認証情報の読み込みエラー: {e}")
    
    # デフォルト認証を試す
    try:
        from google.auth import default
        creds, project = default()
        print(f"デフォルト認証を使用: プロジェクト={project}")
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        print(f"認証エラー: {e}")
        return None

def list_files_in_folder(service, folder_id):
    """フォルダ内のファイル一覧を取得"""
    try:
        # フォルダ内のファイルを検索
        query = f"'{folder_id}' in parents"
        results = service.files().list(
            q=query,
            pageSize=100,
            fields="files(id, name, mimeType, size)"
        ).execute()
        
        items = results.get('files', [])
        
        if not items:
            print('ファイルが見つかりません')
            return []
        
        print(f'\n📂 フォルダ内のファイル一覧:')
        for item in items:
            size = item.get('size', 'N/A')
            if size != 'N/A':
                size = f"{int(size) / 1024 / 1024:.2f} MB"
            print(f"  - {item['name']} (Type: {item['mimeType']}, Size: {size})")
        
        return items
    except Exception as e:
        print(f'エラー: {e}')
        return []

def download_file(service, file_id, file_name, output_dir='./data/ax-camp'):
    """ファイルをダウンロード"""
    try:
        # 出力ディレクトリを作成
        os.makedirs(output_dir, exist_ok=True)
        
        # ファイルをダウンロード
        request = service.files().get_media(fileId=file_id)
        file_path = os.path.join(output_dir, file_name)
        
        fh = io.FileIO(file_path, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
            if status:
                print(f"  ダウンロード中 {int(status.progress() * 100)}%")
        
        print(f"✅ ダウンロード完了: {file_path}")
        return file_path
    except Exception as e:
        print(f"ダウンロードエラー: {e}")
        return None

def main():
    """メイン処理"""
    print("🚀 AX CAMPデータのダウンロードを開始...")
    
    # 認証
    service = authenticate()
    if not service:
        print("❌ 認証に失敗しました")
        return
    
    # フォルダ内のファイル一覧を取得
    files = list_files_in_folder(service, FOLDER_ID)
    
    if not files:
        print("❌ ファイルが見つかりません")
        return
    
    # CSVファイルを優先的にダウンロード
    csv_files = [f for f in files if f['name'].endswith('.csv')]
    
    if csv_files:
        print(f"\n📥 CSVファイルをダウンロード中...")
        for file in csv_files[:5]:  # 最初の5ファイルのみ
            download_file(service, file['id'], file['name'])
    
    print("\n✅ 完了！")

if __name__ == '__main__':
    main()