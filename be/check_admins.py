import sys; sys.path.insert(0, '.')
from app.database import SessionLocal
from app.models.user import User
from sqlalchemy import select

db = SessionLocal()
admins = db.execute(select(User).where(User.role == "admin")).scalars().all()
print("=== ADMIN USERS IN DB ===")
for a in admins:
    print(f"ID: {a.id} | Email: {a.email} | Name: {a.full_name} | Active: {a.is_active}")
db.close()
