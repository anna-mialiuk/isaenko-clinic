<?php
/**
 * Користувачі панелі.
 *
 * Раніше логін і хеш лежали у /var/lib/isaenko/admin-config.php — одна
 * пара на всіх. Тепер вони в базі, щоб адмін міг додавати людей із панелі.
 *
 * Файл на сервері лишається як АВАРІЙНИЙ ВХІД: якщо в базі нікого немає
 * або пароль забутий, зайти можна ним. Інакше можна заблокувати себе,
 * випадково видаливши останнього користувача.
 */

require_once __DIR__ . '/attr-store.php';

function users_db() {
  $pdo = attr_db();

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      login TEXT NOT NULL UNIQUE,
      name TEXT,
      password_hash TEXT NOT NULL,
      -- Ролі поки не розрізняються: усі мають однакові права.
      -- Колонка закладена, щоб потім не робити міграцію.
      role TEXT NOT NULL DEFAULT 'admin',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT
    )
  ");

  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_users_login ON users(login)');

  // Запамʼятовані пристрої. У cookie йде selector:validator;
  // у базі — тільки хеш validator, тому витік бази не дає входу.
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS device_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT NOT NULL,
      selector TEXT NOT NULL UNIQUE,
      validator_hash TEXT NOT NULL,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT,
      expires_at TEXT NOT NULL
    )
  ");

  return $pdo;
}

// ── Запамʼятовані пристрої ─────────────────────────────────────

const DEVICE_TOKEN_TTL = 2592000; // 30 днів

function device_token_create($login) {
  $selector = bin2hex(random_bytes(9));
  $validator = bin2hex(random_bytes(32));

  $stmt = users_db()->prepare('
    INSERT INTO device_tokens (login, selector, validator_hash, user_agent, expires_at)
    VALUES (?, ?, ?, ?, ?)
  ');
  $stmt->execute([
    $login,
    $selector,
    hash('sha256', $validator),
    mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
    gmdate('Y-m-d H:i:s', time() + DEVICE_TOKEN_TTL),
  ]);

  return $selector . ':' . $validator;
}

/** Повертає обліковий запис, якщо токен дійсний, інакше null. */
function device_token_verify($token) {
  $parts = explode(':', (string) $token, 2);
  if (count($parts) !== 2) return null;

  [$selector, $validator] = $parts;
  if (!preg_match('/^[a-f0-9]{18}$/', $selector) || !preg_match('/^[a-f0-9]{64}$/', $validator)) {
    return null;
  }

  $pdo = users_db();

  // Прострочені прибираємо принагідно — окремого cron немає.
  $pdo->exec("DELETE FROM device_tokens WHERE expires_at < datetime('now')");

  $stmt = $pdo->prepare('SELECT * FROM device_tokens WHERE selector = ?');
  $stmt->execute([$selector]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$row) return null;
  if (!hash_equals($row['validator_hash'], hash('sha256', $validator))) {
    // Правильний selector з неправильним validator — хтось підбирає.
    $pdo->prepare('DELETE FROM device_tokens WHERE selector = ?')->execute([$selector]);
    return null;
  }

  $account = users_find_by_login($row['login']);
  if (!$account) return null;

  $pdo->prepare("UPDATE device_tokens SET last_used_at = datetime('now') WHERE id = ?")
    ->execute([$row['id']]);

  return $account;
}

function device_token_revoke($token) {
  $parts = explode(':', (string) $token, 2);
  if (count($parts) !== 2) return;

  users_db()->prepare('DELETE FROM device_tokens WHERE selector = ?')->execute([$parts[0]]);
}

/** Усі пристрої користувача — при зміні пароля чи деактивації. */
function device_tokens_revoke_all($login) {
  users_db()->prepare('DELETE FROM device_tokens WHERE login = ?')->execute([$login]);
}

/** Логін дозволяємо латиницею, цифрами, крапкою й підкресленням. */
function users_valid_login($login) {
  return (bool) preg_match('/^[a-z0-9._-]{3,32}$/i', (string) $login);
}

/**
 * Мінімальна довжина пароля. Вісім символів — компроміс: коротший
 * підбирається офлайн за години, довший люди починають записувати.
 */
function users_valid_password($password) {
  return mb_strlen((string) $password) >= 8;
}

function users_list() {
  return users_db()
    ->query('SELECT id, login, name, role, is_active, created_at, last_login_at
             FROM users ORDER BY created_at')
    ->fetchAll(PDO::FETCH_ASSOC);
}

function users_find_by_login($login) {
  $stmt = users_db()->prepare('SELECT * FROM users WHERE login = ? AND is_active = 1');
  $stmt->execute([(string) $login]);

  return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

function users_create($data) {
  $login = trim((string) ($data['login'] ?? ''));
  $password = (string) ($data['password'] ?? '');

  if (!users_valid_login($login)) {
    return ['error' => 'Логін: 3–32 символи, латиниця, цифри, крапка або підкреслення'];
  }

  if (!users_valid_password($password)) {
    return ['error' => 'Пароль має бути не коротшим за 8 символів'];
  }

  try {
    $stmt = users_db()->prepare(
      'INSERT INTO users (login, name, password_hash, role) VALUES (?, ?, ?, ?)'
    );

    $stmt->execute([
      $login,
      mb_substr(trim((string) ($data['name'] ?? '')), 0, 60),
      password_hash($password, PASSWORD_DEFAULT),
      'admin',
    ]);

    return ['ok' => true];
  } catch (PDOException $e) {
    if (strpos($e->getMessage(), 'UNIQUE') !== false) {
      return ['error' => 'Такий логін уже існує'];
    }

    error_log('[users] ' . $e->getMessage());

    return ['error' => 'Не вдалося створити користувача'];
  }
}

/** Зміна імені, пароля або блокування. Логін не міняється. */
function users_update($id, $data, $currentLogin = null) {
  $pdo = users_db();

  $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
  $stmt->execute([(int) $id]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$user) return ['error' => 'Користувача не знайдено'];

  $set = [];
  $params = [];

  if (array_key_exists('name', $data)) {
    $set[] = 'name = ?';
    $params[] = mb_substr(trim((string) $data['name']), 0, 60);
  }

  if (!empty($data['password'])) {
    if (!users_valid_password($data['password'])) {
      return ['error' => 'Пароль має бути не коротшим за 8 символів'];
    }

    $set[] = 'password_hash = ?';
    $params[] = password_hash((string) $data['password'], PASSWORD_DEFAULT);
  }

  if (array_key_exists('is_active', $data)) {
    $active = (int) (bool) $data['is_active'];

    // Себе заблокувати не можна: інакше людина вилітає з панелі
    // і не може повернутись.
    if (!$active && $currentLogin !== null && $user['login'] === $currentLogin) {
      return ['error' => 'Не можна заблокувати власний обліковий запис'];
    }

    // І не можна лишити систему без жодного активного користувача.
    if (!$active) {
      $others = (int) $pdo->query(
        'SELECT COUNT(*) FROM users WHERE is_active = 1'
      )->fetchColumn();

      if ($others <= 1) return ['error' => 'Має лишитись хоча б один активний користувач'];
    }

    $set[] = 'is_active = ?';
    $params[] = $active;
  }

  if (!$set) return ['error' => 'Немає що змінювати'];

  $params[] = (int) $id;
  $stmt = $pdo->prepare('UPDATE users SET ' . implode(', ', $set) . ' WHERE id = ?');
  $stmt->execute($params);

  // Новий пароль або блокування скидають усі запамʼятовані пристрої:
  // інакше старий токен далі пускає без пароля.
  if (!empty($data['password']) || (array_key_exists('is_active', $data) && !$data['is_active'])) {
    device_tokens_revoke_all($user['login']);
  }

  return ['ok' => true];
}

function users_delete($id, $currentLogin = null) {
  $pdo = users_db();

  $stmt = $pdo->prepare('SELECT login FROM users WHERE id = ?');
  $stmt->execute([(int) $id]);
  $login = $stmt->fetchColumn();

  if (!$login) return ['error' => 'Користувача не знайдено'];

  if ($currentLogin !== null && $login === $currentLogin) {
    return ['error' => 'Не можна видалити власний обліковий запис'];
  }

  $count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();

  if ($count <= 1) return ['error' => 'Має лишитись хоча б один користувач'];

  $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([(int) $id]);
  device_tokens_revoke_all($login);

  return ['ok' => true];
}

function users_touch_login($login) {
  users_db()
    ->prepare("UPDATE users SET last_login_at = datetime('now') WHERE login = ?")
    ->execute([(string) $login]);
}
