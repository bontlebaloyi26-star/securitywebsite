<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request payload.']);
    exit;
}

$service = trim($data['service'] ?? '');
$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$message = trim($data['message'] ?? '');

if (!$service || !$name || !$phone || !$email || !$message) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please complete all fields before submitting.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

$entry = sprintf(
    "%s | Service: %s | Name: %s | Phone: %s | Email: %s | Message: %s\n",
    date('Y-m-d H:i:s'),
    $service,
    $name,
    $phone,
    $email,
    str_replace(["\r", "\n"], [' ', ' '], $message)
);
file_put_contents(__DIR__ . '/quote-requests.txt', $entry, FILE_APPEND | LOCK_EX);

$adminEmail = 'bontlebaloyi26@gmail.com';
$subject = "New quote request from $name";
$body = "Service: $service\nName: $name\nPhone: $phone\nEmail: $email\nMessage:\n$message\n";
$headers = "From: noreply@morabasolutions.co.za\r\nReply-To: $email\r\n";
if (function_exists('mail')) {
    @mail($adminEmail, $subject, $body, $headers);
}

echo json_encode([
    'success' => true,
    'message' => 'Thank you! Your quote request was received.',
]);
