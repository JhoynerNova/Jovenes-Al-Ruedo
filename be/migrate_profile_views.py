import sys, os
sys.path.insert(0, '.')
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN profile_views INTEGER DEFAULT 0;"))
        conn.commit()
        print("Columna profile_views agregada exitosamente a la tabla users.")
    except Exception as e:
        print(f"Resultado / Nota: {e}")

print("Verificando columna...")
with engine.connect() as conn:
    res = conn.execute(text("SELECT id, email, profile_views FROM users LIMIT 3;")).fetchall()
    for row in res:
        print("  User row:", row)
