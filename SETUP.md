# Environment Configuration Guide

This guide will help you configure the `.env` file for the LM Mastermind application.

## Step 1: Create the .env file

Create a `.env` file in the root directory of your project with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (generate a random string for production)
SESSION_SECRET=your-secret-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Base URL (for production)
BASE_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAILS=

# Email Configuration (Optional)
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
```

## Step 2: Configure Google OAuth

### Get Google OAuth Credentials:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select a Project**:
   - Click on the project dropdown at the top
   - Click "New Project" or select an existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" (unless you have a Google Workspace)
     - Fill in the required fields (App name, User support email, Developer contact)
     - Add scopes: `email` and `profile`
     - Add test users (your email) if in testing mode
   - Application type: **Web application**
   - Name: LM Mastermind (or your preferred name)
   - Authorized redirect URIs:
     - For development: `http://localhost:3000/auth/google/callback`
     - For production: `https://yourdomain.com/auth/google/callback`
5. **Copy Credentials**:
   - Copy the **Client ID** and **Client Secret**
   - Add them to your `.env` file:
     ```
     GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-client-secret-here
     ```

## Step 3: Configure Admin Emails

Add comma-separated email addresses that should have admin access:

```env
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

**Important**: These emails must match the Google accounts that will be used to sign in.

## Step 4: Configure Email Notifications (Optional)

If you want to receive email notifications for access requests:

### For Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "LM Mastermind" as the name
   - Copy the generated 16-character password
3. **Add to .env**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

### For Other Email Providers:

Check your email provider's documentation for SMTP settings and use the appropriate configuration.

## Step 5: Generate a Secure Session Secret (Recommended)

For production, generate a secure random session secret:

**On Windows (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**On Mac/Linux:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it to your `.env`:
```env
SESSION_SECRET=your-generated-secret-here
```

## Step 6: Production Configuration

When deploying to production:

1. Set `NODE_ENV=production`
2. Update `BASE_URL` to your production domain
3. Add production redirect URI to Google OAuth credentials
4. Use a secure `SESSION_SECRET`
5. Ensure `SESSION_SECRET` and all credentials are set in your hosting platform's environment variables

## Example .env File

Here's a complete example:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
BASE_URL=http://localhost:3000
ADMIN_EMAILS=admin@example.com
EMAIL_USER=notifications@example.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=notifications@example.com
```

## Troubleshooting

- **OAuth not working?**: Make sure the redirect URI in Google Console matches exactly (including http/https and port)
- **Admin access denied?**: Verify the email in `ADMIN_EMAILS` matches the Google account email exactly
- **Email not sending?**: Check that App Password is correct (for Gmail) and that 2FA is enabled

