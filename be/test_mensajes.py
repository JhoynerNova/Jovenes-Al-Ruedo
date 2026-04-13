import urllib.request
import json
import urllib.parse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import sys
sys.path.append(".")
from app.core.security import create_access_token

DATABASE_URL = "postgresql://jar_user:jar_password@localhost:5433/jovenes_al_ruedo"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

with SessionLocal() as db:
    # Let's get the active conversation
    row = db.execute(text("SELECT id_conversacion, empresa_id FROM conversacion LIMIT 1")).fetchone()
    if not row:
        print("No conversations")
        exit()
    id_conversacion, empresa_id = row
    # Get user email
    user = db.execute(text(f"SELECT email FROM users WHERE id = '{empresa_id}'")).fetchone()
    
# Generate token
token = create_access_token(data={"sub": str(empresa_id), "role": "empresa"})

# 2. Get mensajes
url = f"http://localhost:8000/api/v1/chat/conversacion/{id_conversacion}/mensajes"
req = urllib.request.Request(url)
req.add_header("Authorization", f"Bearer {token}")
try:
    resp = urllib.request.urlopen(req)
    print("Mensajes API Response:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("Mensajes API HTTP Error:", e.code, e.read().decode())
except Exception as e:
    print("Mensajes API Error:", e)
