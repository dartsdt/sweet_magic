<?php
header('Content-Type: application/json; charset=utf-8');

$token  = ''; 
$chatId = '';
function fail($code, $message) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'description' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}
 
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'Разрешены только POST-запросы');
}
 
if (strpos($token, 'ВСТАВЬТЕ') === 0 || strpos($chatId, 'ВСТАВЬТЕ') === 0) {
    fail(500, 'В send-order.php не заполнены token и chatId');
}
 
$input = json_decode(file_get_contents('php://input'), true);
$text = trim($input['text'] ?? '');
 
if ($text === '' || strlen($text) > 6000) {
    fail(400, 'Пустой или слишком длинный заказ');
}
 
if (!function_exists('curl_init')) {
    fail(500, 'На хостинге не включено расширение PHP curl');
}
 
$ch = curl_init("https://api.telegram.org/bot{$token}/sendMessage");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_POSTFIELDS => ['chat_id' => $chatId, 'text' => $text],
]);
if (in_array($_SERVER['SERVER_NAME'], ['localhost', '127.0.0.1'], true)) {
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
}
 
$response = curl_exec($ch);
 
if ($response === false) {
    fail(502, 'Сервер не смог связаться с Telegram: ' . curl_error($ch));
}
 
echo $response;
