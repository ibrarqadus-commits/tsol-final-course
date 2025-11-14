const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding role column to students table...');

db.serialize(() => {
  // Add role column if it doesn't exist
  db.run(`
    ALTER TABLE students 
    ADD COLUMN role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student'))
  `, (err) => {
    if (err) {
      // Column might already exist, check error
      if (err.message.includes('duplicate column')) {
        console.log('✅ Role column already exists');
      } else {
        console.error('Error adding role column:', err.message);
      }
    } else {
      console.log('✅ Role column added successfully');
    }
  });

  // Migrate existing is_admin data to role
  db.run(`
    UPDATE students 
    SET role = CASE 
      WHEN is_admin = 1 THEN 'admin' 
      ELSE 'student' 
    END
    WHERE role IS NULL OR role = ''
  `, (err) => {
    if (err) {
      console.error('Error migrating role data:', err.message);
    } else {
      console.log('✅ Migrated existing admin flags to role column');
    }
  });

  // Set default role for any NULL values
  db.run(`
    UPDATE students 
    SET role = 'student' 
    WHERE role IS NULL OR role = ''
  `, (err) => {
    if (err) {
      console.error('Error setting default role:', err.message);
    } else {
      console.log('✅ Set default role for all users');
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('✅ Migration completed successfully!');
        }
      });
    }
  });
});

