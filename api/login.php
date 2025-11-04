<?php
require __DIR__.'/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'METHOD_NOT_ALLOWED'], 405);
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if ($email === '' || $password === '') {
    json_response(['error' => 'INVALID_INPUT'], 400);
}

try {
    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, approved FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_response(['error' => 'INVALID_CREDENTIALS'], 401);
    }

    start_session();
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'approved' => (int)$user['approved'] === 1
    ];

    // Return user data (without sensitive info)
    $responseData = [
        'ok' => true,
        'user' => [
            'id' => $_SESSION['user']['id'],
            'name' => $_SESSION['user']['name'],
            'email' => $_SESSION['user']['email'],
            'role' => $_SESSION['user']['role'],
            'approved' => $_SESSION['user']['approved']
        ]
    ];
    
    json_response($responseData);
} catch (PDOException $e) {
    // Database-specific errors
    error_log("Login PDO Error: " . $e->getMessage());
    json_response(['error' => 'DB_ERROR', 'message' => 'Database error. Please check configuration.'], 500);
} catch (Throwable $e) {
    // General errors
    error_log("Login Error: " . $e->getMessage());
    json_response(['error' => 'SERVER_ERROR', 'message' => $e->getMessage()], 500);
}


