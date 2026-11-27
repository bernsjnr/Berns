<?php
/* Mailing list sign-ups (Nov 2026). The welcome pop-up and the shop lock POST { name, email, list } here.
   Each sign-up is added to api/data/subscribers.csv (blocked from the web by api/data/.htaccess) and
   emailed to Berns. Needs PHP, so it only works on Hostinger, not GitHub Pages. */
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }

$in = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$name  = trim(mb_substr(strip_tags($in['name'] ?? ''), 0, 120));
$email = trim(mb_substr($in['email'] ?? '', 0, 200));
$list  = ($in['list'] ?? '') === 'shop' ? 'shop' : 'welcome';

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(422); echo '{"ok":false}'; exit; }

$dir = __DIR__ . '/data';
if (!is_dir($dir)) { mkdir($dir, 0750, true); }
if (!file_exists("$dir/.htaccess")) { file_put_contents("$dir/.htaccess", "Require all denied\nDeny from all\n"); }

$file = "$dir/subscribers.csv";
$new = !file_exists($file);
$fh = fopen($file, 'a');
if (!$fh) { http_response_code(500); echo '{"ok":false}'; exit; }
flock($fh, LOCK_EX);
if ($new) { fputcsv($fh, ['date', 'name', 'email', 'list']); }
/* a leading = + - @ would run as a formula in a spreadsheet: neutralise it */
$safe = fn($s) => preg_match('/^[=+\-@]/', $s) ? "'" . $s : $s;
fputcsv($fh, [date('c'), $safe($name), $safe($email), $list]);
flock($fh, LOCK_UN);
fclose($fh);

$subject = $list === 'shop' ? 'New sign-up: tell me when the shop opens' : 'New mailing list sign-up';
@mail('info@bernsds.com', $subject, "Name: $name\nEmail: $email\nFrom: $list pop-up\n",
  "From: Berns website <info@bernsds.com>\r\nReply-To: $email\r\n",
  /* envelope sender on bernsds.com, so SPF (which includes Hostinger) lines up with the From and passes DMARC */
  '-f info@bernsds.com');

echo '{"ok":true}';
