from flask import Blueprint, request, jsonify
from routes.middleware import token_required
import stripe
import os

payments_bp = Blueprint('payments', __name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@payments_bp.route('/create-payment-intent', methods=['POST'])
@token_required
def create_payment_intent(current_user):
    try:
        data = request.json or {}
        amount = data.get('amount')
        
        if not amount:
            return jsonify({"message": "Amount is required"}), 400
            
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='usd',
            metadata={
                'userId': str(current_user.id),
                'type': 'project_posting'
            }
        )
        
        return jsonify({
            "clientSecret": payment_intent.client_secret
        }), 200
    except Exception as e:
        return jsonify({"message": "Payment error", "error": str(e)}), 500

@payments_bp.route('/pay-freelancer', methods=['POST'])
@token_required
def pay_freelancer(current_user):
    try:
        data = request.json or {}
        project_id = data.get('projectId')
        amount = data.get('amount')
        
        if not amount:
            return jsonify({"message": "Amount is required"}), 400
            
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='usd',
            metadata={
                'projectId': str(project_id),
                'type': 'freelancer_payment'
            }
        )
        
        return jsonify({
            "clientSecret": payment_intent.client_secret
        }), 200
    except Exception as e:
        return jsonify({"message": "Payment error", "error": str(e)}), 500
