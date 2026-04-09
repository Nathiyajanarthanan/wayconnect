# Setup Instructions

## Prerequisites
1. **Node.js** (v16 or higher) - ✅ Already installed
2. **MongoDB** - You need to install this

## MongoDB Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended for beginners)
1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Replace `MONGODB_URI` in `server/.env` with your Atlas connection string

### Option 2: Local MongoDB Installation
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Keep the default `MONGODB_URI=mongodb://localhost:27017/talent-connect` in `server/.env`

## Environment Configuration

Edit `server/.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/talent-connect  # Or your Atlas URI
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key  # Get from Stripe dashboard
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NODE_ENV=development
```

## Stripe Setup (Optional for now)
1. Go to https://stripe.com
2. Create account and get test API keys
3. Add them to your `.env` file

## Start Development

1. **Start the application:**
```bash
npm run dev
```

2. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Test the Application

1. Go to http://localhost:3000
2. Click "Sign up" to create an account
3. Try different user types (Student, Employee, Company)
4. Explore the dashboard and features

## Next Steps

Once basic setup works:
1. Set up Stripe for payments
2. Add more features like file uploads
3. Implement real-time notifications
4. Add email verification
5. Deploy to production

## Troubleshooting

- **MongoDB connection error**: Make sure MongoDB is running or check your Atlas connection string
- **Port already in use**: Change PORT in `.env` file
- **Module not found**: Run `npm run install-all` again