# ⚠️ Vercel Deployment Issues & Solutions

## Current Issue: SQLite Database

**Problem:** SQLite databases don't work well in Vercel's serverless environment because:
- File system is read-only (except `/tmp`)
- Database files won't persist between function invocations
- Each serverless function is stateless

**Current Status:** 
- Routes are now configured correctly
- Database will use `/tmp` directory in Vercel
- **Data will NOT persist** - database resets on each deployment

## 🔧 Solutions

### Option 1: Migrate to MongoDB Atlas (Recommended)

1. **Sign up for MongoDB Atlas** (free tier available):
   - Go to: https://www.mongodb.com/cloud/atlas
   - Create a free cluster

2. **Get connection string:**
   - In MongoDB Atlas dashboard
   - Click "Connect" → "Connect your application"
   - Copy the connection string

3. **Update code:**
   - Replace SQLite with MongoDB/Mongoose
   - Update all database queries
   - Set `MONGO_URI` in Vercel environment variables

### Option 2: Use Vercel Postgres (Recommended for Vercel)

1. **Add Vercel Postgres:**
   - In Vercel dashboard → Storage → Create Database
   - Choose Postgres
   - Get connection string

2. **Update code:**
   - Replace SQLite with Postgres (using `pg` package)
   - Update all database queries

### Option 3: Use Railway/Render (Alternative Hosting)

These platforms support persistent file systems:

**Railway:**
- Go to: https://railway.app
- Connect GitHub repository
- Deploy (supports SQLite)

**Render:**
- Go to: https://render.com
- Create Web Service
- Connect GitHub repository
- Deploy (supports SQLite)

### Option 4: Temporary Fix (For Testing Only)

The current setup uses `/tmp` directory which:
- ✅ Allows database to be created
- ❌ Data resets on each deployment
- ❌ Data may reset between function invocations
- ⚠️ **Not suitable for production**

## 📋 Immediate Actions

1. **Fix routing** ✅ (Done - vercel.json updated)
2. **Set environment variables** in Vercel dashboard
3. **Update Google OAuth redirect URI** to Vercel domain
4. **Test deployment** (database won't persist, but routes should work)
5. **Plan database migration** for production use

## 🚀 Quick Fix for Testing

For now, the application will work but:
- Login will work (OAuth)
- Routes will work
- Database operations may fail or reset
- **Not suitable for production**

To test:
1. Deploy to Vercel
2. Set all environment variables
3. Test login flow
4. Plan database migration

## 📚 Migration Guide

See `VERCEL-DEPLOY.md` for detailed migration steps to MongoDB Atlas or Postgres.

