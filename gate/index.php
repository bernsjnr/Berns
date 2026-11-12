<?php
// Password gate. Correct password sets the unlock cookie that .htaccess checks.
$cfg = @include __DIR__ . '/config.php';
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
if (!is_array($cfg)) { http_response_code(503); echo 'Gate not set up. Run gate/setup.sh.'; exit; }

$self = $_SERVER['REQUEST_URI'] ?? '/';
$dest = (strpos($self, '/gate/') === 0 || $self === '') ? '/' : $self;
$bad  = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $pw = (string)($_POST['password'] ?? '');
  if (hash_equals($cfg['hash'], hash('sha256', $cfg['salt'] . $pw))) {
    setcookie('berns_gate', $cfg['token'], [
      'expires' => time() + 60 * 60 * 24 * 30, 'path' => '/',
      'secure' => !empty($_SERVER['HTTPS']), 'httponly' => true, 'samesite' => 'Lax',
    ]);
    header('Location: ' . $dest, true, 303);
    exit;
  }
  sleep(1); // slow guessing
  $bad = true;
  http_response_code(401);
} else {
  http_response_code(401);
}
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#1A1A1A">
<title>Berns. Private</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="https://use.typekit.net/tdx4jgk.css">
<style>
:root{--blue:#080CDF;--ink:#1A1A1A;--white:#fff}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{background:var(--ink);color:var(--white);font-family:'neue-haas-grotesk-text','Helvetica Neue',Arial,sans-serif;font-size:17px;-webkit-font-smoothing:antialiased;display:grid;place-items:center;padding:24px}
::selection{background:var(--blue)}
main{width:100%;max-width:420px;text-align:center}
h1{font-family:'scale-variable','Arial Black',sans-serif;font-variation-settings:'wdth' 125,'wght' 900;text-transform:uppercase;font-size:clamp(34px,9vw,56px);line-height:1}
p{margin-top:16px;font-family:'neue-haas-grotesk-display','Helvetica Neue',Arial,sans-serif;font-weight:700}
form{margin-top:36px;display:grid;gap:12px}
input[type=password]{font:inherit;color:var(--white);background:transparent;border:1px solid var(--white);border-radius:999px;padding:18px 26px;text-align:center;width:100%}
input[type=password]:focus-visible{outline:2px solid var(--white);outline-offset:4px}
.u{position:absolute;opacity:0;pointer-events:none;height:1px;width:1px}
button{font:inherit;font-family:'neue-haas-grotesk-text',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.16em;font-size:13px;color:var(--ink);background:var(--white);border:0;border-radius:999px;padding:18px 26px;cursor:pointer;transition:background .25s,color .25s}
button:hover,button:focus-visible{background:var(--blue);color:var(--white)}
.err{margin-top:20px;font-size:14px}
</style>
</head>
<body>
<main>
  <h1>Bernard Bannor</h1>
  <p>This site is private for now.</p>
  <form method="post" autocomplete="on">
    <input class="u" type="text" name="username" value="berns" autocomplete="username" tabindex="-1" aria-hidden="true">
    <label class="u" for="pw">Password</label>
    <input id="pw" type="password" name="password" placeholder="Password" autocomplete="current-password" required autofocus>
    <button type="submit">Enter</button>
  </form>
  <?php if ($bad): ?><p class="err" role="alert">That password isn't right.</p><?php endif; ?>
</main>
</body>
</html>
