import urllib.request
import urllib.error
import urllib.parse
import json

url = "http://localhost:8000/api/v1/chat/conversaciones/directo"
req = urllib.request.Request(url, method="OPTIONS")
req.add_header("Origin", "http://localhost:5173")
req.add_header("Access-Control-Request-Method", "POST")

try:
    response = urllib.request.urlopen(req)
    print("OPTIONS status:", response.status)
    print("OPTIONS headers:", response.headers)
except urllib.error.HTTPError as e:
    print("OPTIONS error status:", e.code)
    print("OPTIONS error headers:", e.headers)
    print("OPTIONS error body:", e.read().decode())
except Exception as e:
    print("OPTIONS error:", e)
