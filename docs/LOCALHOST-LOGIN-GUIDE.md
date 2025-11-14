# Localhost Login Guide - Step by Step

This guide will walk you through setting up and testing the login functionality on your local machine.

## 📋 Prerequisites Checklist

Before you start, make sure you have:
- ✅ Node.js installed (v16 or higher)
- ✅ A Gmail account (for Google OAuth)
- ✅ Google Cloud Console access (free account)

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

Open your terminal in the project directory and run:
```bash
npm install
```

### Step 2: Set Up Google OAuth Credentials

#### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `LM Mastermind Course`
4. Click **"Create"**

#### 2.2 Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on **"Google Identity Services API"** or **"Google+ API"**
4. Click **"Enable"**

#### 2.3 Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - Choose **"External"** (unless you have Google Workspace)
   - Fill in required fields:
     - App name: `LM Mastermind Course`
     - User support email: Your email
     - Developer contact: Your email
   - Click **"Save and Continue"** through the steps
   - Click **"Back to Dashboard"**

4. Create OAuth Client ID:
   - Application type: **"Web application"**
   - Name: `LM Mastermind Local`
   - Authorized redirect URIs: 
     ```
     http://localhost:3000/auth/google/callback
     ```
   - Click **"Create"**

5. **Copy your credentials:**
   - **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-abcdefghijklmnop`)

### Step 3: Create Environment File

1. In your project root directory, create a file named `.env`

2. Copy this template and fill in your values:

```env
# Google OAuth Configuration (from Step 2.3)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration (use any random string for localhost)
SESSION_SECRET=local-development-secret-key-12345

# Email Configuration (Optional for localhost - can use dummy values)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=noreply@localhost

# Admin Configuration (Your Gmail address for admin access)
ADMIN_EMAILS=your-email@gmail.com
```

**Important Notes:**
- Replace `your_client_id_here` with your actual Client ID
- Replace `your_client_secret_here` with your actual Client Secret
- Replace `your-email@gmail.com` with your Gmail address (for admin access)
- Email settings are optional for basic login testing

### Step 4: Initialize Database

Run this command to create the database and tables:
```bash
npm run init-db
```

You should see:
```
Initializing database...
Database initialized successfully!
Database connection closed.
```

### Step 5: Start the Server

Start the development server:
```bash
npm start
```

You should see output like:
```
🚀 LM Mastermind server running at http://localhost:3000
📊 Admin emails: your-email@gmail.com
📧 Email notifications: Enabled/Disabled
🔒 Google OAuth: Configured
```

## 🔐 Testing Login

### Step 6: Access the Application

1. **Open your web browser**
2. **Navigate to:** `http://localhost:3000`
3. **You should see:**
   - Landing page with course information
   - "Get Started" or "Sign In with Google" button

### Step 7: Login Process

1. **Click "Sign In with Google"** or **"Get Started"** button
2. **You'll be redirected to Google's login page**
3. **Select your Gmail account** (or enter credentials)
4. **Grant permissions** when prompted:
   - "See your profile information"
   - "See your email address"
5. **Click "Allow"**
6. **You'll be redirected back** to `http://localhost:3000`
7. **You should now see:**
   - Student dashboard with your name
   - Module overview
   - If you're an admin: Purple "Admin Panel" button

## ✅ Verify Login Success

After logging in, check for:

### Student Dashboard
- ✅ Your name displayed: "Welcome back, [Your Name]!"
- ✅ Module cards showing available modules
- ✅ Logout button in top-right corner
- ✅ Progress statistics

### Admin Dashboard (if admin)
- ✅ Purple "Admin Panel" button visible
- ✅ Can click to access `/admin.html`
- ✅ See admin statistics and management tools

## 🐛 Troubleshooting

### Problem: "Cannot GET /auth/google"

**Solution:**
- Make sure server is running (`npm start`)
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Restart server after changing `.env` file

### Problem: "redirect_uri_mismatch" Error

**Solution:**
- Go back to Google Cloud Console
- Check that redirect URI is exactly: `http://localhost:3000/auth/google/callback`
- No trailing slashes or typos
- Save and wait 1-2 minutes for changes to propagate

### Problem: "Access Denied" or Login Fails

**Solution:**
- Check browser console (F12) for errors
- Verify OAuth consent screen is configured
- Make sure you're using the same Gmail account that's in `ADMIN_EMAILS` (if testing admin)
- Check server logs in terminal for error messages

### Problem: Database Errors

**Solution:**
- Run `npm run init-db` again
- Check that `database.db` file exists in project root
- Make sure you have write permissions in the project directory

### Problem: Port Already in Use

**Solution:**
- Change `PORT=3000` to `PORT=3001` in `.env` file
- Update redirect URI in Google Cloud Console to match
- Restart server

## 📝 Quick Test Checklist

Use this checklist to verify everything works:

- [ ] Server starts without errors
- [ ] Can access `http://localhost:3000`
- [ ] Landing page loads correctly
- [ ] "Sign In with Google" button works
- [ ] Google OAuth page appears
- [ ] Can select Gmail account
- [ ] Redirects back to application
- [ ] Dashboard shows your name
- [ ] Can see modules
- [ ] Logout button works
- [ ] Can login again after logout

## 🎯 Quick Reference

| Action | URL | What Happens |
|--------|-----|--------------|
| Homepage | `http://localhost:3000` | Landing page |
| Login | Click "Sign In with Google" | Google OAuth flow |
| Dashboard | Auto-redirect after login | Student dashboard |
| Admin Panel | `http://localhost:3000/admin.html` | Admin dashboard (if admin) |
| Logout | Click logout button | Returns to homepage |

## 💡 Tips

1. **Keep terminal open:** Server must be running for login to work
2. **Check `.env` file:** Make sure it's in the project root directory
3. **Browser cache:** Clear cache if you see old pages
4. **Multiple accounts:** Test with different Gmail accounts
5. **Admin testing:** Add your email to `ADMIN_EMAILS` to test admin features

## 🔄 Restarting After Changes

If you change `.env` file or make code changes:

1. **Stop server:** Press `Ctrl+C` in terminal
2. **Restart:** Run `npm start` again
3. **Refresh browser:** Hard refresh with `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

**Need more help?** Check:
- [`ADMIN-SETUP.md`](ADMIN-SETUP.md) - For admin access setup
- [`README-FULLSTACK.md`](../README-FULLSTACK.md) - For general documentation
- Server logs in terminal - For detailed error messages
