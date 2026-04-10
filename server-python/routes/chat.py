from flask import Blueprint, request, jsonify
from models import Message, User
from extensions import db
from routes.middleware import token_required
from sqlalchemy import or_, desc, func
import json
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(current_user):
    try:
        # Complex query to mimic Mongo's aggregation for conversations
        # Get the latest message for each distinct conversation partner
        
        # This is a bit tricky in SQLAlchemy without subqueries
        # Let's find all unique partners first
        sent_to = db.session.query(Message.receiver_id).filter(Message.sender_id == current_user.id).distinct().all()
        received_from = db.session.query(Message.sender_id).filter(Message.receiver_id == current_user.id).distinct().all()
        
        partners = set([p[0] for p in sent_to] + [p[0] for p in received_from])
        
        conversations = []
        for partner_id in partners:
            last_message = Message.query.filter(
                or_(
                    (Message.sender_id == current_user.id) & (Message.receiver_id == partner_id),
                    (Message.sender_id == partner_id) & (Message.receiver_id == current_user.id)
                )
            ).order_by(desc(Message.created_at)).first()
            
            unread_count = Message.query.filter_by(
                sender_id=partner_id,
                receiver_id=current_user.id,
                is_read=False
            ).count()
            
            partner = User.query.get(partner_id)
            
            conversations.append({
                "_id": str(partner_id),
                "lastMessage": last_message.to_dict() if last_message else None,
                "unreadCount": unread_count,
                "partner": partner.to_dict() if partner else None
            })
            
        # Sort conversations by last message time
        conversations.sort(key=lambda x: x['lastMessage']['createdAt'] if x['lastMessage'] else '', reverse=True)
        
        return jsonify(conversations), 200
    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500

@chat_bp.route('/messages/<int:user_id>', methods=['GET'])
@token_required
def get_messages(current_user, user_id):
    try:
        messages = Message.query.filter(
            or_(
                (Message.sender_id == current_user.id) & (Message.receiver_id == user_id),
                (Message.sender_id == user_id) & (Message.receiver_id == current_user.id)
            )
        ).order_by(Message.created_at).all()
        
        # Mark as read
        Message.query.filter_by(
            sender_id=user_id,
            receiver_id=current_user.id,
            is_read=False
        ).update({"is_read": True, "read_at": datetime.utcnow()})
        db.session.commit()
        
        return jsonify([m.to_dict() for m in messages]), 200
    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500

@chat_bp.route('/send', methods=['POST'])
@token_required
def send_message(current_user):
    try:
        data = request.json
        receiver_id = int(data.get('receiver'))
        content = data.get('content')
        message_type = data.get('messageType', 'text')
        
        message = Message(
            sender_id=current_user.id,
            receiver_id=receiver_id,
            content=content,
            message_type=message_type
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify(message.to_dict()), 201
    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500
