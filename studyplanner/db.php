<?php
// =============================================
//   db.php — Database connection for MAMP
//   Location: studyplanner/db.php  (root folder)
// =============================================

// MAMP on Mac uses a Unix socket — much more reliable than TCP port
// This tries the socket first, then falls back to TCP port 8889

$dbName = 'studyplanner';
$dbUser = 'root';
$dbPass = 'root';  // MAMP default. If it fails, try: $dbPass = '';

// MAMP Mac socket path (most reliable)
$socket = '/Applications/MAMP/tmp/mysql/mysql.sock';

try {
    if (file_exists($socket)) {
        // Use Unix socket (Mac MAMP — most reliable, no port issues)
        $dsn = "mysql:unix_socket={$socket};dbname={$dbName};charset=utf8mb4";
    } else {
        // Fallback: TCP connection with port 8889 (Mac) or 3306 (Windows)
        $port = 8889; // Change to 3306 if on Windows MAMP
        $dsn  = "mysql:host=127.0.0.1;port={$port};dbname={$dbName};charset=utf8mb4";
    }

    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error'   => 'Database connection failed',
        'details' => $e->getMessage(),
        'tip'     => 'Check MAMP is running and db.php has the right password'
    ]);
    exit;
}