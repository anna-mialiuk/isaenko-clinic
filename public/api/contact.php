<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method not allowed']);
  exit;
}

require_once __DIR__ . '/ga4-mp.php';

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
  exit;
}

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$message = trim($data['message'] ?? '');
$company = trim($data['company'] ?? '');
$language = trim($data['language'] ?? 'uk');
$page = trim($data['page'] ?? '');

// Поля для GA4 Measurement Protocol.
$eventId     = trim($data['event_id'] ?? '');
$formName    = trim($data['form_name'] ?? 'question_form');
$gaClientId  = trim($data['ga_client_id'] ?? '');
$gaSessionId = trim($data['ga_session_id'] ?? '');

if ($company !== '') {
  echo json_encode(['success' => true]);
  exit;
}

if ($name === '' || $phone === '' || $message === '') {
  http_response_code(422);
  echo json_encode(['success' => false, 'message' => 'Required fields are missing']);
  exit;
}

if (mb_strlen($name) > 120 || mb_strlen($phone) > 60 || mb_strlen($message) > 2000) {
  http_response_code(422);
  echo json_encode(['success' => false, 'message' => 'Field length limit exceeded']);
  exit;
}

$token = getenv('TELEGRAM_BOT_TOKEN') ?: 'PUT_TELEGRAM_BOT_TOKEN_HERE';
$chatId = getenv('TELEGRAM_CHAT_ID') ?: 'PUT_TELEGRAM_CHAT_ID_HERE';
$toEmail = getenv('CONTACT_FORM_EMAIL') ?: '';
$siteUrl = getenv('SITE_URL') ?: '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$pageUrl = $siteUrl !== '' && $page !== '' ? rtrim($siteUrl, '/') . '/' . ltrim($page, '/') : $referer;

$safeName = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safeMessage = htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safeLanguage = htmlspecialchars($language, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safePageUrl = htmlspecialchars($pageUrl ?: 'невідомо', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

$text = "📩 Нова заявка з сайту Dr. Isaenko\n\n" .
  "👤 Імʼя: {$safeName}\n" .
  "📞 Телефон: {$safePhone}\n" .
  "💬 Повідомлення: {$safeMessage}\n" .
  "🌐 Мова: {$safeLanguage}\n" .
  "🔗 Сторінка: {$safePageUrl}";

$sentToTelegram = false;

if ($token !== 'PUT_TELEGRAM_BOT_TOKEN_HERE' && $chatId !== 'PUT_TELEGRAM_CHAT_ID_HERE') {
  $telegramUrl = "https://api.telegram.org/bot{$token}/sendMessage";
  $payload = http_build_query([
    'chat_id' => $chatId,
    'text' => $text,
    'parse_mode' => 'HTML',
  ]);

  $context = stream_context_create([
    'http' => [
      'method' => 'POST',
      'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
      'content' => $payload,
      'timeout' => 8,
    ],
  ]);

  $result = @file_get_contents($telegramUrl, false, $context);
  $sentToTelegram = $result !== false;
}

$sentToEmail = false;

if ($toEmail !== '') {
  $subject = 'Нова заявка з сайту Dr. Isaenko';
  $headers = "Content-Type: text/plain; charset=utf-8\r\n";
  $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

  $plainText = html_entity_decode($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $sentToEmail = @mail($toEmail, $subject, $plainText, $headers);
}

if (!$sentToTelegram && !$sentToEmail) {
  error_log(html_entity_decode($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
}

// --- GA4: generate_lead ---
$deduplicated = false;

if (ga4_claim_event($eventId)) {
  ga4_send_event('generate_lead', $gaClientId, $gaSessionId, [
    'form_name' => $formName,
    'lead_source' => 'form',
    'page_path' => $page,
    'event_id' => $eventId,
    'currency' => 'UAH',
  ]);
} else {
  $deduplicated = true;
}

echo json_encode(['success' => true, 'deduplicated' => $deduplicated]);
