from flask import Blueprint, request, jsonify
from models import User
from extensions import db
from routes.middleware import token_required
import random

skills_bp = Blueprint('skills', __name__)

@skills_bp.route('/my-skills', methods=['GET'])
@token_required
def get_my_skills(current_user):
    try:
        profile = current_user.get_profile()
        skills = profile.get('skills', [])
        
        detailed_skills = []
        for skill in skills:
            detailed_skills.append({
                "name": skill,
                "level": 'Intermediate',
                "endorsements": random.randint(0, 15),
                "verified": random.random() > 0.7,
                "endorsers": ['Sample User 1', 'Sample User 2']
            })
            
        return jsonify(detailed_skills), 200
    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500

@skills_bp.route('/add', methods=['POST'])
@token_required
def add_skill(current_user):
    try:
        data = request.json or {}
        skill = data.get('skill')
        level = data.get('level', 'Beginner')
        
        if not skill:
            return jsonify({"message": "Skill is required"}), 400
            
        profile = current_user.get_profile()
        if 'skills' not in profile:
            profile['skills'] = []
            
        if skill not in profile['skills']:
            profile['skills'].append(skill)
            current_user.set_profile(profile)
            db.session.commit()
            
        return jsonify({
            "name": skill,
            "level": level,
            "endorsements": 0,
            "verified": False,
            "endorsers": []
        }), 200
    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500

@skills_bp.route('/pending-endorsements', methods=['GET'])
@token_required
def get_pending_endorsements(current_user):
    # Mock data
    pending = [
        {
            "id": 1,
            "requester": {"name": "John Doe", "email": "john@example.com"},
            "skill": "React.js",
            "message": "Please endorse my React.js skills"
        }
    ]
    return jsonify(pending), 200

@skills_bp.route('/endorse/<int:endorsement_id>', methods=['POST'])
@token_required
def endorse_skill(current_user, endorsement_id):
    return jsonify({"message": "Endorsement processed successfully"}), 200

@skills_bp.route('/request-verification', methods=['POST'])
@token_required
def request_verification(current_user):
    return jsonify({"message": "Verification request sent to your connections"}), 200
