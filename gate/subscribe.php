<?php
// Mailing list sign-up. Appends to gate/data/signups.csv (blocked from the web by gate/data/.htaccess).
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$out = function ($ok, $msg, $code = 200) { http_response_code($code); echo json_encode(['ok' => $ok, 'message' => $msg]); exit; };

if ($_SERVER['REQUEST_METHOD'] !== 'POST') $out(false, 'Nope.', 405);
if (!empty($_POST['website'])) $out(true, "You're on the list.");               // honeypot: bots fill this in
$email = strtolower(trim((string)($_POST['email'] ?? '')));
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 120) $out(false, 'That email doesn’t look right.', 422);

$dir = __DIR__ . '/data'; $file = $dir . '/signups.csv';
if (!is_dir($dir)) @mkdir($dir, 0755, true);
$fh = fopen($file, 'c+');
if (!$fh) $out(false, 'Something went wrong. Try again in a bit.', 500);
flock($fh, LOCK_EX);
$existing = [];
while (($row = fgetcsv($fh)) !== false) $existing[] = $row[1] ?? '';
if (!in_array($email, $existing, true)) {
  fseek($fh, 0, SEEK_END);
  fputcsv($fh, [gmdate('c'), $email]);
}
flock($fh, LOCK_UN); fclose($fh);
$out(true, "You're on the list.");
