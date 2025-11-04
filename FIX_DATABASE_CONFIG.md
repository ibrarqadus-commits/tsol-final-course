# 🔧 Fix Database Connection Error - Step by Step

You're seeing: **"Database connection failed. Please check api/config.php has correct database credentials."**

This means your `api/config.php` file needs to be configured with your Hostinger database credentials.

## 📋 Step-by-Step Fix

### Step 1: Get Your Hostinger Database Credentials

1. **Log in to Hostinger hPanel**
   - Go to: https://hpanel.hostinger.com
   - Sign in with your Hostinger account

2. **Navigate to Databases**
   - Click on **"Databases"** in the left menu
   - Click on **"MySQL Databases"**

3. **Find Your Database Information**
   You'll see something like this:
   ```
   Database Name: u123456789_courseinfinity
   Database Username: u123456789_admin
   Database Password: ******** (click to show)
   Database Host: localhost
   ```
   
   **Copy these values** - you'll need them in the next step!

### Step 2: Configure api/config.php

1. **Open `api/config.php` on your Hostinger server**
   - You can edit it via:
     - **Hostinger File Manager** (easiest)
     - **FTP** (FileZilla, etc.)
     - **SSH** (if you have access)

2. **Edit the file and replace these lines:**

   **FIND THIS (placeholder values):**
   ```php
   const DB_HOST = 'localhost';
   const DB_NAME = 'YOUR_DB_NAME';
   const DB_USER = 'YOUR_DB_USER';
   const DB_PASS = 'YOUR_DB_PASSWORD';
   ```

   **REPLACE WITH YOUR ACTUAL VALUES:**
   ```php
   const DB_HOST = 'localhost';  // Usually 'localhost' on Hostinger
   const DB_NAME = 'u123456789_courseinfinity';  // Your actual database name
   const DB_USER = 'u123456789_admin';  // Your actual database username
   const DB_PASS = 'YourActualPassword123';  // Your actual database password
   ```

3. **Save the file**

### Step 3: Verify Database Exists

If you haven't created the database yet:

1. **In Hostinger hPanel → MySQL Databases**
2. **Click "Create Database"** (if you see this option)
3. **Or use phpMyAdmin:**
   - Go to **phpMyAdmin** in Hostinger
   - Create a new database if needed

### Step 4: Import Database Tables

1. **Go to Hostinger → phpMyAdmin**
2. **Select your database** from the left sidebar
3. **Click "Import" tab**
4. **Choose file:** Upload `db/schema.sql` from your project
5. **Click "Go"** to import

This creates the necessary tables:
- `users` (for login/registration)
- `units` (for course content)
- `video_settings` (for homepage videos)

### Step 5: Create Admin User

After importing the schema, you need to create the admin user:

**Option A - Via phpMyAdmin:**
1. Select your database
2. Click on `users` table
3. Click **"SQL"** tab
4. Run this SQL:
```sql
INSERT INTO users (name, email, password_hash, role, approved)
VALUES ('Admin', 'admin@lm.com', '$2y$10$wG2yOq2u0o1b3A3yGg7sveQnJQKx4qgOiiE5jv8y0l1s5T0WZ3r2y', 'admin', 1);
```

**Option B - Via Script:**
1. Visit: `https://yourdomain.com/api/create_admin.php?password=admin123`
2. This will create the admin user
3. **Delete this file after use for security!**

### Step 6: Test the Connection

1. **Visit:** `https://yourdomain.com/api/check_setup.php`
2. **This will show you:**
   - ✅ If database credentials are correct
   - ✅ If connection works
   - ✅ If tables exist
   - ✅ If admin user exists

### Step 7: Try Logging In Again

- **Email:** `admin@lm.com`
- **Password:** `admin123`

## 🔍 Common Issues

### Issue: "Can't find database credentials"
**Solution:** 
- Make sure you're looking at MySQL Databases (not PostgreSQL or other databases)
- Check if you created a database yet
- If not, create one first

### Issue: "Database doesn't exist"
**Solution:**
- Create the database in Hostinger hPanel
- Make sure the database name in `config.php` matches exactly (case-sensitive)

### Issue: "Access denied for user"
**Solution:**
- Verify the username matches exactly
- Check the password is correct (no extra spaces)
- Make sure the user has permissions on the database

### Issue: "Tables don't exist"
**Solution:**
- Import `db/schema.sql` via phpMyAdmin
- Make sure you selected the correct database before importing

## ✅ Quick Checklist

Before trying to log in, make sure:

- [ ] `api/config.php` has real database credentials (not YOUR_DB_NAME, etc.)
- [ ] Database exists in Hostinger
- [ ] Database name in config matches exactly
- [ ] Username in config matches exactly
- [ ] Password in config is correct
- [ ] Database tables are imported (via `db/schema.sql`)
- [ ] Admin user exists (created via SQL or script)

## 🆘 Still Having Issues?

1. **Check the exact error:**
   - Open browser console (F12)
   - Try logging in
   - Look at the Network tab → click on `api/login.php`
   - Check the Response - it will show the exact error message

2. **Test database connection:**
   - Visit: `https://yourdomain.com/api/check_setup.php`
   - It will tell you exactly what's wrong

3. **Verify in phpMyAdmin:**
   - Log in to phpMyAdmin
   - Check if your database appears in the list
   - Check if tables exist
   - Check if admin user exists

---

**Remember:** The database credentials are case-sensitive and must match exactly what's shown in Hostinger hPanel!

