from app import app, db
from models import User, Project, Message, Review

with app.app_context():
    db.drop_all()
    db.create_all()
    print("Database re-initialized successfully.")
