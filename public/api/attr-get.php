<?php
require_once __DIR__ . '/attr-store.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  header('Allow: GET');
  echo json_encode(['error' => 'method not allowed']);
  exit;
}

$cid = trim($_GET['cid'] ?? '');

if ($cid === '') {
  http_response_code(400);
  echo json_encode(['error' => 'cid required']);
  exit;
}

$row = attr_find_by_cid($cid);

if (!$row) {
  http_response_code(404);
  echo json_encode(['error' => 'not found']);
  exit;
}

unset($row['raw'], $row['ip'], $row['user_agent']);

echo json_encode($row, JSON_UNESCAPED_UNICODE);