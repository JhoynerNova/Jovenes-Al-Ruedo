import urllib.request
import json
import urllib.parse

# 1. Login
data_login = urllib.parse.urlencode({
    "username": "newempresa@test.com",
    "password": "Test1234!"
}).encode('utf-8')
try:
    req_login = urllib.request.Request("http://localhost:8000/api/v1/auth/token", data=data_login)
    response = urllib.request.urlopen(req_login)
except:
    req_login = urllib.request.Request("http://localhost:8000/api/v1/auth/login", data=data_login)
    response = urllib.request.urlopen(req_login)

token = json.loads(response.read().decode())['access_token']

# 2. Get conversaciones
req_chat = urllib.request.Request("http://localhost:8000/api/v1/chat/conversaciones")
req_chat.add_header("Authorization", f"Bearer {token}")
resp = urllib.request.urlopen(req_chat)
print("Conversaciones JSON:", resp.read().decode())
