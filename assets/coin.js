/* =========================================================
   BERNS: the This Bed I Made coin in 3D (Nov 2026).
   A struck gold coin you can turn with a finger or the mouse. Both faces come from Coin concept 001:
   each face is a relief map (assets/work/tbim/coin-a.webp, coin-b.webp):
     red   = height (rim and raised design high, fields low)
     green = frosted (the raised design is matte, the fields are mirror, like a proof coin)
   Normal and roughness maps are built from those in the browser. three.js r128 from jsdelivr,
   loaded by case.js only when the coin is near the screen. The concept image shows until it is ready.
   ========================================================= */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = 'https://cdn.jsdelivr.net/npm/three@0.128.0/';
  const js = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const img = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

  /* From the relief map: a normal map, a roughness map and a colour map (recesses a touch darker) */
  const maps = (THREE, im, flip) => {
    const N = im.naturalWidth;
    const c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    if (flip) { x.translate(N, 0); x.scale(-1, 1); }
    x.drawImage(im, 0, 0);
    const src = x.getImageData(0, 0, N, N).data;
    const H = new Float32Array(N * N), F = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) { H[i] = src[i * 4] / 255; F[i] = src[i * 4 + 1] / 255; }
    const mk = () => { const k = document.createElement('canvas'); k.width = k.height = N; return k; };
    const nC = mk(), rC = mk(), cC = mk();
    const nD = nC.getContext('2d').createImageData(N, N), rD = rC.getContext('2d').createImageData(N, N), cD = cC.getContext('2d').createImageData(N, N);
    const S = 9; /* relief strength */
    const h = (px, py) => H[Math.min(N - 1, Math.max(0, py)) * N + Math.min(N - 1, Math.max(0, px))];
    for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
      const i = py * N + px, o = i * 4;
      const dx = (h(px + 1, py) - h(px - 1, py)) * S, dy = (h(px, py + 1) - h(px, py - 1)) * S;
      const l = Math.hypot(dx, dy, 1);
      nD.data[o] = (-dx / l * .5 + .5) * 255; nD.data[o + 1] = (dy / l * .5 + .5) * 255; nD.data[o + 2] = (1 / l * .5 + .5) * 255; nD.data[o + 3] = 255;
      const r = .22 + F[i] * .3; /* mirror fields, frosted design */
      rD.data[o] = rD.data[o + 1] = rD.data[o + 2] = r * 255; rD.data[o + 3] = 255;
      const g = .78 + H[i] * .22;
      cD.data[o] = 255 * g; cD.data[o + 1] = 255 * g; cD.data[o + 2] = 255 * g; cD.data[o + 3] = 255;
    }
    nC.getContext('2d').putImageData(nD, 0, 0); rC.getContext('2d').putImageData(rD, 0, 0); cC.getContext('2d').putImageData(cD, 0, 0);
    const tex = (cv, srgb) => { const t = new THREE.CanvasTexture(cv); t.anisotropy = 8; if (srgb) t.encoding = THREE.sRGBEncoding; t.center.set(.5, .5); return t; };
    return { normal: tex(nC), rough: tex(rC), shade: tex(cC, true) };
  };

  /* The milled edge: fine vertical reeds as a normal map round the side */
  const reeds = THREE => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 4;
    const x = c.getContext('2d');
    for (let i = 0; i < 64; i++) {
      const s = Math.sin(i / 64 * Math.PI * 2);
      x.fillStyle = `rgb(${Math.round((s * .55 + .5) * 255)},128,${Math.round((Math.sqrt(1 - s * s * .3) * .5 + .5) * 255)})`;
      x.fillRect(i, 0, 1, 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(160, 1);
    return t;
  };

  const build = async (host, THREE) => {
    const cfg = JSON.parse(host.dataset.coin);
    const [a, b] = await Promise.all(cfg.faces.map(img));
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.physicallyCorrectLights = true;
    const cv = renderer.domElement;
    cv.className = 'cs-coin-gl'; cv.setAttribute('aria-hidden', 'true');
    host.insertBefore(cv, host.firstChild);

    const scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new THREE.RoomEnvironment(), .03).texture;
    const camera = new THREE.PerspectiveCamera(24, 1, .1, 50);
    camera.position.set(0, 0, 6.2);
    const key = new THREE.DirectionalLight(0xFFF1D6, 2.4); key.position.set(-3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xFFE2A8, 1.6); rim.position.set(4, -2, -3); scene.add(rim);

    const gold = { color: 0xE9B949, metalness: 1, envMapIntensity: 1.5 };
    const A = maps(THREE, a, false), B = maps(THREE, b, false);
    const face = m => new THREE.MeshStandardMaterial(Object.assign({}, gold, { map: m.shade, normalMap: m.normal, normalScale: new THREE.Vector2(1, 1), roughnessMap: m.rough, roughness: 1 }));
    const edge = new THREE.MeshStandardMaterial(Object.assign({}, gold, { roughness: .32, normalMap: reeds(THREE), normalScale: new THREE.Vector2(.9, .9) }));
    const fa = face(A), fb = face(B);
    const geo = new THREE.CylinderGeometry(1, 1, .16, 160, 1);
    geo.rotateX(Math.PI / 2); /* caps face the camera: the top cap is the front */
    /* cylinder groups: 0 side, 1 top, 2 bottom. Turn each face's map so it reads upright. */
    A.shade.rotation = A.normal.rotation = A.rough.rotation = Math.PI / 2;
    B.shade.rotation = B.normal.rotation = B.rough.rotation = Math.PI / 2;
    const coin = new THREE.Mesh(geo, [edge, fa, fb]);
    const rig = new THREE.Group(); rig.add(coin); scene.add(rig);

    /* size to the box */
    const size = () => {
      const w = host.clientWidth, h = host.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      /* keep the coin about 62% of the shorter side */
      const fit = 1 / (Math.tan(camera.fov * Math.PI / 360) * Math.min(1, camera.aspect)) / .62;
      camera.position.z = fit; camera.updateProjectionMatrix();
    };
    size();
    new ResizeObserver(size).observe(host);

    /* turn: drag (with a flick of momentum), arrow keys, the Turn it button; idles round slowly */
    let ry = -.5, rx = .12, vy = reduce ? 0 : .004, drag = null, idle = !reduce, target = null, quiet = 0;
    const touch = () => { idle = false; quiet = performance.now(); };
    const btn = host.querySelector('.cs-coin-flip');
    host.addEventListener('pointerdown', e => {
      if (e.target === btn) return;
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, moved: false }; touch(); target = null;
      host.classList.add('grab');
    });
    addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) > 4 && Math.abs(dx) > Math.abs(dy)) { drag.moved = true; try { host.setPointerCapture(e.pointerId); } catch (_) {} }
      if (!drag.moved) return;
      const now = performance.now(), dt = Math.max(8, now - drag.t);
      ry += dx * .011; rx = Math.max(-.6, Math.min(.6, rx + dy * .006));
      vy = dx * .011 / dt * 16; quiet = now;
      drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
    });
    const up = e => { if (!drag || e.pointerId !== drag.id) return; drag = null; quiet = performance.now(); host.classList.remove('grab'); };
    addEventListener('pointerup', up); addEventListener('pointercancel', up);
    const flip = () => { touch(); vy = 0; target = Math.round((ry + Math.PI) / Math.PI) * Math.PI; if (window.BERNS_HAPTIC) window.BERNS_HAPTIC(12); };
    btn.hidden = false;
    btn.addEventListener('click', flip);
    host.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); touch(); target = null; vy += (e.key === 'ArrowRight' ? 1 : -1) * .06; }
      else if (e.key === 'Enter' && e.target === host) { e.preventDefault(); flip(); }
    });

    let on = true;
    new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) loop(); }, { rootMargin: '100px 0px' }).observe(host);
    let raf = 0;
    const loop = () => {
      cancelAnimationFrame(raf);
      if (!on) return;
      raf = requestAnimationFrame(loop);
      if (!drag) {
        if (target !== null) { ry += (target - ry) * .12; if (Math.abs(target - ry) < .001) { ry = target; target = null; quiet = performance.now(); } }
        else { ry += vy; vy *= .95; if (idle) vy += (.004 - vy) * .02; else if (!reduce && performance.now() - quiet > 4000) idle = true; }
        rx += (.12 - rx) * .04;
      }
      /* a gentle sway so the light runs across the relief even at rest */
      const t = performance.now() / 1000;
      rig.rotation.set(rx + (reduce ? 0 : Math.sin(t * .7) * .04), ry, 0);
      renderer.render(scene, camera);
    };
    loop();
    host.classList.add('ready');
  };

  const go = async () => {
    const hosts = document.querySelectorAll('[data-coin]');
    if (!hosts.length) return;
    try {
      if (!window.THREE) await js(T + 'build/three.min.js');
      if (!THREE.RoomEnvironment) await js(T + 'examples/js/environments/RoomEnvironment.js');
      const t = document.createElement('canvas');
      if (!(t.getContext('webgl2') || t.getContext('webgl'))) return; /* no WebGL: the concept image stays */
      for (const h of hosts) await build(h, THREE);
    } catch (e) { /* the concept image stays */ }
  };
  go();
})();
