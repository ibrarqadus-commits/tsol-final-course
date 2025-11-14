# Admin Access Setup Guide

This guide explains how to configure and access the admin dashboard for the LM Mastermind course platform.

## 🔐 How Admin Access Works

Admin access is controlled by email addresses configured in the environment variables. When a user logs in with Google OAuth, their email address is checked against the `ADMIN_EMAILS` list. If it matches, they are granted admin privileges.

## 📋 Setup Steps

### Step 1: Configure Admin Email Addresses

1. **Open your `.env` file** in the project root directory

2. **Add or update the `ADMIN_EMAILS` variable:**
   ```env
   ADMIN_EMAILS=admin@example.com,anotheradmin@example.com
   ```
   
   - Use **comma-separated** list for multiple admins
   - Use the **exact Gmail address** that will be used for Google OAuth login
   - **Case-sensitive** - make sure the email matches exactly

3. **Example:**
   ```env
   ADMIN_EMAILS=monty@yourdomain.com,john.doe@gmail.com
   ```

### Step 2: Restart the Server

After updating the `.env` file, restart your server:
```bash
npm start
```

### Step 3: Login with Admin Email

1. **Go to the application homepage:** `http://localhost:3000`
2. **Click "Sign In with Google"**
3. **Sign in with your admin Gmail account** (the one listed in `ADMIN_EMAILS`)
4. **You will be redirected to the student dashboard**

### Step 4: Access Admin Dashboard

Once logged in as an admin, you have **three ways** to access the admin dashboard:

#### Option 1: Admin Button (Recommended)
- On the student dashboard, you'll see a **purple "Admin Panel" button** in the top-right corner
- Click it to navigate to `/admin.html`

#### Option 2: Direct URL
- Navigate directly to: `http://localhost:3000/admin.html`
- The system will verify your admin status and grant access

#### Option 3: After Login Redirect
- After logging in with an admin email, you can be automatically redirected to the admin dashboard
- (Currently optional - admins can access both student and admin dashboards)

## ✅ Verifying Admin Access

### Check if You're an Admin

1. **Login to the application**
2. **Look for the purple "Admin Panel" button** in the top-right corner of the student dashboard
3. **If you see it**, you have admin access
4. **If you don't see it**, check:
   - Your email is in `ADMIN_EMAILS` environment variable
   - Email matches exactly (case-sensitive)
   - Server has been restarted after `.env` changes

### Test Admin Access

1. **Click the "Admin Panel" button** or navigate to `/admin.html`
2. **You should see:**
   - Admin dashboard with statistics
   - Access request management
   - Student management
   - Message management

## 🚨 Troubleshooting

### Problem: "Access Denied" Error

**Symptoms:** You see an "Access Denied" message when trying to access `/admin.html`

**Solutions:**
1. ✅ Verify your email is in `ADMIN_EMAILS` environment variable
2. ✅ Check email spelling and case sensitivity
3. ✅ Ensure you're logged in with the correct Google account
4. ✅ Restart the server after changing `.env` file
5. ✅ Check server logs for authentication errors

### Problem: No "Admin Panel" Button

**Symptoms:** You don't see the admin button on the student dashboard

**Solutions:**
1. ✅ Check `ADMIN_EMAILS` includes your email
2. ✅ Logout and login again
3. ✅ Clear browser cache and cookies
4. ✅ Check browser console for JavaScript errors

### Problem: Can't Login

**Symptoms:** Google OAuth login fails or redirects incorrectly

**Solutions:**
1. ✅ Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
2. ✅ Check redirect URI in Google Cloud Console matches: `http://localhost:3000/auth/google/callback`
3. ✅ Ensure OAuth consent screen is configured
4. ✅ Check server logs for OAuth errors

## 📧 Adding Multiple Admins

To add multiple admin users, separate their emails with commas:

```env
ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

**Important:** 
- No spaces after commas
- Each email must be a valid Gmail address
- All admins must sign in with Google OAuth

## 🔒 Security Best Practices

1. **Limit Admin Access:** Only add trusted email addresses to `ADMIN_EMAILS`
2. **Use Strong Session Secret:** Set a strong random string for `SESSION_SECRET`
3. **HTTPS in Production:** Always use HTTPS in production environments
4. **Regular Audits:** Periodically review who has admin access
5. **Environment Variables:** Never commit `.env` file to version control

## 📝 Example Configuration

Here's a complete example `.env` configuration:

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Server
PORT=3000
NODE_ENV=production

# Session
SESSION_SECRET=your-super-secret-random-string-here-change-this

# Email
EMAIL_USER=notifications@yourdomain.com
EMAIL_PASS=your-app-password-here
EMAIL_FROM=noreply@yourdomain.com

# Admin Configuration
ADMIN_EMAILS=monty@yourdomain.com,john@yourdomain.com
```

## 🎯 Quick Reference

| Action | URL | Requirement |
|--------|-----|-------------|
| Student Dashboard | `/` | Any authenticated user |
| Admin Dashboard | `/admin.html` | Admin email in `ADMIN_EMAILS` |
| Login | `/auth/google` | Google account |
| Logout | `/auth/logout` | Authenticated user |

## 💡 Tips

- **Admins can access both dashboards:** Admins see both student and admin features
- **Email must match exactly:** The email used for Google login must match `ADMIN_EMAILS`
- **Changes require restart:** Always restart the server after changing `.env`
- **Test with multiple accounts:** Test admin access with different email addresses

---

**Need Help?** Check the main `README-FULLSTACK.md` for general setup instructions or review server logs for detailed error messages.
