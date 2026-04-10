from flask import Blueprint, request, jsonify
import requests
import re
from models import User
from extensions import db
from routes.middleware import token_required

discovery_bp = Blueprint('discovery', __name__)

@discovery_bp.route('/global-suggestions', methods=['GET'])
@token_required
def get_global_suggestions(current_user):
    try:
        skills = request.args.get('skills', '')
        location = request.args.get('location', '')
        industry = request.args.get('industry', '')
        
        suggestions = []
        
        # 1. Local users
        skill_list = skills.split(',') if skills else []
        local_query = User.query.filter(User.id != current_user.id)
        
        if skill_list:
            # Simple skill match - check if any skill in list is in profile_data
            # In a real app we'd use a more sophisticated join or full-text search
            for s in skill_list:
                local_query = local_query.filter(User.profile_data.ilike(f"%{s}%"))
        
        local_users = local_query.limit(10).all()
        
        for user in local_users:
            profile = user.get_profile()
            suggestions.append({
                "source": 'wayconnect',
                "id": str(user.id),
                "name": profile.get('companyName') if user.user_type == 'company' else f"{profile.get('firstName', '')} {profile.get('lastName', '')}",
                "headline": profile.get('headline'),
                "location": profile.get('location'),
                "profilePicture": profile.get('profilePicture'),
                "skills": profile.get('skills', []),
                "isLocal": True
            })
            
        # 2. GitHub users
        if any(s in skills.lower() for s in ['programming', 'developer', 'software', 'coder']):
            try:
                gh_query = f"location:{location or 'worldwide'} type:user"
                gh_url = f"https://api.github.com/search/users?q={gh_query}&per_page=5"
                gh_resp = requests.get(gh_url, timeout=5)
                if gh_resp.status_code == 200:
                    gh_items = gh_resp.json().get('items', [])
                    for item in gh_items:
                        # Optional: fetch more details if needed
                        suggestions.append({
                            "source": 'github',
                            "id": item['id'],
                            "name": item['login'],
                            "headline": 'Software Developer',
                            "location": location,
                            "profilePicture": item['avatar_url'],
                            "githubUrl": item['html_url'],
                            "isLocal": False
                        })
            except Exception as e:
                print(f"GitHub API error: {e}")

        # 3. Mock global professionals
        mock_global = [
            {
                "source": 'global',
                "id": 'global_1',
                "name": 'Alex Rodriguez',
                "headline": 'Senior Software Engineer at Google',
                "location": 'Mountain View, CA',
                "skills": ['React', 'Node.js', 'Python'],
                "isLocal": False
            },
            {
                "source": 'global',
                "id": 'global_2',
                "name": 'Priya Sharma',
                "headline": 'Data Scientist at Microsoft',
                "location": 'Bangalore, India',
                "skills": ['Python', 'Machine Learning', 'SQL'],
                "isLocal": False
            }
        ]
        suggestions.extend(mock_global)
        
        return jsonify({
            "success": True,
            "suggestions": suggestions[:20],
            "total": len(suggestions)
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@discovery_bp.route('/import-external-user', methods=['POST'])
@token_required
def import_external_user(current_user):
    # Mimic the import logic (stub for now as it needs platform-specific schemas)
    return jsonify({"success": True, "message": "User imported successfully"}), 200

@discovery_bp.route('/global-projects', methods=['GET'])
@token_required
def get_global_projects(current_user):
    # Mock projects
    mock_projects = [
        {
            "id": 'freelancer_1',
            "title": 'Build React Native Mobile App',
            "description": 'Looking for experienced React Native developer',
            "budget": {"min": 3000, "max": 8000, "currency": 'USD'},
            "deadline": '2024-03-15',
            "skills": ['React Native', 'JavaScript', 'Mobile Development'],
            "location": 'Remote',
            "platform": 'Freelancer.com',
            "isExternal": True
        }
    ]
    return jsonify({
        "success": True,
        "projects": mock_projects,
        "total": len(mock_projects)
    }), 200
