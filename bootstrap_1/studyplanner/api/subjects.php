<?php
// =============================================
//   api/subjects.php
//   Location: studyplanner/api/subjects.php
// =============================================

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*'));
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$dbFile = __DIR__ . '/../db.php';
if (!file_exists($dbFile)) {
    echo json_encode(['error' => 'db.php not found']);
    exit;
}
require_once $dbFile;

$method = $_SERVER['REQUEST_METHOD'];
$userId = isset($_SESSION['sp_user_id']) ? (int)$_SESSION['sp_user_id'] : 0;

if (!$userId) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

// =============================================
//   GET — list subjects for current user
// =============================================
if ($method === 'GET') {
    $stmt = $pdo->prepare('SELECT * FROM subjects WHERE user_id = ? ORDER BY name ASC');
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll());

// =============================================
//   POST — add subject
// =============================================
} elseif ($method === 'POST') {
    $body  = json_decode(file_get_contents('php://input'), true);
    $name  = trim($body['name']  ?? '');
    $color = trim($body['color'] ?? '#4f7cac');

    if (!$name) {
        echo json_encode(['success' => false, 'error' => 'Name is required']);
        exit;
    }

    // Check for duplicate subject name for this user
    $check = $pdo->prepare('SELECT id FROM subjects WHERE user_id = ? AND LOWER(name) = LOWER(?)');
    $check->execute([$userId, $name]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'error' => 'You already have a subject with that name']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO subjects (user_id, name, color) VALUES (?, ?, ?)');
    $stmt->execute([$userId, $name, $color]);
    $newId = (int) $pdo->lastInsertId();

    $row = $pdo->prepare('SELECT * FROM subjects WHERE id = ?');
    $row->execute([$newId]);
    echo json_encode(['success' => true, 'subject' => $row->fetch()]);

// =============================================
//   PATCH — update subject
// =============================================
} elseif ($method === 'PATCH') {
    $body  = json_decode(file_get_contents('php://input'), true);
    $id    = intval($body['id']    ?? 0);
    $name  = trim($body['name']   ?? '');
    $color = trim($body['color']  ?? '#4f7cac');

    if (!$id || !$name) {
        echo json_encode(['success' => false, 'error' => 'ID and name required']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE subjects SET name = ?, color = ? WHERE id = ? AND user_id = ?');
    $stmt->execute([$name, $color, $id, $userId]);
    echo json_encode(['success' => true]);

// =============================================
//   DELETE — remove subject
// =============================================
} elseif ($method === 'DELETE') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? 0);

    if (!$id) {
        echo json_encode(['success' => false, 'error' => 'ID required']);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $userId]);
    echo json_encode(['success' => true]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
