import google.generativeai as genai
import os
import time
from dotenv import load_dotenv

load_dotenv(override=True)
keys = os.environ.get("GEMINI_API_KEYS", "").split(",")

print(f"--- TESTING {len(keys)} KEYS ---")
for i, k in enumerate(keys):
    k = k.strip()
    if not k: continue
    print(f"Key {i+1} (...{k[-4:]}): ", end="", flush=True)
    try:
        genai.configure(api_key=k)
        model = genai.GenerativeModel('models/gemini-2.0-flash')
        model.generate_content("Hi", request_options={"timeout": 10})
        print("OK")
    except Exception as e:
        err = str(e)
        if "429" in err:
            print("BUSY (Rate Limit)")
        else:
            print(f"ERROR: {err[:50]}")

print("\nIf all are BUSY, please wait 60 seconds for Google's timer to reset.")
