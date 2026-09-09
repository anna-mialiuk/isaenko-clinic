<?php
/**
 * API адмінпанелі. Один вхідний файл, дія передається в ?action=
 * (nginx маршрутизує /api/admin/* сюди).
 */

require_once __DIR__ . '/admin-auth.php';
require_once __DIR__ . '/leads-store.php';
require_once __DIR__ . '/users-store.php';

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

  if (!admin_login($body['user'] ?? '', $body['password'] ?? '', !empty($body['remember']))) {
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
  admin_json([
    'authorised' => admin_is_authorised(),
    'user' => admin_current_login(),
    'name' => $_SESSION['admin']['name'] ?? '',
    // Аварійний вхід показуємо в панелі: підказка, що варто
    // створити нормальний обліковий запис.
    'fallback' => (bool) ($_SESSION['admin']['fallback'] ?? false),
  ]);
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
      'statuses' => statuses_list(),
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

if ($action === 'export') {
  $rows = leads_list([
    'status' => $_GET['status'] ?? '',
    'search' => $_GET['search'] ?? '',
    'date_from' => $_GET['date_from'] ?? '',
    'limit' => 10000,
  ]);

  $statusLabels = array_column(statuses_list(true), 'label', 'id');

  $columns = [
    'created_at' => 'Дата',
    'name' => 'Імʼя',
    'phone' => 'Телефон',
    'email' => 'Пошта',
    'message' => 'Повідомлення',
    'status' => 'Статус',
    'comment' => 'Коментар',
    'form_name' => 'Форма',
    'page' => 'Сторінка',
    'utm_source' => 'Байер',
    'utm_medium' => 'Канал',
    'src_pl' => 'Платформа',
    'cmp_name' => 'Кампанія',
    'grp_name' => 'Група оголошень',
    'ad_name' => 'Оголошення',
    'kw' => 'Ключ',
    'plc' => 'Місце показу',
    'gclid' => 'gclid',
    'fbclid' => 'fbclid',
  ];

  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="leads-' . date('Y-m-d') . '.csv"');
  header('Cache-Control: no-store');

  $out = fopen('php://output', 'w');

  fwrite($out, "\xEF\xBB\xBF");

  fputcsv($out, array_values($columns), ';');

  foreach ($rows as $row) {
    $line = [];

    foreach ($columns as $key => $label) {
      $value = $row[$key] ?? '';

      if ($key === 'status') $value = $statusLabels[$value] ?? $value;

      if ($key !== 'phone' && $value !== '' && strpbrk((string) $value[0], '=+-@') !== false) {
        $value = "'" . $value;
      }

      $line[] = $value;
    }

    fputcsv($out, $line, ';');
  }

  fclose($out);
  exit;
}

if ($action === 'users') {
  if ($method === 'GET') {
    admin_json(['items' => users_list(), 'current' => admin_current_login()]);
  }

  $body = admin_body();

  if ($method === 'POST') {
    $result = users_create($body);

    admin_json($result, isset($result['error']) ? 400 : 200);
  }

  if ($method === 'PATCH') {
    $id = (int) ($body['id'] ?? 0);

    if (!$id) admin_json(['error' => 'id required'], 400);

    $result = users_update($id, $body, admin_current_login());

    admin_json($result, isset($result['error']) ? 400 : 200);
  }

  if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);

    if (!$id) admin_json(['error' => 'id required'], 400);

    $result = users_delete($id, admin_current_login());

    admin_json($result, isset($result['error']) ? 400 : 200);
  }

  admin_json(['error' => 'method not allowed'], 405);
}

if ($action === 'statuses') {
  if ($method === 'GET') {
    admin_json(['items' => statuses_list(true)]);
  }

  if ($method === 'POST' || $method === 'PATCH') {
    $body = admin_body();

    if (empty($body['items']) || !is_array($body['items'])) {
      admin_json(['error' => 'items required'], 400);
    }

    admin_json(['ok' => statuses_save($body['items'])]);
  }

  admin_json(['error' => 'method not allowed'], 405);
}

if ($action === 'lead') {
  $id = (int) ($_GET['id'] ?? 0);

  if (!$id) admin_json(['error' => 'id required'], 400);

  $lead = leads_find($id);

  if (!$lead) admin_json(['error' => 'not found'], 404);

  admin_json($lead);
}

if ($action === 'events') {
  $days = min(max((int) ($_GET['days'] ?? 30), 1), 365);
  $since = '-' . $days . ' day';
  $sinceTwice = '-' . ($days * 2) . ' day';

  $pdo = attr_db();

  // Підсумок по кожній події за період і за попередній такий самий.
  $stmt = $pdo->prepare("
    SELECT COALESCE(event_name, '') AS event_name,
           SUM(CASE WHEN created_at > datetime('now', :since) THEN 1 ELSE 0 END) AS count,
           SUM(CASE WHEN created_at <= datetime('now', :since) THEN 1 ELSE 0 END) AS previous
    FROM attribution_clicks
    WHERE created_at > datetime('now', :twice)
    GROUP BY event_name ORDER BY count DESC
  ");
  $stmt->execute([':since' => $since, ':twice' => $sinceTwice]);
  $events = array_map(static fn ($row) => [
    'event_name' => (string) $row['event_name'],
    'count' => (int) $row['count'],
    'previous' => (int) $row['previous'],
  ], $stmt->fetchAll(PDO::FETCH_ASSOC));

  $stmt = $pdo->prepare("
    SELECT COALESCE(event_name, '') AS event_name, date(created_at) AS day, COUNT(*) AS count
    FROM attribution_clicks
    WHERE created_at > datetime('now', ?)
    GROUP BY event_name, day ORDER BY day
  ");
  $stmt->execute([$since]);
  $byDay = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Джерело: utm_source, а без нього — платформа з src_pl або «direct».
  $stmt = $pdo->prepare("
    SELECT COALESCE(event_name, '') AS event_name,
           COALESCE(NULLIF(utm_source, ''), NULLIF(src_pl, ''), 'direct') AS source,
           COALESCE(NULLIF(cmp_name, ''), NULLIF(utm_campaign, ''), '') AS campaign,
           COUNT(*) AS count
    FROM attribution_clicks
    WHERE created_at > datetime('now', ?)
    GROUP BY event_name, source, campaign ORDER BY count DESC
  ");
  $stmt->execute([$since]);
  $bySource = $stmt->fetchAll(PDO::FETCH_ASSOC);

  admin_json([
    'events' => $events,
    'by_day' => $byDay,
    'by_source' => $bySource,
    'days' => $days,
  ]);
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

  // Попередній період такої ж довжини — для дельт у картках.
  $stmt = $pdo->prepare("
    SELECT COUNT(*) AS clicks, COUNT(DISTINCT cid) AS visitors
    FROM attribution_clicks
    WHERE created_at > datetime('now', ?) AND created_at <= datetime('now', ?)
  ");
  $stmt->execute(['-' . ($days * 2) . ' day', '-' . $days . ' day']);
  $previous = $stmt->fetch(PDO::FETCH_ASSOC) ?: ['clicks' => 0, 'visitors' => 0];

  $leads = leads_stats($days);

  admin_json([
    'leads' => $leads,
    'events' => $events,
    'by_day' => $byDay,
    'pages' => $pages,
    'days' => $days,
    'previous' => [
      'clicks' => (int) $previous['clicks'],
      'visitors' => (int) $previous['visitors'],
      'leads' => (int) ($leads['previous'] ?? 0),
    ],
  ]);
}

admin_json(['error' => 'unknown action'], 404);
