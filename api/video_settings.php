<?php
require __DIR__.'/config.php';

$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $row = $pdo->query('SELECT hero_video, video2, home_content FROM video_settings WHERE id = 1')->fetch();
    if (!$row) {
        $row = ['hero_video' => '', 'video2' => '', 'home_content' => ''];
    }
    json_response($row);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_admin();
    $hero = isset($_POST['heroVideo']) ? (string)$_POST['heroVideo'] : null;
    $v2 = isset($_POST['video2']) ? (string)$_POST['video2'] : null;
    $home = isset($_POST['homeUnitContent']) ? (string)$_POST['homeUnitContent'] : null;
    $stmt = $pdo->prepare('REPLACE INTO video_settings (id, hero_video, video2, home_content) VALUES (1, ?, ?, ?)');
    $stmt->execute([$hero, $v2, $home]);
    json_response(['ok' => true]);
}

json_response(['error' => 'METHOD_NOT_ALLOWED'], 405);


