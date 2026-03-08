import urllib.request
import json

req = urllib.request.Request(
    'http://localhost:8000/api/staff/open-session?staff_id=2', 
    data=json.dumps({'division_id': 1}).encode(), 
    headers={'Content-Type': 'application/json'}
)
try:
    res = urllib.request.urlopen(req)
    print("SUCCESS:")
    print(res.read().decode())
except Exception as e:
    print("ERROR:")
    print(e)
    try:
        print(e.read().decode())
    except:
        pass
