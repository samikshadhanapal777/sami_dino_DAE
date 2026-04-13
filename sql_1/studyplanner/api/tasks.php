<?php
// =============================================
//   api/tasks.php
//   Location: studyplanner/api/tasks.php
// =============================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// __DIR__ is the folder THIS file is in (studyplanner/api/)
// So '../db.php' = studyplanner/db.php  — but we use __DIR__ to be 100% safe
$dbFile = __DIR__ . '/../db.php';

if (!file_exists($dbFile)) {
    echo json_encode([
        'error' => 'db.php not found at: ' . $dbFile,
        'tip'   => 'Make sure db.php is in the studyplanner/ root folder, not inside api/'
    ]);
    exit;
}

require_once $dbFile;

$method = $_SERVER['REQUEST_METHOD'];
$type   = $_GET['type'] ?? '';

// =============================================
//   GET
// =============================================
if ($method === 'GET') {

    if ($type === 'tasks') {
        $stmt = $pdo->query('SELECT * FROM tasks ORDER BY due_date ASC, id DESC');
        echo json_encode($stmt->fetchAll());

    } elseif ($type === 'schedule') {
        $today = date('Y-m-d');
        $stmt  = $pdo->prepare('SELECT * FROM schedule WHERE session_date = ? ORDER BY time ASC');
        $stmt->execute([$today]);
        echo json_encode($stmt->fetchAll());

    } elseif ($type === 'next_exam') {
        $today = date('Y-m-d');
        $stmt  = $pdo->prepare("SELECT * FROM tasks WHERE type='exam' AND due_date >= ? ORDER BY due_date ASC LIMIT 1");
        $stmt->execute([$today]);
        $row = $stmt->fetch();
        echo json_encode($row ?: ['title' => null, 'date' => null]);

    } else {
        echo json_encode(['error' => 'Unknown type parameter']);
    }

// =============================================
//   POST — add task or exam
// =============================================
} elseif ($method === 'POST') {
    $raw   = file_get_contents('php://input');
    $body  = json_decode($raw, true);
    $title = trim($body['title'] ?? '');
    $date  = ($body['date'] !== '' && $body['date'] !== null) ? $body['date'] : null;
    $type  = $body['type'] ?? 'task';

    if (!$title) {
        echo json_encode(['success' => false, 'error' => 'Title is required']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO tasks (title, due_date, type, done) VALUES (?, ?, ?, 0)');
    $stmt->execute([$title, $date, $type]);
    $newId = (int) $pdo->lastInsertId();

    // Return the full new row so JS can display it immediately
    $newRow = $pdo->prepare('SELECT * FROM tasks WHERE id = ?');
    $newRow->execute([$newId]);

    echo json_encode(['success' => true, 'id' => $newId, 'task' => $newRow->fetch()]);

// =============================================
//   PATCH — toggle done/undone
// =============================================
} elseif ($method === 'PATCH') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id']   ?? 0);
    $done = intval($body['done'] ?? 0);

    if (!$id) { echo json_encode(['success' => false, 'error' => 'ID required']); exit; }

    $stmt = $pdo->prepare('UPDATE tasks SET done = ? WHERE id = ?');
    $stmt->execute([$done, $id]);
    echo json_encode(['success' => true]);

// =============================================
//   DELETE — remove task
// =============================================
} elseif ($method === 'DELETE') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? 0);

    if (!$id) { echo json_encode(['success' => false, 'error' => 'ID required']); exit; }

    $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}