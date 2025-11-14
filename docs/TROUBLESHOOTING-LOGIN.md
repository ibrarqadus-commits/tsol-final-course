# Troubleshooting: "Sign In" Redirects to Home Page

## 🔍 Problem

When clicking "Sign In with Google", the page redirects back to the home page instead of going to Google's OAuth page.

## ✅ Quick Fixes

### Fix 1: Check Google OAuth Credentials

**Most common cause:** Missing or incorrect Google OAuth credentials in `.env` file.

1. **Check your `.env` file** exists in project root
2. **Verify these lines are present:**
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   ```
3. **Make sure they're NOT:**
   - Empty
   - Set to placeholder values like `your_client_id_here`
   - Missing quotes or have extra spaces

4. **Restart the server** after making changes:
   ```bash
   # Press Ctrl+C to stop
   npm start
   ```

### Fix 2: Check Server Logs

When you click "Sign In", check your terminal/console where the server is running:

**If you see:**
```
⚠️  WARNING: Google OAuth credentials not configured!
```
→ Your `.env` file is missing or credentials aren't loaded

**If you see:**
```
OAuth error: [some error message]
```
→ There's an issue with the OAuth configuration

### Fix 3: Verify Redirect URI in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Check **Authorized redirect URIs** includes:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. **Must be exact match** - no trailing slashes, correct protocol (http not https for localhost)

### Fix 4: Check OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Make sure it's configured (at least basic info filled in)
3. For testing, you can use "External" user type
4. Add your email as a test user if needed

## 🔧 Step-by-Step Diagnosis

### Step 1: Verify `.env` File

1. **Check file exists:** Look for `.env` in project root (same folder as `package.json`)
2. **Check file contents:**
   ```bash
   # On Windows (PowerShell)
   Get-Content .env
   
   # On Mac/Linux
   cat .env
   ```
3. **Verify format:**
   ```env
   GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=any-random-string
   ADMIN_EMAILS=your-email@gmail.com
   ```

### Step 2: Test Server Startup

When you run `npm start`, you should see:
```
🚀 LM Mastermind server running at http://localhost:3000
📊 Admin emails: your-email@gmail.com
📧 Email notifications: Enabled/Disabled
🔒 Google OAuth: Configured
```

**If you see:**
```
🔒 Google OAuth: Not configured
```
→ Your `.env` file isn't being loaded or credentials are missing

### Step 3: Test OAuth Endpoint Directly

1. **Open browser:** `http://localhost:3000/auth/google`
2. **Expected behavior:**
   - ✅ Redirects to Google login page
   - ❌ Shows error page or redirects to home
   - ❌ Shows "OAuth Not Configured" message

### Step 4: Check Browser Console

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Click "Sign In with Google"**
4. **Look for errors:**
   - Network errors
   - JavaScript errors
   - CORS errors

### Step 5: Check Network Tab

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Click "Sign In with Google"**
4. **Look for:**
   - Request to `/auth/google`
   - Status code (should be 302 redirect)
   - If status is 500, check response for error details

## 🐛 Common Issues & Solutions

### Issue 1: `.env` File Not Found

**Symptoms:**
- Server starts but OAuth doesn't work
- No error messages

**Solution:**
- Create `.env` file in project root (same folder as `package.json`)
- Make sure it's named exactly `.env` (not `.env.txt` or `env`)
- Restart server

### Issue 2: Wrong Redirect URI

**Symptoms:**
- Redirects to Google but shows "redirect_uri_mismatch" error

**Solution:**
- Go to Google Cloud Console
- Update redirect URI to: `http://localhost:3000/auth/google/callback`
- Wait 1-2 minutes for changes to propagate
- Try again

### Issue 3: OAuth Consent Screen Not Configured

**Symptoms:**
- Google shows "Access blocked" error

**Solution:**
- Configure OAuth consent screen in Google Cloud Console
- Add your email as a test user
- Complete all required fields

### Issue 4: Server Not Restarted

**Symptoms:**
- Changed `.env` but still doesn't work

**Solution:**
- **Always restart server** after changing `.env`
- Stop server: `Ctrl+C`
- Start again: `npm start`

### Issue 5: Port Mismatch

**Symptoms:**
- Server running on different port
- Redirect URI doesn't match

**Solution:**
- Check what port server is using (look at startup message)
- Update redirect URI in Google Cloud Console to match
- Or change `PORT` in `.env` to match Google Console

## 📋 Complete Checklist

Use this checklist to diagnose:

- [ ] `.env` file exists in project root
- [ ] `GOOGLE_CLIENT_ID` is set and not empty
- [ ] `GOOGLE_CLIENT_SECRET` is set and not empty
- [ ] Server restarted after `.env` changes
- [ ] Server shows "Google OAuth: Configured" on startup
- [ ] Redirect URI in Google Console matches exactly
- [ ] OAuth consent screen is configured
- [ ] Can access `http://localhost:3000/auth/google` directly
- [ ] Browser console shows no errors
- [ ] Network tab shows redirect to Google

## 🎯 Quick Test

Run this test to verify OAuth setup:

1. **Start server:** `npm start`
2. **Open browser:** `http://localhost:3000/auth/google`
3. **Expected:** Redirects to Google login page
4. **If not:** Check server logs and `.env` file

## 💡 Still Not Working?

1. **Check server terminal** for error messages
2. **Check browser console** (F12) for JavaScript errors
3. **Check network tab** for failed requests
4. **Verify `.env` file** is in correct location
5. **Try creating new OAuth credentials** in Google Cloud Console
6. **Clear browser cache** and try again

## 📞 Getting Help

If still having issues, provide:
1. Server startup logs
2. Browser console errors
3. Network tab errors
4. Contents of `.env` (remove secrets, just show structure)
5. Google Cloud Console redirect URI settings

---

**Related Guides:**
- [`LOCALHOST-LOGIN-GUIDE.md`](LOCALHOST-LOGIN-GUIDE.md) - Complete login setup
- [`ADMIN-LOGIN-LOCALHOST.md`](ADMIN-LOGIN-LOCALHOST.md) - Admin login guide
