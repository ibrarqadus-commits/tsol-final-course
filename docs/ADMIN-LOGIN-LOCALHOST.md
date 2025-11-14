# Admin Panel Login on Localhost - Complete Guide

## 🎯 Quick Answer

**To login to admin panel on localhost:**

1. **Add your Gmail to `.env`:** `ADMIN_EMAILS=your-email@gmail.com`
2. **Start server:** `npm start`
3. **Go to:** `http://localhost:3000`
4. **Click "Sign In with Google"**
5. **Use the Gmail account** listed in `ADMIN_EMAILS`
6. **Click purple "Admin Panel" button** or go to `http://localhost:3000/admin.html`

---

## 📋 Step-by-Step Instructions

### Step 1: Configure Admin Email

1. **Open `.env` file** in your project root
2. **Add or update** the `ADMIN_EMAILS` line:
   ```env
   ADMIN_EMAILS=your-admin-email@gmail.com
   ```
   
   **Important:** 
   - Use the **exact Gmail address** you'll use for Google login
   - Must match **exactly** (case-sensitive)
   - For multiple admins: `ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com`

3. **Save the file**

### Step 2: Ensure Google OAuth is Set Up

Your `.env` file should also have:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
PORT=3000
NODE_ENV=development
SESSION_SECRET=any-random-string
```

**If you don't have Google OAuth credentials yet:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable "Google Identity Services API"
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:3000/auth/google/callback`
5. Copy Client ID and Secret to `.env`

### Step 3: Initialize Database (if not done)

```bash
npm run init-db
```

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
🚀 LM Mastermind server running at http://localhost:3000
📊 Admin emails: your-admin-email@gmail.com
🔒 Google OAuth: Configured
```

### Step 5: Login Process

#### Option A: Via Homepage (Recommended)

1. **Open browser:** `http://localhost:3000`
2. **Click "Sign In with Google"** button
3. **Select your admin Gmail account** (the one in `ADMIN_EMAILS`)
4. **Grant permissions** when Google asks
5. **You'll be redirected** to the student dashboard
6. **Look for purple "Admin Panel" button** in top-right corner
7. **Click it** → You're in the admin panel!

#### Option B: Direct Admin URL

1. **Open browser:** `http://localhost:3000/admin.html`
2. **If not logged in:** You'll be redirected to login
3. **Click "Sign In with Google"**
4. **Use your admin Gmail account**
5. **After login:** You'll be redirected to admin panel automatically

## ✅ Verify Admin Access

After logging in, check for:

### On Student Dashboard:
- ✅ Purple **"Admin Panel"** button visible in top-right
- ✅ Your name displayed: "Welcome back, [Your Name]!"
- ✅ Can see both student and admin features

### In Admin Panel:
- ✅ Dashboard shows statistics (students, requests, messages)
- ✅ Can see "Access Requests" tab
- ✅ Can see "Students" tab  
- ✅ Can see "Messages" tab
- ✅ Can approve/deny access requests

## 🔍 Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: http://localhost:3000                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Landing Page                                      │ │
│  │  [Sign In with Google] ← Click here              │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Step 2: Google OAuth Page                              │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Select Account:                                   │ │
│  │  ☐ admin@example.com ← Use THIS account          │ │
│  │  ☐ other@gmail.com                                │ │
│  │                                                     │ │
│  │  [Allow] ← Click to grant permissions             │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Step 3: Student Dashboard                              │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Welcome back, Admin!                             │ │
│  │                                                     │ │
│  │  [Admin Panel] [Logout] ← Click Admin Panel      │ │
│  │         ↑                                         │ │
│  │    Purple button                                  │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Step 4: Admin Dashboard                                │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Admin Dashboard                                  │ │
│  │  - Total Students: 5                              │ │
│  │  - Pending Requests: 3                            │ │
│  │  - Unread Messages: 2                             │ │
│  │                                                     │ │
│  │  [Access Requests] [Students] [Messages]         │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting Admin Access

### Problem: No "Admin Panel" Button

**Symptoms:** Logged in but don't see purple admin button

**Solutions:**
1. ✅ Check `.env` file has your email: `ADMIN_EMAILS=your-email@gmail.com`
2. ✅ Verify email matches **exactly** (case-sensitive)
3. ✅ Restart server after changing `.env`: `npm start`
4. ✅ Logout and login again
5. ✅ Check browser console (F12) for errors

### Problem: "Access Denied" on Admin Page

**Symptoms:** See "Access Denied" message when accessing `/admin.html`

**Solutions:**
1. ✅ Verify your email is in `ADMIN_EMAILS` environment variable
2. ✅ Check you're logged in with the correct Gmail account
3. ✅ Email must match exactly (check spelling and case)
4. ✅ Restart server after changing `.env`
5. ✅ Clear browser cookies and try again

### Problem: Redirected to Login Page

**Symptoms:** Trying to access `/admin.html` redirects to login

**Solutions:**
1. ✅ Make sure you're logged in first (go to homepage and login)
2. ✅ Check session is working (can you see student dashboard?)
3. ✅ Try accessing admin panel via the purple button instead
4. ✅ Check server logs for authentication errors

### Problem: Google Login Not Working

**Symptoms:** Can't login with Google OAuth

**Solutions:**
1. ✅ Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
2. ✅ Check redirect URI in Google Cloud Console: `http://localhost:3000/auth/google/callback`
3. ✅ Ensure OAuth consent screen is configured
4. ✅ Restart server after changing `.env`
5. ✅ Check server terminal for error messages

## 📝 Quick Checklist

Use this to verify admin login setup:

- [ ] `.env` file exists in project root
- [ ] `ADMIN_EMAILS` contains your Gmail address
- [ ] `GOOGLE_CLIENT_ID` is set
- [ ] `GOOGLE_CLIENT_SECRET` is set
- [ ] Database initialized (`npm run init-db`)
- [ ] Server running (`npm start`)
- [ ] Can access `http://localhost:3000`
- [ ] Google OAuth redirect URI configured correctly
- [ ] Logged in with admin Gmail account
- [ ] See purple "Admin Panel" button
- [ ] Can access `/admin.html` without errors

## 🎯 Testing Admin Features

Once logged in as admin, test these features:

### Access Request Management
1. Go to "Access Requests" tab
2. See pending requests from students
3. Click "Approve" or "Deny" buttons
4. Add optional comments

### Student Management
1. Go to "Students" tab
2. View all registered students
3. See student status and registration dates

### Message Management
1. Go to "Messages" tab
2. Read messages from students
3. Mark messages as read

## 💡 Pro Tips

1. **Multiple Admin Accounts:** Add comma-separated emails:
   ```env
   ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com,admin3@gmail.com
   ```

2. **Test Both Dashboards:** Admins can access both student and admin dashboards

3. **Session Persistence:** Login persists for 24 hours (or until logout)

4. **Quick Access:** Bookmark `http://localhost:3000/admin.html` for quick access

5. **Development vs Production:** Use different emails for localhost vs production

## 🔄 Complete Login Flow

```
1. Start Server
   ↓
2. Open http://localhost:3000
   ↓
3. Click "Sign In with Google"
   ↓
4. Select admin Gmail account
   ↓
5. Grant permissions
   ↓
6. Redirected to student dashboard
   ↓
7. See purple "Admin Panel" button
   ↓
8. Click button → Admin dashboard!
```

## 📞 Still Having Issues?

1. **Check server logs** in terminal for error messages
2. **Check browser console** (F12) for JavaScript errors
3. **Verify `.env` file** is in project root (not a subfolder)
4. **Restart everything:** Stop server, restart, clear browser cache
5. **Test with different Gmail account** to isolate the issue

---

**Related Guides:**
- [`ADMIN-SETUP.md`](ADMIN-SETUP.md) - General admin setup
- [`LOCALHOST-LOGIN-GUIDE.md`](LOCALHOST-LOGIN-GUIDE.md) - General login guide
- [`QUICK-START.md`](../QUICK-START.md) - Quick setup guide
