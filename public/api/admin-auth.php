<?php
require_once __DIR__ . '/attr-store.php';
require_once __DIR__ . '/users-store.php';

$adminConfig = '/var/lib/isaenko/admin-config.php';

if (is_readable($adminConfig)) {
  require_once $adminConfig;
}

const ADMIN_SESSION_TTL = 43200; // 12 годин
const ADMIN_MAX_ATTEMPTS = 5;    // спроб входу за 15 хвилин з одного IP

function admin_session_start() {
  if (session_status() === PHP_SESSION_ACTIVE) return;

  session_set_cookie_params([
    'lifetime' => ADMIN_SESSION_TTL,
    'path' => '/',
    'httponly' => true,
    'secure' => true,
    'samesite' => 'Strict',
  ]);

  session_name('isaenko_admin');
  session_start();
}

function admin_client_ip() {
  return $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/** Захист від перебору пароля. */
function admin_throttle_check() {
  $file = sys_get_temp_dir() . '/admin-login-' . md5(admin_client_ip());
  $attempts = (int) @file_get_contents($file);
  $mtime = @filemtime($file) ?: 0;

  // Вікно 15 хвилин: після нього лічильник обнуляється.
  if (time() - $mtime > 900) {
    @unlink($file);
    return true;
  }

  return $attempts < ADMIN_MAX_ATTEMPTS;
}

function admin_throttle_hit() {
  $file = sys_get_temp_dir() . '/admin-login-' . md5(admin_client_ip());
  @file_put_contents($file, ((int) @file_get_contents($file)) + 1);
}

function admin_throttle_reset() {
  @unlink(sys_get_temp_dir() . '/admin-login-' . md5(admin_client_ip()));
}

/**
 * Вхід. Спершу шукаємо в базі, потім — аварійний обліковий запис
 * із конфігу сервера.
 *
 * Аварійний потрібен, щоб не можна було заблокувати себе назавжди:
 * якщо база порожня чи пошкоджена, ним завжди можна зайти й усе полагодити.
 */
function admin_login($user, $password) {
  $login = trim((string) $user);
  $account = users_find_by_login($login);

  if ($account) {
    if (!password_verify((string) $password, $account['password_hash'])) return false;

    users_touch_login($account['login']);
    admin_start_session($account['login'], $account['name'] ?? '', false);

    return true;
  }

  // ── Аварійний вхід ────────────────────────────────
  $fallbackUser = attr_env('ADMIN_USER');
  $fallbackHash = attr_env('ADMIN_PASSWORD_HASH');

  if ($fallbackUser === '' || $fallbackHash === '') {
    error_log('[admin] ADMIN_USER або ADMIN_PASSWORD_HASH не задані');
    return false;
  }

  // hash_equals замість === : порівняння за постійний час,
  // щоб логін не можна було підібрати за часом відповіді.
  if (!hash_equals($fallbackUser, $login)) return false;
  if (!password_verify((string) $password, $fallbackHash)) return false;

  admin_start_session($fallbackUser, 'Адміністратор', true);

  return true;
}

function admin_start_session($login, $name, $isFallback) {
  admin_session_start();
  session_regenerate_id(true);

  $_SESSION['admin'] = [
    'user' => $login,
    'name' => $name,
    'fallback' => $isFallback,
    'ip' => admin_client_ip(),
    'expires' => time() + ADMIN_SESSION_TTL,
  ];
}

/** Логін поточного користувача — щоб не дати видалити самого себе. */
function admin_current_login() {
  return admin_is_authorised() ? ($_SESSION['admin']['user'] ?? null) : null;
}

function admin_logout() {
  admin_session_start();
  $_SESSION = [];
  session_destroy();
}

function admin_is_authorised() {
  admin_session_start();

  if (empty($_SESSION['admin'])) return false;
  if ($_SESSION['admin']['expires'] < time()) {
    admin_logout();
    return false;
  }

  return true;
}

/** Ставиться на початку кожного захищеного ендпоінта. */
function admin_require_auth() {
  if (admin_is_authorised()) return;

  http_response_code(401);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['error' => 'unauthorised']);
  exit;
}
