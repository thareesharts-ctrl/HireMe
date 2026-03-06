import requests

url = "http://127.0.0.1:5000/api/generate-test"
payload = {"skills": ["React", "Express"]}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    # print(f"Response: {response.json()}")
    data = response.json()
    if data.get("success"):
        print(f"Generated {len(data.get('questions', []))} questions successfully.")
    else:
        print(f"Error: {data}")
except Exception as e:
    print(f"Fetch Error: {e}")
