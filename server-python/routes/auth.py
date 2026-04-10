from flask import Blueprint, request, jsonify, current_app
import jwt
import bcrypt
import datetime
from models import User
from extensions import db

auth_bp = Blueprint('auth', __name__)

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('userType')
        profile = data.get('profile', {})

        if not email or not password or not user_type:
            return jsonify({"errors": [{"msg": "Missing fields"}]}), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "User already exists"}), 400

        user = User(
            email=email,
            password=hash_password(password),
            user_type=user_type
        )
        user.set_profile(profile)
        
        db.session.add(user)
        db.session.commit()

        token = jwt.encode(
            {"userId": user.id, "userType": user.user_type, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
            current_app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        return jsonify({
            "token": token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "userType": user.user_type,
                "profile": user.get_profile()
            }
        }), 201
    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"errors": [{"msg": "Missing fields"}]}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not check_password(password, user.password):
            return jsonify({"message": "Invalid credentials"}), 400

        token = jwt.encode(
            {"userId": user.id, "userType": user.user_type, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
            current_app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        return jsonify({
            "token": token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "userType": user.user_type,
                "profile": user.get_profile()
            }
        }), 200
    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_me():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"message": "No token provided"}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        user = User.query.get(decoded['userId'])
        if not user:
             return jsonify({"message": "User not found"}), 404
             
        return jsonify({
            "_id": str(user.id),
            "email": user.email,
            "userType": user.user_type,
            "profile": user.get_profile(),
            "rating": {"average": user.rating_average, "count": user.rating_count},
            "isVerified": user.is_verified,
            "createdAt": user.created_at.isoformat() if user.created_at else None
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401
