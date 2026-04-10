from extensions import db
from datetime import datetime
import json

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(20), nullable=False) # student, employee, company
    
    # Profile JSON (Simplification to mimic mongo easily without 5 separate tables for now)
    profile_data = db.Column(db.Text, default='{}')
    
    # Followers and following could also be saved as comma separated lists or JSON arrays for now
    followers = db.Column(db.Text, default='[]')
    following = db.Column(db.Text, default='[]')
    
    rating_average = db.Column(db.Float, default=0.0)
    rating_count = db.Column(db.Integer, default=0)
    is_verified = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_profile(self, profile_dict):
        self.profile_data = json.dumps(profile_dict)
        
    def get_profile(self):
        return json.loads(self.profile_data) if self.profile_data else {}
        
    def to_dict(self):
        return {
            "_id": str(self.id),
            "email": self.email,
            "userType": self.user_type,
            "profile": self.get_profile(),
            "rating": {"average": self.rating_average, "count": self.rating_count},
            "isVerified": self.is_verified,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.String(50), default='open')
    skills_required = db.Column(db.Text, default='[]')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text') # text, voice
    file_url = db.Column(db.String(255), nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages')

    def to_dict(self):
        return {
            "_id": str(self.id),
            "sender": self.sender.to_dict() if self.sender else str(self.sender_id),
            "receiver": self.receiver.to_dict() if self.receiver else str(self.receiver_id),
            "content": self.content,
            "messageType": self.message_type,
            "fileUrl": self.file_url,
            "isRead": self.is_read,
            "readAt": self.read_at.isoformat() if self.read_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reviewee_id = db.Column(db.Integer, nullable=False)
    project_id = db.Column(db.Integer, nullable=True)
    rating = db.Column(db.Float, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

