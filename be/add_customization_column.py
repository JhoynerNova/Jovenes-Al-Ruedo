from app.database import engine
from sqlalchemy import text

def add_column():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS customization JSON;"))
        conn.commit()
        print("Columna 'customization' (JSON) verificada y anadida exitosamente en PostgreSQL")

if __name__ == "__main__":
    add_column()
