# LinkedIn Integration Setup Guide

## Current Status
LinkedIn integration is **optional** and not required for the core functionality of Way Connect. The platform works perfectly without it using local networking features.

## What Works Without LinkedIn
- ✅ Connect with local users (sample users created)
- ✅ Follow/unfollow functionality
- ✅ User search
- ✅ Profile management
- ✅ Global professionals (mock data)
- ✅ All other platform features

## To Enable LinkedIn Integration (Optional)

If you want to connect with real LinkedIn profiles, follow these steps:

### 1. Create LinkedIn Developer App
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Sign in with your LinkedIn account
3. Click "Create App"
4. Fill in app details:
   - **App name**: Way Connect
   - **LinkedIn Page**: Your company page (or create one)
   - **Privacy policy URL**: Your privacy policy
   - **App logo**: Upload your logo

### 2. Configure OAuth Settings
1. In your LinkedIn app dashboard, go to "Auth" tab
2. Add redirect URL: `http://localhost:3000/auth/linkedin/callback`
3. Request these permissions:
   - `r_liteprofile` (Basic profile info)
   - `r_emailaddress` (Email address)
   - `w_member_social` (Share content)

### 3. Get Credentials
1. Copy your **Client ID** and **Client Secret**
2. Add them to `server/.env`:
```env
LINKEDIN_CLIENT_ID=your_actual_client_id_here
LINKEDIN_CLIENT_SECRET=your_actual_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

### 4. Restart Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Alternative: Use Without LinkedIn
The platform is fully functional without LinkedIn integration. You can:
- Connect with the 5 sample users created
- Test all networking features
- Use the search functionality
- Manage your profile and connections

## Note
LinkedIn's API has restrictions and requires app review for production use. For development and testing, the local networking features provide full functionality.