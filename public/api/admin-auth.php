<?php
/**
 * Авторизація в адмінпанель.
 *
 * Змінні оточення (fastcgi_param у nginx):
 *   ADMIN_USER            логін
 *   ADMIN_PASSWORD_HASH   хеш пароля, отриманий через password_hash()
 *
 * Хеш генерується так (на сервері, один раз):
 *   php -r 'echo password_hash("ваш_пароль", PASSWORD_DEFAULT), PHP_EOL;'
 *
 * Пароль у відкритому вигляді в конфіг НЕ кладемо: конфіг читають усі,
 * хто має доступ до сервера, а панель містить персональні дані пацієнтів.
 */

require_once __DIR__ . '/attr-store.php';

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

function admin_login($user, $password) {
  $expectedUser = attr_env('ADMIN_USER');
  $expectedHash = attr_env('ADMIN_PASSWORD_HASH');

  if ($expectedUser === '' || $expectedHash === '') {
    error_log('[admin] ADMIN_USER або ADMIN_PASSWORD_HASH не задані');
    return false;
  }

  // hash_equals замість === : порівняння за постійний час,
  // щоб логін не можна було підібрати за часом відповіді.
  $userOk = hash_equals($expectedUser, (string) $user);
  $passOk = password_verify((string) $password, $expectedHash);

  if (!$userOk || !$passOk) return false;

  admin_session_start();
  session_regenerate_id(true);

  $_SESSION['admin'] = [
    'user' => $expectedUser,
    'ip' => admin_client_ip(),
    'expires' => time() + ADMIN_SESSION_TTL,
  ];

  return true;
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
