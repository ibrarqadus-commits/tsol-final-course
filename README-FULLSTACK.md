# LM Mastermind - Full-Stack Course Platform

A complete online course platform with Google OAuth authentication, module access control, and admin management system.

## 🚀 Features

### Student Features
- **Google OAuth Login** - Secure authentication with Gmail accounts
- **Module Dashboard** - View all modules with progress tracking and access status
- **Access Requests** - Request approval for restricted modules (2-7)
- **Progress Tracking** - Track completion percentage for each module
- **Contact Admin** - Send messages to administrators
- **Responsive Design** - Mobile-friendly interface

### Admin Features
- **Admin Dashboard** - Overview of students, requests, and messages
- **Access Approval** - Approve/deny module access requests with comments
- **Student Management** - View all registered students and their progress
- **Message Management** - Read and respond to student messages
- **Email Notifications** - Automatic notifications for new requests

## 🏗️ Architecture

### Database Schema (SQLite)
- **Students Table** - User accounts with Gmail authentication
- **Modules Table** - Course content modules
- **Access Requests Table** - Student requests for module access
- **Progress Table** - Learning progress tracking
- **Messages Table** - Student-admin communication

### Tech Stack
- **Backend**: Node.js, Express.js, SQLite, Passport.js
- **Frontend**: Vanilla JavaScript, Tailwind CSS
- **Authentication**: Google OAuth 2.0
- **Security**: Helmet, Rate Limiting, Input Validation
- **Email**: Nodemailer for notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- Gmail account for OAuth and notifications
- Google Cloud Console project for OAuth credentials

## ⚙️ Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd lm-mastermind
npm install
```

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Note your Client ID and Client Secret

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=change_this_to_a_random_string_for_production

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=noreply@yourdomain.com

# Admin Configuration - comma-separated list of admin email addresses
ADMIN_EMAILS=admin@example.com,anotheradmin@example.com
```

**Important:** The email addresses in `ADMIN_EMAILS` must match the Gmail addresses that will be used for Google OAuth login. These users will have access to the admin dashboard.

### 4. Gmail App Password Setup
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for the platform
4. Use this app password in the `EMAIL_PASS` environment variable

### 5. Initialize Database
```bash
npm run init-db
```

### 6. Start the Server
```bash
npm start
```

Visit `http://localhost:3000` to access the application.

## 👨‍💼 Admin Access

### Setting Up Admin Access

1. **Add admin email to `.env` file:**
   ```env
   ADMIN_EMAILS=ibrarqadusl@gmail.com
   ```

2. **Restart the server** after updating `.env`

3. **Login with the admin Gmail account** via Google OAuth

4. **Access admin dashboard** using one of these methods:
   - Click the **purple "Admin Panel" button** on the student dashboard
   - Navigate directly to `/admin.html`
   - The system automatically detects admin status

### Admin Dashboard Features

- **Overview Statistics** - Total students, pending requests, unread messages
- **Access Request Management** - Approve/deny module access requests
- **Student Management** - View all registered students and their progress
- **Message Management** - Read and respond to student messages

**For detailed admin setup instructions, see:** [`docs/ADMIN-SETUP.md`](docs/ADMIN-SETUP.md)

## 🔐 Security Features

- **Session Management** - Secure HTTP-only sessions with 24-hour timeout
- **Rate Limiting** - API rate limiting to prevent abuse
- **Input Validation** - Comprehensive form validation using express-validator
- **SQL Injection Protection** - Parameterized queries throughout
- **XSS Protection** - Helmet security headers
- **CSRF Protection** - SameSite cookie configuration

## 📊 Database ER Diagram

```
┌─────────────────┐       ┌─────────────────┐
│    Students     │       │    Modules      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ full_name       │       │ module_name     │
│ email (UQ)      │       │ description     │
│ phone_number    │       │ access_type     │
│ gmail_uid (UQ)  │       │ created_at      │
│ status          │       │ updated_at      │
│ is_admin        │       └─────────────────┘
│ created_at      │               │
│ updated_at      │               │
└─────────────────┘               │
        │                        │
        │ 1                    1 │
        │                        │
        ▼                        ▼
┌─────────────────┐       ┌─────────────────┐
│ Access Requests │       │    Progress     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ student_id (FK) │◄──────┤ student_id (FK) │
│ module_id (FK)  │──────►│ module_id (FK)  │
│ status          │       │ progress_status │
│ admin_comment   │       │ percentage_comp │
│ created_at      │       │ last_updated    │
│ updated_at      │       └─────────────────┘
│ (UQ: s_id,m_id) │
└─────────────────┘
        ▲
        │ 1
        │
        ▼
┌─────────────────┐
│   Messages      │
├─────────────────┤
│ id (PK)         │
│ student_id (FK) │
│ message_content │
│ status          │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## 🛠️ API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/logout` - Logout user
- `GET /auth/status` - Check authentication status

### Student APIs
- `GET /api/dashboard` - Get student dashboard data
- `POST /api/access-request` - Request module access
- `POST /api/progress` - Update progress
- `POST /api/message` - Send message to admin

### Admin APIs
- `GET /api/admin/dashboard` - Get admin dashboard overview
- `GET /api/admin/students` - Get all students
- `GET /api/admin/messages` - Get all messages
- `POST /api/admin/access-request/:id` - Approve/deny access request
- `POST /api/admin/message/:id/read` - Mark message as read

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
SESSION_SECRET=your_secure_random_string
GOOGLE_CLIENT_ID=your_prod_client_id
GOOGLE_CLIENT_SECRET=your_prod_client_secret
```

### Database Migration
For production, consider migrating from SQLite to PostgreSQL:
1. Update database connection in `server.js`
2. Run migration scripts
3. Update environment variables

## 📝 Business Rules

1. **Module 1 is always accessible** to registered students
2. **Modules 2-7 require admin approval** before access
3. **Students can request access** to multiple modules simultaneously
4. **Progress is tracked** per student-module combination
5. **Admin emails are configured** via environment variables
6. **Session timeout** after 24 hours of inactivity
7. **Email notifications** sent for new access requests

## 🐛 Troubleshooting

### Common Issues

**Google OAuth not working:**
- Verify redirect URI in Google Cloud Console
- Check client ID and secret in `.env`
- Ensure OAuth consent screen is configured

**Database connection failed:**
- Run `npm run init-db` to initialize database
- Check file permissions for `database.db`

**Email notifications not sending:**
- Verify Gmail app password
- Check spam folder
- Ensure less secure app access is disabled (use app password instead)

**Admin access not working:**
- Verify email is in `ADMIN_EMAILS` environment variable
- Check case sensitivity of email addresses

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review server logs for error messages
- Verify all environment variables are set correctly

## 🔄 Future Enhancements

- **Video Integration** - Direct video uploads and streaming
- **Payment System** - Stripe integration for course purchases
- **Analytics** - Detailed learning analytics and reports
- **Mobile App** - React Native companion app
- **Multi-language** - Internationalization support
- **Advanced Progress** - Detailed lesson-by-lesson tracking

---

**Version**: 2.0.0
**Last Updated**: November 2025
