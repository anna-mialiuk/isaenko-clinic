<?php
/**
 * Лог серверних помилок.
 *
 * Пишемо в базу, а не тільки в error_log: у логу nginx це змішано з усім
 * іншим, доступне лише по SSH і губиться при ротації. А головне — якщо
 * Telegram не прийняв заявку, зараз про це ніхто не дізнається.
 */

require_once __DIR__ . '/attr-store.php';

function errors_db() {
  $pdo = attr_db();

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      source TEXT NOT NULL,
      message TEXT,
      level TEXT NOT NULL DEFAULT 'error',
      context TEXT,
      lead_id INTEGER,
      resolved INTEGER NOT NULL DEFAULT 0
    )
  ");

  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_errors_created ON errors(created_at DESC)');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_errors_source ON errors(source, created_at DESC)');

  return $pdo;
}

/**
 * Джерела: telegram, email, ga4_mp, form, db.
 * Рівні: error (щось втрачено), warning (працює, але не так).
 */
function errors_log($source, $message, $context = [], $level = 'error', $leadId = null) {
  try {
    $stmt = errors_db()->prepare(
      'INSERT INTO errors (source, level, message, context, lead_id) VALUES (?, ?, ?, ?, ?)'
    );

    $stmt->execute([
      (string) $source,
      in_array($level, ['warning', 'error'], true) ? $level : 'error',
      mb_substr((string) $message, 0, 1000),
      json_encode($context, JSON_UNESCAPED_UNICODE),
      $leadId,
    ]);
  } catch (PDOException $e) {
    // Якщо не вдалося записати навіть помилку — лишається error_log.
    error_log('[errors] ' . $e->getMessage());
  }
}

function errors_list($filters = []) {
  $pdo = errors_db();

  $where = [];
  $params = [];

  if (!empty($filters['source'])) {
    $where[] = 'source = ?';
    $params[] = $filters['source'];
  }

  if (isset($filters['resolved']) && $filters['resolved'] !== '') {
    $where[] = 'resolved = ?';
    $params[] = (int) $filters['resolved'];
  }

  $sql = 'SELECT * FROM errors';
  if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
  $sql .= ' ORDER BY created_at DESC, id DESC LIMIT ?';

  $params[] = (int) ($filters['limit'] ?? 200);

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function errors_resolve($id, $resolved = 1) {
  $stmt = errors_db()->prepare('UPDATE errors SET resolved = ? WHERE id = ?');
  $stmt->execute([(int) $resolved, (int) $id]);

  return $stmt->rowCount() > 0;
}

function errors_unresolved_count() {
  return (int) errors_db()
    ->query('SELECT COUNT(*) FROM errors WHERE resolved = 0')
    ->fetchColumn();
}

function errors_stats($days = 30) {
  $stmt = errors_db()->prepare("
    SELECT source, level, COUNT(*) AS count
    FROM errors WHERE created_at > datetime('now', ?)
    GROUP BY source, level ORDER BY count DESC
  ");

  $stmt->execute(['-' . (int) $days . ' day']);

  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}