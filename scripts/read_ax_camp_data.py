#!/usr/bin/env python3
"""
AX CAMPのGoogle Driveデータを参照するスクリプト（ダウンロードなし）
"""

import os
import io
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import json
import csv
from io import StringIO

# フォルダID
FOLDER_ID = '1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-'

# 認証スコープ
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def authenticate():
    """Google Drive APIの認証"""
    try:
        # application_default_credentialsを直接使用
        import json
        creds_path = os.path.expanduser('~/.config/gcloud/application_default_credentials.json')
        
        if os.path.exists(creds_path):
            with open(creds_path, 'r') as f:
                creds_data = json.load(f)
            
            from google.oauth2.credentials import Credentials
            creds = Credentials(
                token=None,
                refresh_token=creds_data.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=creds_data.get('client_id'),
                client_secret=creds_data.get('client_secret'),
                scopes=['https://www.googleapis.com/auth/drive.readonly']
            )
            
            print(f"認証成功: nakagawa_motoki@a-x.inc")
            
            # quota_project_idを明示的に指定しない
            from googleapiclient import discovery
            return discovery.build('drive', 'v3', credentials=creds)
        else:
            print("認証ファイルが見つかりません")
            return None
    except Exception as e:
        print(f"認証エラー: {e}")
        return None

def list_files_in_folder(service, folder_id):
    """フォルダ内のファイル一覧を取得"""
    try:
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
                size_mb = int(size) / 1024 / 1024
                size = f"{size_mb:.2f} MB"
            print(f"  - {item['name']} (Type: {item['mimeType']}, Size: {size})")
        
        return items
    except Exception as e:
        print(f'エラー: {e}')
        return []

def read_csv_content(service, file_id, file_name):
    """CSVファイルの内容を直接読み込み（ダウンロードなし）"""
    try:
        print(f"\n📖 読み込み中: {file_name}")
        
        # ファイルの内容を取得
        request = service.files().get_media(fileId=file_id)
        content = request.execute()
        
        # バイト列を文字列に変換
        if isinstance(content, bytes):
            content_str = content.decode('utf-8')
        else:
            content_str = content
        
        # CSVとして解析
        csv_reader = csv.DictReader(StringIO(content_str))
        rows = list(csv_reader)
        
        print(f"  ✅ {len(rows)}行のデータを読み込みました")
        
        # 最初の数行を表示
        if rows:
            print(f"\n  📊 データのサンプル（最初の3行）:")
            for i, row in enumerate(rows[:3]):
                print(f"    行{i+1}: {dict(list(row.items())[:5])}...")  # 最初の5カラムのみ表示
        
        return rows
    except Exception as e:
        print(f"  ❌ 読み込みエラー: {e}")
        return None

def analyze_ax_camp_service(csv_data):
    """AX CAMPのサービス内容を分析"""
    print("\n🔍 AX CAMPサービス分析:")
    
    if not csv_data:
        print("データがありません")
        return
    
    # カラム名を確認
    if csv_data[0]:
        columns = list(csv_data[0].keys())
        print(f"\n  📋 データ構造:")
        print(f"    カラム: {columns}")
    
    # サービス関連のキーワードを検索
    keywords = ['研修', 'AI', 'カリキュラム', '法人', 'CAMP', 'サービス', '料金', '特徴']
    
    print(f"\n  🔎 キーワード検索結果:")
    for keyword in keywords:
        count = 0
        samples = []
        for row in csv_data:
            row_text = ' '.join(str(v) for v in row.values())
            if keyword in row_text:
                count += 1
                if len(samples) < 2:
                    samples.append(row_text[:100])
        
        if count > 0:
            print(f"    '{keyword}': {count}件")
            for sample in samples:
                print(f"      例: {sample}...")

def main():
    """メイン処理"""
    print("🚀 AX CAMPデータの参照を開始...")
    
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
    
    # CSVファイルを探す
    csv_files = [f for f in files if f['name'].endswith('.csv')]
    
    if csv_files:
        print(f"\n📥 CSVファイルを参照中...")
        for file in csv_files[:2]:  # 最初の2ファイルのみ参照
            csv_data = read_csv_content(service, file['id'], file['name'])
            if csv_data:
                analyze_ax_camp_service(csv_data)
    else:
        print("CSVファイルが見つかりません")
    
    print("\n✅ 参照完了！")

if __name__ == '__main__':
    main()