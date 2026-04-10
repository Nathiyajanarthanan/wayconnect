from flask import Blueprint, request, jsonify
from models import User, Project
from extensions import db
from routes.middleware import token_required
import json
import os

smart_match_bp = Blueprint('smart_match', __name__)

# Note: Integration with google-generativeai for AI analysis would go here.
# For now we'll implement the basic matching logic.

@smart_match_bp.route('/skills', methods=['GET'])
@token_required
def get_skill_matches(current_user):
    try:
        profile = current_user.get_profile()
        user_skills = profile.get('skills', [])
        
        if not user_skills:
            return jsonify([]), 200
            
        # Simplistic matching: Find users who have at least one common skill
        # In a real app, this would be more complex (SQL join or full-text)
        # For SQLite, we search for the skill strings in profile_data
        matches = []
        for s in user_skills:
            users = User.query.filter(User.id != current_user.id, User.profile_data.ilike(f"%{s}%")).limit(10).all()
            for u in users:
                if u.id not in [m['_id'] for m in matches]:
                    matches.append(u.to_dict())
            if len(matches) >= 10:
                break
                
        return jsonify(matches[:10]), 200
    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500

@smart_match_bp.route('/goals', methods=['GET'])
@token_required
def get_goal_matches(current_user):
    try:
        matches = User.query.filter(User.id != current_user.id, User.user_type == current_user.user_type).limit(10).all()
        return jsonify([u.to_dict() for u in matches]), 200
    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500

@smart_match_bp.route('/projects', methods=['GET'])
@token_required
def get_project_collaboration_matches(current_user):
    try:
        # Matches users with different user types for diverse collaboration
        matches = User.query.filter(User.id != current_user.id, User.user_type != current_user.user_type).limit(10).all()
        return jsonify([u.to_dict() for u in matches]), 200
    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500

@smart_match_bp.route('/ai-analyze', methods=['POST'])
@token_required
def ai_analyze(current_user):
    # This would call matchUserToProject(user, project) using Gemini
    return jsonify({
        "score": 85,
        "summary": "Great match based on project requirements and your profile skills.",
        "pros": ["Strong React.js experience", "Previous project success"],
        "cons": ["Location difference", "Budget slightly below expectation"]
    }), 200

@smart_match_bp.route('/optimize-profile', methods=['POST'])
@token_required
def optimize_profile(current_user):
    # This would call optimizeProfile(user.profile) using Gemini
    return jsonify({
        "summary": "Your profile is 70% complete. Adding more detailed project descriptions will improve match rates.",
        "suggestions": ["Add a headline", "Detail your role in Project X", "List current certifications"]
    }), 200
