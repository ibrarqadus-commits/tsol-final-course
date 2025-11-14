# 🚀 Quick Start - Login on Localhost

## Fast Setup (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project → Enable "Google Identity Services API"
3. Create OAuth 2.0 credentials:
   - Type: Web application
   - Redirect URI: `http://localhost:3000/auth/google/callback`
4. Copy Client ID and Client Secret

### 3. Create `.env` File

Create `.env` in project root:

```env
GOOGLE_CLIENT_ID=your_client_id_from_step_2
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_2
PORT=3000
NODE_ENV=development
SESSION_SECRET=any-random-string-here
ADMIN_EMAILS=your-email@gmail.com
```

### 4. Initialize Database
```bash
npm run init-db
```

### 5. Start Server
```bash
npm start
```

### 6. Login

1. Open browser: `http://localhost:3000`
2. Click **"Sign In with Google"**
3. Select your Gmail account
4. Grant permissions
5. Done! You're logged in ✅

---

**Detailed guide:** See [`docs/LOCALHOST-LOGIN-GUIDE.md`](docs/LOCALHOST-LOGIN-GUIDE.md)
