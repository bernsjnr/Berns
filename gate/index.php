<?php
// Holding page: spinning "under construction" sign + mailing list. The password unlocks the real site.
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
  http_response_code(503);
  header('Retry-After: 86400');
}
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#1A1A1A">
<title>Bernard Bannor. Under construction</title>
<meta name="description" content="Berns' site is currently under construction. Join the mailing list.">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="https://use.typekit.net/tdx4jgk.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@700&display=swap">
<style>
:root{--blue:#080CDF;--ink:#1A1A1A;--white:#fff;--mono:'Space Mono',ui-monospace,Menlo,monospace;
  --scale:'scale-variable','Arial Black','Helvetica Neue',Arial,sans-serif;--gut:max(24px,env(safe-area-inset-left),env(safe-area-inset-right))}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden;overscroll-behavior:none}
body{background:var(--ink);color:var(--white);font-family:'neue-haas-grotesk-text','Helvetica Neue',Arial,sans-serif;font-size:17px;-webkit-font-smoothing:antialiased;
  display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;height:100vh;height:100dvh;
  cursor:url(/assets/cursor/arrow.png) 0 0,default;cursor:-webkit-image-set(url(/assets/cursor/arrow.png) 1.3333x) 0 0,default}
button{font:inherit;color:inherit;background:none;border:0;border-radius:0;-webkit-appearance:none;appearance:none;
  cursor:url(/assets/cursor/hand.png) 8 0,pointer;cursor:-webkit-image-set(url(/assets/cursor/hand.png) 1.3333x) 8 0,pointer}
input{font:inherit;-webkit-appearance:none;appearance:none;border-radius:0;cursor:text}
::selection{background:var(--blue);color:var(--white)}
:focus-visible{outline:2px solid var(--white);outline-offset:4px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.scale{font-family:var(--scale);font-variation-settings:'wdth' 125,'wght' 900;font-weight:900;text-transform:uppercase;letter-spacing:0}
.mono{font-family:var(--mono);font-weight:700;font-size:12px;line-height:1.2;letter-spacing:.04em;text-transform:uppercase}

/* Bar: name left, private lock right. Wraps instead of overlapping. */
.bar{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;
  padding:max(22px,env(safe-area-inset-top)) var(--gut) 0;position:relative;z-index:2}
.name{font-size:clamp(14px,1.6vw,24px);line-height:1;user-select:none;-webkit-user-select:none;white-space:nowrap}
.lock{display:flex;flex-direction:column;align-items:flex-end;gap:8px;margin-left:auto}
.lock-btn{display:flex;gap:8px;align-items:center;padding:6px 0;line-height:1}
.lock-btn svg{width:12px;height:12px;shape-rendering:crispEdges;flex:none}
.lock-btn .t{background-image:linear-gradient(currentColor,currentColor);background-size:0 1px;background-repeat:no-repeat;background-position:0 100%;transition:background-size .25s}
.lock-btn:hover .t,.lock-btn:focus-visible .t{background-size:100% 1px}
.lock form{display:none;gap:8px}
.lock.open form{display:flex}
.lock.open .lock-btn{display:none}
.lock input[type=password]{font-size:16px;width:220px;min-width:0;color:var(--white);background:transparent;border:1px solid var(--white);border-radius:999px;padding:0 18px;height:40px}
.lock .btn{height:40px;padding:0 18px}
.u{position:absolute;opacity:0;pointer-events:none;height:1px;width:1px}

/* Sign: fills whatever space is left between the bar and the form */
#stage{position:relative;min-height:0;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:grab}
#stage:active{cursor:grabbing}
#stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block;image-rendering:pixelated;image-rendering:crisp-edges;image-rendering:pixelated}
.fallback{position:absolute;inset:0;display:none;place-items:center;text-align:center;padding:24px;font-size:14px;line-height:2}
.nogl .fallback{display:grid}

/* Mailing list */
.join{display:grid;justify-items:center;gap:14px;padding:12px var(--gut) max(28px,calc(env(safe-area-inset-bottom) + 12px));position:relative;z-index:2}
.join form{display:flex;gap:10px;width:100%;max-width:480px}
.join input[type=email]{flex:1 1 auto;width:100%;min-width:0;font-size:16px;color:var(--white);background:transparent;border:1px solid var(--white);border-radius:999px;padding:0 24px;height:52px}
input::placeholder{color:var(--white);opacity:1}
.btn{display:inline-flex;align-items:center;justify-content:center;font-size:14px;line-height:1;color:var(--ink);background:var(--white);border-radius:999px;padding:0 26px;height:52px;white-space:nowrap;transition:background .25s,color .25s}
.btn:hover,.btn:focus-visible{background:var(--blue);color:var(--white)}
.hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}
.msg{min-height:1.2em;text-align:center}

@media (max-width:560px){
  .join form{flex-direction:column}
  .join input[type=email]{flex:none}
  .join .btn{width:100%}
  .lock.open{flex-basis:100%;align-items:stretch}
  .lock.open form{width:100%}
  .lock.open{min-width:0}
  .lock.open input[type=password]{flex:1 1 0;width:0}
  .lock .err{align-self:flex-end}
}
@media (max-height:520px){
  .join{gap:8px;padding-top:8px;padding-bottom:max(14px,env(safe-area-inset-bottom))}
  .join input[type=email],.join .btn{height:44px}
  .bar{padding-top:max(14px,env(safe-area-inset-top))}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<header class="bar">
  <p class="name scale">Bernard Bannor</p>
  <div class="lock<?= $bad ? ' open' : '' ?>" id="lock">
    <button class="lock-btn mono" type="button" id="lockBtn" aria-expanded="<?= $bad ? 'true' : 'false' ?>" aria-controls="lockForm">
      <svg viewBox="0 0 7 7" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M2 0h3v1h1v2h1v4H0V3h1V1h1zm0 1v2h3V1z"/></svg><span class="t">Private</span>
    </button>
    <form id="lockForm" method="post" autocomplete="on">
      <input class="u" type="text" name="username" value="berns" autocomplete="username" tabindex="-1" aria-hidden="true">
      <label class="sr" for="pw">Password</label>
      <input id="pw" type="password" name="password" placeholder="Password" autocomplete="current-password" required>
      <button class="btn scale" type="submit">Enter</button>
    </form>
    <?php if ($bad): ?><p class="err mono" role="alert">Wrong password</p><?php endif; ?>
  </div>
</header>

<main id="stage">
  <h1 class="sr">Berns' site is currently under construction</h1>
  <canvas id="c" aria-hidden="true"></canvas>
  <div class="fallback mono" aria-hidden="true">Berns' site is<br>currently under<br>construction</div>
</main>

<section class="join" aria-label="Mailing list">
  <p class="mono">Get an email when it opens</p>
  <form id="join" method="post" action="/gate/subscribe.php" novalidate>
    <label class="sr" for="em">Email address</label>
    <input id="em" type="email" name="email" placeholder="Your email" autocomplete="email" inputmode="email" required>
    <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="btn scale" type="submit">Join the list</button>
  </form>
  <p class="msg mono" id="msg" role="status" aria-live="polite"></p>
</section>

<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
<script>
(() => {
  /* ---------- lock + mailing list ---------- */
  const lock = document.getElementById('lock'), lockBtn = document.getElementById('lockBtn');
  lockBtn.addEventListener('click', () => { lock.classList.add('open'); lockBtn.setAttribute('aria-expanded', 'true'); document.getElementById('pw').focus(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && lock.classList.contains('open')) { lock.classList.remove('open'); lockBtn.setAttribute('aria-expanded', 'false'); lockBtn.focus(); } });
  if (lock.classList.contains('open')) document.getElementById('pw').focus();

  const form = document.getElementById('join'), msg = document.getElementById('msg');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const em = form.email.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(em)) { msg.textContent = 'That email doesn’t look right.'; return; }
    msg.textContent = 'One sec…';
    try {
      const r = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      const j = await r.json();
      msg.textContent = j.message || 'Done.';
      if (j.ok) form.reset();
    } catch (err) { msg.textContent = 'Something went wrong. Try again in a bit.'; }
  });

  /* ---------- the sign ---------- */
  const stage = document.getElementById('stage');
  if (!window.THREE) { document.body.classList.add('nogl'); stage.classList.add('nogl'); return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PAL = [[245,200,0],[203,152,0],[17,17,17],[214,32,31]]; // yellow, dark yellow, black, red
  const snap = (ctx, w, h) => {
    const d = ctx.getImageData(0, 0, w, h), a = d.data;
    for (let i = 0; i < a.length; i += 4) {
      let best = 0, bd = 1e9;
      for (let p = 0; p < PAL.length; p++) {
        const dr = a[i] - PAL[p][0], dg = a[i+1] - PAL[p][1], db = a[i+2] - PAL[p][2], dd = dr*dr + dg*dg + db*db;
        if (dd < bd) { bd = dd; best = p; }
      }
      a[i] = PAL[best][0]; a[i+1] = PAL[best][1]; a[i+2] = PAL[best][2]; a[i+3] = 255;
    }
    ctx.putImageData(d, 0, 0);
  };

  /* 5x7 pixel letters (only the ones the sign needs), so the type is crisp and needs no font */
  const GLYPH = {
    B:['11110','10001','10001','11110','10001','10001','11110'], E:['11111','10000','10000','11110','10000','10000','11111'],
    R:['11110','10001','10001','11110','10100','10010','10001'], N:['10001','11001','10101','10101','10011','10001','10001'],
    S:['01111','10000','10000','01110','00001','00001','11110'], "'":['00100','00100','01000','00000','00000','00000','00000'],
    I:['11111','00100','00100','00100','00100','00100','11111'], T:['11111','00100','00100','00100','00100','00100','00100'],
    C:['01111','10000','10000','10000','10000','10000','01111'], U:['10001','10001','10001','10001','10001','10001','01110'],
    L:['10000','10000','10000','10000','10000','10000','11111'], Y:['10001','10001','01010','00100','00100','00100','00100'],
    D:['11110','10001','10001','10001','10001','10001','11110'], O:['01110','10001','10001','10001','10001','10001','01110'], ' ':['00000','00000','00000','00000','00000','00000','00000']
  };
  const makeTexture = () => {
    const W = 192, H = 384, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const px = (x, y, c, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    px(0, 0, '#F5C800', W, H);
    // ridged base, like the real sign
    for (let y = 300; y < 372; y++) for (let x = 9; x < W - 9; x++) if (((y + Math.abs(x - 96) * 0.5) | 0) % 12 < 3) px(x, y, '#CB9800');
    // warning triangle
    const k = 51 / 99;
    for (let y = 78; y <= 177; y++) for (let x = 30; x <= 162; x++) {
      const dx = Math.abs(x - 95.5), outer = dx <= (y - 78) * k, inner = dx <= (y - 78) * k - 9 && y <= 168;
      if (outer && !inner) px(x, y, '#D6201F');
    }
    // hard hat
    const hat = ['.....kkkkkk.....', '....kkkkkkkk....', '...kkyykkkkkk...', '..kkkkkkkkkkkk..', '..kkkkkkkkkkkk..', '.kkkkkkkkkkkkkk.', 'kkkkkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkk'];
    hat.forEach((row, ry) => [...row].forEach((ch, rx) => { if (ch === 'k') px(72 + rx * 3, 138 + ry * 3, '#111', 3, 3); }));
    // words, 2px per art pixel
    ["BERNS' SITE", 'IS CURRENTLY', 'UNDER', 'CONSTRUCTION'].forEach((line, li) => {
      const x0 = Math.round(96 - (line.length * 12 - 2) / 2), y0 = 200 + li * 22;
      [...line].forEach((ch, ci) => GLYPH[ch].forEach((row, ry) => [...row].forEach((bit, rx) => { if (bit === '1') px(x0 + ci * 12 + rx * 2, y0 + ry * 2, '#111', 2, 2); })));
    });
    snap(g, W, H);
    const t = new THREE.CanvasTexture(cv);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4;
    return t;
  };

  const build = () => {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, alpha: true }); }
    catch (e) { stage.classList.add('nogl'); document.body.classList.add('nogl'); return; }
    renderer.setPixelRatio(1);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

    const ramp = new THREE.DataTexture(Uint8Array.from([130, 195, 255]), 3, 1, THREE.LuminanceFormat);
    ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
    const tex = makeTexture();
    const bodyMat = new THREE.MeshToonMaterial({ color: 0xF5C800, gradientMap: ramp });
    const faceMat = new THREE.MeshToonMaterial({ map: tex, gradientMap: ramp });

    const H = 2, BW = 1.0, TW = 0.76;
    const outline = () => {
      const s = new THREE.Shape();
      s.moveTo(-BW / 2, 0); s.lineTo(BW / 2, 0); s.lineTo(TW / 2, H); s.lineTo(-TW / 2, H); s.lineTo(-BW / 2, 0);
      const hole = new THREE.Path();
      hole.moveTo(-0.19, 1.70); hole.lineTo(0.19, 1.70); hole.lineTo(0.19, 1.89); hole.lineTo(-0.19, 1.89); hole.lineTo(-0.19, 1.70);
      s.holes.push(hole);
      return s;
    };
    const shape = outline();
    const bodyG = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false }); bodyG.translate(0, -H, -0.03);
    const faceG = new THREE.ShapeGeometry(shape); faceG.translate(0, -H, 0);
    { // UVs from position
      const p = faceG.attributes.position, uv = faceG.attributes.uv;
      for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + BW / 2) / BW, (p.getY(i) + H) / H);
    }
    const panel = () => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(bodyG, bodyMat));
      const f = new THREE.Mesh(faceG, faceMat); f.position.z = 0.032; g.add(f);
      const b = new THREE.Mesh(faceG, faceMat); b.position.z = -0.032; b.rotation.y = Math.PI; g.add(b);
      return g;
    };
    const sign = new THREE.Group();
    const LEAN = 0.26;
    const a = panel(); a.rotation.x = -LEAN;
    const bPivot = new THREE.Group(); bPivot.rotation.y = Math.PI; const b = panel(); b.rotation.x = -LEAN; bPivot.add(b);
    const top = new THREE.Group(); top.position.y = H * Math.cos(LEAN); top.add(a, bPivot); sign.add(top);
    // hinge knuckle
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.07, 0.1), new THREE.MeshToonMaterial({ color: 0xCB9800, gradientMap: ramp })); hinge.position.y = H * Math.cos(LEAN); sign.add(hinge);
    scene.add(sign);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: 0x0E0E0E }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; shadow.scale.set(0.85, 0.5, 1); scene.add(shadow);

    const sun = new THREE.DirectionalLight(0xffffff, 0.6); sun.position.set(-2.5, 4, 3.5); scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // size: draw small, show big, so every pixel is a chunky square
    const resize = () => {
      const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight), PX = 2;
      renderer.setSize(Math.ceil(w / PX), Math.ceil(h / PX), false);
      cam.aspect = w / h;
      // fit the whole sign (2 tall, about 1.6 wide as it turns) with a margin, whatever the shape of the space
      const wantH = Math.max(2.55, 1.9 / cam.aspect);
      const dist = wantH / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
      cam.position.set(0, 0.97 + dist * 0.16, dist); cam.lookAt(0, 0.97, 0); cam.updateProjectionMatrix();
    };
    resize(); (window.ResizeObserver ? new ResizeObserver(resize).observe(stage) : addEventListener('resize', resize));

    // spin: slow auto turn, drag to spin it yourself (no clicking through to anything)
    let ang = reduce ? -0.55 : 0.4, vel = reduce ? 0 : 0.9, drag = false, lx = 0, lt = 0, dv = 0;
    const AUTO = reduce ? 0 : 0.9;
    stage.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - lx; lx = e.clientX; ang += dx * 0.012; dv = dx * 0.012 * 60; });
    const end = () => { if (drag) { drag = false; vel = dv; dv = 0; } };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);

    let last = performance.now(), t = 0;
    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      if (!drag) { vel += (AUTO - vel) * Math.min(1, dt * 0.8); ang += vel * dt; }
      sign.rotation.y = ang;
      if (!reduce) sign.position.y = Math.sin(t * 1.6) * 0.03;
      renderer.render(scene, cam);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  build();
})();
</script>
</body>
</html>
