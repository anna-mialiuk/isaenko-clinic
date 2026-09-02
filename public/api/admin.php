<?php
/**
 * API адмінпанелі. Один вхідний файл, дія передається в ?action=
 * (nginx маршрутизує /api/admin/* сюди).
 */

require_once __DIR__ . '/admin-auth.php';
require_once __DIR__ . '/leads-store.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

function admin_body() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function admin_json($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

// ── Публічні дії ──────────────────────────────────────────────

if ($action === 'login') {
  if ($method !== 'POST') admin_json(['error' => 'method not allowed'], 405);

  if (!admin_throttle_check()) {
    admin_json(['error' => 'too many attempts, try again in 15 minutes'], 429);
  }

  $body = admin_body();

  if (!admin_login($body['user'] ?? '', $body['password'] ?? '')) {
    admin_throttle_hit();
    // Не уточнюємо, логін чи пароль невірний — це підказка для перебору.
    admin_json(['error' => 'invalid credentials'], 401);
  }

  admin_throttle_reset();
  admin_json(['ok' => true]);
}

if ($action === 'logout') {
  admin_logout();
  admin_json(['ok' => true]);
}

if ($action === 'me') {
  admin_json(['authorised' => admin_is_authorised()]);
}

// ── Далі тільки для авторизованих ─────────────────────────────

admin_require_auth();

if ($action === 'leads') {
  if ($method === 'GET') {
    admin_json([
      'items' => leads_list([
        'status' => $_GET['status'] ?? '',
        'search' => $_GET['search'] ?? '',
        'date_from' => $_GET['date_from'] ?? '',
        'limit' => min((int) ($_GET['limit'] ?? 100), 500),
        'offset' => (int) ($_GET['offset'] ?? 0),
      ]),
      'statuses' => leads_statuses(),
    ]);
  }

  if ($method === 'PATCH' || $method === 'POST') {
    $body = admin_body();
    $id = (int) ($body['id'] ?? 0);

    if (!$id) admin_json(['error' => 'id required'], 400);

    admin_json(['ok' => leads_update($id, $body)]);
  }

  admin_json(['error' => 'method not allowed'], 405);
}

if ($action === 'stats') {
  $days = min(max((int) ($_GET['days'] ?? 30), 1), 365);

  $pdo = attr_db();

  // Аналітика з нашої власної бази кліків — без GA4 Data API.
  $stmt = $pdo->prepare("
    SELECT event_name, COUNT(*) AS count
    FROM attribution_clicks
    WHERE created_at > datetime('now', ?)
    GROUP BY event_name ORDER BY count DESC
  ");
  $stmt->execute(['-' . $days . ' day']);
  $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $stmt = $pdo->prepare("
    SELECT date(created_at) AS day,
           COUNT(*) AS clicks,
           COUNT(DISTINCT cid) AS visitors
    FROM attribution_clicks
    WHERE created_at > datetime('now', ?)
    GROUP BY day ORDER BY day
  ");
  $stmt->execute(['-' . $days . ' day']);
  $byDay = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $stmt = $pdo->prepare("
    SELECT page_location, COUNT(*) AS count
    FROM attribution_clicks
    WHERE created_at > datetime('now', ?) AND page_location != ''
    GROUP BY page_location ORDER BY count DESC LIMIT 20
  ");
  $stmt->execute(['-' . $days . ' day']);
  $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);

  admin_json([
    'leads' => leads_stats($days),
    'events' => $events,
    'by_day' => $byDay,
    'pages' => $pages,
    'days' => $days,
  ]);
}

admin_json(['error' => 'unknown action'], 404);
