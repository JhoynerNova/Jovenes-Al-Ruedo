import urllib.request
import json
import urllib.parse

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://jar_user:jar_password@localhost:5433/jovenes_al_ruedo"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

with SessionLocal() as db:
    # Let's get the user who has a conversation
    row = db.execute(text("SELECT empresa_id FROM conversacion LIMIT 1")).fetchone()
    if not row:
        print("No conversations")
        exit()
    empresa_id = row[0]
    # Get user email
    user = db.execute(text(f"SELECT email, act_password FROM users WHERE id = '{empresa_id}'")).fetchone()
    
# We won't login. We'll just generate an access token for this user!
import sys
sys.path.append(".")
from app.core.security import create_access_token
from app.schemas.user import TokenData
token = create_access_token(data={"sub": user[0], "role": "empresa"})

# Call API
req_chat = urllib.request.Request("http://localhost:8000/api/v1/chat/conversaciones")
req_chat.add_header("Authorization", f"Bearer {token}")
try:
    resp = urllib.request.urlopen(req_chat)
    print("API Response:", resp.read().decode())
except Exception as e:
    print("API Error:", e.read().decode() if hasattr(e, 'read') else str(e))
