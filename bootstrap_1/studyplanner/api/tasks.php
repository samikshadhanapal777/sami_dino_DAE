<?php
// =============================================
//   api/tasks.php
//   Location: studyplanner/api/tasks.php
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
$type   = $_GET['type'] ?? '';

// Read logged-in user from session
$userId = isset($_SESSION['sp_user_id']) ? (int)$_SESSION['sp_user_id'] : 0;

// =============================================
//   GET
// =============================================
if ($method === 'GET') {

    if ($type === 'tasks') {
        if ($userId) {
            $stmt = $pdo->prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC, id DESC');
            $stmt->execute([$userId]);
        } else {
            // Not logged in — return empty
            echo json_encode([]);
            exit;
        }
        echo json_encode($stmt->fetchAll());

    } elseif ($type === 'schedule') {
        $today = date('Y-m-d');
        $stmt  = $pdo->prepare('SELECT * FROM schedule WHERE session_date = ? ORDER BY time ASC');
        $stmt->execute([$today]);
        echo json_encode($stmt->fetchAll());

    } elseif ($type === 'next_exam') {
        $today = date('Y-m-d');
        if ($userId) {
            $stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = ? AND type='exam' AND due_date >= ? ORDER BY due_date ASC LIMIT 1");
            $stmt->execute([$userId, $today]);
        } else {
            echo json_encode(['title' => null, 'date' => null]);
            exit;
        }
        $row = $stmt->fetch();
        echo json_encode($row ?: ['title' => null, 'date' => null]);

    } else {
        echo json_encode(['error' => 'Unknown type parameter']);
    }

// =============================================
//   POST — add task or exam
// =============================================
} elseif ($method === 'POST') {
    if (!$userId) {
        echo json_encode(['success' => false, 'error' => 'Not logged in']);
        exit;
    }

    $raw   = file_get_contents('php://input');
    $body  = json_decode($raw, true);
    $title = trim($body['title'] ?? '');
    $date  = (isset($body['date']) && $body['date'] !== '' && $body['date'] !== null) ? $body['date'] : null;
    $type  = $body['type'] ?? 'task';

    if (!$title) {
        echo json_encode(['success' => false, 'error' => 'Title is required']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO tasks (user_id, title, due_date, type, done) VALUES (?, ?, ?, ?, 0)');
    $stmt->execute([$userId, $title, $date, $type]);
    $newId = (int) $pdo->lastInsertId();

    $newRow = $pdo->prepare('SELECT * FROM tasks WHERE id = ?');
    $newRow->execute([$newId]);

    echo json_encode(['success' => true, 'id' => $newId, 'task' => $newRow->fetch()]);

// =============================================
//   PATCH — toggle done/undone
// =============================================
} elseif ($method === 'PATCH') {
    if (!$userId) {
        echo json_encode(['success' => false, 'error' => 'Not logged in']);
        exit;
    }

    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id']   ?? 0);
    $done = intval($body['done'] ?? 0);

    if (!$id) { echo json_encode(['success' => false, 'error' => 'ID required']); exit; }

    // Only update tasks belonging to this user
    $stmt = $pdo->prepare('UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?');
    $stmt->execute([$done, $id, $userId]);
    echo json_encode(['success' => true]);

// =============================================
//   DELETE — remove task
// =============================================
} elseif ($method === 'DELETE') {
    if (!$userId) {
        echo json_encode(['success' => false, 'error' => 'Not logged in']);
        exit;
    }

    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? 0);

    if (!$id) { echo json_encode(['success' => false, 'error' => 'ID required']); exit; }

    // Only delete tasks belonging to this user
    $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $userId]);
    echo json_encode(['success' => true]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
