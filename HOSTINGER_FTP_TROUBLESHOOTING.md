# Hostinger FTP Login Troubleshooting

## Common Issues and Solutions

### Issue: "530 Login incorrect" Error

This means your FTP username or password is incorrect. Here's how to fix it:

## ✅ Solution 1: Verify FTP Credentials in Hostinger Panel

1. **Log in to Hostinger Control Panel**
   - Go to: https://hpanel.hostinger.com
   - Log in with your main account credentials

2. **Navigate to FTP Accounts**
   - Look for "FTP Accounts" or "FTP" in the control panel
   - Click on it

3. **Check Your FTP Username**
   - Hostinger FTP usernames usually look like:
     - `u873112027.yourdomain.com` (your format)
     - `u873112027` (without domain)
     - `yourdomain.com` (just domain)
   - **Important:** The username might NOT include `.theatretickethub` - that might be a mistake
   - Copy the EXACT username shown in the FTP Accounts section

4. **Reset or View FTP Password**
   - If you see a "Show Password" or "Reset Password" button, use it
   - **Note:** FTP password is DIFFERENT from your hosting panel password
   - Create a new FTP password if needed

5. **Check FTP Host/Server**
   - Should be: `ftp.yourdomain.com` or the IP address provided
   - Or: `yourdomain.com`
   - NOT: `theatretickethub.com` (unless that's your actual domain)

## ✅ Solution 2: Correct FTP Settings

Use these settings in your FTP client:

### For Standard FTP:
- **Host/Server:** `ftp.yourdomain.com` or IP from Hostinger
- **Port:** `21`
- **Protocol:** `FTP` or `FTP - Plain FTP`
- **Encryption:** `None` or `Plain FTP`
- **Username:** `u873112027` (without `.theatretickethub`)
- **Password:** Your FTP password (from Hostinger panel)

### For Secure FTP (FTPS):
- **Host/Server:** `ftp.yourdomain.com` or IP from Hostinger
- **Port:** `990` or `21`
- **Protocol:** `FTPS` or `FTP over TLS`
- **Encryption:** `Explicit TLS/SSL`
- **Username:** `u873112027`
- **Password:** Your FTP password

### For SFTP:
- **Host/Server:** `yourdomain.com` or IP from Hostinger
- **Port:** `22`
- **Protocol:** `SFTP`
- **Username:** `u873112027`
- **Password:** Your FTP password

## ✅ Solution 3: Create a New FTP Account (Recommended)

If you're unsure about credentials, create a fresh FTP account:

1. In Hostinger panel → **FTP Accounts**
2. Click **"Create FTP Account"** or **"Add FTP Account"**
3. Set:
   - **Username:** Choose a simple name (e.g., `deploy` or `upload`)
   - **Password:** Create a strong password
   - **Directory:** `/public_html` (or leave default)
4. Click **"Create"**
5. Copy the new credentials
6. Use these new credentials in your FTP client

## ✅ Solution 4: Use Hostinger File Manager (Easiest - No FTP Needed!)

Instead of FTP, use Hostinger's web-based File Manager:

1. **Log in to Hostinger Control Panel**
   - Go to: https://hpanel.hostinger.com

2. **Open File Manager**
   - Click "File Manager" in the control panel
   - Navigate to `public_html` folder

3. **Upload Files**
   - Click "Upload" button
   - Drag and drop your files
   - No FTP credentials needed!

## 🔍 Quick Checklist

Before trying again, verify:

- [ ] Username is correct (check in Hostinger FTP Accounts section)
- [ ] Password is correct (FTP password, NOT hosting panel password)
- [ ] FTP host/server is correct (usually `ftp.yourdomain.com`)
- [ ] Port is correct (21 for FTP, 22 for SFTP, 990 for FTPS)
- [ ] Protocol/encryption settings match (FTP vs FTPS vs SFTP)
- [ ] You're connecting to the right domain/server

## 📝 Example Correct Settings

Based on your username `u873112027`, your settings should be:

```
Host: ftp.yourdomain.com (or IP from Hostinger)
Port: 21
Protocol: FTP
Username: u873112027 (NOT u873112027.theatretickethub)
Password: [Your FTP password from Hostinger]
```

## 🆘 Still Having Issues?

1. **Contact Hostinger Support**
   - Live chat: Available in Hostinger control panel
   - They can verify your FTP credentials

2. **Use File Manager Instead**
   - Easiest method - no FTP needed
   - See `MANUAL_DEPLOY_STEPS.md` for detailed instructions

3. **Check Hostinger Knowledge Base**
   - https://support.hostinger.com
   - Search for "FTP connection" or "FTP login error"

