from flask import Blueprint, request, jsonify
import json
from models import Project, User
from extensions import db
from routes.middleware import token_required

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/', methods=['GET'])
@token_required
def get_projects(current_user):
    status = request.args.get('status')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))

    query = Project.query
    if status:
        query = query.filter_by(status=status)

    projects = query.order_by(Project.created_at.desc()) \
                    .offset((page - 1) * limit).limit(limit).all()

    result = []
    for p in projects:
        company = User.query.get(p.company_id)
        result.append({
            "_id": str(p.id),
            "title": p.title,
            "description": p.description,
            "status": p.status,
            "skillsRequired": json.loads(p.skills_required or '[]'),
            "createdAt": p.created_at.isoformat() if p.created_at else None,
            "company": {
                "_id": str(company.id),
                "profile": company.get_profile()
            } if company else None
        })
    return jsonify(result), 200

@projects_bp.route('/', methods=['POST'])
@token_required
def create_project(current_user):
    if current_user.user_type != 'company':
        return jsonify({"message": "Only companies can create projects"}), 403

    data = request.json or {}
    skills = data.get('skillsRequired', data.get('skills_required', []))
    project = Project(
        title=data.get('title', ''),
        description=data.get('description', ''),
        company_id=current_user.id,
        status=data.get('status', 'open'),
        skills_required=json.dumps(skills)
    )
    db.session.add(project)
    db.session.commit()

    return jsonify({
        "_id": str(project.id),
        "title": project.title,
        "description": project.description,
        "status": project.status,
        "skillsRequired": json.loads(project.skills_required),
        "createdAt": project.created_at.isoformat() if project.created_at else None
    }), 201

@projects_bp.route('/<int:project_id>/apply', methods=['POST'])
@token_required
def apply_to_project(current_user, project_id):
    if current_user.user_type == 'company':
        return jsonify({"message": "Companies cannot apply to projects"}), 403

    project = Project.query.get(project_id)
    if not project:
        return jsonify({"message": "Project not found"}), 404

    return jsonify({"message": "Application submitted successfully"}), 200
