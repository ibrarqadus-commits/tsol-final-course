<?php
require __DIR__.'/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'METHOD_NOT_ALLOWED'], 405);
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if ($name === '' || $email === '' || $password === '') {
    json_response(['error' => 'INVALID_INPUT'], 400);
}

try {
    $pdo = db();
    // Check if user exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_response(['error' => 'EMAIL_EXISTS'], 409);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash, role, approved) VALUES (?, ?, ?, "student", 0)');
    $stmt->execute([$name, $email, $hash]);

    json_response(['ok' => true, 'message' => 'Registered. Await admin approval.']);
} catch (Throwable $e) {
    json_response(['error' => 'SERVER_ERROR', 'message' => $e->getMessage()], 500);
}


