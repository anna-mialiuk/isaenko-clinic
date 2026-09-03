<?php
define('GA4_MAX_PARAMS', 25);
define('GA4_MAX_NAME_LEN', 40);
define('GA4_MAX_VALUE_LEN', 100);

function ga4_sanitize_params($params) {
  $clean = [];

  foreach ($params as $key => $value) {
    if ($value === '' || $value === null) continue;
    if (mb_strlen($key) > GA4_MAX_NAME_LEN) continue;

    if (preg_match('/^(_|firebase_|ga_|google_|gtag\.)/', $key)) continue;

    if (is_string($value) && mb_strlen($value) > GA4_MAX_VALUE_LEN) {
      $value = mb_substr($value, 0, GA4_MAX_VALUE_LEN);
    }

    $clean[$key] = $value;

    if (count($clean) >= GA4_MAX_PARAMS) break;
  }

  return $clean;
}

function ga4_env($name, $default = '') {
  if (isset($_SERVER[$name]) && $_SERVER[$name] !== '') return $_SERVER[$name];
  $value = getenv($name);
  return ($value !== false && $value !== '') ? $value : $default;
}

function ga4_claim_event($eventId) {
  if ($eventId === '') return true;

  $dir = sys_get_temp_dir() . '/ga4-dedup';
  if (!is_dir($dir)) @mkdir($dir, 0700, true);

  if (rand(1, 50) === 1) {
    foreach (glob($dir . '/*') as $file) {
      if (filemtime($file) < time() - 72 * 3600) @unlink($file);
    }
  }

  $path = $dir . '/' . preg_replace('/[^a-zA-Z0-9_.-]/', '', $eventId);
  $handle = @fopen($path, 'x');

  if ($handle === false) return false; 

  fclose($handle);
  return true;
}


function ga4_send_event($eventName, $clientId, $sessionId, $params) {
  $measurementId = ga4_env('GA4_MEASUREMENT_ID', 'G-3LKVREYQFY');
  $apiSecret     = ga4_env('GA4_API_SECRET');
  $mode          = ga4_env('GA4_MP_MODE', 'live');

  if ($apiSecret === '') {
    error_log('[GA4 MP] GA4_API_SECRET is not set');
    // Не разова помилка, а зламане налаштування: доки секрет не заданий,
    // жодна конверсія не потрапить у GA4.
    errors_log('ga4_mp', 'GA4_API_SECRET не заданий у конфізі сервера', [
      'event_name' => $eventName,
    ], 'error');
    return false;
  }

  if ($clientId === '') {
    error_log('[GA4 MP] client_id missing, event skipped: ' . $eventName);
    // Форма не передала client_id — подія була б прив'язана
    // до «фантомного» користувача, тому не надсилаємо взагалі.
    errors_log('ga4_mp', 'Форма не передала client_id, подію не надіслано', [
      'event_name' => $eventName,
      'session_id' => $sessionId,
    ], 'warning');
    return false;
  }

  if ($sessionId !== '' && preg_match('/^\d+$/', $sessionId)) {
    $params['session_id'] = $sessionId;
  }

  $params['engagement_time_msec'] = 100;

  $params = ga4_sanitize_params($params);

  $body = [
    'client_id' => $clientId,
    'consent' => [
      'ad_user_data' => 'DENIED',
      'ad_personalization' => 'DENIED',
    ],
    'events' => [[
      'name' => $eventName,
      'params' => $params,
    ]],
  ];

  if ($mode === 'debug') {
    $body['validation_behavior'] = 'ENFORCE_RECOMMENDATIONS';
  }

  $endpoint = $mode === 'debug'
    ? 'https://www.google-analytics.com/debug/mp/collect'
    : 'https://www.google-analytics.com/mp/collect';

  $url = $endpoint
    . '?measurement_id=' . urlencode($measurementId)
    . '&api_secret=' . urlencode($apiSecret);

  $json = json_encode($body, JSON_UNESCAPED_UNICODE);

  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => $json,
      CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 8,
    ]);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
  } else {
    $context = stream_context_create(['http' => [
      'method' => 'POST',
      'header' => "Content-Type: application/json\r\n",
      'content' => $json,
      'timeout' => 8,
      'ignore_errors' => true,
    ]]);
    $response = @file_get_contents($url, false, $context);
    $status = $response === false ? 0 : 200;
  }

  if ($mode === 'debug' && $response) {
    error_log('[GA4 MP debug] ' . $response);
  }

  return $status >= 200 && $status < 300;
}
