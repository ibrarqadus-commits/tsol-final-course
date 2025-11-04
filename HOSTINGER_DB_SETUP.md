# Hostinger Database Setup (PHP + MySQL)

Follow these steps to enable shared registrations and admin approvals using a MySQL database on Hostinger.

## 1) Create MySQL Database
1. Log in to hPanel → Databases → MySQL Databases
2. Create:
   - Database name
   - Database user
   - Strong password
3. Keep the host (usually `localhost`), DB name, user and password at hand

## 2) Import Schema
1. Go to hPanel → phpMyAdmin → select your database
2. Click the "Import" tab
3. Upload `db/schema.sql` from the project
4. This creates a `users` table and inserts a default admin:
   - Email: `admin@lm.com`
   - Password: `admin123` (change after login)

## 3) Configure API Credentials
1. Edit `api/config.php` on the server (or locally and re-upload):
```
const DB_HOST = 'localhost';
const DB_NAME = 'YOUR_DB_NAME';
const DB_USER = 'YOUR_DB_USER';
const DB_PASS = 'YOUR_DB_PASSWORD';
```

## 4) Upload API Files
Upload the entire `api/` directory and `db/schema.sql` (for reference) to your Hostinger site root (`public_html`).

Your final structure should be:
```
public_html/
├── index.html
├── admin.html
├── login.html
├── register.html
├── ... other .html files ...
├── .htaccess
├── assets/
├── js/
└── api/
    ├── config.php
    ├── register.php
    ├── login.php
    ├── logout.php
    ├── me.php
    ├── stats.php
    ├── students.php
    ├── approve.php
    └── reject.php
```

## 5) Test Flow
1. Visit `/register.html` → create a student
2. Visit `/login.html` → login as admin (`admin@lm.com` / `admin123`)
3. Go to `/admin.html` → you should see pending approvals
4. Approve or reject a student → stats update immediately

## 6) Secure and Maintain
- Change the default admin password after first login
- Ensure your site is served over HTTPS (hPanel → SSL)
- Keep `api/` files permissions to `644`

If anything fails, check:
- phpMyAdmin for table existence
- Edit `api/config.php` credentials
- Browser dev tools → Network tab → API responses / errors
- Hostinger Logs (Advanced → Logs)
