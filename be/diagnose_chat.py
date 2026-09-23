import sys; sys.path.insert(0, '.')
from app.database import SessionLocal
from app.models.conversacion import Conversacion
from app.models.user import User
from sqlalchemy import select

db = SessionLocal()

print("=== USUARIOS ===")
for u in db.execute(select(User)).scalars().all():
    n = u.full_name or "?"
    print("  id=" + str(u.id) + " | role=" + str(u.role) + " | name=" + n)

print()
print("=== CONVERSACIONES ===")
for c in db.execute(select(Conversacion)).scalars().all():
    emp = db.execute(select(User).where(User.id == c.empresa_id)).scalar_one_or_none()
    art = db.execute(select(User).where(User.id == c.artista_id)).scalar_one_or_none()
    emp_name = emp.full_name if emp else "?"
    art_name = art.full_name if art else "?"
    print("  conv_id=" + str(c.id_conversacion) + " | tipo=" + str(c.tipo) + " | emp_id=" + str(c.empresa_id) + " (" + emp_name + ") | art_id=" + str(c.artista_id) + " (" + art_name + ")")

db.close()
