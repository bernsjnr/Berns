/* =========================================================
   BERNS: shared page chrome and behaviour.
   Each page sets <body data-base="../" data-page="shop">.
   ========================================================= */
(() => {
  const D = window.BERNS;
  const body = document.body;
  const base = body.dataset.base || '';
  const page = body.dataset.page || 'home';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const url = p => base + p;
  const LOGO = '<svg class="bs-logo" viewBox="0 0 2578.01 244.70" role="img" aria-label="Berns Studios"><use href="#bs-logo"/></svg>';

  /* Logo artwork (2026 brand kit). Always ink or white, never blue. */
  body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs> <g> <g id="bsg-0-0"> <path d="M 14.40625 -234.625 L 207.46875 -234.625 C 231.15625 -234.625 251.429688 -233.171875 268.296875 -230.265625 C 285.171875 -227.359375 298.859375 -221.546875 309.359375 -212.828125 C 319.859375 -204.117188 325.109375 -191.492188 325.109375 -174.953125 C 325.109375 -156.859375 318.960938 -143.171875 306.671875 -133.890625 C 294.390625 -124.617188 277.859375 -119.984375 257.078125 -119.984375 L 257.078125 -116.96875 C 272.710938 -116.96875 286.335938 -115.40625 297.953125 -112.28125 C 309.578125 -109.15625 318.910156 -103.679688 325.953125 -95.859375 C 332.992188 -88.035156 336.515625 -77.421875 336.515625 -64.015625 C 336.515625 -49.046875 331.597656 -36.8125 321.765625 -27.3125 C 311.929688 -17.820312 297.570312 -10.894531 278.6875 -6.53125 C 259.8125 -2.175781 236.410156 0 208.484375 0 L 14.40625 0 Z M 118.65625 -58.65625 L 183.34375 -58.65625 C 193.613281 -58.65625 200.925781 -59.828125 205.28125 -62.171875 C 209.644531 -64.515625 211.828125 -68.925781 211.828125 -75.40625 C 211.828125 -81.894531 209.757812 -86.476562 205.625 -89.15625 C 201.488281 -91.832031 194.507812 -93.171875 184.6875 -93.171875 L 128.703125 -93.171875 L 128.703125 -142.78125 L 177.3125 -142.78125 C 186.019531 -142.78125 192.441406 -144.117188 196.578125 -146.796875 C 200.710938 -149.484375 202.78125 -153.84375 202.78125 -159.875 C 202.78125 -165.90625 200.597656 -170.207031 196.234375 -172.78125 C 191.878906 -175.351562 185.007812 -176.640625 175.625 -176.640625 L 118.65625 -176.640625 L 133.734375 -195.0625 L 133.734375 -40.21875 Z M 118.65625 -58.65625 "/> </g> <g id="bsg-0-1"> <path d="M 14.40625 -234.625 L 277.1875 -234.625 L 277.1875 -159.875 L 134.0625 -159.875 L 134.0625 -143.78125 L 270.15625 -143.78125 L 270.15625 -92.5 L 134.0625 -92.5 L 134.0625 -74.75 L 277.1875 -74.75 L 277.1875 0 L 14.40625 0 Z M 14.40625 -234.625 "/> </g> <g id="bsg-0-2"> <path d="M 14.40625 -234.625 L 203.453125 -234.625 C 233.617188 -234.625 258.140625 -232.441406 277.015625 -228.078125 C 295.898438 -223.722656 310.035156 -216.40625 319.421875 -206.125 C 328.804688 -195.851562 333.5 -181.78125 333.5 -163.90625 C 333.5 -149.375 330.476562 -136.96875 324.4375 -126.6875 C 318.40625 -116.414062 308.96875 -108.597656 296.125 -103.234375 C 283.28125 -97.867188 266.910156 -95.1875 247.015625 -95.1875 L 247.015625 -92.171875 C 265.566406 -92.390625 280.367188 -90.988281 291.421875 -87.96875 C 302.484375 -84.957031 311.195312 -80.046875 317.5625 -73.234375 C 323.9375 -66.421875 328.800781 -57.09375 332.15625 -45.25 L 345.234375 0 L 221.890625 0 L 211.15625 -42.90625 C 209.59375 -48.707031 207.691406 -53.226562 205.453125 -56.46875 C 203.222656 -59.71875 200.375 -62.007812 196.90625 -63.34375 C 193.445312 -64.6875 188.8125 -65.359375 183 -65.359375 L 133.734375 -65.359375 L 133.734375 0 L 14.40625 0 Z M 190.71875 -123.671875 C 198.09375 -123.671875 203.675781 -125.066406 207.46875 -127.859375 C 211.269531 -130.660156 213.171875 -135.410156 213.171875 -142.109375 C 213.171875 -146.578125 212.273438 -150.207031 210.484375 -153 C 208.703125 -155.800781 206.132812 -157.867188 202.78125 -159.203125 C 199.425781 -160.546875 195.289062 -161.21875 190.375 -161.21875 L 133.734375 -161.21875 L 133.734375 -123.671875 Z M 190.71875 -123.671875 "/> </g> <g id="bsg-0-3"> <path d="M 14.40625 -234.625 L 125.015625 -234.625 L 264.109375 -102.234375 L 239.3125 -102.234375 L 239.3125 -234.625 L 346.5625 -234.625 L 346.5625 0 L 236.625 0 L 97.53125 -137.078125 L 121.671875 -137.078125 L 121.671875 0 L 14.40625 0 Z M 14.40625 -234.625 "/> </g> <g id="bsg-0-4"> <path d="M 170.609375 4.359375 C 135.523438 4.359375 106.640625 1.625 83.953125 -3.84375 C 61.273438 -9.320312 43.507812 -17.867188 30.65625 -29.484375 C 17.8125 -41.109375 8.929688 -56.640625 4.015625 -76.078125 L 128.03125 -76.078125 C 129.375 -71.160156 131.5 -67.191406 134.40625 -64.171875 C 137.3125 -61.160156 142.113281 -58.757812 148.8125 -56.96875 C 155.519531 -55.1875 165.019531 -54.296875 177.3125 -54.296875 C 191.164062 -54.296875 200.828125 -55.410156 206.296875 -57.640625 C 211.773438 -59.878906 214.515625 -63.125 214.515625 -67.375 C 214.515625 -70.945312 212.054688 -73.679688 207.140625 -75.578125 C 202.222656 -77.484375 196.019531 -78.828125 188.53125 -79.609375 C 181.050781 -80.390625 170.046875 -81.335938 155.515625 -82.453125 C 126.691406 -84.679688 102.503906 -87.640625 82.953125 -91.328125 C 63.398438 -95.015625 46.25 -102.273438 31.5 -113.109375 C 16.757812 -123.953125 9.390625 -139.539062 9.390625 -159.875 C 9.390625 -175.289062 14.25 -188.863281 23.96875 -200.59375 C 33.6875 -212.332031 50.382812 -221.71875 74.0625 -228.75 C 97.75 -235.789062 129.484375 -239.3125 169.265625 -239.3125 C 202.554688 -239.3125 230.648438 -236.570312 253.546875 -231.09375 C 276.453125 -225.625 294.382812 -216.800781 307.34375 -204.625 C 320.3125 -192.445312 327.6875 -176.414062 329.46875 -156.53125 L 211.828125 -156.53125 C 210.929688 -161.882812 209.03125 -166.125 206.125 -169.25 C 203.226562 -172.382812 198.59375 -174.789062 192.21875 -176.46875 C 185.851562 -178.144531 176.972656 -178.984375 165.578125 -178.984375 C 155.960938 -178.984375 148.414062 -178.421875 142.9375 -177.296875 C 137.46875 -176.179688 133.785156 -174.785156 131.890625 -173.109375 C 129.992188 -171.441406 129.046875 -169.601562 129.046875 -167.59375 C 129.046875 -163.789062 131.554688 -160.828125 136.578125 -158.703125 C 141.609375 -156.578125 148.035156 -155.066406 155.859375 -154.171875 C 163.679688 -153.285156 175.078125 -152.28125 190.046875 -151.15625 C 218.640625 -149.375 242.597656 -146.691406 261.921875 -143.109375 C 281.253906 -139.535156 298.128906 -132.332031 312.546875 -121.5 C 326.960938 -110.664062 334.171875 -94.859375 334.171875 -74.078125 C 334.171875 -58.660156 329.363281 -45.195312 319.75 -33.6875 C 310.144531 -22.175781 293.273438 -12.957031 269.140625 -6.03125 C 245.003906 0.894531 212.160156 4.359375 170.609375 4.359375 Z M 170.609375 4.359375 "/> </g> <g id="bsg-1-0"> <path d="M 72.5 4.515625 C 109.15625 4.515625 136.234375 -11.421875 136.234375 -41.96875 C 136.234375 -77.546875 107.5625 -84.1875 82.328125 -88.703125 C 62.9375 -92.15625 47.53125 -93.75 47.53125 -104.375 C 47.53125 -113.40625 55.765625 -118.71875 68.515625 -118.71875 C 81.796875 -118.71875 89.765625 -113.671875 92.421875 -103.578125 L 131.203125 -103.578125 C 127.484375 -128.28125 107.828125 -145.265625 68.515625 -145.265625 C 35.328125 -145.265625 9.03125 -130.140625 9.03125 -101.1875 C 9.03125 -68.25 34.53125 -61.875 59.75 -57.09375 C 79.40625 -53.375 96.140625 -51.78125 96.140625 -39.046875 C 96.140625 -28.953125 87.640625 -22.84375 72.765625 -22.84375 C 56.5625 -22.84375 46.46875 -30.28125 44.09375 -43.5625 L 4.78125 -43.5625 C 6.90625 -15.140625 31.609375 4.515625 72.5 4.515625 Z M 72.5 4.515625 "/> </g> <g id="bsg-1-1"> <path d="M 5.578125 -114.734375 L 26.828125 -114.734375 L 26.828125 -35.59375 C 26.828125 -6.90625 44.609375 1.59375 70.90625 1.59375 C 82.0625 1.59375 90.5625 0.265625 95.078125 -0.53125 L 95.078125 -31.609375 L 92.953125 -31.609375 C 90.296875 -31.34375 86.046875 -31.078125 83.390625 -31.078125 C 73.5625 -31.078125 67.71875 -34 67.71875 -44.609375 L 67.71875 -114.734375 L 95.34375 -114.734375 L 95.34375 -141.28125 L 67.71875 -141.28125 L 67.71875 -186.4375 L 26.828125 -186.4375 L 26.828125 -141.28125 L 5.578125 -141.28125 Z M 5.578125 -114.734375 "/> </g> <g id="bsg-1-2"> <path d="M 145.265625 0 L 145.265625 -141.28125 L 104.109375 -141.28125 L 104.109375 -61.34375 C 104.109375 -43.828125 93.75 -31.078125 77.015625 -31.078125 C 62.140625 -31.078125 54.4375 -40.109375 54.4375 -55.765625 L 54.4375 -141.28125 L 12.75 -141.28125 L 12.75 -47.796875 C 12.75 -16.734375 30.28125 3.984375 62.40625 3.984375 C 81.796875 3.984375 94.546875 -3.71875 104.90625 -20.1875 L 105.703125 -20.1875 L 105.703125 0 Z M 145.265625 0 "/> </g> <g id="bsg-1-3"> <path d="M 67.71875 4.515625 C 86.84375 4.515625 102.515625 -3.453125 110.75 -20.71875 L 111.28125 -20.71875 L 111.28125 0 L 151.375 0 L 151.375 -197.59375 L 109.6875 -197.59375 L 109.6875 -154.296875 C 109.6875 -142.34375 110.21875 -130.40625 110.75 -121.640625 L 110.21875 -121.640625 C 100.65625 -136.234375 87.640625 -145.265625 68.25 -145.265625 C 31.609375 -145.265625 7.171875 -113.9375 7.171875 -70.640625 C 7.171875 -23.90625 31.078125 4.515625 67.71875 4.515625 Z M 78.875 -28.953125 C 59.484375 -28.953125 49.65625 -45.40625 49.65625 -70.90625 C 49.65625 -96.140625 59.484375 -113.671875 79.140625 -113.671875 C 100.65625 -113.671875 111.015625 -95.609375 111.015625 -70.640625 C 111.015625 -45.9375 99.0625 -28.953125 78.875 -28.953125 Z M 78.875 -28.953125 "/> </g> <g id="bsg-1-4"> <path d="M 13.546875 -161.203125 L 55.765625 -161.203125 L 55.765625 -197.59375 L 13.546875 -197.59375 Z M 13.8125 0 L 55.5 0 L 55.5 -141.28125 L 13.8125 -141.28125 Z M 13.8125 0 "/> </g> <g id="bsg-1-5"> <path d="M 82.0625 4.515625 C 126.953125 4.515625 156.421875 -28.15625 156.421875 -70.375 C 156.421875 -112.875 126.953125 -145.265625 82.0625 -145.265625 C 36.921875 -145.265625 7.171875 -112.875 7.171875 -70.375 C 7.171875 -28.15625 36.921875 4.515625 82.0625 4.515625 Z M 81.796875 -25.765625 C 60.546875 -25.765625 49.390625 -43.828125 49.390625 -70.375 C 49.390625 -97.203125 60.546875 -115.53125 81.796875 -115.53125 C 102.515625 -115.53125 114.203125 -97.203125 114.203125 -70.375 C 114.203125 -43.828125 102.515625 -25.765625 81.796875 -25.765625 Z M 81.796875 -25.765625 "/> </g> </g> <symbol id="bs-logo" viewBox="630.98 930.87 2578.01 244.70"> <g fill="currentColor" fill-opacity="1"> <use href="#bsg-0-0" x="616.9062" y="1170.2813"/> </g> <g fill="currentColor" fill-opacity="1"> <use href="#bsg-0-1" x="949.396526" y="1170.2813"/> <use href="#bsg-0-2" x="1221.220775" y="1170.2813"/> <use href="#bsg-0-3" x="1557.062818" y="1170.2813"/> </g> <g fill="currentColor" fill-opacity="1"> <use href="#bsg-0-4" x="1906.31173" y="1170.2813"/> </g> <g fill="currentColor" fill-opacity="1"> <use href="#bsg-1-0" x="2304.5469" y="1160.5625"/> </g> <g fill="currentColor" fill-opacity="1"> <use href="#bsg-1-1" x="2438.401034" y="1160.5625"/> <use href="#bsg-1-2" x="2536.401383" y="1160.5625"/> <use href="#bsg-1-3" x="2690.174287" y="1160.5625"/> <use href="#bsg-1-4" x="2850.055614" y="1160.5625"/> <use href="#bsg-1-5" x="2914.061262" y="1160.5625"/> <use href="#bsg-1-0" x="3072.349088" y="1160.5625"/> </g> </symbol></defs></svg>`);

  /* Top bar: BERNARD BANNOR + nav, the same on every page */
  const NAV = [['work', 'Work', 'studios/index.html'], ['about', 'About', 'about/index.html'], ['shop', 'Shop', 'shop/index.html'], ['contact', 'Contact', 'contact/index.html']];
  const ON = { studios: 'work', about: 'about', shop: 'shop', contact: 'contact' }[page];
  body.insertAdjacentHTML('afterbegin',
    `<header class="bar"><a class="bar-name" href="${url('index.html')}" aria-label="Bernard Bannor, home"><span><i>Bernard </i><i>Bannor</i></span></a>` +
    `<nav class="bar-nav" aria-label="Main">${NAV.map(([k, n, h]) => `<a href="${url(h)}"${k === ON ? ' class="on" aria-current="page"' : ''}>${n}</a>`).join('')}</nav></header>`);
  document.querySelectorAll('[data-logo]').forEach(el => el.innerHTML = LOGO);

  /* Shared renderers */
  const media = p => p.video
    ? `<video src="${url(p.video)}" poster="${url(p.poster)}" muted loop playsinline preload="none"></video>`
    : `<img src="${url(p.img)}" alt="${p.name}" loading="lazy" width="1200" height="675">`;
  const price = (s, f) => s.price + (f.id === 'none' ? 0 : s.frame);
  window.BERNS_UI = {
    url, media, price, LOGO,
    projectTile: p => `<a class="tile rv" href="${url('studios/project.html?p=' + p.id)}"><div class="media">${media(p)}</div><div class="cap"><b>${p.name}</b><span>${p.discipline}</span></div></a>`,
    posterTile: p => `<a class="tile rv" href="${url('shop/print.html?p=' + p.id)}"><div class="media tall"><img src="${url(p.img)}" alt="${p.name}, print" loading="lazy" width="1000" height="1416"></div><div class="cap"><b>${p.name}</b><span>From £${Math.min(...D.sizes.map(s => s.price))}</span></div></a>`
  };
  document.querySelectorAll('[data-render]').forEach(el => {
    const [what, n] = el.dataset.render.split(':');
    const list = what === 'projects' ? D.projects : D.posters;
    const tile = what === 'projects' ? BERNS_UI.projectTile : BERNS_UI.posterTile;
    el.innerHTML = list.slice(0, n ? +n : undefined).map(tile).join('');
  });
  document.querySelectorAll('[data-credits]').forEach(el => {
    el.innerHTML = D.credits.map(([a, b]) => `<li><span>${a}</span><span class="label">${b}</span></li>`).join('');
  });

  /* Reveals and videos (re-run when a page adds content) */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  const vo = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduce) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  }), { threshold: .25 });
  window.BERNS_UI.observe = (root = document) => {
    root.querySelectorAll('.rv:not(.in)').forEach(el => io.observe(el));
    root.querySelectorAll('video').forEach(v => vo.observe(v));
  };
  window.BERNS_UI.observe();

  /* Home: the bar takes over from the hero as you scroll.
     Stage 1, hero nav gone: white bar in, nav slides from its spread hero spots to the right.
     Stage 2, hero name gone: BERNARD BANNOR rises into the bar. */
  const heroNav = document.querySelector('.hero-nav');
  const heroName = document.querySelector('.hero-name');
  if (heroNav && heroName) {
    const bar = document.querySelector('.bar');
    const barLinks = [...bar.querySelectorAll('.bar-nav a')];
    const heroLinks = [...heroNav.querySelectorAll('a')];
    let navOn = false, nameOn = false;
    const fromHero = () => barLinks.map((l, i) => {
      const h = heroLinks[i]; if (!h) return 0;
      l.style.transform = 'none';
      return h.getBoundingClientRect().left - l.getBoundingClientRect().left;
    });
    const slide = (show) => {
      if (reduce) return;
      const dx = fromHero();
      barLinks.forEach((l, i) => {
        l.style.transition = 'none';
        l.style.transform = show ? `translateX(${dx[i]}px)` : 'none';
        l.getBoundingClientRect();
        l.style.transition = 'transform .9s var(--ease), opacity .5s var(--ease)';
        l.style.transform = show ? 'none' : `translateX(${dx[i]}px)`;
      });
    };
    const check = () => {
      const barH = bar.getBoundingClientRect().height;
      const n = heroNav.getBoundingClientRect().bottom < 0;
      const m = heroName.getBoundingClientRect().bottom < barH;
      if (n !== navOn) { navOn = n; body.classList.toggle('bar-on', n); slide(n); }
      if (m !== nameOn) { nameOn = m; body.classList.toggle('name-on', m); }
    };
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    check();
  }

  /* Home poster: bar sits see-through over the blue, then turns white and the name rises once the blue has gone */
  const posterEl = document.querySelector('.poster');
  if (posterEl) {
    const bar = document.querySelector('.bar');
    let on = null;
    const check = () => {
      const o = posterEl.getBoundingClientRect().bottom < bar.getBoundingClientRect().height;
      if (o !== on) { on = o; body.classList.toggle('bar-on', o); body.classList.toggle('name-on', o); }
    };
    addEventListener('scroll', check, { passive: true }); addEventListener('resize', check); check();
  }

  /* Home portrait: a photo pinned to a noteboard.
     Drag it anywhere (mouse or finger) and it stays where you drop it, swinging a little as it moves.
     It also turns up to ~7deg as you scroll through the hero. */
  const portrait = document.querySelector('.hero-portrait');
  if (portrait) {
    let px = 0, py = 0;            // where it's been dropped
    let scrollRot = 0, swing = 0;  // eased rotations
    let drag = null, running = false;
    const render = () => {
      const target = reduce ? 0 : Math.min(1, scrollY / innerHeight) * 7;
      scrollRot += (target - scrollRot) * .12;
      if (!drag) swing *= .85;
      portrait.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${(scrollRot + swing).toFixed(2)}deg)`;
      if (drag || Math.abs(target - scrollRot) > .01 || Math.abs(swing) > .01) requestAnimationFrame(render); else running = false;
    };
    const kick = () => { if (!running) { running = true; requestAnimationFrame(render); } };
    addEventListener('scroll', kick, { passive: true });
    portrait.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      portrait.setPointerCapture(e.pointerId);
      drag = { x: e.clientX - px, y: e.clientY - py, lx: e.clientX };
      portrait.classList.add('lifted');
      kick();
    });
    portrait.addEventListener('pointermove', e => {
      if (!drag) return;
      const r = portrait.getBoundingClientRect(), m = 24;
      // keep at least a corner on screen sideways
      px = Math.max(-(r.left - px) - r.width + m, Math.min(innerWidth - (r.left - px) - m, e.clientX - drag.x));
      py = e.clientY - drag.y;
      if (!reduce) swing = Math.max(-12, Math.min(12, swing * .7 + (e.clientX - drag.lx) * .6));
      drag.lx = e.clientX;
    });
    const drop = () => { if (!drag) return; drag = null; portrait.classList.remove('lifted'); kick(); };
    portrait.addEventListener('pointerup', drop);
    portrait.addEventListener('pointercancel', drop);
    portrait.addEventListener('dblclick', () => { px = 0; py = 0; kick(); });
    kick();
  }

  /* Cursor: Berns Blue. Breathes at rest, pulses while scrolling, grows on hover. */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const root = document.documentElement;
    body.insertAdjacentHTML('beforeend', '<div class="cursor-ring" aria-hidden="true"></div><div class="cursor" aria-hidden="true"></div>');
    const dot = body.querySelector('.cursor'), ring = body.querySelector('.cursor-ring');
    const HOT = 'a,button,[role="button"],input,select,textarea,label,.media,.hero-portrait,.stage canvas';
    let mx = -100, my = -100, x = mx, y = my, seen = false;
    let hover = 0, hoverTo = 0, energy = 0, lastY = scrollY;
    const sense = () => { const el = document.elementFromPoint(mx, my); hoverTo = el && el.closest(HOT) ? 1 : 0; root.classList.toggle('cursor-light', !!(el && el.closest('.poster, .on-blue'))); };
    addEventListener('pointermove', e => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!seen) { x = mx; y = my; seen = true; root.classList.add('has-cursor'); }
      root.classList.remove('cursor-out');
      hoverTo = e.target.closest && e.target.closest(HOT) ? 1 : 0;
      root.classList.toggle('cursor-light', !!(e.target.closest && e.target.closest('.poster, .on-blue')));
    }, { passive: true });
    document.addEventListener('mouseleave', () => root.classList.add('cursor-out'));
    addEventListener('scroll', () => {
      energy = Math.min(1, energy + Math.abs(scrollY - lastY) / 280);
      lastY = scrollY;
      if (seen) sense();
    }, { passive: true });
    const t0 = performance.now();
    const loop = now => {
      const t = (now - t0) / 1000;
      x += (mx - x) * .22; y += (my - y) * .22;
      hover += (hoverTo - hover) * .14;
      energy *= .94;
      const grow = 1 + hover * 3.6;
      const breath = reduce ? 1 : 1 + Math.sin(t * Math.PI * (1.4 + energy * 2.2)) * (.06 + energy * .14);
      dot.style.transform = `translate3d(${x}px,${y}px,0) scale(${(grow * breath).toFixed(3)})`;
      const ph = (t * (.8 + energy)) % 1;
      ring.style.transform = `translate3d(${x}px,${y}px,0) scale(${(grow * (1 + ph * (1.3 + energy))).toFixed(3)})`;
      ring.style.opacity = reduce ? 0 : (energy * .5 * (1 - ph)).toFixed(3);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* Smooth scroll */
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4) });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    window.BERNS_UI.lenis = lenis;
  }
})();
