<?php
// Database Connection Test Script
// Access this file directly in your browser: https://yourdomain.com/api/test_db.php
// This will help diagnose database connection issues

require __DIR__.'/config.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Connection Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { color: green; background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { color: red; background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .info { color: #004085; background: #d1ecf1; padding: 10px; border-radius: 5px; margin: 10px 0; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔍 Database Connection Test</h1>
    
    <?php
    // Test 1: Configuration Check
    echo '<h2>1. Configuration Check</h2>';
    echo '<div class="info">';
    echo '<strong>DB_HOST:</strong> ' . htmlspecialchars(DB_HOST) . '<br>';
    echo '<strong>DB_NAME:</strong> ' . htmlspecialchars(DB_NAME) . '<br>';
    echo '<strong>DB_USER:</strong> ' . htmlspecialchars(DB_USER) . '<br>';
    echo '<strong>DB_PASS:</strong> ' . (DB_PASS ? '***' : '<span style="color:red;">NOT SET</span>') . '<br>';
    echo '</div>';
    
    if (DB_NAME === 'YOUR_DB_NAME' || DB_USER === 'YOUR_DB_USER' || DB_PASS === 'YOUR_DB_PASSWORD') {
        echo '<div class="error"><strong>⚠️ ERROR:</strong> Database credentials not configured!<br>';
        echo 'Please edit <code>api/config.php</code> and set your database credentials.</div>';
        exit;
    }
    
    // Test 2: Database Connection
    echo '<h2>2. Database Connection</h2>';
    try {
        $pdo = db();
        echo '<div class="success">✅ Database connection successful!</div>';
    } catch (Throwable $e) {
        echo '<div class="error"><strong>❌ Connection Failed:</strong><br>';
        echo htmlspecialchars($e->getMessage()) . '</div>';
        exit;
    }
    
    // Test 3: Check Tables
    echo '<h2>3. Database Tables</h2>';
    try {
        $tables = ['users', 'units', 'video_settings'];
        foreach ($tables as $table) {
            $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
            if ($stmt->rowCount() > 0) {
                echo '<div class="success">✅ Table <code>' . $table . '</code> exists</div>';
            } else {
                echo '<div class="error">❌ Table <code>' . $table . '</code> does NOT exist</div>';
                echo '<div class="info">You need to import <code>db/schema.sql</code> into your database.</div>';
            }
        }
    } catch (Throwable $e) {
        echo '<div class="error">Error checking tables: ' . htmlspecialchars($e->getMessage()) . '</div>';
    }
    
    // Test 4: Check Admin User
    echo '<h2>4. Admin User Check</h2>';
    try {
        $stmt = $pdo->prepare("SELECT id, name, email, role, approved FROM users WHERE role = 'admin'");
        $stmt->execute();
        $admins = $stmt->fetchAll();
        
        if (count($admins) === 0) {
            echo '<div class="error">❌ No admin user found!</div>';
            echo '<div class="info">';
            echo '<strong>Solution:</strong> Import <code>db/schema.sql</code> or create admin user manually:<br>';
            echo '<pre>INSERT INTO users (name, email, password_hash, role, approved) VALUES (\'Admin\', \'admin@lm.com\', \'$2y$10$wG2yOq2u0o1b3A3yGg7sveQnJQKx4qgOiiE5jv8y0l1s5T0WZ3r2y\', \'admin\', 1);</pre>';
            echo 'Password: <code>admin123</code>';
            echo '</div>';
        } else {
            echo '<div class="success">✅ Admin user(s) found:</div>';
            echo '<pre>';
            foreach ($admins as $admin) {
                echo "ID: {$admin['id']}\n";
                echo "Name: {$admin['name']}\n";
                echo "Email: {$admin['email']}\n";
                echo "Role: {$admin['role']}\n";
                echo "Approved: " . ($admin['approved'] ? 'Yes' : 'No') . "\n";
                echo "---\n";
            }
            echo '</pre>';
        }
    } catch (Throwable $e) {
        echo '<div class="error">Error checking admin user: ' . htmlspecialchars($e->getMessage()) . '</div>';
    }
    
    // Test 5: Test Login
    echo '<h2>5. Login Test</h2>';
    echo '<div class="info">';
    echo '<strong>Default Admin Credentials:</strong><br>';
    echo 'Email: <code>admin@lm.com</code><br>';
    echo 'Password: <code>admin123</code><br><br>';
    echo '<strong>Try logging in at:</strong> <a href="../login.html">login.html</a>';
    echo '</div>';
    ?>
    
    <hr>
    <p><strong>⚠️ Security Note:</strong> Delete this file (<code>api/test_db.php</code>) after testing!</p>
</body>
</html>

