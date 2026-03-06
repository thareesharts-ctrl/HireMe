import requests
import json

url = "http://localhost:5000/api/generate-roadmap"
data = {"domain": "Full Stack Development"}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=data, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"ERROR: {e}")
