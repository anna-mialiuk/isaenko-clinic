<?php
require_once __DIR__ . '/attr-store.php';

$target = attr_env('BOOKING_TARGET_URL', 'https://cbox.mobi/go/isaenko');

$whitelist = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'cmp_id', 'grp_id', 'ad_id', 'src_pl',
  'gclid', 'fbclid', 'ttclid',
  'client_id', 'session_id', 'session_number',
  'event_name', 'event_id', 'cid',
];

$params = [];

foreach ($whitelist as $key) {
  $value = $_GET[$key] ?? '';
  if ($value !== '' && is_string($value)) {
    $params[$key] = mb_substr($value, 0, 500);
  }
}

if (!empty($params['cid']) && !empty($params['event_id'])) {
  $log = $_GET;
  $log['event_name'] = $log['event_name'] ?? 'booking_click';
  $log['ip'] = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
  $log['user_agent'] = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);
  $log['referrer'] = $_SERVER['HTTP_REFERER'] ?? '';

  attr_save($log);
}

$separator = strpos($target, '?') === false ? '?' : '&';
$location = $params ? $target . $separator . http_build_query($params) : $target;

header('Cache-Control: no-store, no-cache, must-revalidate');
header('Location: ' . $location, true, 302);
