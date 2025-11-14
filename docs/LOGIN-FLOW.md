# Login Flow Diagram

## 🔄 Complete Login Process

```
┌─────────────────────────────────────────────────────────────┐
│                   1. User Visits Localhost                  │
│              http://localhost:3000                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Landing Page                                        │  │
│  │  - Course information                                │  │
│  │  - "Sign In with Google" button                      │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ User clicks "Sign In with Google"
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   2. Redirect to Google                     │
│         GET /auth/google                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Google OAuth Page                                   │  │
│  │  - Select Gmail account                             │  │
│  │  - Enter credentials (if needed)                    │  │
│  │  - Grant permissions                                │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ User grants permissions
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             3. Google Callback                              │
│    GET /auth/google/callback?code=...                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Server Processing                                   │  │
│  │  1. Exchange code for access token                   │  │
│  │  2. Get user profile from Google                    │  │
│  │  3. Check if user exists in database                │  │
│  │  4. Create/update student record                     │  │
│  │  5. Check if admin (compare email to ADMIN_EMAILS) │  │
│  │  6. Create session                                   │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Session created
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   4. Redirect to Dashboard                   │
│              Redirect: /                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Student Dashboard                                    │  │
│  │  - Welcome message with user name                    │  │
│  │  - Module overview                                   │  │
│  │  - Progress tracking                                 │  │
│  │  - Admin Panel button (if admin)                     │  │
│  │  - Logout button                                     │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites Check

Before logging in, verify:

### ✅ Server is Running
```bash
# Terminal should show:
🚀 LM Mastermind server running at http://localhost:3000
🔒 Google OAuth: Configured
```

### ✅ Environment Variables Set
Check `.env` file has:
- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Secret
- `ADMIN_EMAILS` - Your Gmail address (for admin access)

### ✅ Database Initialized
```bash
npm run init-db
# Should show: "Database initialized successfully!"
```

### ✅ Google OAuth Configured
- OAuth consent screen configured
- Redirect URI: `http://localhost:3000/auth/google/callback`
- API enabled in Google Cloud Console

## 🎯 Step-by-Step Login

### Step 1: Start Server
```bash
npm start
```

### Step 2: Open Browser
Navigate to: `http://localhost:3000`

### Step 3: Click Login Button
Click **"Sign In with Google"** or **"Get Started"**

### Step 4: Google Authentication
- Select your Gmail account
- Enter password if needed
- Click **"Allow"** to grant permissions

### Step 5: Success!
- You'll be redirected back to the application
- Dashboard loads with your information
- You're now logged in!

## 🔍 What Happens Behind the Scenes

1. **User clicks login** → Browser requests `/auth/google`
2. **Server redirects** → Google OAuth page
3. **User authenticates** → Google validates credentials
4. **Google redirects back** → `/auth/google/callback?code=...`
5. **Server exchanges code** → Gets user profile from Google
6. **Database check** → Creates/updates student record
7. **Session creation** → Stores user ID in session
8. **Redirect to dashboard** → User sees personalized content

## 🛡️ Security Features

- **OAuth 2.0** - Secure Google authentication
- **Session Management** - Server-side session storage
- **HTTPS in Production** - Secure connections
- **CSRF Protection** - SameSite cookies
- **Rate Limiting** - Prevents abuse

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Redirect URI mismatch | Check Google Cloud Console settings |
| Server not running | Run `npm start` |
| Database error | Run `npm run init-db` |
| OAuth not configured | Set up Google Cloud project |
| Session expired | Login again |

## 📱 Testing Different Scenarios

### Test as Student
1. Use any Gmail account (not in ADMIN_EMAILS)
2. Should see student dashboard only
3. No admin panel button

### Test as Admin
1. Use Gmail account listed in ADMIN_EMAILS
2. Should see student dashboard
3. Purple "Admin Panel" button visible
4. Can access `/admin.html`

### Test Logout
1. Click logout button
2. Should return to landing page
3. Session cleared
4. Must login again to access dashboard

---

**Need help?** See [`LOCALHOST-LOGIN-GUIDE.md`](LOCALHOST-LOGIN-GUIDE.md) for detailed setup instructions.
