import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)
keys_raw = os.environ.get("GEMINI_API_KEYS")
if not keys_raw:
    print("KEYS NOT FOUND IN ENV")
    sys.exit(1)
keys = keys_raw.split(",")
key = keys[0].strip()

print(f"Testing with Key: {key[:10]}...")
genai.configure(api_key=key)
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"Trying {m.name}...")
        try:
            model = genai.GenerativeModel(m.name)
            response = model.generate_content("Hi", request_options={"timeout": 10})
            print(f"SUCCESS with {m.name}!")
            sys.exit(0)
        except Exception as e:
            print(f"Failed {m.name}: {e}")
print("ALL MODELS FAILED")
sys.exit(1)
