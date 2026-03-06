import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.environ.get("GEMINI_API_KEY", "")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')

try:
    response = model.generate_content("Hello, this is a test. Just say Hi.")
    print("Success:", response.text)
except Exception as e:
    print("Error:", str(e))
