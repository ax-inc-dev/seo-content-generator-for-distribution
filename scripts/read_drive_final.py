#!/usr/bin/env python3
"""
Google Drive outputsフォルダの内容を読み取る（最終版）
"""

import os
import json
import pandas as pd
from google.auth import default
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

# フォルダID
MAIN_FOLDER_ID = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR'
OUTPUTS_FOLDER_ID = '1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-'

def get_drive_service():
    """Google Drive サービスを取得"""
    # Application Default Credentials を使用
    creds, project = default(scopes=['https://www.googleapis.com/auth/drive.readonly'])
    service = build('drive', 'v3', credentials=creds)
    return service

def list_folder_contents(service, folder_id, folder_name):
    """フォルダの内容をリスト"""
    print(f"\n{folder_name}の内容:")
    try:
        results = service.files().list(
            q=f"'{folder_id}' in parents",
            pageSize=100,
            fields="files(id, name, mimeType, size)",
            supportsAllDrives=True
        ).execute()
        
        files = results.get('files', [])
        
        if not files:
            print('  ファイルが見つかりませんでした')
        else:
            for f in files:
                size = f.get('size', 'N/A')
                if size != 'N/A':
                    size = f"{int(size):,} bytes"
                print(f"  - {f['name']} ({f['mimeType']}, {size})")
        
        return files
    except Exception as e:
        print(f"  エラー: {e}")
        return []

def download_file(service, file_id, file_name):
    """ファイルをダウンロード"""
    try:
        request = service.files().get_media(fileId=file_id)
        file_content = io.BytesIO()
        downloader = MediaIoBaseDownload(file_content, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        
        file_content.seek(0)
        return file_content.read()
    except Exception as e:
        print(f"  ダウンロードエラー ({file_name}): {e}")
        return None

def analyze_segments_csv(service, files):
    """segments_index.csv を分析して企業情報を抽出"""
    segments_file = next((f for f in files if f['name'] == 'segments_index.csv'), None)
    
    if not segments_file:
        print("segments_index.csv が見つかりません")
        return {}
    
    print(f"\nsegments_index.csv を分析中...")
    content = download_file(service, segments_file['id'], 'segments_index.csv')
    
    if not content:
        return {}
    
    # pandas で CSV を読み込む
    import io
    df = pd.read_csv(io.BytesIO(content))
    
    print(f"  総レコード数: {len(df)}")
    print(f"  カラム: {list(df.columns)}")
    
    # ファイル名から企業を特定
    if 'file_name' in df.columns:
        unique_files = df['file_name'].unique()
        print(f"\n  ユニークファイル:")
        for file in unique_files:
            print(f"    - {file}")
    
    # PDFファイルから企業情報を抽出
    company_info = {}
    pdf_files = df[df['file_name'].str.contains('.pdf', case=False, na=False)] if 'file_name' in df.columns else pd.DataFrame()
    
    for _, row in pdf_files.iterrows():
        filename = row['file_name']
        text = f"{row.get('transcript', '')} {row.get('summary', '')} {row.get('title', '')}"
        
        # 各企業の業種を特定
        if 'グラシズ' in filename:
            # テキストから業種を推定
            if 'マーケ' in text or 'LP' in text or 'ライティング' in text:
                company_info['グラシズ社'] = 'マーケティング企業'
            else:
                company_info['グラシズ社'] = '（PDFから業種を特定）'
                
        elif 'Route66' in filename:
            if 'コンテンツ' in text or '原稿' in text or 'マーケ' in text:
                company_info['Route66社'] = 'コンテンツ制作企業'
            else:
                company_info['Route66社'] = '（PDFから業種を特定）'
                
        elif 'WISDOM' in filename:
            # WISDOMの業種を特定するためテキストを詳しく分析
            if '採用' in text or '人材' in text or 'HR' in text:
                company_info['WISDOM社'] = '人材サービス企業'
            elif 'コンサル' in text:
                company_info['WISDOM社'] = 'コンサルティング企業'
            elif '調整' in text and '業務' in text:
                company_info['WISDOM社'] = '業務支援サービス企業'
            else:
                company_info['WISDOM社'] = '（詳細な業種は要確認）'
                
        elif 'C社' in filename:
            if 'メディア' in text or 'imp' in text or '広告' in text:
                company_info['C社'] = 'メディア運営企業'
            else:
                company_info['C社'] = '（PDFから業種を特定）'
    
    # サンプルデータを表示
    print(f"\n  PDFファイルのサンプル（最初の3件）:")
    for idx, row in pdf_files.head(3).iterrows():
        print(f"\n  [{idx}] {row.get('file_name', 'N/A')}")
        print(f"    Title: {row.get('title', 'N/A')}")
        print(f"    Summary: {row.get('summary', 'N/A')[:200]}...")
    
    return company_info

def main():
    """メイン処理"""
    print("Google Drive outputsフォルダの分析を開始...")
    
    # サービスを取得
    service = get_drive_service()
    
    # メインフォルダの内容を確認
    main_files = list_folder_contents(service, MAIN_FOLDER_ID, "メインフォルダ")
    
    # outputsフォルダを探す
    outputs_folder = next((f for f in main_files if f['name'] == 'outputs'), None)
    if outputs_folder:
        print(f"\noutputsフォルダが見つかりました: {outputs_folder['id']}")
        # outputsフォルダの内容を確認
        outputs_files = list_folder_contents(service, outputs_folder['id'], "outputsフォルダ")
    else:
        # 直接outputsフォルダIDでアクセス
        outputs_files = list_folder_contents(service, OUTPUTS_FOLDER_ID, "outputsフォルダ（直接ID）")
    
    # segments_index.csv を分析
    company_info = analyze_segments_csv(service, outputs_files)
    
    print("\n========== 分析結果 ==========")
    print("\n各企業の業種:")
    for company, industry in company_info.items():
        print(f"  {company}: {industry}")
    
    print("\n結論:")
    if not company_info:
        print("  企業情報を特定できませんでした。PDFファイルの内容を直接確認する必要があります。")
    else:
        print("  上記の業種は推定です。正確な業種はPDFの内容を詳しく確認してください。")
    
    return company_info

if __name__ == '__main__':
    result = main()
    print(f"\n最終結果: {json.dumps(result, ensure_ascii=False, indent=2)}")