# Admin Access - Quick Start Guide

## 🚀 How to Access Admin Dashboard

### Step 1: Configure Admin Email
Add your Gmail address to `.env` file:
```env
ADMIN_EMAILS=your-email@gmail.com
```

### Step 2: Restart Server
```bash
npm start
```

### Step 3: Login
1. Go to `http://localhost:3000`
2. Click "Sign In with Google"
3. Use your admin Gmail account

### Step 4: Access Admin Panel
**Three ways to access:**

1. **Admin Button** (Easiest)
   - Look for purple "Admin Panel" button in top-right corner
   - Click it!

2. **Direct URL**
   - Navigate to: `http://localhost:3000/admin.html`

3. **After Login**
   - System detects admin status automatically

## ✅ Verify You're an Admin

After logging in, check for:
- ✅ Purple "Admin Panel" button visible on student dashboard
- ✅ Can access `/admin.html` without errors
- ✅ See admin dashboard with statistics

## ❌ If You Don't See Admin Access

1. Check `.env` file has your email:
   ```env
   ADMIN_EMAILS=your-exact-email@gmail.com
   ```

2. Verify email matches exactly (case-sensitive)

3. Restart server after changing `.env`

4. Logout and login again

## 📋 Admin Features

Once in admin dashboard, you can:
- ✅ View all students
- ✅ Approve/deny access requests
- ✅ Read student messages
- ✅ View progress reports

---

**Full documentation:** See [`ADMIN-SETUP.md`](ADMIN-SETUP.md) for detailed instructions.
