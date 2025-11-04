<?php
require __DIR__.'/config.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'METHOD_NOT_ALLOWED'], 405);
}

$module = trim($_POST['module'] ?? '');
$unit = trim($_POST['unit'] ?? '');
$content = isset($_POST['content']) ? (string)$_POST['content'] : null;
$video = isset($_POST['video_url']) ? trim((string)$_POST['video_url']) : null;

if ($module === '' || $unit === '') {
    json_response(['error' => 'INVALID_INPUT'], 400);
}

$pdo = db();
$stmt = $pdo->prepare('INSERT INTO units (module_id, unit_id, content, video_url) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = COALESCE(VALUES(content), content), video_url = COALESCE(VALUES(video_url), video_url)');
$stmt->execute([$module, $unit, $content, $video]);
json_response(['ok' => true]);


