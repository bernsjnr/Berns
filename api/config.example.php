<?php
/* Copy this file to api/config.php on Hostinger and fill it in. config.php is gitignored: it never goes in the repo.
   Start with the TEST secret key (sk_test_...), switch to the live key (sk_live_...) when you are ready to sell. */
return [
  'secret_key'    => 'sk_test_REPLACE_ME',
  'site_url'      => 'https://bernsds.com',   // no trailing slash
  'countries'     => ['GB'],                  // where you will post to, e.g. ['GB','IE','FR']
  'postage_pence' => 500,                     // PLACEHOLDER flat postage in pence (500 = £5)
  'postage_label' => 'Tracked postage',
  'automatic_tax' => false,                   // true only once VAT registered and Stripe Tax is switched on
];
