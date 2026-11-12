/* =========================================================
   BERNS: print page (shop/print.html?p=<id>)
   Options, price, buy flow, and the 3D wall view (three.js r128).
   ========================================================= */
(() => {
  const D = BERNS;
  const base = document.body.dataset.base || '';
  const U = { url: p => base + p, price: (s, f) => s.price + (f.id === 'none' ? 0 : s.frame) };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const id = new URLSearchParams(location.search).get('p');
  const poster = D.posters.find(p => p.id === id) || D.posters[0];
  const qs = new URLSearchParams(location.search);
  const state = {
    size: D.sizes.find(s => s.id === qs.get('s')) || D.sizes[1],
    frame: D.frames.find(f => f.id === qs.get('f')) || D.frames[0],
    mode: 'free'
  };

  /* ---------- Panel ---------- */
  document.title = poster.name + '. Bernard Bannor';
  $('p-name').textContent = poster.name;
  $('p-ed').textContent = 'Edition of ' + poster.edition;
  $('p-name').closest('.pdp-info').classList.add('in');
  $('flat-img').src = U.url(poster.img);
  $('flat-img').alt = poster.name + ', print';

  const opts = (el, list, key, swatch) => {
    el.innerHTML = list.map(o => `<button type="button" data-id="${o.id}" aria-pressed="${state[key].id === o.id}">${swatch ? `<span class="sw" style="background:${o.swatch}"></span>` : ''}${o.label}</button>`).join('');
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      state[key] = list.find(o => o.id === b.dataset.id);
      el.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      sync(); rebuild(); prepAR();
    });
  };
  opts($('o-size'), D.sizes, 'size');
  opts($('o-frame'), D.frames, 'frame', true);

  function sync() {
    const total = U.price(state.size, state.frame);
    $('p-price').textContent = '£' + total;
    const key = `${state.size.id}-${state.frame.id}`;
    const link = poster.checkout && poster.checkout[key];
    const desc = `${poster.name}, ${state.size.label}, ${state.frame.label.toLowerCase()}, £${total}`;
    const mail = `mailto:info@bernsds.com?subject=${encodeURIComponent('Print order: ' + poster.name)}&body=${encodeURIComponent(`Hi Berns,\n\nI'd like to order: ${desc}.\n\nDelivery address:\n\n`)}`;
    const live = !link && !!D.checkoutEndpoint;
    $('buy').href = link || (live ? '#' : mail);
    $('buy').dataset.live = live ? '1' : '';
    $('buy').textContent = link || live ? `Buy now · £${total}` : `Order by email · £${total}`;
    if (qs.get('paid') !== '1') {
      $('buy-note').hidden = !!link || live;
      $('buy-note').innerHTML = `Online checkout is being set up. Email me your order and I'll send a secure payment link.`;
    }
  }
  sync();

  /* Stripe Checkout through api/checkout.php: the server sets the price, Stripe takes the payment */
  $('buy').addEventListener('click', async e => {
    if (!$('buy').dataset.live) return;
    e.preventDefault();
    const btn = $('buy'), label = btn.textContent; btn.textContent = 'One moment…';
    try {
      const r = await fetch(base + D.checkoutEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ poster: poster.id, size: state.size.id, frame: state.frame.id }) });
      const j = await r.json();
      if (!j.url) throw new Error(j.error || 'No checkout');
      location.href = j.url;
    } catch (err) {
      btn.textContent = label;
      $('buy-note').hidden = false;
      $('buy-note').textContent = 'Checkout did not open. Please try again, or email info@bernsds.com and I will sort it.';
    }
  });
  if (qs.get('paid') === '1') {
    $('buy-note').hidden = false;
    $('buy-note').textContent = 'Thank you. Your order is in. A receipt is on its way to your email and I will post your print once it is checked.';
  }

  const from = Math.min(...D.sizes.map(z => z.price));
  $('more').innerHTML = D.posters.filter(p => p !== poster).slice(0, 4).map(p => `
    <a class="more-item" href="print.html?p=${encodeURIComponent(p.id)}">
      <span class="more-img"><img src="${U.url(p.img)}" alt="" loading="lazy" draggable="false"></span>
      <span class="more-name">${p.name}</span>
      <span class="more-meta mono">From £${from}</span>
    </a>`).join('');

  /* ---------- View modes ---------- */
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  function setMode(m) {
    state.mode = m;
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
    $('flat').hidden = m !== 'flat';
    $('hint').hidden = m === 'flat';
    $('hint').textContent = m === 'free' ? 'Drag to turn it' : 'Drag to look around';
    $('stage').dataset.mode = m;
    if (m === 'flat') { running = false; if (renderer) renderer.domElement.style.display = 'none'; return; }
    if (!init3D()) { setMode('flat'); return; }
    renderer.domElement.style.display = '';
    applyMode(); resetView();
    if (!running) { running = true; loop(); }
  }

  /* ---------- 3D ---------- */
  let renderer, scene, camera, controls, group, room = [], running = false, ready = false, tex = null;
  const C = { ink: '#1A1A1A', wall: '#E6E7E9', floor: '#CDD0D3', bg: '#1A1A1A' };

  function grainTex(base, line) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 140; i++) {
      x.strokeStyle = line; x.globalAlpha = Math.random() * .18; x.lineWidth = Math.random() * 1.6 + .3;
      const y = Math.random() * 256; x.beginPath(); x.moveTo(0, y);
      for (let k = 0; k <= 8; k++) x.lineTo(k * 32, y + Math.sin(k * .9 + i) * 2.2);
      x.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; return t;
  }
  function labelTex() {
    const c = document.createElement('canvas'); c.width = 600; c.height = 320; const x = c.getContext('2d');
    x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, 600, 320); x.fillStyle = C.ink;
    x.font = `900 60px 'scale-variable', 'Helvetica Neue', Arial, sans-serif`; x.fillText('BERNS', 36, 96);
    x.font = `700 22px 'neue-haas-grotesk-text', 'Helvetica Neue', Arial, sans-serif`;
    x.fillText('SIGNED AND NUMBERED BY HAND', 36, 160); x.fillText(poster.name.toUpperCase(), 36, 200);
    x.fillRect(36, 232, 48, 3);
    x.font = `700 40px 'neue-haas-grotesk-text', 'Helvetica Neue', Arial, sans-serif`; x.fillText(`00 / ${poster.edition}`, 36, 290);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }

  function init3D() {
    if (ready) return true;
    if (!window.THREE || !THREE.OrbitControls) return false;
    const stage = $('stage');
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch (e) { return false; }
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.prepend(renderer.domElement);
    scene = new THREE.Scene(); scene.background = new THREE.Color(C.wall);
    camera = new THREE.PerspectiveCamera(32, 1, .05, 60);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    Object.assign(controls, { enableDamping: true, dampingFactor: .08, enablePan: false, enableZoom: false });
    let idle = 0;
    controls.addEventListener('start', () => { clearTimeout(idle); controls.autoRotate = false; });
    controls.addEventListener('end', () => { clearTimeout(idle); idle = setTimeout(() => { controls.autoRotate = state.mode === 'free' && !reduce; }, 2500); });
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcdd0d3, .55));
    const sun = new THREE.DirectionalLight(0xffffff, .55); sun.position.set(1.6, 3.2, 2.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: .5, far: 8 }); sun.shadow.bias = -.0004; sun.shadow.radius = 4; scene.add(sun);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), new THREE.MeshStandardMaterial({ color: lin(C.wall), roughness: 1 }));
    wall.position.set(0, 2.5, -.035); wall.receiveShadow = true;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), new THREE.MeshStandardMaterial({ color: lin(C.floor), roughness: .9 }));
    floor.rotation.x = -Math.PI / 2; floor.position.z = 3.5; floor.receiveShadow = true;
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.5, .42, .38), new THREE.MeshStandardMaterial({ color: lin(C.ink), roughness: .7 }));
    bench.position.set(0, .21, .2); bench.castShadow = bench.receiveShadow = true;
    room = [wall, floor, bench]; room.forEach(m => scene.add(m));
    new THREE.TextureLoader().load(U.url(poster.img), t => { t.encoding = THREE.sRGBEncoding; t.format = THREE.RGBFormat; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex = t; rebuild(); });
    new ResizeObserver(resize).observe(stage); resize();
    ready = true; rebuild(); return true;
  }
  function resize() {
    if (!renderer) return; const s = $('stage'); const w = s.clientWidth, h = s.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  /* Builds the print (sheet or framed) as a THREE.Group, in metres.
     forExport drops the glass (transparent layers export badly to AR). */
  function makeGroup(forExport) {
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    const g = new THREE.Group();
    const [pwm, phm] = state.size.mm, pw = pwm / 1000, ph = phm / 1000;
    const posterMat = new THREE.MeshStandardMaterial({ map: tex, color: tex ? 0xffffff : lin('#CDD0D3'), roughness: .85 });
    const f = state.frame; let H;
    if (f.id === 'none') {
      const paper = new THREE.MeshStandardMaterial({ color: lin('#FBFBFA'), roughness: .9 });
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, .0015), [paper, paper, paper, paper, posterMat, posterMat]);
      sheet.castShadow = true; g.add(sheet); H = ph; g.userData.depth = .002;
    } else {
      const m = pw < .35 ? .05 : .065, fw = .024, fd = .032, W = pw + 2 * m + 2 * fw; H = ph + 2 * m + 2 * fw;
      const wood = new THREE.MeshStandardMaterial({ color: 0xffffff, map: grainTex(f.col, f.grain), roughness: .62 });
      const bar = (w, h, x, y, rot) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, fd), wood); b.position.set(x, y, 0); b.castShadow = b.receiveShadow = true;
        if (rot) { b.material = wood.clone(); b.material.map = wood.map.clone(); b.material.map.rotation = Math.PI / 2; b.material.map.needsUpdate = true; }
        g.add(b);
      };
      bar(W, fw, 0, H / 2 - fw / 2); bar(W, fw, 0, -H / 2 + fw / 2); bar(fw, H - 2 * fw, -W / 2 + fw / 2, 0, true); bar(fw, H - 2 * fw, W / 2 - fw / 2, 0, true);
      const back = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * fw, H - 2 * fw, .004), new THREE.MeshStandardMaterial({ color: lin('#B79A73'), roughness: 1 }));
      back.position.z = -fd / 2 + .002; g.add(back);
      const mount = new THREE.Mesh(new THREE.PlaneGeometry(W - 2 * fw, H - 2 * fw), new THREE.MeshStandardMaterial({ color: lin('#FBFBFA'), roughness: .95 }));
      mount.position.z = -fd / 2 + .0045; mount.receiveShadow = true; g.add(mount);
      const art = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), posterMat); art.position.z = -fd / 2 + .005; g.add(art);
      if (!forExport) {
        const glass = new THREE.Mesh(new THREE.PlaneGeometry(W - 2 * fw, H - 2 * fw), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .07, roughness: .05, metalness: .2, depthWrite: false }));
        glass.position.z = fd / 2 - .003; g.add(glass);
        const lbl = new THREE.Mesh(new THREE.PlaneGeometry(.15, .08), new THREE.MeshStandardMaterial({ map: labelTex(), roughness: .9 }));
        lbl.rotation.y = Math.PI; lbl.position.set(0, -H / 2 + .12, -fd / 2 - .0005); g.add(lbl);
        const wire = new THREE.Mesh(new THREE.CylinderGeometry(.0012, .0012, W * .62, 8), new THREE.MeshStandardMaterial({ color: lin('#8A8A8A'), metalness: .8, roughness: .4 }));
        wire.rotation.z = Math.PI / 2; wire.position.set(0, H / 2 - .12, -fd / 2 - .004); g.add(wire);
      }
      g.userData.depth = fd;
    }
    g.userData.H = H;
    return g;
  }

  function rebuild() {
    if (!ready) return;
    if (group) { scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    group = makeGroup(false);
    group.position.set(0, Math.max(1.45, .42 + .18 + group.userData.H / 2), group.userData.depth / 2 - .03 + .001);
    scene.add(group);
    applyMode();
  }
  function resetView() {
    if (!group) return; const c = group.position.clone();
    const room = state.mode === 'room';
    const dist = room ? 4.6 : 0.2 + group.userData.H * 1.9;
    if (room) c.y = 1.05;   // frame the bench too, for scale
    controls.target.copy(c);
    camera.position.set(c.x + (room ? .6 : 0), c.y + (room ? .1 : .02), c.z + dist); controls.update();
  }
  function applyMode() {
    if (!group) return;
    const free = state.mode === 'free'; room.forEach(m => m.visible = !free);
    scene.background = new THREE.Color(free ? C.bg : C.wall);
    controls.minAzimuthAngle = free ? -Infinity : -1.0; controls.maxAzimuthAngle = free ? Infinity : 1.0;
    controls.minPolarAngle = free ? .15 : .95; controls.maxPolarAngle = free ? Math.PI - .15 : 1.72;
    controls.autoRotate = free && !reduce; controls.autoRotateSpeed = 2.4;
    group.position.z = free ? 0 : group.userData.depth / 2 - .03 + .001;
  }
  function loop() { if (!running) return; requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); }

  /* ---------- AR: "View in your room" ----------
     Phones: export the chosen print + frame as a GLB, hand it to <model-viewer>,
     which opens Quick Look on iPhone (it converts to USDZ itself) or WebXR on Android.
     Computers: show a QR code that opens this page, with the same choices, on a phone. */
  const arBtn = $('ar-btn'), mv = $('mv');
  const isIOS = (() => { const a = document.createElement('a'); return !!(a.relList && a.relList.supports && a.relList.supports('ar')); })();
  let isAndroidAR = false;
  if (navigator.xr && navigator.xr.isSessionSupported) navigator.xr.isSessionSupported('immersive-ar').then(v => { isAndroidAR = v; if (v) prepAR(); }).catch(() => {});
  const phoneAR = () => isIOS || isAndroidAR;
  let arURL = null, arPending = null;

  function ensureTexture() {
    if (tex) return Promise.resolve();
    return new Promise((res, rej) => new THREE.TextureLoader().load(U.url(poster.img), t => { t.encoding = THREE.sRGBEncoding; t.format = THREE.RGBFormat; tex = t; res(); }, undefined, rej));
  }
  function prepAR() {
    if (!phoneAR() || !window.THREE || !THREE.GLTFExporter) return Promise.resolve();
    arPending = ensureTexture().then(() => new Promise(res => {
      const g = makeGroup(true);
      new THREE.GLTFExporter().parse(g, glb => {
        if (arURL) URL.revokeObjectURL(arURL);
        arURL = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
        mv.addEventListener('load', () => res(), { once: true });
        mv.src = arURL;
      }, { binary: true });
    }));
    return arPending;
  }
  if (isIOS) addEventListener('load', prepAR);

  arBtn.addEventListener('click', async () => {
    if (phoneAR()) {
      arBtn.textContent = 'Opening…';
      try { await (arPending || prepAR()); await mv.activateAR(); }
      finally { arBtn.textContent = 'View in your room'; }
      return;
    }
    const box = $('ar-qr');
    box.hidden = !box.hidden;
    if (!box.hidden && window.QRCode) {
      const link = new URL(location.href); link.searchParams.set('s', state.size.id); link.searchParams.set('f', state.frame.id);
      $('qr').innerHTML = '';
      new QRCode($('qr'), { text: link.href, width: 224, height: 224, colorDark: '#1A1A1A', colorLight: '#F1F2F3', correctLevel: QRCode.CorrectLevel.M });
    }
  });

  /* opens turning on its own, double-sided */
  setMode('free');
})();
