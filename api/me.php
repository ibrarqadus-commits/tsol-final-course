<?php
require __DIR__.'/config.php';
start_session();
if (!isset($_SESSION['user'])) {
    json_response(['authenticated' => false], 200);
}
json_response(['authenticated' => true, 'user' => $_SESSION['user']]);


