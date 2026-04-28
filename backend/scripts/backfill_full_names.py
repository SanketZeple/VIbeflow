import sys
import os

# Add backend to sys.path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User

def update_full_names():
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.full_name == None).all()
        print(f"Found {len(users)} users with no full_name.")
        for user in users:
            # Extract name from email as a default
            default_name = user.email.split('@')[0].capitalize()
            user.full_name = default_name
            print(f"Updating user {user.email} -> {default_name}")
        db.commit()
        print("Update complete.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_full_names()
