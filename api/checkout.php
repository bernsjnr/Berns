<?php
/* BERNS: creates a Stripe Checkout session for one print and returns its URL.
   The browser only says WHICH print, size and frame. The price is worked out here, never taken from the page.
   Keep the price tables in sync with assets/data.js (sizes, frames). Prices are PLACEHOLDERS until Berns confirms. */
header('Content-Type: application/json');
header('Cache-Control: no-store');

function fail($code, $msg) { http_response_code($code); echo json_encode(['error' => $msg]); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'POST only');

$cfgFile = __DIR__ . '/config.php';
if (!is_file($cfgFile)) fail(503, 'Checkout is not set up yet');
$cfg = require $cfgFile;

$sizes  = ['a3' => ['A3', 45, 50], 'a2' => ['A2', 70, 70], '50x70' => ['50 × 70 cm', 90, 85]];   // label, price £, frame add-on £
$frames = ['none' => 'Unframed', 'black' => 'Black frame', 'white' => 'White frame', 'oak' => 'Natural oak frame'];
$posters = [   // id => [name, image path]
  'mistakes-are-the-portals-of-discovery' => ['Mistakes are the portals of discovery', 'assets/posters/mistakes-are-the-portals-of-discovery.webp'],
  'love-god-love-people' => ['Love God, love people', 'assets/posters/love-god-love-people.webp'],
  'home-is-where-the-heart-is' => ['Home is where the heart is', 'assets/posters/home-is-where-the-heart-is.webp'],
  'dont-get-tired-of-doing-good' => ["Don't get tired of doing good", 'assets/posters/dont-get-tired-of-doing-good.webp'],
  'day-by-day' => ['Day by day', 'assets/posters/day-by-day.webp'],
  'in-gods-time' => ["In God's time", 'assets/posters/in-gods-time.webp'],
  'breathe' => ['Breathe', 'assets/posters/breathe.webp'],
  'pause' => ['Pause', 'assets/posters/pause.webp'],
  'warmth' => ['Warmth', 'assets/posters/warmth.webp'],
  'rest-is-productive' => ['Rest is productive', 'assets/posters/rest-is-productive.webp'],
  'breath-in-breath-out' => ['Breath in, breath out', 'assets/posters/breath-in-breath-out.webp'],
  'no-5' => ['No. 5', 'assets/posters/no-5.webp'],
];

$in = json_decode(file_get_contents('php://input'), true) ?: [];
$p = $in['poster'] ?? ''; $s = $in['size'] ?? ''; $f = $in['frame'] ?? '';
if (!isset($posters[$p], $sizes[$s], $frames[$f])) fail(400, 'Unknown print, size or frame');

$pence = ($sizes[$s][1] + ($f === 'none' ? 0 : $sizes[$s][2])) * 100;
$name  = $posters[$p][0] . ', ' . $sizes[$s][0] . ', ' . strtolower($frames[$f]);
$site  = rtrim($cfg['site_url'], '/');
$back  = $site . '/shop/print.html?p=' . rawurlencode($p);

$params = [
  'mode' => 'payment',
  'success_url' => $back . '&paid=1',
  'cancel_url'  => $back,
  'line_items' => [[
    'quantity' => 1,
    'price_data' => array_filter([
      'currency' => 'gbp',
      'unit_amount' => $pence,
      'tax_behavior' => !empty($cfg['automatic_tax']) ? 'inclusive' : null,
      'product_data' => ['name' => $name, 'images' => [$site . '/' . $posters[$p][1]]],
    ]),
  ]],
  'shipping_address_collection' => ['allowed_countries' => $cfg['countries']],
  'shipping_options' => [[
    'shipping_rate_data' => [
      'type' => 'fixed_amount',
      'display_name' => $cfg['postage_label'],
      'fixed_amount' => ['amount' => (int)$cfg['postage_pence'], 'currency' => 'gbp'],
    ],
  ]],
  'invoice_creation' => ['enabled' => 'true'],          // a proper receipt/invoice for every order
  'phone_number_collection' => ['enabled' => 'true'],   // for the courier
  'metadata' => ['poster' => $p, 'size' => $s, 'frame' => $f],
];
if (!empty($cfg['automatic_tax'])) $params['automatic_tax'] = ['enabled' => 'true'];

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt_array($ch, [
  CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20,
  CURLOPT_USERPWD => $cfg['secret_key'] . ':',
  CURLOPT_POSTFIELDS => http_build_query($params),
  CURLOPT_HTTPHEADER => ['Idempotency-Key: ' . bin2hex(random_bytes(16))],
]);
$out = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
$res = json_decode((string)$out, true);
if ($code !== 200 || empty($res['url'])) { error_log('Stripe checkout failed: ' . $out); fail(502, 'Could not start checkout'); }
echo json_encode(['url' => $res['url']]);
