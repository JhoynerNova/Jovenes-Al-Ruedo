import urllib.request
import urllib.error
import json

# Start by logging in as the company created by the agent: newempresa@test.com
url_login = "http://localhost:8000/api/v1/auth/token"
data_login = urllib.parse.urlencode({
    "username": "newempresa@test.com",
    "password": "Test1234!"
}).encode('utf-8')

req_login = urllib.request.Request(url_login, data=data_login)
try:
    with urllib.request.urlopen(req_login) as response:
        token_data = json.loads(response.read().decode())
        token = token_data['access_token']
        print("Got token")
except Exception as e:
    # try the old credential if newempresa doesn't work
    print("Could not login as newempresa:", e)
    data_login = urllib.parse.urlencode({
        "username": "empresa@test.com",
        "password": "Test1234!"
    }).encode('utf-8')
    req_login = urllib.request.Request(url_login, data=data_login)
    with urllib.request.urlopen(req_login) as response:
        token_data = json.loads(response.read().decode())
        token = token_data['access_token']
        print("Got token (fallback)")

url = "http://localhost:8000/api/v1/chat/conversaciones/directo"
req = urllib.request.Request(url, method="POST")
req.add_header("Authorization", f"Bearer {token}")
req.add_header("Content-Type", "application/json")
req.add_header("Origin", "http://localhost:5173")

# We need an artist id. Let's just find an artist first or send a dummy UUID. The code expects UUID format.
data = json.dumps({"artista_id": "00000000-0000-0000-0000-000000000000"}).encode('utf-8')

try:
    response = urllib.request.urlopen(req, data=data)
    print("POST status:", response.status)
    print("POST response:", response.read().decode())
except urllib.error.HTTPError as e:
    print("POST error status:", e.code)
    print("POST error body:", e.read().decode())
except Exception as e:
    print("POST error:", e)
