const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['student', 'employee', 'company'],
    required: true
  },
  profile: {
    firstName: String,
    lastName: String,
    companyName: String, // For company users
    headline: String, // Professional headline
    bio: String,
    skills: [String],
    experience: [{
      title: String,
      company: String,
      location: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String
    }],
    education: [{
      school: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number,
      description: String
    }],
    location: String,
    profilePicture: String,
    coverPhoto: String,
    website: String,
    linkedin: String,
    github: String,
    twitter: String,
    phone: String,
    languages: [String],
    certifications: [{
      name: String,
      issuer: String,
      date: Date,
      url: String
    }],
    projects: [{
      title: String,
      description: String,
      url: String,
      technologies: [String]
    }]
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);