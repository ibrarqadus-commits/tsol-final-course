# 🔧 Environment Variables Setup Guide

This guide will walk you through setting up all required environment variables for the LM Mastermind application.

## 🚀 Quick Setup (Interactive)

Run the interactive setup script:

```bash
npm run setup
```

This will guide you through each step interactively.

---

## 📋 Manual Setup

### Step 1: Create .env File

Create a `.env` file in the root directory of your project.

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**Mac/Linux:**
```bash
touch .env
```

---

### Step 2: Generate Session Secret

Generate a secure random session secret:

```bash
npm run generate-secret
```

Copy the output - you'll need it in the next step.

---

### Step 3: Set Up Google OAuth Credentials

#### 3.1 Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

#### 3.2 Create or Select a Project

1. Click the project dropdown at the top
2. Click **"New Project"** or select an existing project
3. Give it a name (e.g., "LM Mastermind")
4. Click **"Create"**

#### 3.3 Enable Required APIs

1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Identity Services API"** or **"Google+ API"**
3. Click on it and press **"Enable"**

#### 3.4 Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have Google Workspace)
3. Fill in the required information:
   - **App name**: LM Mastermind (or your preferred name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **"Save and Continue"**
5. On **Scopes** page, click **"Save and Continue"**
6. On **Test users** page (if in testing mode):
   - Click **"Add Users"**
   - Add your email address
   - Click **"Save and Continue"**
7. Review and submit

#### 3.5 Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Select **"Web application"** as the application type
4. Give it a name: **"LM Mastermind Web Client"**
5. **Authorized redirect URIs** - Add these:
   - For development: `http://localhost:3000/auth/google/callback`
   - For production: `https://yourdomain.com/auth/google/callback`
   - For admin login: `http://localhost:3000/auth/google/callback`
   - For student login: `http://localhost:3000/auth/google/callback`
6. Click **"Create"**
7. **Copy the Client ID and Client Secret** - you'll need these!

---

### Step 4: Configure Admin Emails

Decide which email addresses should have admin access. These must be Google accounts that will be used for login.

**Example:**
- Single admin: `admin@example.com`
- Multiple admins: `admin1@example.com,admin2@example.com`

**Important:** 
- No spaces after commas
- Emails must match exactly (case-sensitive)
- These users must sign in with Google OAuth

---

### Step 5: Set Up Email Notifications (Optional)

If you want email notifications for access requests:

#### For Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select **"Mail"** and **"Other (Custom name)"**
   - Enter **"LM Mastermind"** as the name
   - Click **"Generate"**
   - Copy the 16-character password (no spaces)

#### For Other Email Providers:

Check your provider's SMTP documentation for settings.

---

### Step 6: Complete .env File

Copy this template and fill in your values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (use the one generated in Step 2)
SESSION_SECRET=your-generated-secret-here

# Google OAuth Configuration (from Step 3.5)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# Base URL
BASE_URL=http://localhost:3000

# Admin Configuration (from Step 4)
ADMIN_EMAILS=your-admin-email@gmail.com

# Email Configuration (Optional - from Step 5)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
EMAIL_FROM=noreply@yourdomain.com
```

---

## ✅ Verification

After setting up your `.env` file:

1. **Check OAuth Setup:**
   ```bash
   npm run check-oauth
   ```

2. **Initialize Database:**
   ```bash
   npm run init-db
   ```

3. **Start Server:**
   ```bash
   npm start
   ```

4. **Verify Configuration:**
   Look for these messages in the console:
   ```
   🚀 LM Mastermind server running at http://localhost:3000
   📊 Admin emails: your-admin-email@gmail.com
   📧 Email notifications: Enabled/Disabled
   🔒 Google OAuth: Configured
   ```

---

## 🌐 Production Setup

When deploying to production:

1. **Update `NODE_ENV`:**
   ```env
   NODE_ENV=production
   ```

2. **Update `BASE_URL`:**
   ```env
   BASE_URL=https://yourdomain.com
   ```

3. **Add Production Redirect URI:**
   - Go back to Google Cloud Console
   - Edit your OAuth 2.0 Client ID
   - Add production redirect URI: `https://yourdomain.com/auth/google/callback`
   - Save

4. **Set Environment Variables on Hosting Platform:**
   - Most platforms (Vercel, Heroku, Railway, etc.) have an environment variables section
   - Add all variables from your `.env` file
   - **Never commit `.env` to git!**

5. **Use Secure Session Secret:**
   - Generate a new one for production: `npm run generate-secret`
   - Use a different secret than development

---

## 🔒 Security Checklist

- [ ] `.env` file is in `.gitignore` (should be automatic)
- [ ] Session secret is random and secure
- [ ] Google OAuth credentials are correct
- [ ] Admin emails are correct and verified
- [ ] Production uses HTTPS
- [ ] Environment variables are set on hosting platform (not in code)

---

## 🆘 Troubleshooting

### OAuth Not Working?

- ✅ Check redirect URI matches exactly (including http/https and port)
- ✅ Verify Client ID and Secret are correct
- ✅ Ensure OAuth consent screen is configured
- ✅ Check that APIs are enabled

### Admin Access Denied?

- ✅ Verify email in `ADMIN_EMAILS` matches Google account exactly
- ✅ Check for typos or extra spaces
- ✅ Ensure you're using the correct Google account to sign in
- ✅ Restart server after changing `.env`

### Email Not Sending?

- ✅ Verify App Password is correct (for Gmail)
- ✅ Check that 2FA is enabled (for Gmail)
- ✅ Verify SMTP settings for other providers

---

## 📚 Additional Resources

- **Detailed Setup Guide:** See `SETUP.md`
- **Localhost Login Guide:** See `docs/LOCALHOST-LOGIN-GUIDE.md`
- **Admin Setup:** See `docs/ADMIN-SETUP.md`
- **Troubleshooting:** See `docs/TROUBLESHOOTING-LOGIN.md`

---

## 💡 Quick Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |
| `SESSION_SECRET` | **Yes** | Random secret for sessions |
| `GOOGLE_CLIENT_ID` | **Yes** | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | **Yes** | Google OAuth Client Secret |
| `BASE_URL` | No | Base URL for callbacks |
| `ADMIN_EMAILS` | **Yes** | Comma-separated admin emails |
| `EMAIL_USER` | No | Email for notifications |
| `EMAIL_PASS` | No | Email app password |
| `EMAIL_FROM` | No | From email address |

---

**Need Help?** Check the documentation files or review server logs for detailed error messages.

