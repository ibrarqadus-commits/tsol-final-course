<?php
require __DIR__.'/config.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'METHOD_NOT_ALLOWED'], 405);
}

$email = trim($_POST['email'] ?? '');
$id = (int)($_POST['id'] ?? 0);
if ($email === '' && $id === 0) {
    json_response(['error' => 'INVALID_INPUT'], 400);
}

$pdo = db();
if ($id > 0) {
    $stmt = $pdo->prepare('UPDATE users SET approved = 1 WHERE id = ? AND role <> "admin"');
    $stmt->execute([$id]);
} else {
    $stmt = $pdo->prepare('UPDATE users SET approved = 1 WHERE email = ? AND role <> "admin"');
    $stmt->execute([$email]);
}

json_response(['ok' => true]);


