const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  budget: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  deadline: Date,
  skills: [String],
  category: {
    type: String,
    enum: ['web-development', 'mobile-app', 'data-science', 'design', 'marketing', 'other']
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proposal: String,
    proposedBudget: Number,
    appliedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  selectedFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submissions: [{
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    files: [String],
    description: String,
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'revision-requested'],
      default: 'submitted'
    },
    feedback: String
  }],
  payment: {
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    stripePaymentId: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);