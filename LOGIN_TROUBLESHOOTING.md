# 🔐 Admin Login Troubleshooting Guide

If you're unable to log in to the admin panel, follow these steps:

## Step 1: Check Database Configuration

The most common issue is that the database credentials are not configured.

1. **Open** `api/config.php` on your server
2. **Verify** these values are set (not the placeholder values):
   ```php
   const DB_HOST = 'localhost';  // Usually 'localhost' on Hostinger
   const DB_NAME = 'YOUR_ACTUAL_DB_NAME';
   const DB_USER = 'YOUR_ACTUAL_DB_USER';
   const DB_PASS = 'YOUR_ACTUAL_DB_PASSWORD';
   ```

3. **Get your credentials from Hostinger:**
   - Log in to Hostinger hPanel
   - Go to **Databases** → **MySQL Databases**
   - Find your database name, username, and password
   - Update `api/config.php` with these values

## Step 2: Test Database Connection

1. **Upload** `api/test_db.php` to your server (if not already uploaded)
2. **Visit** in your browser: `https://yourdomain.com/api/test_db.php`
3. **Check** the output:
   - ✅ Green = Working
   - ❌ Red = Problem found

The test script will show you:
- If database credentials are configured
- If database connection works
- If tables exist
- If admin user exists

## Step 3: Verify Database Tables Exist

1. **Log in to Hostinger** → **phpMyAdmin**
2. **Select your database**
3. **Check** that these tables exist:
   - `users`
   - `units`
   - `video_settings`

If tables don't exist:
1. Go to **Import** tab in phpMyAdmin
2. Upload `db/schema.sql` from your project
3. Click **Go** to import

## Step 4: Verify Admin User Exists

### Option A: Check via phpMyAdmin
1. Open phpMyAdmin
2. Select your database
3. Click on `users` table
4. Look for a user with:
   - Email: `admin@lm.com`
   - Role: `admin`

### Option B: Create Admin User

If admin user doesn't exist, run this SQL in phpMyAdmin:

```sql
INSERT INTO users (name, email, password_hash, role, approved)
VALUES ('Admin', 'admin@lm.com', '$2y$10$wG2yOq2u0o1b3A3yGg7sveQnJQKx4qgOiiE5jv8y0l1s5T0WZ3r2y', 'admin', 1);
```

**Default credentials:**
- Email: `admin@lm.com`
- Password: `admin123`

### Option C: Use Create Admin Script

1. Visit: `https://yourdomain.com/api/create_admin.php?password=admin123`
2. This will create or update the admin user
3. **⚠️ Delete this file after use for security!**

## Step 5: Check Browser Console

1. **Open** login page
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Try logging in**
5. **Check for errors:**
   - Red errors = API call failed
   - Network tab shows failed requests

## Step 6: Check API Endpoint

1. **Open** Developer Tools (F12)
2. **Go to Network tab**
3. **Try logging in**
4. **Click on** `api/login.php` request
5. **Check Response:**
   - `{"error": "DB_CONNECTION_FAILED"}` = Database config wrong
   - `{"error": "INVALID_CREDENTIALS"}` = Wrong email/password
   - `{"error": "SERVER_ERROR"}` = Check server error logs

## Step 7: Common Issues & Solutions

### Issue: "Invalid email or password"
**Solutions:**
- Verify email: `admin@lm.com` (exact, case-sensitive)
- Verify password: `admin123`
- Check if admin user exists in database (see Step 4)

### Issue: "Login failed. Please try again."
**Solutions:**
- Check browser console for errors
- Verify `api/login.php` file exists
- Check file permissions (should be 644)
- Check if PHP is enabled on server

### Issue: Database connection error
**Solutions:**
- Verify database credentials in `api/config.php`
- Check database is active in Hostinger
- Verify database name, user, password are correct
- Check if database host is correct (usually `localhost`)

### Issue: Session not working
**Solutions:**
- Ensure site is using HTTPS
- Check `.htaccess` file is uploaded
- Check PHP sessions are enabled
- Clear browser cookies and try again

## Step 8: Reset Admin Password

If you need to reset the admin password:

### Via phpMyAdmin:
```sql
UPDATE users 
SET password_hash = '$2y$10$wG2yOq2u0o1b3A3yGg7sveQnJQKx4qgOiiE5jv8y0l1s5T0WZ3r2y'
WHERE email = 'admin@lm.com' AND role = 'admin';
```
(This sets password back to `admin123`)

### Via Script:
1. Visit: `https://yourdomain.com/api/create_admin.php?password=YOUR_NEW_PASSWORD`
2. Replace `YOUR_NEW_PASSWORD` with your desired password
3. **⚠️ Delete this file after use!**

## Still Not Working?

1. **Check Hostinger Error Logs:**
   - Hostinger hPanel → **Advanced** → **Error Log**
   - Look for PHP errors related to database

2. **Verify File Structure:**
   ```
   public_html/
   ├── api/
   │   ├── config.php (with correct credentials)
   │   ├── login.php
   │   └── ...
   ├── login.html
   └── admin.html
   ```

3. **Test API Directly:**
   - Visit: `https://yourdomain.com/api/test_db.php`
   - This will show exactly what's wrong

---

**Need more help?** Check the browser console (F12) and share the error messages you see.

