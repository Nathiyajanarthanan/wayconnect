from flask import Blueprint, request, jsonify
from models import User, Project, Review
from extensions import db
from routes.middleware import token_required
from datetime import datetime

reviews_bp = Blueprint('reviews', __name__)

@token_required
def submit_review(current_user):
    data = request.json or {}
    reviewee_id = data.get('revieweeId')
    project_id = data.get('projectId')
    rating = data.get('rating')
    comment = data.get('comment', '')

    if not reviewee_id or not rating:
        return jsonify({"message": "revieweeId and rating are required"}), 400

    if str(reviewee_id) == str(current_user.id):
        return jsonify({"message": "You cannot review yourself"}), 400

    # Check duplicate
    existing = Review.query.filter_by(
        reviewer_id=current_user.id,
        reviewee_id=int(reviewee_id),
        project_id=project_id
    ).first()
    if existing:
        return jsonify({"message": "You have already reviewed this user for this project"}), 400

    review = Review(
        reviewer_id=current_user.id,
        reviewee_id=int(reviewee_id),
        project_id=project_id,
        rating=float(rating),
        comment=comment
    )
    db.session.add(review)

    # Update reviewee rating average
    reviewee = User.query.get(int(reviewee_id))
    if reviewee:
        new_count = reviewee.rating_count + 1
        new_avg = ((reviewee.rating_average * reviewee.rating_count) + float(rating)) / new_count
        reviewee.rating_count = new_count
        reviewee.rating_average = round(new_avg, 2)

    db.session.commit()
    reviewer = current_user.to_dict()
    return jsonify({
        "success": True,
        "message": "Review submitted successfully",
        "review": {
            "_id": str(review.id),
            "rating": review.rating,
            "comment": review.comment,
            "reviewer": {"_id": str(reviewer['_id']), "profile": reviewer['profile']},
            "createdAt": review.created_at.isoformat()
        }
    }), 201

@reviews_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_reviews(current_user, user_id):
    reviews = Review.query.filter_by(reviewee_id=user_id)\
                          .order_by(Review.created_at.desc()).all()
    result = []
    for r in reviews:
        reviewer = User.query.get(r.reviewer_id)
        result.append({
            "_id": str(r.id),
            "rating": r.rating,
            "comment": r.comment,
            "createdAt": r.created_at.isoformat(),
            "reviewer": reviewer.to_dict() if reviewer else None
        })
    return jsonify(result), 200
