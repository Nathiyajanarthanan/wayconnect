from flask import Blueprint, request, jsonify
import json
from models import User
from extensions import db
from routes.middleware import token_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify(current_user.to_dict()), 200

@users_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.json or {}
    allowed = ['firstName','lastName','companyName','headline','bio','location',
                'skills','experience','education','website','linkedin','github',
                'twitter','phone','languages','certifications','projects']
    profile = current_user.get_profile()
    for key in allowed:
        if key in data:
            profile[key] = data[key]
    current_user.set_profile(profile)
    db.session.commit()
    return jsonify(current_user.to_dict()), 200

@users_bp.route('/suggestions', methods=['GET'])
@token_required
def get_suggestions(current_user):
    following_ids = json.loads(current_user.following or '[]')
    excluded = following_ids + [current_user.id]
    users = User.query.filter(User.id.notin_(excluded)).limit(10).all()
    return jsonify([u.to_dict() for u in users]), 200

@users_bp.route('/following', methods=['GET'])
@token_required
def get_following(current_user):
    following_ids = json.loads(current_user.following or '[]')
    users = User.query.filter(User.id.in_(following_ids)).all()
    return jsonify([u.to_dict() for u in users]), 200

@users_bp.route('/follow/<int:user_id>', methods=['POST'])
@token_required
def follow_user(current_user, user_id):
    if user_id == current_user.id:
        return jsonify({"message": "Cannot follow yourself"}), 400
    target = User.query.get(user_id)
    if not target:
        return jsonify({"message": "User not found"}), 404

    following = json.loads(current_user.following or '[]')
    target_followers = json.loads(target.followers or '[]')
    is_following = user_id in following

    if is_following:
        following.remove(user_id)
        if current_user.id in target_followers:
            target_followers.remove(current_user.id)
    else:
        following.append(user_id)
        if current_user.id not in target_followers:
            target_followers.append(current_user.id)

    current_user.following = json.dumps(following)
    target.followers = json.dumps(target_followers)
    db.session.commit()

    return jsonify({
        "isFollowing": not is_following,
        "message": "Unfollowed successfully" if is_following else "Following successfully"
    }), 200

@users_bp.route('/search/<query>', methods=['GET'])
@token_required
def search_users(current_user, query):
    q = f"%{query}%"
    users = User.query.filter(
        User.profile_data.ilike(q)
    ).limit(20).all()
    return jsonify([u.to_dict() for u in users]), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user_by_id(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict()), 200
