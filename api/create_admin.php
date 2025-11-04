<?php
// Admin User Creation Script
// Use this if you need to create/reset the admin user
// Access: https://yourdomain.com/api/create_admin.php?password=YOUR_NEW_PASSWORD

require __DIR__.'/config.php';

header('Content-Type: application/json');

// Security: Only allow if password is provided via GET (you can remove this after use)
$newPassword = $_GET['password'] ?? '';
if ($newPassword === '') {
    json_response(['error' => 'Provide password via ?password=YOUR_PASSWORD'], 400);
}

try {
    $pdo = db();
    
    // Hash the password
    $hash = password_hash($newPassword, PASSWORD_BCRYPT);
    
    // Check if admin exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = 'admin@lm.com' AND role = 'admin'");
    $stmt->execute();
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Update existing admin
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = 'admin@lm.com' AND role = 'admin'");
        $stmt->execute([$hash]);
        json_response(['ok' => true, 'message' => 'Admin password updated successfully']);
    } else {
        // Create new admin
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, approved) VALUES ('Admin', 'admin@lm.com', ?, 'admin', 1)");
        $stmt->execute([$hash]);
        json_response(['ok' => true, 'message' => 'Admin user created successfully']);
    }
} catch (Throwable $e) {
    json_response(['error' => 'SERVER_ERROR', 'message' => $e->getMessage()], 500);
}

