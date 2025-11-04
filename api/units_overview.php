<?php
require __DIR__.'/config.php';
require_admin();

$module = trim($_GET['module'] ?? '');
if ($module === '') {
    json_response(['error' => 'INVALID_INPUT'], 400);
}

$pdo = db();
$stmt = $pdo->prepare('SELECT unit_id, (content IS NOT NULL AND content <> "") AS has_content, (video_url IS NOT NULL AND video_url <> "") AS has_video FROM units WHERE module_id = ?');
$stmt->execute([$module]);
$rows = $stmt->fetchAll();
json_response(['units' => $rows]);


