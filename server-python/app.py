from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, socketio

app = Flask(__name__)
# Enable CORS for frontend
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://wayconnect.vercel.app"]}}, supports_credentials=True)

# Configuration
app.config['SECRET_KEY'] = 'your_super_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wayconnect.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
socketio.init_app(app)

# Import models to ensure they are created
from models import *

# Register Blueprints
from routes.auth import auth_bp
from routes.users import users_bp
from routes.projects import projects_bp
from routes.reviews import reviews_bp
from routes.chat import chat_bp
from routes.discovery import discovery_bp
from routes.search import search_bp
from routes.skills import skills_bp
from routes.smartMatch import smart_match_bp
from routes.linkedin import linkedin_bp
from routes.payments import payments_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(projects_bp, url_prefix='/api/projects')
app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(discovery_bp, url_prefix='/api/discovery')
app.register_blueprint(search_bp, url_prefix='/api/search')
app.register_blueprint(skills_bp, url_prefix='/api/skills')
app.register_blueprint(smart_match_bp, url_prefix='/api/smart-match')
app.register_blueprint(linkedin_bp, url_prefix='/api/linkedin')
app.register_blueprint(payments_bp, url_prefix='/api/payments')

# Socket.io events
from flask_socketio import emit, join_room, leave_room

connected_users = {} # Track connected users: {userId: socketId}

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('join-room')
def on_join(user_id):
    join_room(str(user_id))
    connected_users[str(user_id)] = request.sid
    print(f"User {user_id} joined room")

@socketio.on('send-message')
def handle_send_message(data):
    print(f"Received message via socket: {data}")
    receiver_id = str(data.get('receiver', {}).get('_id') if isinstance(data.get('receiver'), dict) else data.get('receiver'))
    sender_id = str(data.get('sender', {}).get('_id') if isinstance(data.get('sender'), dict) else data.get('sender'))
    
    if receiver_id:
        emit('receive-message', data, room=receiver_id)
    if sender_id:
        emit('receive-message', data, room=sender_id)

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    # Remove from connected users...

@app.route('/health')
def health_check():
    return jsonify({"status": "UP"}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Create sqlite db tables
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)
