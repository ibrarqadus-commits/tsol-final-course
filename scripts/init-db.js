const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {
    // Students table
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone_number TEXT,
            gmail_uid TEXT UNIQUE,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
            is_admin BOOLEAN DEFAULT 0,
            role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Modules table
    db.run(`
        CREATE TABLE IF NOT EXISTS modules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module_name TEXT NOT NULL,
            description TEXT,
            access_type TEXT DEFAULT 'requires_approval' CHECK (access_type IN ('open', 'requires_approval')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Access Requests table
    db.run(`
        CREATE TABLE IF NOT EXISTS access_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            module_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
            admin_comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
            UNIQUE(student_id, module_id)
        )
    `);

    // Progress table
    db.run(`
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            module_id INTEGER NOT NULL,
            progress_status TEXT DEFAULT 'not_started' CHECK (progress_status IN ('not_started', 'in_progress', 'completed')),
            percentage_completed INTEGER DEFAULT 0 CHECK (percentage_completed >= 0 AND percentage_completed <= 100),
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
            UNIQUE(student_id, module_id)
        )
    `);

    // Messages table
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            message_content TEXT NOT NULL,
            status TEXT DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    `);

    // Insert default modules
    const modules = [
        { name: 'Foundation & Financial Freedom Roadmap', description: 'Build your foundation and create a clear roadmap to financial freedom through property management.', access_type: 'open' },
        { name: 'Market Understanding & Property Strategy', description: 'Understand the property market and develop effective strategies.', access_type: 'requires_approval' },
        { name: 'Business Setup & Compliance Foundations', description: 'Set up your business legally and ensure compliance.', access_type: 'requires_approval' },
        { name: 'Client Acquisition & Lettings Operations', description: 'Learn how to acquire clients and manage lettings operations.', access_type: 'requires_approval' },
        { name: 'Property Management & Relationship Building', description: 'Master property management and build strong client relationships.', access_type: 'requires_approval' },
        { name: 'End of Tenancy, Renewals & Compliance Updates', description: 'Handle tenancy endings, renewals, and stay compliant.', access_type: 'requires_approval' },
        { name: 'Scaling, Marketing & Portfolio Growth', description: 'Scale your business through marketing and portfolio expansion.', access_type: 'requires_approval' }
    ];

    const stmt = db.prepare(`
        INSERT OR IGNORE INTO modules (module_name, description, access_type)
        VALUES (?, ?, ?)
    `);

    modules.forEach(module => {
        stmt.run(module.name, module.description, module.access_type);
    });

    stmt.finalize();

    console.log('Database initialized successfully!');
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
