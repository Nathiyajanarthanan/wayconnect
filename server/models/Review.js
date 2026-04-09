const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Calculate average rating for user when a review is saved
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const User = mongoose.model('User');

  const stats = await Review.aggregate([
    { $match: { reviewee: this.reviewee } },
    {
      $group: {
        _id: '$reviewee',
        average: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.reviewee, {
      'rating.average': parseFloat(stats[0].average.toFixed(1)),
      'rating.count': stats[0].count
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
