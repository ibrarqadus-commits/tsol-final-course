/**
 * Shared Google Authentication Helper
 * Handles user lookup/creation and role assignment
 */

/**
 * Process Google OAuth profile and return user with role
 * @param {Object} profile - Google OAuth profile
 * @param {Function} dbCallback - Database callback function (db.get)
 * @param {Function} dbRun - Database run function (db.run)
 * @returns {Promise<Object>} User object with role
 */
async function processGoogleAuth(profile, dbCallback, dbRun) {
  return new Promise((resolve, reject) => {
    try {
      const gmailUid = profile.id;
      const email = profile.emails[0].value;
      const fullName = profile.displayName;

      // Check if user exists
      dbCallback('SELECT * FROM students WHERE gmail_uid = ? OR email = ?', [gmailUid, email], (err, user) => {
        if (err) return reject(err);

        if (user) {
          // Update existing user
          dbRun('UPDATE students SET full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [fullName, user.id], function(updateErr) {
              if (updateErr) return reject(updateErr);
              
              // Return user with role
              resolve({
                ...user,
                role: user.role || 'student'
              });
            });
        } else {
          // Create new user - default to student role
          // Admin accounts must be manually added to database
          dbRun(`INSERT INTO students (full_name, email, gmail_uid, status, role, is_admin)
                  VALUES (?, ?, ?, 'pending', 'student', 0)`,
            [fullName, email, gmailUid], function(insertErr) {
              if (insertErr) return reject(insertErr);

              const newUser = {
                id: this.lastID,
                full_name: fullName,
                email,
                gmail_uid: gmailUid,
                status: 'pending',
                role: 'student',
                is_admin: 0
              };
              
              resolve(newUser);
            });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get user role from database
 * @param {number} userId - User ID
 * @param {Function} dbCallback - Database callback function (db.get)
 * @returns {Promise<string>} User role ('admin' or 'student')
 */
async function getUserRole(userId, dbCallback) {
  return new Promise((resolve, reject) => {
    dbCallback('SELECT role FROM students WHERE id = ?', [userId], (err, user) => {
      if (err) return reject(err);
      if (!user) return reject(new Error('User not found'));
      resolve(user.role || 'student');
    });
  });
}

module.exports = {
  processGoogleAuth,
  getUserRole
};

