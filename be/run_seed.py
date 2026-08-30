import sys; sys.path.insert(0, '.')
from app.database import SessionLocal
from app.seed import seed_admin_user
from app.models.user import User
from sqlalchemy import select

db = SessionLocal()
seed_admin_user(db)

admins = db.execute(select(User).where(User.role == "admin")).scalars().all()
print("=== UPDATED ADMIN USERS ===")
for a in admins:
    print(f"Email: {a.email} | Name: {a.full_name} | Role: {a.role}")

db.close()
