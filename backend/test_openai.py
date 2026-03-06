import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(override=True)
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "ping"}]
    )
    print("SUCCESS")
    print(response.choices[0].message.content)
except Exception as e:
    print(f"FAILED: {e}")
