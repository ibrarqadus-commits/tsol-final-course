# 🔧 Vercel Deployment Troubleshooting

## Common Issues and Solutions

### Issue 1: "Function not found" or 404 Errors

**Symptoms:**
- Routes return 404
- `/admin/login` doesn't work
- API routes fail

**Solution:**
1. Check `vercel.json` routes configuration
2. Ensure `api/index.js` exists and exports the Express app
3. Verify build completed successfully in Vercel dashboard

### Issue 2: "Cannot find module" Errors

**Symptoms:**
- Build fails with module errors
- Missing dependencies

**Solution:**
1. Ensure all dependencies are in `package.json`
2. Check `package-lock.json` is committed
3. Verify Node.js version in Vercel (should be 18.x or 20.x)

### Issue 3: Database Errors

**Symptoms:**
- SQLite errors
- Database file not found
- Permission errors

**Solution:**
- SQLite doesn't persist in Vercel serverless
- Database uses `/tmp` directory (resets on each deployment)
- **For production:** Migrate to MongoDB Atlas or Vercel Postgres

### Issue 4: Session Store Errors

**Symptoms:**
- SQLiteStore errors
- Session not persisting

**Solution:**
- Sessions use memory store in Vercel (configured automatically)
- Sessions won't persist across function invocations
- **For production:** Use Redis or database-backed sessions

### Issue 5: Environment Variables Not Set

**Symptoms:**
- OAuth not working
- Missing configuration errors

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add all required variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `SESSION_SECRET`
   - `ADMIN_EMAILS`
   - `BASE_URL` (should be your Vercel domain)
3. Redeploy after adding variables

### Issue 6: OAuth Redirect Errors

**Symptoms:**
- Google OAuth redirect fails
- "redirect_uri_mismatch" error

**Solution:**
1. Go to Google Cloud Console
2. Edit OAuth 2.0 Client ID
3. Add redirect URI: `https://your-domain.vercel.app/auth/google/callback`
4. Ensure `BASE_URL` in Vercel matches your domain

### Issue 7: Build Timeout

**Symptoms:**
- Build fails with timeout
- Function takes too long to initialize

**Solution:**
1. Check database initialization isn't blocking
2. Reduce cold start time
3. Consider using Vercel Pro for longer timeouts

## 🔍 Debugging Steps

### 1. Check Build Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on latest deployment
5. Check "Build Logs" and "Function Logs"

### 2. Test Locally with Vercel CLI

```bash
npm install -g vercel
vercel dev
```

This runs your app locally with Vercel's serverless environment.

### 3. Check Function Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Functions" tab
4. Click on a function
5. Check "Logs" for errors

### 4. Verify Environment Variables

```bash
vercel env ls
```

Or check in Vercel Dashboard → Settings → Environment Variables

## 🚀 Quick Fixes

### Fix 1: Rebuild from Scratch

1. Delete `.vercel` folder (if exists locally)
2. Redeploy: `vercel --prod`

### Fix 2: Clear Build Cache

1. In Vercel Dashboard → Settings → General
2. Click "Clear Build Cache"
3. Redeploy

### Fix 3: Check Node.js Version

1. In Vercel Dashboard → Settings → General
2. Set Node.js version to 18.x or 20.x
3. Redeploy

## 📋 Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] `api/index.js` exists and exports Express app
- [ ] `vercel.json` has correct routing
- [ ] Google OAuth redirect URI matches Vercel domain
- [ ] `BASE_URL` environment variable matches domain
- [ ] Build completes successfully
- [ ] Functions deploy without errors

## 🆘 Still Not Working?

1. **Check Vercel Status**: https://www.vercel-status.com/
2. **Review Build Logs**: Look for specific error messages
3. **Test Locally**: Use `vercel dev` to test serverless environment
4. **Simplify**: Try deploying a minimal Express app first
5. **Contact Support**: Vercel support is very helpful

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Express on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Troubleshooting Guide](https://vercel.com/docs/concepts/deployments/troubleshooting)

