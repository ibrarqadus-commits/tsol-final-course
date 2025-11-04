<?php
require __DIR__.'/config.php';

$module = trim($_GET['module'] ?? '');
$unit = trim($_GET['unit'] ?? '');
if ($module === '' || $unit === '') {
    json_response(['error' => 'INVALID_INPUT'], 400);
}

$pdo = db();
$stmt = $pdo->prepare('SELECT module_id, unit_id, content, video_url FROM units WHERE module_id = ? AND unit_id = ?');
$stmt->execute([$module, $unit]);
$row = $stmt->fetch();
if (!$row) {
    json_response(['module' => $module, 'unit' => $unit, 'content' => '', 'video_url' => '']);
}
json_response($row);


