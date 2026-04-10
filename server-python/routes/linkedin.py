from flask import Blueprint, request, jsonify
import requests
import os
from models import User
from extensions import db
from routes.middleware import token_required

linkedin_bp = Blueprint('linkedin', __name__)

CLIENT_URL = os.getenv('CLIENT_URL', 'http://localhost:3000')
REDIRECT_URI = f"{CLIENT_URL}/auth/linkedin/callback"

@linkedin_bp.route('/auth-url', methods=['GET'])
def get_auth_url():
    client_id = os.getenv('LINKEDIN_CLIENT_ID')
    if not client_id:
        return jsonify({"error": "LinkedIn not configured"}), 400
        
    state = "random_state_string"
    scope = "r_liteprofile r_emailaddress w_member_social"
    auth_url = (
        f"https://www.linkedin.com/oauth/v2/authorization?"
        f"response_type=code&client_id={client_id}&"
        f"redirect_uri={REDIRECT_URI}&state={state}&scope={scope}"
    )
    return jsonify({"authUrl": auth_url, "state": state}), 200

@linkedin_bp.route('/callback', methods=['POST'])
def linkedin_callback():
    try:
        data = request.json
        code = data.get('code')
        
        client_id = os.getenv('LINKEDIN_CLIENT_ID')
        client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
        
        resp = requests.post(
            'https://www.linkedin.com/oauth/v2/accessToken',
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': REDIRECT_URI,
                'client_id': client_id,
                'client_secret': client_secret
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        access_token = resp.json().get('access_token')
        
        # Stubs for profile fetching
        return jsonify({
            "success": True,
            "linkedinData": {
                "linkedinId": "mock_id",
                "email": "mock@example.com",
                "firstName": "LinkedIn",
                "lastName": "User",
                "accessToken": access_token
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@linkedin_bp.route('/import-connections', methods=['POST'])
@token_required
def import_connections(current_user):
    return jsonify({"success": True, "imported": 0, "connections": []}), 200

@linkedin_bp.route('/search-linkedin', methods=['POST'])
@token_required
def search_linkedin(current_user):
    return jsonify({"success": False, "error": "Partner program access required"}), 500
