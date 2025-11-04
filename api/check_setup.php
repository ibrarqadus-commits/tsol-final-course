<?php
// Quick Setup Check for Hostinger
// Visit: https://yourdomain.com/api/check_setup.php
// This will check if everything is configured correctly

require __DIR__.'/config.php';

header('Content-Type: application/json');

$results = [
    'config_ok' => false,
    'db_connected' => false,
    'tables_exist' => false,
    'admin_exists' => false,
    'errors' => [],
    'warnings' => []
];

// Check 1: Configuration
if (DB_NAME === 'YOUR_DB_NAME' || DB_USER === 'YOUR_DB_USER' || DB_PASS === 'YOUR_DB_PASSWORD') {
    $results['errors'][] = 'Database credentials not configured in api/config.php';
    json_response($results);
}

$results['config_ok'] = true;

// Check 2: Database Connection
try {
    $pdo = db();
    $results['db_connected'] = true;
} catch (Throwable $e) {
    $results['errors'][] = 'Database connection failed: ' . $e->getMessage();
    json_response($results);
}

// Check 3: Tables
try {
    $tables = ['users', 'units', 'video_settings'];
    $missing = [];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() === 0) {
            $missing[] = $table;
        }
    }
    if (empty($missing)) {
        $results['tables_exist'] = true;
    } else {
        $results['warnings'][] = 'Missing tables: ' . implode(', ', $missing) . '. Import db/schema.sql';
    }
} catch (Throwable $e) {
    $results['errors'][] = 'Error checking tables: ' . $e->getMessage();
}

// Check 4: Admin User
try {
    $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE role = 'admin'");
    $stmt->execute();
    $admin = $stmt->fetch();
    if ($admin) {
        $results['admin_exists'] = true;
        $results['admin_email'] = $admin['email'];
    } else {
        $results['warnings'][] = 'No admin user found. Use api/create_admin.php?password=admin123 to create one.';
    }
} catch (Throwable $e) {
    $results['errors'][] = 'Error checking admin user: ' . $e->getMessage();
}

// Check 5: Session
if (function_exists('session_start')) {
    $results['session_available'] = true;
} else {
    $results['warnings'][] = 'PHP sessions may not be configured';
}

json_response($results);

