<?php
// =============================================
//   auth.php — Authentication handler
//   Location: studyplanner/auth.php
//   Handles: signup, signin, signout, check
// =============================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// Start session
session_start();

$action = $_GET['action'] ?? '';

// =============================================
//   GET: check — is someone logged in?
// =============================================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'check') {
    if (isset($_SESSION['sp_user_id'])) {
        echo json_encode([
            'loggedIn'   => true,
            'name'       => $_SESSION['sp_name'],
            'isFirstLogin' => $_SESSION['sp_first_login'] ?? false,
        ]);
        // Clear the first-login flag after reading it once
        if ($_SESSION['sp_first_login'] ?? false) {
            $_SESSION['sp_first_login'] = false;
        }
    } else {
        echo json_encode(['loggedIn' => false]);
    }
    exit;
}

// =============================================
//   POST: signin / signup / signout
// =============================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);

    // ---- SIGN OUT ----
    if ($action === 'signout') {
        // Fully nuke the session
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $p['path'], $p['domain'], $p['secure'], $p['httponly']
            );
        }
        session_destroy();
        echo json_encode(['success' => true]);
        exit;
    }

    // ---- Require db.php for signin / signup ----
    $dbFile = __DIR__ . '/db.php';
    if (!file_exists($dbFile)) {
        echo json_encode(['success' => false, 'error' => 'db.php not found']);
        exit;
    }
    require_once $dbFile;

    // ---- SIGN IN ----
    if ($action === 'signin') {
        $name     = trim($body['name']     ?? '');
        $password = trim($body['password'] ?? '');

        if (!$name || !$password) {
            echo json_encode(['success' => false, 'error' => 'Name and password are required']);
            exit;
        }

        // Look up user by name (case-insensitive)
        $stmt = $pdo->prepare('SELECT * FROM users WHERE LOWER(name) = LOWER(?) LIMIT 1');
        $stmt->execute([$name]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            echo json_encode(['success' => false, 'error' => 'Incorrect name or password']);
            exit;
        }

        // Update last_login
        $upd = $pdo->prepare('UPDATE users SET last_login = NOW(), visit_count = visit_count + 1 WHERE id = ?');
        $upd->execute([$user['id']]);

        // Fetch updated visit count
        $stmt2 = $pdo->prepare('SELECT visit_count FROM users WHERE id = ?');
        $stmt2->execute([$user['id']]);
        $updated = $stmt2->fetch();

        // Set session
        $_SESSION['sp_user_id']    = $user['id'];
        $_SESSION['sp_name']       = $user['name'];
        $_SESSION['sp_first_login'] = ($updated['visit_count'] <= 1);

        echo json_encode(['success' => true, 'name' => $user['name']]);
        exit;
    }

    // ---- SIGN UP ----
    if ($action === 'signup') {
        $name     = trim($body['name']     ?? '');
        $password = trim($body['password'] ?? '');

        if (!$name || !$password) {
            echo json_encode(['success' => false, 'error' => 'Name and password are required']);
            exit;
        }
        if (strlen($password) < 4) {
            echo json_encode(['success' => false, 'error' => 'Password must be at least 4 characters']);
            exit;
        }

        // Check if name already taken
        $check = $pdo->prepare('SELECT id FROM users WHERE LOWER(name) = LOWER(?) LIMIT 1');
        $check->execute([$name]);
        if ($check->fetch()) {
            echo json_encode(['success' => false, 'error' => 'That name is already taken — try a different one']);
            exit;
        }

        // Hash password + insert
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $ins  = $pdo->prepare('INSERT INTO users (name, password, visit_count, created_at) VALUES (?, ?, 1, NOW())');
        $ins->execute([$name, $hash]);
        $newId = (int) $pdo->lastInsertId();

        // Set session — first login = true
        $_SESSION['sp_user_id']    = $newId;
        $_SESSION['sp_name']       = $name;
        $_SESSION['sp_first_login'] = true;

        echo json_encode(['success' => true, 'name' => $name]);
        exit;
    }
}

// Fallback
http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
