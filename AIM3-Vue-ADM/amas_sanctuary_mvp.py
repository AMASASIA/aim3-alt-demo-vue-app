import gspread
from oauth2client.service_account import ServiceAccountCredentials
import google.generativeai as genai
from PIL import Image
import json
import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- 1. 設定エリア ---
GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY") # Use environment variable
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID") # Need to be added to .env
CREDENTIALS_FILE = "credentials.json"
SHEET_NAME = "PersonalData" # 作成したシート名

if not GEMINI_API_KEY:
    print("Error: VITE_GEMINI_API_KEY not found in environment variables.")
    exit(1)

# Geminiの初期化
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# --- 2. 過去データの抽出 (Context Fetch) ---
def get_past_context():
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    try:
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, scope)
        client = gspread.authorize(creds)
        sheet = client.open_by_key(SPREADSHEET_ID).worksheet(SHEET_NAME)
        
        # E列（Principle_Tag）の直近10行を取得
        all_values = sheet.get_all_values()
        # Assumes header is row 1, data starts row 2. Column E is index 4.
        past_tags = []
        if len(all_values) > 1:
            # Check if column E (index 4) exists
            if len(all_values[0]) > 4:
                 past_tags = [row[4] for row in all_values[1:][-10:] if len(row) > 4]
        
        return sheet, list(set(past_tags)) # 重複を除いたタグリスト
    except Exception as e:
        print(f"Spreadsheet Error: {e}")
        return None, []

# --- 3. 手書きOCR & タグ付けロジック (Orchestration) ---
def process_handwritten_note(image_path, past_tags):
    try:
        img = Image.open(image_path)
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        return None

    prompt = f"""
    あなたはAMAS OSのコア知能です。
    
    【過去の自分からのコンテキスト（既存タグ）】: {past_tags}
    
    【タスク】:
    1. 添付された手書きノートの画像をOCRし、核心的な思考を抽出してください。
    2. その思考が過去のタグのどれに関連するか、あるいは新しい原則か判断してください。
    
    【出力形式(JSONのみ)】:
    {{
      "soul_text": "ノートから要約された本音",
      "tags": ["関連タグ1", "新規タグ"],
      "vibe": {{"stress": 0.3, "energy": 0.8}},
      "thought": "なぜこのタグを選んだかの理由"
    }}
    """
    
    try:
        response = model.generate_content([prompt, img])
        # JSON部分のみを抽出（Markdownタグを削除）
        text_response = response.text
        # Naive cleaning, robust parsing would be better
        clean_json = text_response.replace('```json', '').replace('```', '').strip() 
        return json.loads(clean_json)
    except Exception as e:
        print(f"Gemini Processing Error: {e}")
        return None

# --- 4. 実行とWorkspaceへの記録 (Execution) ---
def run_mvp(image_path):
    print("🧚 A\Wallet 認証完了(シミュレート)...")

    if not SPREADSHEET_ID:
        print("Error: SPREADSHEET_ID not set in .env")
        return
    
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"Error: {CREDENTIALS_FILE} not found. Please place your Google Service Account credentials here.")
        return

    # 過去データの取得
    sheet, tags = get_past_context()
    if sheet is None:
        print("Could not access spreadsheet. Exiting.")
        return

    print(f"📚 過去の自分から {len(tags)} 個の文脈を読み込みました。")
    print(f"Tags found: {tags}")
    
    # Geminiによる解析
    result = process_handwritten_note(image_path, tags)
    if not result:
        print("Failed to analyze note.")
        return

    print(f"✨ ノートの解析完了: {result.get('tags', [])}")
    
    # スプレッドシートへ1行追加 (最小GASを使わず直接gspreadで実行)
    # カラム: Timestamp, Input_Type, Soul_Text, Metadata_Vibe, Principle_Tag, Advocacy_Action, Skill_Log
    new_row = [
        str(datetime.datetime.now()),
        "HANDWRITTEN",
        result.get('soul_text', ''),
        json.dumps(result.get('vibe', {})),
        ", ".join(result.get('tags', [])),
        "None",
        result.get('thought', '')
    ]
    
    try:
        sheet.append_row(new_row)
        print("✅ あなたの『聖域』に新しい魂のデータがアーカイブされました🧚")
    except Exception as e:
        print(f"Failed to append row: {e}")

# 実行
if __name__ == "__main__":
    # Example usage: python amas_sanctuary_mvp.py my_note.jpg
    import sys
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        # Default for testing if image exists
        image_path = "my_note.jpg" 
        
    print(f"Processing: {image_path}")
    run_mvp(image_path)
