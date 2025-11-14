# 🚀 Vercel Deployment Guide

This guide will help you deploy your LM Mastermind application to Vercel.

## ⚠️ Important Notes

**Vercel Limitations:**
- SQLite databases don't persist in Vercel's serverless environment
- Each serverless function has a cold start time
- File system is read-only except `/tmp`

**Recommended:** For production with database persistence, consider:
- Railway
- Render
- Heroku
- DigitalOcean App Platform
- Or migrate to MongoDB Atlas (cloud database)

## 📋 Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. GitHub repository connected
3. Environment variables configured

## 🔧 Setup Steps

### Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all required variables:

```
PORT=3000
NODE_ENV=production
SESSION_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
BASE_URL=https://your-vercel-domain.vercel.app
ADMIN_EMAILS=your-admin-email@gmail.com
EMAIL_USER=your-email@gmail.com (optional)
EMAIL_PASS=your-app-password (optional)
EMAIL_FROM=noreply@yourdomain.com (optional)
```

### Step 2: Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add production redirect URI:
   ```
   https://your-vercel-domain.vercel.app/auth/google/callback
   ```
4. Save changes

### Step 3: Deploy

**Option A: Via Vercel Dashboard**
1. Connect your GitHub repository
2. Vercel will auto-detect the configuration
3. Click **Deploy**

**Option B: Via CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 📁 Project Structure

```
.
├── api/
│   └── index.js          # Vercel serverless function entry point
├── server.js             # Express app (exported for Vercel)
├── vercel.json           # Vercel configuration
└── ... (other files)
```

## 🔍 Troubleshooting

### Error: "Cannot find module"
- Ensure all dependencies are in `package.json`
- Vercel installs dependencies automatically

### Error: "Database not found"
- SQLite files don't persist in Vercel serverless
- Consider migrating to MongoDB Atlas or another cloud database
- Or use Vercel's serverless database options

### Routes not working
- Check `vercel.json` routes configuration
- Ensure routes are pointing to `/api/index.js`
- Verify environment variables are set

### OAuth redirect errors
- Verify redirect URI in Google Console matches your Vercel domain exactly
- Check `BASE_URL` environment variable matches your domain

## 🔄 Database Migration (Recommended)

For production, migrate from SQLite to MongoDB Atlas:

1. **Sign up for MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Create a cluster** (free tier available)
3. **Get connection string**
4. **Update server.js** to use MongoDB instead of SQLite
5. **Set `MONGO_URI`** in Vercel environment variables

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Express on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Environment Variables](https://vercel.com/docs/environment-variables)

---

**Note:** This application uses SQLite which may not work well in Vercel's serverless environment. Consider migrating to a cloud database for production use.

