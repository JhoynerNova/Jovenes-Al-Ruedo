import urllib.request
import json

url = "http://127.0.0.1:8000/api/v1/users/profile/e8169c63-dc30-4b43-9148-5c77c186c397"
print(f"GET {url}")
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        data = json.loads(response.read().decode())
        print(f"User: {data.get('user', {}).get('full_name')}")
        print(f"Role: {data.get('user', {}).get('role')}")
        print(f"Customization: {data.get('user', {}).get('customization')}")
except Exception as e:
    print(f"Error: {e}")
