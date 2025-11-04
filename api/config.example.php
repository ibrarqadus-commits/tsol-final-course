<?php
// COPY THIS FILE TO config.php AND FILL IN YOUR HOSTINGER DATABASE CREDENTIALS
// DO NOT upload this example file - only upload config.php with real credentials

// Basic database configuration for Hostinger MySQL
// Get these values from Hostinger hPanel → Databases → MySQL Databases

const DB_HOST = 'localhost';  // Usually 'localhost' on Hostinger
const DB_NAME = 'u123456789_courseinfinity';  // Your actual database name from Hostinger
const DB_USER = 'u123456789_admin';  // Your actual database username from Hostinger
const DB_PASS = 'YourSecurePassword123!';  // Your actual database password from Hostinger

// Example of what Hostinger database names look like:
// Database name: u123456789_courseinfinity
// Username: u123456789_admin (usually same as DB_NAME but can be different)
// Password: (the one you set when creating the database)

function db() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $dsn = 'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4';
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (Throwable $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'DB_CONNECTION_FAILED', 'message' => $e->getMessage()]);
        exit;
    }
    return $pdo;
}

function json_response($data, int $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function start_session() {
    if (session_status() === PHP_SESSION_NONE) {
        // Configure session for Hostinger compatibility
        ini_set('session.cookie_httponly', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.cookie_samesite', 'Lax');
        
        // Set secure cookie if HTTPS
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            ini_set('session.cookie_secure', '1');
        }
        
        session_start();
    }
}

function require_admin() {
    start_session();
    if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] ?? '') !== 'admin') {
        json_response(['error' => 'UNAUTHORIZED'], 401);
    }
}

