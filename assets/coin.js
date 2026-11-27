/* =========================================================
   BERNS: the This Bed I Made coin in 3D (Nov 2026).
   The struck coin you can turn with a finger or the mouse, after the real one (Nov 2026): antique brass,
   a raised plain rim, THIS BED I MADE • twice round a dark sunk band, a satin field with the face cut in.
   Each face is a relief map (assets/work/tbim/coin-a.webp, coin-b.webp, made from Coin concept 001):
     red   = height (rim, lettering and field high; band and cut lines low)
     green = patina (the dark antiquing that sits in the recesses)
   Normal and roughness maps are built from those in the browser. Also the 12 inch sleeve ([data-sleeve]):
   a thin card with the cover painting front and the back cover behind. three.js r128 from jsdelivr,
   loaded by case.js only when the coin is near the screen. The concept image shows until it is ready.
   ========================================================= */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = 'https://cdn.jsdelivr.net/npm/three@0.128.0/';
  const js = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const img = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

  /* From the relief map: a normal map, a roughness map and a colour map (brass, dark in the recesses) */
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
      /* satin brass, worn brighter on the high points; patina is dark, rough and slightly grainy */
      const grain = (Math.random() - .5) * .06, P = F[i], hi = Math.max(0, H[i] - .8) * 2.5;
      const r = Math.min(1, .42 - hi * .14 + P * .4 + grain * .5);
      rD.data[o] = rD.data[o + 1] = rD.data[o + 2] = r * 255; rD.data[o + 3] = 255;
      const k = 1 - P * (.62 + grain);
      cD.data[o] = Math.min(255, (200 + hi * 34 + grain * 110) * k + 26 * P); cD.data[o + 1] = Math.min(255, (172 + hi * 30 + grain * 95) * k + 24 * P); cD.data[o + 2] = Math.min(255, (110 + hi * 20 + grain * 60) * k + 18 * P); cD.data[o + 3] = 255;
    }
    nC.getContext('2d').putImageData(nD, 0, 0); rC.getContext('2d').putImageData(rD, 0, 0); cC.getContext('2d').putImageData(cD, 0, 0);
    const tex = (cv, srgb) => { const t = new THREE.CanvasTexture(cv); t.anisotropy = 8; if (srgb) t.encoding = THREE.sRGBEncoding; t.center.set(.5, .5); return t; };
    return { normal: tex(nC), rough: tex(rC), shade: tex(cC, true) };
  };

  /* A renderer in the host, sized to it, that keeps `fill` of the shorter side for an object `span` units across */
  const stage = (THREE, host, o) => {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = o.tone ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
    renderer.toneMappingExposure = o.exposure || 1;
    renderer.physicallyCorrectLights = true;
    const cv = renderer.domElement;
    cv.className = o.cls || ''; cv.setAttribute('aria-hidden', 'true');
    host.insertBefore(cv, host.firstChild);
    const scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new THREE.RoomEnvironment(), .03).texture;
    const camera = new THREE.PerspectiveCamera(24, 1, .1, 50);
    const size = () => {
      const w = cv.clientWidth || host.clientWidth, h = cv.clientHeight || host.clientHeight; /* the canvas box, as CSS sizes it */
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = (o.span / 2) / (Math.tan(camera.fov * Math.PI / 360) * Math.min(1, camera.aspect)) / o.fill;
      camera.updateProjectionMatrix();
    };
    size();
    new ResizeObserver(size).observe(host);
    return { renderer, scene, camera };
  };

  /* Turning: drag (with a flick of momentum), arrow keys, an optional Turn it button; idles round slowly */
  const turn = (host, rig, draw, o) => {
    let ry = o.ry0 || 0, rx = o.rx0 || 0, vy = reduce ? 0 : o.idle, drag = null, idle = !reduce, target = null, quiet = 0;
    const touch = () => { idle = false; quiet = performance.now(); };
    const btn = host.querySelector('.cs-coin-flip');
    host.addEventListener('pointerdown', e => {
      if (btn && e.target === btn) return;
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
    if (btn) { btn.hidden = false; btn.addEventListener('click', flip); }
    host.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); touch(); target = null; vy += (e.key === 'ArrowRight' ? 1 : -1) * .06; }
      else if (e.key === 'Enter' && e.target === host) { e.preventDefault(); flip(); }
    });
    let on = true, raf = 0;
    const loop = () => {
      cancelAnimationFrame(raf);
      if (!on) return;
      raf = requestAnimationFrame(loop);
      if (!drag) {
        if (target !== null) { ry += (target - ry) * .12; if (Math.abs(target - ry) < .001) { ry = target; target = null; quiet = performance.now(); } }
        else { ry += vy; vy *= .95; if (idle) vy += (o.idle - vy) * .02; else if (!reduce && performance.now() - quiet > (o.rest || 4000)) idle = true; }
        rx += ((o.rx0 || 0) - rx) * .04;
      }
      const t = performance.now() / 1000;
      rig.rotation.set(rx + (reduce || !o.sway ? 0 : Math.sin(t * .7) * o.sway), ry, 0);
      draw();
    };
    new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) loop(); }, { rootMargin: '100px 0px' }).observe(host);
    loop();
    host.classList.add('ready');
  };

  /* The coin */
  const coin = async (host, THREE) => {
    const cfg = JSON.parse(host.dataset.coin);
    const [a, b] = await Promise.all(cfg.faces.map(img));
    const { renderer, scene, camera } = stage(THREE, host, { tone: true, exposure: 1.2, span: 2, fill: innerWidth < 760 ? .76 : .62, cls: 'cs-coin-gl' });
    const key = new THREE.DirectionalLight(0xFFF1D6, 2.4); key.position.set(-3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xFFE2A8, 1.6); rim.position.set(4, -2, -3); scene.add(rim);
    const brass = { color: 0xFFFFFF, metalness: 1, envMapIntensity: 1.6 };
    const A = maps(THREE, a, false), B = maps(THREE, b, false);
    const face = m => new THREE.MeshStandardMaterial(Object.assign({}, brass, { map: m.shade, normalMap: m.normal, normalScale: new THREE.Vector2(1, 1), roughnessMap: m.rough, roughness: 1 }));
    const edge = new THREE.MeshStandardMaterial(Object.assign({}, brass, { color: 0xCDAA6E, roughness: .38 }));
    const geo = new THREE.CylinderGeometry(1, 1, .13, 160, 1);
    geo.rotateX(Math.PI / 2); /* caps face the camera: the top cap is the front */
    /* cylinder groups: 0 side, 1 top, 2 bottom. Turn each face's map so it reads upright. */
    A.shade.rotation = A.normal.rotation = A.rough.rotation = Math.PI / 2;
    B.shade.rotation = B.normal.rotation = B.rough.rotation = Math.PI / 2;
    const rig = new THREE.Group(); rig.add(new THREE.Mesh(geo, [edge, face(A), face(B)])); scene.add(rig);
    turn(host, rig, () => renderer.render(scene, camera), { ry0: -.5, rx0: .12, idle: .004, sway: .04 });
  };

  /* The 12 inch sleeve: the cover painting on the front, the back cover behind, a thin card edge */
  const sleeve = async (host, THREE) => {
    const cfg = JSON.parse(host.dataset.sleeve);
    const [f, b] = await Promise.all([cfg.front, cfg.back].map(img));
    const { renderer, scene, camera } = stage(THREE, host, { tone: false, span: 2.9, fill: .9 });
    const key = new THREE.DirectionalLight(0xFFFFFF, 1.1); key.position.set(-2, 3, 5); scene.add(key);
    scene.add(new THREE.AmbientLight(0xFFFFFF, .9));
    const tex = im => { const t = new THREE.Texture(im); t.encoding = THREE.sRGBEncoding; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.needsUpdate = true; return t; };
    const paper = o => new THREE.MeshStandardMaterial(Object.assign({ roughness: .62, metalness: 0, envMapIntensity: .35 }, o));
    const edge = paper({ color: 0x2A2620 });
    const geo = new THREE.BoxGeometry(2, 2, .035);
    /* box faces: +x, -x, +y, -y, +z (front), -z (back) */
    const rig = new THREE.Group(); rig.add(new THREE.Mesh(geo, [edge, edge, edge, edge, paper({ map: tex(f) }), paper({ map: tex(b) })])); scene.add(rig);
    turn(host, rig, () => renderer.render(scene, camera), { ry0: -.35, rx0: .06, idle: .006, rest: 2500 });
  };

  /* The tee (Nov 2026, the BTR x MSNGR tee): a real garment, sewn and draped in Blender with cloth simulation
     (assets/work/btr/tee.glb, from /home/claude/tee/build.py). Its two panels carry UVs that line up with the
     front and back prints, so the cutouts land where they are on the real tee. Drag to turn. */
  const tee = async (host, THREE) => {
    const cfg = JSON.parse(host.dataset.tee);
    if (!THREE.GLTFLoader) await js(T + 'examples/js/loaders/GLTFLoader.js');
    const [f, b, gltf] = await Promise.all([img(cfg.front), img(cfg.back), new Promise((ok, no) => new THREE.GLTFLoader().load(cfg.model, ok, null, no))]);
    const { renderer, scene, camera } = stage(THREE, host, { tone: true, exposure: 1.25, span: .95, fill: innerWidth < 760 ? .92 : .84 });
    scene.environment = null;
    const key = new THREE.DirectionalLight(0xFFFFFF, 2.6); key.position.set(-3, 4, 3); scene.add(key);
    const back = new THREE.DirectionalLight(0xFFFFFF, .6); back.position.set(3, 1, -2); scene.add(back);
    scene.add(new THREE.HemisphereLight(0xFFFFFF, 0x9A9A9A, 1.1));
    const tex = im => { const t = new THREE.Texture(im); t.encoding = THREE.sRGBEncoding; t.flipY = false; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.needsUpdate = true; return t; };
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    /* The cloth moves in the vertex shader: a soft breeze ripples it, and when it turns the loose parts
       (hem and sleeves) lag behind, swing past and settle. The shoulders hold still, like it is on a hanger. */
    const U = { uT: { value: 0 }, uSwing: { value: 0 }, uTilt: { value: 0 }, uWind: { value: reduce ? 0 : 1 },
      uTop: { value: box.max.y }, uBot: { value: box.min.y }, uC: { value: box.getCenter(new THREE.Vector3()) } };
    const cloth = `
      uniform float uT, uSwing, uTilt, uWind, uTop, uBot; uniform vec3 uC;
      float clothW(vec3 p) {
        float h = clamp((uTop - p.y) / (uTop - uBot), 0., 1.);
        float sl = smoothstep(.2, .42, abs(p.x - uC.x));
        return clamp(h * h * .9 + h * .1 + sl * .55 * (1. - h * .4), 0., 1.2);
      }
      float breeze(vec3 p) {
        float t = uT;
        return .0045 * (sin(p.x * 7. + p.y * 3. + t * 1.3)
          + .7 * sin(p.y * 11. - p.x * 5. + t * 1.9 + sin(p.z * 6. + t * .7))
          + .4 * sin((p.x + p.y) * 19. + t * 2.7)
          + .25 * sin(p.x * 31. - p.y * 13. + t * 3.6)) * uWind;
      }
      mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
      mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }
    `;
    const cotton = map => {
      const m = new THREE.MeshStandardMaterial({ map, color: 0xEDEDEA, roughness: .92, metalness: 0, side: THREE.DoubleSide });
      m.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, U);
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\n' + cloth)
          .replace('#include <beginnormal_vertex>', `
            vec3 objectNormal = vec3(normal);
            float cw = clothW(position);
            vec3 cq = abs(normal.y) < .9 ? vec3(0., 1., 0.) : vec3(1., 0., 0.);
            vec3 t1 = normalize(cross(normal, cq)), t2 = cross(normal, t1);
            float e = .004, f0 = breeze(position);
            float d1 = breeze(position + t1 * e) - f0, d2 = breeze(position + t2 * e) - f0;
            objectNormal = normalize(objectNormal - (t1 * d1 + t2 * d2) / e * cw);
            mat3 cr = rotY(uSwing * cw) * rotX(uTilt * cw);
            objectNormal = cr * objectNormal;
            vec3 clothP = uC + cr * (position + normal * f0 * cw - uC);
            #ifdef USE_TANGENT
              vec3 objectTangent = vec3(tangent.xyz);
            #endif`)
          .replace('#include <begin_vertex>', 'vec3 transformed = clothP;');
      };
      return m;
    };
    const F = cotton(tex(f)), B = cotton(tex(b));
    model.traverse(o => { if (o.isMesh) o.material = /^back/.test(o.material.name || '') ? B : F; });
    model.position.sub(box.getCenter(new THREE.Vector3()));
    const rig = new THREE.Group(); rig.add(model); scene.add(rig);
    /* the swing: a damped spring chasing how fast the tee is turning, so it lags, overshoots and settles */
    let lastY = null, lastX = null, sw = 0, sv = 0, tl = 0, tv = 0, t0 = performance.now();
    turn(host, rig, () => {
      const ry = rig.rotation.y, rx = rig.rotation.x;
      const vy = lastY === null ? 0 : ry - lastY, vx = lastX === null ? 0 : rx - lastX;
      lastY = ry; lastX = rx;
      if (!reduce) {
        sv += (Math.max(-.35, Math.min(.35, -vy * 9)) - sw) * .09; sv *= .86; sw += sv;
        tv += (Math.max(-.2, Math.min(.2, -vx * 7)) - tl) * .09; tv *= .86; tl += tv;
      }
      U.uSwing.value = sw; U.uTilt.value = tl;
      U.uT.value = (performance.now() - t0) / 1000;
      renderer.render(scene, camera);
    }, { ry0: -.5, rx0: .04, idle: .006, rest: 2500 });
  };

  const go = async () => {
    const hosts = document.querySelectorAll('[data-coin],[data-sleeve],[data-tee]');
    if (!hosts.length) return;
    try {
      if (!window.THREE) await js(T + 'build/three.min.js');
      if (!THREE.RoomEnvironment) await js(T + 'examples/js/environments/RoomEnvironment.js');
      const t = document.createElement('canvas');
      if (!(t.getContext('webgl2') || t.getContext('webgl'))) return; /* no WebGL: the stills stay */
      for (const h of hosts) await (h.dataset.coin ? coin : h.dataset.tee ? tee : sleeve)(h, THREE).catch(() => {});
    } catch (e) { /* the stills stay */ }
  };
  go();
})();
