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

if ($action === 'export') {
  // Віддаємо CSV файлом, а не JSON: браузер одразу пропонує зберегти.
  $rows = leads_list([
    'status' => $_GET['status'] ?? '',
    'search' => $_GET['search'] ?? '',
    'date_from' => $_GET['date_from'] ?? '',
    'limit' => 10000,
  ]);

  $statusLabels = [
    'new' => 'Нові',
    'in_progress' => 'В роботі',
    'booked' => 'Записані',
    'done' => 'Прийшли',
    'rejected' => 'Відмова',
  ];

  // Робочий набір полів. Технічні (client_id, event_id, ip, user_agent)
  // у вивантаженні лише заважають — вони потрібні для звʼязки, не людині.
  $columns = [
    'created_at' => 'Дата',
    'name' => 'Імʼя',
    'phone' => 'Телефон',
    'message' => 'Повідомлення',
    'status' => 'Статус',
    'comment' => 'Коментар',
    'form_name' => 'Форма',
    'page' => 'Сторінка',
    'utm_source' => 'Джерело',
    'utm_medium' => 'Канал',
    'utm_campaign' => 'Кампанія',
    'cmp_id' => 'ID кампанії',
    'src_pl' => 'Платформа',
    'gclid' => 'gclid',
    'fbclid' => 'fbclid',
  ];

  $filename = 'leads-' . date('Y-m-d') . '.csv';

  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="' . $filename . '"');
  header('Cache-Control: no-store');

  $out = fopen('php://output', 'w');

  // BOM: без нього Excel на Windows читає файл як ANSI
  // і кирилиця перетворюється на кракозябри.
  fwrite($out, "\xEF\xBB\xBF");

  // Крапка з комою: Excel з українською локаллю розбиває саме по ній,
  // інакше весь рядок потрапляє в одну клітинку.
  fputcsv($out, array_values($columns), ';');

  foreach ($rows as $row) {
    $line = [];

    foreach ($columns as $key => $label) {
      $value = $row[$key] ?? '';

      if ($key === 'status') $value = $statusLabels[$value] ?? $value;

      // Значення, що починається з = + - @, Excel виконує як формулу.
      // Апостроф спереду знешкоджує це (CSV injection).
      //
      // Телефон виключаємо: він нормалізований до «+ і цифри», формули
      // там бути не може, а апостроф було б видно в клітинці.
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
