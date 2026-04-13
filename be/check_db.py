from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/jovenes_al_ruedo_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

with SessionLocal() as db:
    # Check all conversations
    result = db.execute(text("SELECT id_conversacion, tipo, empresa_id, artista_id FROM conversacion")).fetchall()
    print("Conversaciones:", result)
    
    # Check any messages
    msgs = db.execute(text("SELECT id_msg, id_conversacion, remitente_id, contenido FROM mensaje")).fetchall()
    print("Mensajes:", msgs)
