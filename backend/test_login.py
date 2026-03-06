import urllib.request
import json
import traceback

data = json.dumps({'email':'test@test.com','password':'test'}).encode('utf-8')
req = urllib.request.Request('http://localhost:5000/api/login', data=data, headers={'Content-Type': 'application/json'}, method='POST')

try:
    response = urllib.request.urlopen(req)
    print("SUCCESS:", response.read().decode())
except Exception as e:
    try:
        print("HTTP_ERROR_BODY:", e.read().decode())
    except:
        print("GENERIC_ERROR:", str(e))
