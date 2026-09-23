import sys; sys.path.insert(0, '.')
from app.database import SessionLocal
from app.models.conversacion import Conversacion
from app.models.chat import Mensaje
from app.models.user import User
from sqlalchemy import select
from app.routers.chat import _user_participates, _get_otro_participante, _build_conversacion_response

db = SessionLocal()

print("=== CHECKING ALL CONVERSATIONS ===")
convs = db.execute(select(Conversacion)).scalars().all()
users = db.execute(select(User)).scalars().all()

for c in convs:
    print(f"\n--- CONVERSATION {c.id_conversacion} (tipo={c.tipo}, emp={c.empresa_id}, art={c.artista_id}) ---")
    msgs = db.execute(select(Mensaje).where(Mensaje.id_conversacion == c.id_conversacion)).scalars().all()
    print(f"Total msgs: {len(msgs)}")
    for u in users:
        participates = _user_participates(c, u.id) or u.role == "admin"
        if participates:
            try:
                resp = _build_conversacion_response(c, u, db)
                # print(f"  User {u.full_name} ({u.role}): OK -> otro_nombre={resp.otro_usuario_nombre}")
            except Exception as e:
                print(f"  ERROR for User {u.full_name} ({u.role}): {e}")
        else:
            pass

print("\nDone testing.")
db.close()
