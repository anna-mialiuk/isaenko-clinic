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
      email TEXT,
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
      utm_term TEXT,
      utm_content TEXT,
      cmp_id TEXT,
      cmp_name TEXT,
      grp_id TEXT,
      grp_name TEXT,
      ad_id TEXT,
      ad_name TEXT,
      kw TEXT,
      plc TEXT,
      src_pl TEXT,
      gclid TEXT,
      fbclid TEXT,
      landing_page TEXT,

      -- робота менеджера
      status TEXT NOT NULL DEFAULT 'new',
      comment TEXT,
      updated_at TEXT,

      -- технічне
      sent_to_telegram INTEGER DEFAULT 0,
      ip TEXT,
      user_agent TEXT,
      deleted_at TEXT
    )
  ");

  // CREATE TABLE IF NOT EXISTS не додає колонки до вже створеної таблиці,
  // тому для наявних баз доганяємо схему вручну.
  $columns = $pdo->query('PRAGMA table_info(leads)')->fetchAll(PDO::FETCH_COLUMN, 1);

  // Догоняємо схему для баз, створених раніше: CREATE TABLE IF NOT EXISTS
  // не додає колонок до вже існуючої таблиці.
  $expected = [
    'deleted_at', 'email', 'utm_term', 'utm_content', 'cmp_name',
    'grp_id', 'grp_name', 'ad_id', 'ad_name', 'kw', 'plc', 'landing_page',
  ];

  foreach ($expected as $column) {
    if (!in_array($column, $columns, true)) {
      $pdo->exec("ALTER TABLE leads ADD COLUMN $column TEXT");
    }
  }

  // Історія роботи з лідом: хто що змінив і коли.
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS lead_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      field TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT
    )
  ");

  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_history_lead ON lead_history(lead_id, created_at)');

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

  // XXXXXXXXX (без коду оператора) не чіпаємо — незрозуміло, що це.
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

/**
 * Статуси воронки. Зберігаються в базі, щоб їх можна було
 * перейменовувати, міняти місцями й фарбувати з панелі.
 * При першому зверненні створюється набір за замовчуванням.
 */
function statuses_db() {
  $pdo = attr_db();

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS lead_statuses (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#8a8aa3',
      position INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0
    )
  ");

  $count = (int) $pdo->query('SELECT COUNT(*) FROM lead_statuses')->fetchColumn();

  if ($count === 0) {
    $defaults = [
      ['new', 'Нові', '#4d48b4', 1],
      ['in_progress', 'В роботі', '#d99a2b', 2],
      ['booked', 'Записані', '#2b8ad9', 3],
      ['done', 'Прийшли', '#3d9970', 4],
      ['rejected', 'Відмова', '#d1435b', 5],
    ];

    $stmt = $pdo->prepare(
      'INSERT INTO lead_statuses (id, label, color, position) VALUES (?, ?, ?, ?)'
    );

    foreach ($defaults as $row) $stmt->execute($row);
  }

  return $pdo;
}

/** Повні дані статусів — для канбану й налаштувань. */
function statuses_list($withArchived = false) {
  $sql = 'SELECT * FROM lead_statuses';
  if (!$withArchived) $sql .= ' WHERE is_archived = 0';
  $sql .= ' ORDER BY position, id';

  return statuses_db()->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}

/** Тільки ідентифікатори — там, де потрібен простий список. */
function leads_statuses() {
  return array_column(statuses_list(), 'id');
}

/**
 * Збереження набору статусів цілком: додані, перейменовані, переставлені.
 * Видалені не стираємо, а архівуємо — інакше ліди з таким статусом
 * зникли б із канбану назавжди.
 */
function statuses_save($items) {
  $pdo = statuses_db();
  $pdo->beginTransaction();

  try {
    $keep = [];

    foreach (array_values($items) as $index => $item) {
      $id = trim((string) ($item['id'] ?? ''));
      $label = trim((string) ($item['label'] ?? ''));

      if ($id === '' || $label === '') continue;

      $keep[] = $id;

      $stmt = $pdo->prepare("
        INSERT INTO lead_statuses (id, label, color, position, is_archived)
        VALUES (?, ?, ?, ?, 0)
        ON CONFLICT(id) DO UPDATE SET
          label = excluded.label,
          color = excluded.color,
          position = excluded.position,
          is_archived = 0
      ");

      $stmt->execute([
        $id,
        mb_substr($label, 0, 40),
        preg_match('/^#[0-9a-fA-F]{6}$/', $item['color'] ?? '') ? $item['color'] : '#8a8aa3',
        $index + 1,
      ]);
    }

    if ($keep) {
      $marks = implode(',', array_fill(0, count($keep), '?'));
      $pdo->prepare("UPDATE lead_statuses SET is_archived = 1 WHERE id NOT IN ($marks)")
        ->execute($keep);
    }

    $pdo->commit();

    return true;
  } catch (PDOException $e) {
    $pdo->rollBack();
    error_log('[statuses] ' . $e->getMessage());

    return false;
  }
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
    'email' => $data['email'] ?? '',
    'utm_source' => $attribution['utm_source'] ?? '',
    'utm_medium' => $attribution['utm_medium'] ?? '',
    'utm_campaign' => $attribution['utm_campaign'] ?? '',
    'utm_term' => $attribution['utm_term'] ?? '',
    'utm_content' => $attribution['utm_content'] ?? '',
    'cmp_id' => $attribution['cmp_id'] ?? '',
    'cmp_name' => $attribution['cmp_name'] ?? '',
    'grp_id' => $attribution['grp_id'] ?? '',
    'grp_name' => $attribution['grp_name'] ?? '',
    'ad_id' => $attribution['ad_id'] ?? '',
    'ad_name' => $attribution['ad_name'] ?? '',
    'kw' => $attribution['kw'] ?? '',
    'plc' => $attribution['plc'] ?? '',
    'src_pl' => $attribution['src_pl'] ?? '',
    'gclid' => $attribution['gclid'] ?? '',
    'fbclid' => $attribution['fbclid'] ?? '',
    'landing_page' => $attribution['landing_page'] ?? '',
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
    errors_log('db', $e->getMessage(), [
      'phone' => $fields['phone'],
      'name' => $fields['name'],
    ], 'error');

    return 0;
  }
}

/** Список із фільтрами і пагінацією. */
function leads_list($filters = []) {
  $pdo = leads_db();

  // Видалені ховаємо, але з бази не стираємо: у панелі персональні дані
  // пацієнтів, і випадковий клік не має знищувати заявку назавжди.
  $where = ['deleted_at IS NULL'];
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

  $sql = 'SELECT * FROM leads WHERE ' . implode(' AND ', $where);
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

  // Поточні значення потрібні, щоб записати в історію, що саме змінилось.
  $stmt = $pdo->prepare('SELECT status, comment FROM leads WHERE id = ?');
  $stmt->execute([(int) $id]);
  $before = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

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

  if ($stmt->rowCount() === 0) return false;

  // Пишемо тільки те, що справді змінилось: інакше історія засмічується
  // записами «зберегли, нічого не змінивши».
  foreach ($allowed as $field) {
    if (!array_key_exists($field, $data)) continue;

    $old = (string) ($before[$field] ?? '');
    $new = (string) $data[$field];

    if ($old === $new) continue;

    $log = $pdo->prepare(
      'INSERT INTO lead_history (lead_id, field, old_value, new_value) VALUES (?, ?, ?, ?)'
    );
    $log->execute([(int) $id, $field, $old, $new]);
  }

  return true;
}

/** Один лід із історією — для картки. */
function leads_find($id) {
  $pdo = leads_db();

  $stmt = $pdo->prepare('SELECT * FROM leads WHERE id = ? AND deleted_at IS NULL');
  $stmt->execute([(int) $id]);
  $lead = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$lead) return null;

  $stmt = $pdo->prepare(
    'SELECT * FROM lead_history WHERE lead_id = ? ORDER BY created_at DESC, id DESC'
  );
  $stmt->execute([(int) $id]);
  $lead['history'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

  return $lead;
}

/** Мʼяке видалення: заявка зникає з панелі, але лишається в базі. */
function leads_delete($id) {
  $stmt = leads_db()->prepare(
    "UPDATE leads SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL"
  );
  $stmt->execute([(int) $id]);

  return $stmt->rowCount() > 0;
}

/** Повернути видалену заявку (через SQL або майбутню кнопку в панелі). */
function leads_restore($id) {
  $stmt = leads_db()->prepare('UPDATE leads SET deleted_at = NULL WHERE id = ?');
  $stmt->execute([(int) $id]);

  return $stmt->rowCount() > 0;
}

/** Зведення для дашборду. */
function leads_stats($days = 30) {
  $pdo = leads_db();

  $byStatus = $pdo->query("
    SELECT status, COUNT(*) AS count FROM leads
    WHERE deleted_at IS NULL GROUP BY status
  ")->fetchAll(PDO::FETCH_KEY_PAIR);

  $stmt = $pdo->prepare("
    SELECT date(created_at) AS day, COUNT(*) AS count
    FROM leads WHERE created_at > datetime('now', ?) AND deleted_at IS NULL
    GROUP BY day ORDER BY day
  ");
  $stmt->execute(['-' . (int) $days . ' day']);
  $byDay = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $stmt = $pdo->prepare("
    SELECT
      CASE WHEN utm_source = '' OR utm_source IS NULL THEN 'direct' ELSE utm_source END AS source,
      COUNT(*) AS count
    FROM leads WHERE created_at > datetime('now', ?) AND deleted_at IS NULL
    GROUP BY source ORDER BY count DESC
  ");
  $stmt->execute(['-' . (int) $days . ' day']);
  $bySource = $stmt->fetchAll(PDO::FETCH_ASSOC);

  return [
    'by_status' => $byStatus,
    'by_day' => $byDay,
    'by_source' => $bySource,
    'total' => (int) $pdo->query(
      'SELECT COUNT(*) FROM leads WHERE deleted_at IS NULL'
    )->fetchColumn(),
  ];
}
