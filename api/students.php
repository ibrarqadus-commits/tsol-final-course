<?php
require __DIR__.'/config.php';
require_admin();

$status = $_GET['status'] ?? 'all';
$pdo = db();

if ($status === 'pending') {
    $stmt = $pdo->query("SELECT id, name, email, approved FROM users WHERE role <> 'admin' AND approved = 0 ORDER BY created_at DESC");
} else {
    $stmt = $pdo->query("SELECT id, name, email, approved FROM users WHERE role <> 'admin' ORDER BY created_at DESC");
}

$rows = $stmt->fetchAll();
json_response(['students' => $rows]);


