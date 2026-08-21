<?php
/**
 * Сховище атрибуції. SQLite замість PostgreSQL + Redis:
 * на сервері nginx + PHP-FPM, окремих сервісів немає.
 * Для навантаження клініки SQLite у WAL-режимі цього достатньо.
 *
 * Змінні оточення:
 *   ATTR_DB_PATH   шлях до файлу БД (за замовчуванням /var/lib/isaenko/attribution.sqlite)
 */

// Запобіжник: mbstring є не на кожному хостингу, а без нього
// mb_strlen кидає фатальну помилку і губить весь запит.
if (!function_exists('mb_strlen')) {
  function mb_strlen($value) { return strlen($value); }
}

if (!function_exists('mb_substr')) {
  function mb_substr($value, $start, $length = null) {
    return $length === null ? substr($value, $start) : substr($value, $start, $length);
  }
}

function attr_env($name, $default = '') {
  if (isset($_SERVER[$name]) && $_SERVER[$name] !== '') return $_SERVER[$name];
  $value = getenv($name);
  return ($value !== false && $value !== '') ? $value : $default;
}

/** Усі ключі з п. 2.1 ТЗ — кожен своєю колонкою. */
function attr_columns() {
  return [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
    'cmp_id', 'cmp_name', 'grp_id', 'grp_name', 'ad_id', 'ad_name',
    'kw', 'mt', 'plc', 'net', 'dev', 'geo', 'tgt', 'src_pl',
    'gclid', 'fbclid', 'ttclid',
    'client_id', 'session_id', 'session_number',
    'event_name', 'event_id', 'cid',
    'booking_place', 'form_name',
    'page_location', 'landing_page', 'referrer', 'ip', 'user_agent',
  ];
}

function attr_db() {
  static $pdo = null;
  if ($pdo !== null) return $pdo;

  $path = attr_env('ATTR_DB_PATH', '/var/lib/isaenko/attribution.sqlite');
  $dir = dirname($path);

  if (!is_dir($dir)) @mkdir($dir, 0770, true);

  $pdo = new PDO('sqlite:' . $path);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // WAL дозволяє читати під час запису — інакше паралельні
  // beacon-запити блокували б один одного.
  $pdo->exec('PRAGMA journal_mode = WAL');
  $pdo->exec('PRAGMA busy_timeout = 3000');

  $columns = implode(" TEXT,\n    ", attr_columns());

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS attribution_clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      $columns TEXT,
      raw TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  ");

  // event_id UNIQUE — друга лінія дедуплікації після файлових ключів.
  $pdo->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_attr_event_id ON attribution_clicks(event_id)');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_attr_cid ON attribution_clicks(cid)');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_attr_created ON attribution_clicks(created_at DESC)');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_attr_gclid ON attribution_clicks(gclid) WHERE gclid IS NOT NULL');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_attr_campaign ON attribution_clicks(cmp_id, grp_id, ad_id)');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_attr_platform ON attribution_clicks(src_pl, created_at DESC)');

  // Заміна представлення v_attr_daily з ТЗ.
  $pdo->exec("
    CREATE VIEW IF NOT EXISTS v_attr_daily AS
    SELECT
      date(created_at) AS day,
      src_pl, cmp_id, cmp_name, grp_id, ad_id, kw,
      SUM(CASE WHEN event_name = 'booking_click' THEN 1 ELSE 0 END) AS booking_clicks,
      SUM(CASE WHEN event_name = 'phone_click' THEN 1 ELSE 0 END) AS phone_clicks,
      COUNT(DISTINCT cid) AS visitors
    FROM attribution_clicks
    GROUP BY day, src_pl, cmp_id, cmp_name, grp_id, ad_id, kw
  ");

  return $pdo;
}

/** Запис кліку. Повертає false, якщо event_id уже був (дубль). */
function attr_save($data) {
  $columns = attr_columns();
  $values = [];

  foreach ($columns as $column) {
    $value = isset($data[$column]) ? (string) $data[$column] : null;
    // Обрізаємо надто довгі значення: імена кампаній бувають величезні.
    if ($value !== null && mb_strlen($value) > 500) {
      $value = mb_substr($value, 0, 500);
    }
    $values[] = $value;
  }

  $values[] = json_encode($data, JSON_UNESCAPED_UNICODE);

  $placeholders = implode(', ', array_fill(0, count($columns) + 1, '?'));
  $columnList = implode(', ', array_merge($columns, ['raw']));

  try {
    $stmt = attr_db()->prepare(
      "INSERT INTO attribution_clicks ($columnList) VALUES ($placeholders)"
    );
    $stmt->execute($values);
    return true;
  } catch (PDOException $e) {
    if (strpos($e->getMessage(), 'UNIQUE') !== false) return false;
    error_log('[attr] ' . $e->getMessage());
    return false;
  }
}

function attr_find_by_cid($cid) {
  $stmt = attr_db()->prepare(
    'SELECT * FROM attribution_clicks WHERE cid = ? ORDER BY created_at DESC LIMIT 1'
  );
  $stmt->execute([$cid]);

  return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}
