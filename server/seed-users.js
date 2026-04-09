const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const sampleUsers = [
  {
    email: 'john.doe@example.com',
    password: 'password123',
    userType: 'employee',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      headline: 'Full Stack Developer at Tech Corp',
      bio: 'Passionate developer with 5+ years of experience in React and Node.js',
      location: 'San Francisco, CA',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
      website: 'https://johndoe.dev',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe'
    }
  },
  {
    email: 'sarah.wilson@example.com',
    password: 'password123',
    userType: 'student',
    profile: {
      firstName: 'Sarah',
      lastName: 'Wilson',
      headline: 'Computer Science Student at MIT',
      bio: 'Aspiring software engineer interested in AI and machine learning',
      location: 'Boston, MA',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Java', 'C++'],
      website: 'https://sarahwilson.dev',
      linkedin: 'https://linkedin.com/in/sarahwilson'
    }
  },
  {
    email: 'techcorp@example.com',
    password: 'password123',
    userType: 'company',
    profile: {
      companyName: 'TechCorp Solutions',
      headline: 'Leading Software Development Company',
      bio: 'We build innovative software solutions for businesses worldwide',
      location: 'New York, NY',
      skills: ['Software Development', 'Web Applications', 'Mobile Apps', 'Cloud Solutions'],
      website: 'https://techcorp.com',
      linkedin: 'https://linkedin.com/company/techcorp'
    }
  },
  {
    email: 'mike.chen@example.com',
    password: 'password123',
    userType: 'employee',
    profile: {
      firstName: 'Mike',
      lastName: 'Chen',
      headline: 'UI/UX Designer at Design Studio',
      bio: 'Creative designer with expertise in user experience and interface design',
      location: 'Los Angeles, CA',
      skills: ['UI Design', 'UX Research', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
      website: 'https://mikechen.design',
      linkedin: 'https://linkedin.com/in/mikechen'
    }
  },
  {
    email: 'emma.garcia@example.com',
    password: 'password123',
    userType: 'student',
    profile: {
      firstName: 'Emma',
      lastName: 'Garcia',
      headline: 'Data Science Student at Stanford',
      bio: 'Passionate about data analytics and business intelligence',
      location: 'Palo Alto, CA',
      skills: ['Data Science', 'Python', 'R', 'SQL', 'Tableau', 'Statistics'],
      linkedin: 'https://linkedin.com/in/emmagarcia'
    }
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing sample users (except your account)
    await User.deleteMany({ 
      email: { $in: sampleUsers.map(user => user.email) }
    });
    console.log('Cleared existing sample users');

    // Create new sample users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Created ${createdUsers.length} sample users`);

    console.log('Sample users created successfully:');
    createdUsers.forEach(user => {
      console.log(`- ${user.profile.firstName || user.profile.companyName} (${user.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();