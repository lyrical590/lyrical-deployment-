 <?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$config = json_decode(file_get_contents('../data/config.json'), true);
$data_dir = '../data/';

// Function to generate unique ID
function generateId($length = 8) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)))),1,$length);
}

// Function to validate session
function validateSession() {
    if (!isset($_COOKIE['session_token'])) {
        return false;
    }
    
    $sessions = json_decode(file_get_contents('../data/sessions.json'), true) ?? [];
    $sessionToken = $_COOKIE['session_token'];
    
    foreach ($sessions as $session) {
        if ($session['token'] === $sessionToken && $session['expires'] > time()) {
            return $session['user_id'];
        }
    }
    
    return false;
}

// API Routes
$route = $_GET['action'] ?? '';

switch ($route) {
    case 'deploy':
        handleDeploy();
        break;
    case 'status':
        handleStatus();
        break;
    case 'login':
        handleLogin();
        break;
    case 'register':
        handleRegister();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'get_bots':
        handleGetBots();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function handleDeploy() {
    $userId = validateSession();
    if (!$userId) {
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['bot_name']) || !isset($data['bot_type'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid data']);
        return;
    }
    
    $botId = generateId();
    $botData = [
        'id' => $botId,
        'user_id' => $userId,
        'name' => $data['bot_name'],
        'type' => $data['bot_type'],
        'status' => 'pending',
        'created_at' => time(),
        'updated_at' => time(),
        'config' => $data['config'] ?? [],
        'token' => $data['token'] ?? null,
        'memory_limit' => '512MB',
        'uptime' => 0
    ];
    
    // Save bot data
    $bots = json_decode(file_get_contents('../data/deployments.json'), true) ?? [];
    $bots[] = $botData;
    file_put_contents('../data/deployments.json', json_encode($bots, JSON_PRETTY_PRINT));
    
    // Create bot directory
    $botDir = "../bots/$botId";
    if (!file_exists($botDir)) {
        mkdir($botDir, 0777, true);
    }
    
    // Save bot files if provided
    if (isset($data['files']) && is_array($data['files'])) {
        foreach ($data['files'] as $filename => $content) {
            file_put_contents("$botDir/$filename", base64_decode($content));
        }
    }
    
    // Simulate deployment process
    $logEntry = [
        'bot_id' => $botId,
        'action' => 'deploy',
        'status' => 'success',
        'message' => 'Bot deployment initiated',
        'timestamp' => time()
    ];
    
    $logs = json_decode(file_get_contents('../data/logs.json'), true) ?? [];
    $logs[] = $logEntry;
    file_put_contents('../data/logs.json', json_encode($logs, JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'Bot deployment started',
        'bot_id' => $botId,
        'status' => 'pending'
    ]);
}

function handleStatus() {
    $botId = $_GET['bot_id'] ?? '';
    
    if (!$botId) {
        echo json_encode(['success' => false, 'error' => 'Bot ID required']);
        return;
    }
    
    $bots = json_decode(file_get_contents('../data/deployments.json'), true) ?? [];
    
    foreach ($bots as $bot) {
        if ($bot['id'] === $botId) {
            echo json_encode([
                'success' => true,
                'bot' => $bot
            ]);
            return;
        }
    }
    
    echo json_encode(['success' => false, 'error' => 'Bot not found']);
}

function handleLogin() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password'])) {
        echo json_encode(['success' => false, 'error' => 'Email and password required']);
        return;
    }
    
    $users = json_decode(file_get_contents('../data/users.json'), true) ?? [];
    
    foreach ($users as $user) {
        if ($user['email'] === $data['email'] && password_verify($data['password'], $user['password'])) {
            // Create session
            $sessionToken = bin2hex(random_bytes(32));
            $sessionData = [
                'user_id' => $user['id'],
                'token' => $sessionToken,
                'expires' => time() + (7 * 24 * 60 * 60) // 7 days
            ];
            
            $sessions = json_decode(file_get_contents('../data/sessions.json'), true) ?? [];
            $sessions[] = $sessionData;
            file_put_contents('../data/sessions.json', json_encode($sessions, JSON_PRETTY_PRINT));
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email']
                ],
                'session_token' => $sessionToken
            ]);
            return;
        }
    }
    
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
}

function handleRegister() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
        echo json_encode(['success' => false, 'error' => 'All fields required']);
        return;
    }
    
    $users = json_decode(file_get_contents('../data/users.json'), true) ?? [];
    
    // Check if user exists
    foreach ($users as $user) {
        if ($user['email'] === $data['email']) {
            echo json_encode(['success' => false, 'error' => 'Email already registered']);
            return;
        }
        if ($user['username'] === $data['username']) {
            echo json_encode(['success' => false, 'error' => 'Username already taken']);
            return;
        }
    }
    
    // Create new user
    $userId = generateId();
    $newUser = [
        'id' => $userId,
        'username' => $data['username'],
        'email' => $data['email'],
        'password' => password_hash($data['password'], PASSWORD_DEFAULT),
        'created_at' => time(),
        'plan' => 'free',
        'max_bots' => 5
    ];
    
    $users[] = $newUser;
    file_put_contents('../data/users.json', json_encode($users, JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'user' => [
            'id' => $userId,
            'username' => $data['username'],
            'email' => $data['email']
        ]
    ]);
}

function handleLogout() {
    $sessionToken = $_COOKIE['session_token'] ?? '';
    
    if ($sessionToken) {
        $sessions = json_decode(file_get_contents('../data/sessions.json'), true) ?? [];
        $sessions = array_filter($sessions, function($session) use ($sessionToken) {
            return $session['token'] !== $sessionToken;
        });
        
        file_put_contents('../data/sessions.json', json_encode(array_values($sessions), JSON_PRETTY_PRINT));
    }
    
    echo json_encode(['success' => true, 'message' => 'Logged out']);
}

function handleGetBots() {
    $userId = validateSession();
    if (!$userId) {
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        return;
    }
    
    $bots = json_decode(file_get_contents('../data/deployments.json'), true) ?? [];
    $userBots = array_filter($bots, function($bot) use ($userId) {
        return $bot['user_id'] === $userId;
    });
    
    echo json_encode([
        'success' => true,
        'bots' => array_values($userBots)
    ]);
}
?>
