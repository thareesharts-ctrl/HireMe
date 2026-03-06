import urllib.request
import json

data = json.dumps({"skills":["Data Science"],"history":[]}).encode('utf-8')
req = urllib.request.Request('http://localhost:5000/api/interview/next', data=data, headers={'Content-Type': 'application/json'}, method='POST')

try:
    with urllib.request.urlopen(req) as f:
        msg = f.read().decode()
        print(msg)
        with open('error_log.txt', 'w') as errf:
            errf.write(msg)
except Exception as e:
    msg = e.read().decode()
    print(msg)
    with open('error_log.txt', 'w') as errf:
        errf.write(msg)
