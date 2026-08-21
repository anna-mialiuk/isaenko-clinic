<?php
require_once __DIR__ . '/attr-store.php';

header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  header('Allow: POST');
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
  http_response_code(400);
  exit;
}

if (empty($data['cid']) || empty($data['event_id'])) {
  http_response_code(400);
  exit;
}

$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = sys_get_temp_dir() . '/attr-rl-' . md5($ip) . '-' . floor(time() / 60);
$hits = (int) @file_get_contents($bucket);

if ($hits >= 60) {
  http_response_code(429);
  exit;
}

@file_put_contents($bucket, $hits + 1);

$data['ip'] = $ip;
$data['user_agent'] = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

attr_save($data);

http_response_code(204);
