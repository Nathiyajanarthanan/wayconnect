const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');

const router = express.Router();

// Create payment intent for project posting
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount } = req.body; // Amount in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString(),
        type: 'project_posting'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment error', error: error.message });
  }
});

// Process payment for completed project
router.post('/pay-freelancer', auth, async (req, res) => {
  try {
    const { projectId, amount } = req.body;

    // Create transfer to freelancer (simplified - in production you'd need connected accounts)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        projectId,
        type: 'freelancer_payment'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment error', error: error.message });
  }
});

module.exports = router;