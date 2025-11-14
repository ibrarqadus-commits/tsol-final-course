# ⚡ Quick Environment Setup

Follow these steps to set up your environment variables quickly.

## 🎯 Option 1: Interactive Setup (Easiest)

Run the interactive setup script:

```bash
npm run setup
```

This will guide you through each step automatically.

---

## 🎯 Option 2: Manual Setup

### Step 1: Generate Session Secret

```bash
npm run generate-secret
```

Copy the output - you'll need it!

**Example output:**
```
d9467581a2f08f84ead67ad89df0e98c849093e26d87c443ed63ffe1bff6a7a2
```

---

### Step 2: Get Google OAuth Credentials

#### A. Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. You should see your project "propertycourse" - select it

#### B. Enable Required API

1. Click **"APIs & Services"** in the left menu
2. Click **"Library"**
3. Search for **"Google Identity Services API"**
4. Click on it and press **"Enable"**

#### C. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. If not configured:
   - Choose **"External"**
   - Fill in:
     - **App name**: LM Mastermind
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click **"Save and Continue"** through all steps
   - Add yourself as a test user if in testing mode

#### D. Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, select **"Web application"**
4. Fill in:
   - **Name**: LM Mastermind Web Client
   - **Authorized redirect URIs**: Click **"+ ADD URI"** and add:
     ```
     http://localhost:3000/auth/google/callback
     ```
5. Click **"CREATE"**
6. **IMPORTANT:** Copy both:
   - **Your Client ID** (looks like: `123456789-abc...apps.googleusercontent.com`)
   - **Your Client Secret** (looks like: `GOCSPX-abc...`)

---

### Step 3: Create .env File

**Windows PowerShell:**
```powershell
Copy-Item env.template .env
```

**Mac/Linux:**
```bash
cp env.template .env
```

---

### Step 4: Edit .env File

Open `.env` in a text editor and fill in:

1. **SESSION_SECRET**: Paste the secret from Step 1
2. **GOOGLE_CLIENT_ID**: Paste your Client ID from Step 2
3. **GOOGLE_CLIENT_SECRET**: Paste your Client Secret from Step 2
4. **ADMIN_EMAILS**: Your Gmail address (the one you'll use to login)

**Example:**
```env
SESSION_SECRET=d9467581a2f08f84ead67ad89df0e98c849093e26d87c443ed63ffe1bff6a7a2
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
ADMIN_EMAILS=your-email@gmail.com
```

---

### Step 5: Initialize Database

```bash
npm run init-db
```

You should see:
```
Initializing database...
Database initialized successfully!
```

---

### Step 6: Verify Setup

```bash
npm run check-oauth
```

This will verify your OAuth configuration.

---

### Step 7: Start Server

```bash
npm start
```

Look for:
```
🚀 LM Mastermind server running at http://localhost:3000
📊 Admin emails: your-email@gmail.com
🔒 Google OAuth: Configured
```

---

## ✅ Test Login

1. Open browser: http://localhost:3000
2. Click **"Admin Login"** or **"Student Login"**
3. Sign in with your Google account
4. You should be redirected to the dashboard!

---

## 🆘 Troubleshooting

### "Google OAuth Not Configured"
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `.env`
- Restart the server after editing `.env`

### "You are not authorised for this section"
- Check that your email in `ADMIN_EMAILS` matches your Google account exactly
- No spaces, correct capitalization

### OAuth redirect error
- Verify redirect URI in Google Console matches exactly: `http://localhost:3000/auth/google/callback`
- Check for typos

---

## 📚 Need More Help?

- **Detailed Guide**: See `ENV-SETUP-GUIDE.md`
- **Google OAuth Setup**: See `SETUP.md`
- **Troubleshooting**: See `docs/TROUBLESHOOTING-LOGIN.md`

