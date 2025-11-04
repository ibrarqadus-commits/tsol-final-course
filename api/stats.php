<?php
require __DIR__.'/config.php';
require_admin();

$pdo = db();
$total = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role <> 'admin'")->fetchColumn();
$approved = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role <> 'admin' AND approved = 1")->fetchColumn();
$pending = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role <> 'admin' AND approved = 0")->fetchColumn();

json_response(['total' => $total, 'approved' => $approved, 'pending' => $pending]);


