require('dotenv').config();
const express = require('express');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { processGoogleAuth } = require('./lib/auth-helper');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
// In Vercel serverless, use /tmp directory (but data won't persist)
// For production, consider migrating to MongoDB Atlas or another cloud database
const dbPath = process.env.VERCEL === '1' 
  ? path.join('/tmp', 'database.db')
  : path.join(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else if (process.env.VERCEL === '1') {
    console.warn('⚠️  Running in Vercel serverless - SQLite database in /tmp (data will not persist)');
    console.warn('⚠️  Consider migrating to MongoDB Atlas or another cloud database for production');
  }
});

// Middleware
// app.use(helmet()); // Temporarily disable helmet to fix loading issue

// Disable CSP completely for development
app.use((req, res, next) => {
  // Disable caching to prevent header caching issues
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  next();
});
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Session configuration
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
  secret: process.env.SESSION_SECRET || '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GOCSPX-qCd-ZEYR2MCosUgIbPnIiW8kHumk',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Check if Google OAuth is configured
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  WARNING: Google OAuth credentials not configured!');
  console.warn('⚠️  Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
}

// Shared Google OAuth Strategy
// Uses state parameter to differentiate between admin and student login
const baseCallbackURL = process.env.NODE_ENV === 'production' 
  ? `${process.env.BASE_URL || 'https://yourdomain.com'}/auth/google/callback`
  : 'http://localhost:3000/auth/google/callback';

passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'dummy',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
  callbackURL: baseCallbackURL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Process Google auth using shared helper (authenticates user first)
    const user = await processGoogleAuth(profile, db.get.bind(db), db.run.bind(db));
    
    // Return user - role checking will happen in callback route
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM students WHERE id = ?', [id], (err, student) => {
    if (err) return done(err);
    if (!student) return done(null, false);

    // Ensure role is set (fallback for legacy data)
    if (!student.role) {
      student.role = student.is_admin === 1 ? 'admin' : 'student';
    }
    
    // Keep isAdmin for backward compatibility
    student.isAdmin = student.role === 'admin';
    
    done(null, student);
  });
});

// Email transporter
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to render OAuth error page
function renderOAuthError(message, returnUrl = '/') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Error</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #244855 0%, #000000 100%); color: white; }
        .error-box { background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 1rem; max-width: 600px; text-align: center; }
        code { background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 0.25rem; display: block; margin: 1rem 0; }
        a { color: #60a5fa; text-decoration: none; display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.2); border-radius: 0.5rem; }
        a:hover { background: rgba(255,255,255,0.3); }
      </style>
    </head>
    <body>
      <div class="error-box">
        <h1>⚠️ ${message}</h1>
        <p><a href="${returnUrl}">← Return</a></p>
      </div>
    </body>
    </html>
  `;
}

// Helper function to render login page
function renderLoginPage(title, description, loginUrl, returnUrl = '/') {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - LM Mastermind</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        * { font-family: 'Poppins', sans-serif; }
        body { background: linear-gradient(135deg, #244855 0%, #000000 100%); min-height: 100vh; }
      </style>
    </head>
    <body>
      <div class="min-h-screen flex items-center justify-center px-4">
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">${title}</h2>
            <p class="text-gray-600">${description}</p>
          </div>

          <div class="space-y-4">
            <a href="${loginUrl}" class="w-full flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
              <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </div>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              By signing in, you agree to our
              <a href="/privacy.html" class="text-[#244855] hover:underline">Privacy Policy</a>
              and
              <a href="/terms.html" class="text-[#244855] hover:underline">Terms of Service</a>
            </p>
            <a href="${returnUrl}" class="mt-4 inline-block text-sm text-gray-500 hover:text-gray-700">← Back to Home</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Admin login page route - shows login UI
app.get('/admin/login', (req, res) => {
  // Check if OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).send(renderOAuthError('Google OAuth Not Configured', '/'));
  }
  
  // Render login page
  return res.send(renderLoginPage(
    'Admin Login',
    'Sign in with your Google account to access the admin dashboard',
    '/admin/login/auth',
    '/'
  ));
});

// Admin login auth route - initiates Google OAuth
app.get('/admin/login/auth', (req, res, next) => {
  // Set expected role in session
  req.session.expectedRole = 'admin';
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Student login page route - shows login UI
app.get('/student/login', (req, res) => {
  // Check if OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).send(renderOAuthError('Google OAuth Not Configured', '/'));
  }
  
  // Render login page
  return res.send(renderLoginPage(
    'Student Login',
    'Sign in with your Google account to access your course materials',
    '/student/login/auth',
    '/'
  ));
});

// Student login auth route - initiates Google OAuth
app.get('/student/login/auth', (req, res, next) => {
  // Set expected role in session
  req.session.expectedRole = 'student';
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google OAuth callback - handles both admin and student
app.get('/auth/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: false,
      failureFlash: false 
    })(req, res, (err) => {
      if (err) {
        console.error('OAuth error:', err);
        return res.status(403).send(renderOAuthError('Authentication failed. Please try again.', '/'));
      }
      
      // Check if authentication failed due to role mismatch or other reason
      if (!req.user) {
        return res.status(403).send(renderOAuthError('You are not authorised for this section.', '/'));
      }
      
      // Get expected role from session (or default to student)
      const expectedRole = req.session.expectedRole || 'student';
      delete req.session.expectedRole;
      
      // Verify role matches
      const userRole = req.user.role || (req.user.is_admin === 1 ? 'admin' : 'student');
      if (userRole !== expectedRole) {
        req.logout(() => {
          return res.status(403).send(renderOAuthError('You are not authorised for this section.', '/'));
        });
        return;
      }
      
      // Redirect based on role
      if (userRole === 'admin') {
        res.redirect('/admin.html');
      } else {
        res.redirect('/');
      }
    });
  }
);

// Legacy route for backward compatibility (redirects to student login)
app.get('/auth/google', (req, res) => {
  res.redirect('/student/login');
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Auth status endpoint
app.get('/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Middleware to require admin role
function requireAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check role field
  const userRole = req.user.role || (req.user.is_admin === 1 ? 'admin' : 'student');
  
  if (userRole !== 'admin') {
    console.warn(`⚠️  Unauthorized admin API access attempt by: ${req.user.email} (role: ${userRole}) to ${req.path}`);
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  return next();
}

// Middleware to require student role
function requireStudent(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check role field
  const userRole = req.user.role || (req.user.is_admin === 1 ? 'admin' : 'student');
  
  if (userRole !== 'student') {
    console.warn(`⚠️  Unauthorized student API access attempt by: ${req.user.email} (role: ${userRole}) to ${req.path}`);
    return res.status(403).json({ error: 'Student access required' });
  }
  
  return next();
}

// API Routes

// Get student dashboard data
app.get('/api/dashboard', requireStudent, (req, res) => {
  const studentId = req.user.id;

  // Get modules with access status - only modules 1-7
  const query = `
    SELECT
      m.*,
      CASE
        WHEN m.access_type = 'open' THEN 'approved'
        WHEN ar.status IS NOT NULL THEN ar.status
        ELSE 'not_requested'
      END as access_status,
      ar.admin_comment,
      p.progress_status,
      p.percentage_completed,
      p.last_updated as progress_updated
    FROM modules m
    LEFT JOIN access_requests ar ON m.id = ar.module_id AND ar.student_id = ?
    LEFT JOIN progress p ON m.id = p.module_id AND p.student_id = ?
    WHERE m.id <= 7
    ORDER BY m.id
  `;

  db.all(query, [studentId, studentId], (err, modules) => {
    if (err) return res.status(500).json({ error: err.message });

    // Double-check: Filter out any modules with ID > 7 (safety measure)
    const filteredModules = modules.filter(m => m.id <= 7);

    // Sanitize user data - remove admin flags for student dashboard
    const studentData = {
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email,
      status: req.user.status,
      created_at: req.user.created_at
      // Explicitly exclude isAdmin, is_admin, and any admin-related fields
    };

    res.json({
      student: studentData,
      modules: filteredModules
    });
  });
});

// Get admin dashboard data
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  const queries = {
    students: 'SELECT COUNT(*) as count FROM students',
    pendingRequests: 'SELECT COUNT(*) as count FROM access_requests ar JOIN modules m ON ar.module_id = m.id WHERE ar.status = "pending" AND m.id <= 7',
    totalMessages: 'SELECT COUNT(*) as count FROM messages WHERE status = "unread"',
    recentRequests: `
      SELECT ar.*, s.full_name, s.email, m.module_name
      FROM access_requests ar
      JOIN students s ON ar.student_id = s.id
      JOIN modules m ON ar.module_id = m.id
      WHERE ar.status = 'pending' AND m.id <= 7
      ORDER BY ar.created_at DESC
      LIMIT 10
    `
  };

  const results = {};

  db.get(queries.students, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    results.students = row.count;

    db.get(queries.pendingRequests, [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      results.pendingRequests = row.count;

      db.get(queries.totalMessages, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        results.unreadMessages = row.count;

        db.all(queries.recentRequests, [], (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          results.recentRequests = rows;

          res.json(results);
        });
      });
    });
  });
});

// Request access to modules
app.post('/api/access-request',
  requireStudent,
  [
    body('modules').isArray({ min: 1 }).withMessage('At least one module must be selected'),
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phoneNumber').trim().isLength({ min: 10 }).withMessage('Valid phone number is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { modules, fullName, email, phoneNumber } = req.body;
    const studentId = req.user.id;

    // Validate that only modules 1-7 can be requested
    const invalidModules = modules.filter(id => id > 7 || id < 1);
    if (invalidModules.length > 0) {
      return res.status(400).json({ error: `Invalid module IDs: ${invalidModules.join(', ')}. Only modules 1-7 are available.` });
    }

    // Update student info
    db.run('UPDATE students SET full_name = ?, email = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [fullName, email, phoneNumber, studentId], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Create access requests
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO access_requests (student_id, module_id, status, updated_at)
        VALUES (?, ?, 'pending', CURRENT_TIMESTAMP)
      `);

      let completed = 0;
      modules.forEach(moduleId => {
        stmt.run([studentId, moduleId], (err) => {
          if (err) console.error('Error creating access request:', err);
          completed++;
          if (completed === modules.length) {
            stmt.finalize();

            // Send notification email to admin
            if (process.env.EMAIL_USER) {
              const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: process.env.ADMIN_EMAILS.split(',')[0],
                subject: 'New Access Request - LM Mastermind',
                html: `
                  <h2>New Access Request</h2>
                  <p><strong>Student:</strong> ${fullName}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Phone:</strong> ${phoneNumber}</p>
                  <p><strong>Modules Requested:</strong> ${modules.join(', ')}</p>
                  <p>Please review and approve/deny the request in the admin dashboard.</p>
                `
              };

              emailTransporter.sendMail(mailOptions, (error, info) => {
                if (error) console.error('Email error:', error);
              });
            }

            res.json({ success: true, message: 'Access request submitted successfully' });
          }
        });
      });
    });
  });

// Admin approve/deny access request
app.post('/api/admin/access-request/:id',
  requireAdmin,
  [
    body('action').isIn(['approve', 'deny']).withMessage('Action must be approve or deny'),
    body('comment').optional().trim()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const requestId = req.params.id;
    const { action, comment } = req.body;
    const status = action === 'approve' ? 'approved' : 'denied';

    // First check if the request is for a valid module (1-7)
    db.get('SELECT module_id FROM access_requests WHERE id = ?', [requestId], (err, request) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!request) return res.status(404).json({ error: 'Access request not found' });
      
      if (request.module_id > 7 || request.module_id < 1) {
        return res.status(400).json({ error: `Cannot process request for module ${request.module_id}. Only modules 1-7 are available.` });
      }

      db.run('UPDATE access_requests SET status = ?, admin_comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, comment, requestId], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Access request not found' });
        }

        res.json({ success: true, message: `Request ${status}` });
      });
    });
  });

// Update progress
app.post('/api/progress',
  requireStudent,
  [
    body('moduleId').isInt().withMessage('Valid module ID required'),
    body('status').isIn(['not_started', 'in_progress', 'completed']).withMessage('Invalid status'),
    body('percentage').isInt({ min: 0, max: 100 }).withMessage('Percentage must be 0-100')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { moduleId, status, percentage } = req.body;
    const studentId = req.user.id;

    // Validate that only modules 1-7 can have progress tracked
    if (moduleId > 7 || moduleId < 1) {
      return res.status(400).json({ error: `Invalid module ID: ${moduleId}. Only modules 1-7 are available.` });
    }

    db.run(`INSERT OR REPLACE INTO progress (student_id, module_id, progress_status, percentage_completed, last_updated)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [studentId, moduleId, status, percentage], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ success: true, message: 'Progress updated' });
    });
  });

// Send message to admin
app.post('/api/message',
  requireStudent,
  [
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const studentId = req.user.id;

    db.run('INSERT INTO messages (student_id, message_content) VALUES (?, ?)',
      [studentId, message], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ success: true, message: 'Message sent successfully' });
    });
  });

// Get messages for admin
app.get('/api/admin/messages', requireAdmin, (req, res) => {
  const query = `
    SELECT m.*, s.full_name, s.email
    FROM messages m
    JOIN students s ON m.student_id = s.id
    ORDER BY m.created_at DESC
  `;

  db.all(query, [], (err, messages) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(messages);
  });
});

// Get all students for admin
app.get('/api/admin/students', requireAdmin, (req, res) => {
  const query = `
    SELECT
      s.*,
      COUNT(CASE WHEN ar.status = 'approved' AND m.id <= 7 THEN 1 END) as approved_modules,
      COUNT(CASE WHEN ar.status = 'pending' AND m.id <= 7 THEN 1 END) as pending_requests
    FROM students s
    LEFT JOIN access_requests ar ON s.id = ar.student_id
    LEFT JOIN modules m ON ar.module_id = m.id
    WHERE s.is_admin = 0
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;

  db.all(query, [], (err, students) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(students);
  });
});

// Mark message as read
app.post('/api/admin/message/:id/read', requireAdmin, (req, res) => {
  db.run('UPDATE messages SET status = "read", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ success: true });
  });
});

// Admin page route - STRICT admin-only access
app.get('/admin.html', (req, res, next) => {
  // First check authentication
  if (!req.isAuthenticated()) {
    return res.redirect('/admin/login');
  }
  
  // Check role field
  const userRole = req.user.role || (req.user.is_admin === 1 ? 'admin' : 'student');
  
  if (userRole !== 'admin') {
    console.warn(`⚠️  Unauthorized admin access attempt by: ${req.user.email} (role: ${userRole})`);
    return res.status(403).send(renderOAuthError('You are not authorised for this section. Admin access required.', '/'));
  }
  
  // Admin access granted - serve the file
  next();
});

// Cleanup function to remove modules 8-14 on startup
function cleanupModules() {
  db.run('DELETE FROM modules WHERE id > 7', (err) => {
    if (err) {
      console.error('Error cleaning up modules 8-14:', err);
    } else {
      db.get('SELECT changes() as deleted', [], (err, row) => {
        if (!err && row && row.deleted > 0) {
          console.log(`✅ Cleaned up ${row.deleted} module(s) with ID > 7`);
        }
      });
    }
  });
  
  // Also clean up any access requests and progress for modules 8-14
  db.run('DELETE FROM access_requests WHERE module_id > 7', (err) => {
    if (err) {
      console.error('Error cleaning up access requests for modules 8-14:', err);
    }
  });
  
  db.run('DELETE FROM progress WHERE module_id > 7', (err) => {
    if (err) {
      console.error('Error cleaning up progress for modules 8-14:', err);
    }
  });
}

// Run cleanup on startup
cleanupModules();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files (but exclude login routes and API routes)
app.use((req, res, next) => {
  // Skip static file serving for specific routes that have their own handlers
  if (req.path === '/admin/login' || 
      req.path === '/student/login' || 
      req.path === '/admin/login/auth' || 
      req.path === '/student/login/auth' ||
      req.path.startsWith('/api/') ||
      req.path.startsWith('/auth/')) {
    return next();
  }
  
  // Use express.static for all other requests
  const staticMiddleware = express.static(path.join(__dirname), {
    maxAge: '1h',
    etag: true,
    lastModified: true,
    index: false // Don't auto-serve index.html, we'll handle that in catch-all
  });
  
  staticMiddleware(req, res, next);
});

// Catch all handler - serve index.html for SPA
app.use((req, res, next) => {
  // Skip if it's an API route, auth route, health check, or login routes
  if (req.path.startsWith('/api/') ||
      req.path.startsWith('/auth/') ||
      req.path === '/health' ||
      req.path === '/admin/login' ||
      req.path === '/student/login' ||
      req.path === '/admin/login/auth' ||
      req.path === '/student/login/auth') {
    return next();
  }

  // Skip if it's a static file request (has file extension)
  const hasExtension = /\.[^/]+$/.test(req.path);
  if (hasExtension) {
    return next(); // Let Express handle 404 for missing static files
  }

  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      next(err);
    }
  });
});

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 LM Mastermind server running at http://localhost:${PORT}`);
    console.log(`📊 Admin emails: ${process.env.ADMIN_EMAILS || 'Not configured'}`);
    console.log(`📧 Email notifications: ${process.env.EMAIL_USER ? 'Enabled' : 'Disabled'}`);
    console.log(`🔒 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close();
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });
}

// Export app for Vercel serverless functions
module.exports = app;
