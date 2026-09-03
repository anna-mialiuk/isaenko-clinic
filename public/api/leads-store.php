<?php
/**
 * Сховище лідів. Окрема таблиця в тій самій базі, що й атрибуція —
 * так лід можна зіставити з кліком за cid і подивитись, з якої реклами прийшов.
 */

require_once __DIR__ . '/attr-store.php';

function leads_db() {
  $pdo = attr_db();

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      name TEXT,
      phone TEXT,
      message TEXT,
      form_name TEXT,
      page TEXT,
      language TEXT,

      -- звʼязка з атрибуцією
      cid TEXT,
      event_id TEXT,
      client_id TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      cmp_id TEXT,
      src_pl TEXT,
      gclid TEXT,
      fbclid TEXT,

      -- робота менеджера
      status TEXT NOT NULL DEFAULT 'new',
      comment TEXT,
      updated_at TEXT,

      -- технічне
      sent_to_telegram INTEGER DEFAULT 0,
      ip TEXT,
      user_agent TEXT
    )
  ");

  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC)');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_leads_cid ON leads(cid)');
  $pdo->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_event ON leads(event_id) WHERE event_id IS NOT NULL');

  return $pdo;
}

/**
 * Нормалізація телефону до формату +380XXXXXXXXX.
 * У формах немає маски, тому люди пишуть по-різному: 0968842404,
 * 380971922147, +38 (067) 111-22-33. Посилання tel: з такими
 * значеннями спрацьовує не завжди, тому зводимо до одного вигляду.
 */
function leads_normalize_phone($raw) {
  $digits = preg_replace('/\D+/', '', (string) $raw);

  if ($digits === '') return trim((string) $raw);

  // 0XXXXXXXXX → 380XXXXXXXXX
  if (strlen($digits) === 10 && $digits[0] === '0') {
    $digits = '38' . $digits;
  }

  if (strlen($digits) === 12 && strpos($digits, '380') === 0) {
    return '+' . $digits;
  }

  // Міжнародні номери інших країн: додаємо плюс, якщо схоже на повний.
  if (strlen($digits) >= 11 && strlen($digits) <= 15) {
    return '+' . $digits;
  }

  // Надто коротке чи надто довге — лишаємо як ввели, щоб не втратити дані.
  return trim((string) $raw);
}

/** Статуси для канбану. Порядок = порядок колонок. */
function leads_statuses() {
  return ['new', 'in_progress', 'booked', 'done', 'rejected'];
}

/**
 * Запис ліда. Мітки підтягуються з таблиці атрибуції за cid —
 * форма їх не передає, але клік цього ж відвідувача там уже є.
 */
function leads_save($data) {
  $pdo = leads_db();

  $attribution = [];

  if (!empty($data['cid'])) {
    $row = attr_find_by_cid($data['cid']);
    if ($row) $attribution = $row;
  }

  $fields = [
    'name' => $data['name'] ?? '',
    'phone' => leads_normalize_phone($data['phone'] ?? ''),
    'message' => $data['message'] ?? '',
    'form_name' => $data['form_name'] ?? '',
    'page' => $data['page'] ?? '',
    'language' => $data['language'] ?? '',
    'cid' => $data['cid'] ?? '',
    'event_id' => $data['event_id'] ?? null,
    'client_id' => $attribution['client_id'] ?? '',
    'utm_source' => $attribution['utm_source'] ?? '',
    'utm_medium' => $attribution['utm_medium'] ?? '',
    'utm_campaign' => $attribution['utm_campaign'] ?? '',
    'cmp_id' => $attribution['cmp_id'] ?? '',
    'src_pl' => $attribution['src_pl'] ?? '',
    'gclid' => $attribution['gclid'] ?? '',
    'fbclid' => $attribution['fbclid'] ?? '',
    'sent_to_telegram' => !empty($data['sent_to_telegram']) ? 1 : 0,
    'ip' => $data['ip'] ?? '',
    'user_agent' => mb_substr($data['user_agent'] ?? '', 0, 500),
  ];

  $columns = implode(', ', array_keys($fields));
  $placeholders = implode(', ', array_fill(0, count($fields), '?'));

  try {
    $stmt = $pdo->prepare("INSERT INTO leads ($columns) VALUES ($placeholders)");
    $stmt->execute(array_values($fields));
    return (int) $pdo->lastInsertId();
  } catch (PDOException $e) {
    // Повторна відправка тієї самої форми — не дубль, а той самий лід.
    if (strpos($e->getMessage(), 'UNIQUE') !== false) return 0;
    error_log('[leads] ' . $e->getMessage());
    return 0;
  }
}

/** Список із фільтрами і пагінацією. */
function leads_list($filters = []) {
  $pdo = leads_db();

  $where = [];
  $params = [];

  if (!empty($filters['status'])) {
    $where[] = 'status = ?';
    $params[] = $filters['status'];
  }

  if (!empty($filters['search'])) {
    $where[] = '(name LIKE ? OR phone LIKE ?)';
    $params[] = '%' . $filters['search'] . '%';
    $params[] = '%' . $filters['search'] . '%';
  }

  if (!empty($filters['date_from'])) {
    $where[] = 'created_at >= ?';
    $params[] = $filters['date_from'];
  }

  $sql = 'SELECT * FROM leads';
  if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
  $sql .= ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  $params[] = (int) ($filters['limit'] ?? 100);
  $params[] = (int) ($filters['offset'] ?? 0);

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/** Зміна статусу або коментаря. */
function leads_update($id, $data) {
  $pdo = leads_db();
  $allowed = ['status', 'comment'];
  $set = [];
  $params = [];

  foreach ($allowed as $field) {
    if (!array_key_exists($field, $data)) continue;

    if ($field === 'status' && !in_array($data['status'], leads_statuses(), true)) {
      continue;
    }

    $set[] = "$field = ?";
    $params[] = $data[$field];
  }

  if (!$set) return false;

  $set[] = "updated_at = datetime('now')";
  $params[] = (int) $id;

  $stmt = $pdo->prepare('UPDATE leads SET ' . implode(', ', $set) . ' WHERE id = ?');
  $stmt->execute($params);

  return $stmt->rowCount() > 0;
}

/** Зведення для дашборду. */
function leads_stats($days = 30) {
  $pdo = leads_db();

  $byStatus = $pdo->query("
    SELECT status, COUNT(*) AS count FROM leads GROUP BY status
  ")->fetchAll(PDO::FETCH_KEY_PAIR);

  $stmt = $pdo->prepare("
    SELECT date(created_at) AS day, COUNT(*) AS count
    FROM leads WHERE created_at > datetime('now', ?)
    GROUP BY day ORDER BY day
  ");
  $stmt->execute(['-' . (int) $days . ' day']);
  $byDay = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $stmt = $pdo->prepare("
    SELECT
      CASE WHEN utm_source = '' OR utm_source IS NULL THEN 'direct' ELSE utm_source END AS source,
      COUNT(*) AS count
    FROM leads WHERE created_at > datetime('now', ?)
    GROUP BY source ORDER BY count DESC
  ");
  $stmt->execute(['-' . (int) $days . ' day']);
  $bySource = $stmt->fetchAll(PDO::FETCH_ASSOC);

  return [
    'by_status' => $byStatus,
    'by_day' => $byDay,
    'by_source' => $bySource,
    'total' => (int) $pdo->query('SELECT COUNT(*) FROM leads')->fetchColumn(),
  ];
}
