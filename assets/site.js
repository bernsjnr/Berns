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
  const LOGO = '<span class="wm" role="img" aria-label="Berns Studios"><span class="b" aria-hidden="true">Berns</span><span class="s" aria-hidden="true">Studios</span></span>';

  /* Logo artwork (2026 brand kit). Always ink or white, never blue. */

  /* Top bar: BERNARD BANNOR + nav, the same on every page */
  const NAV = [...(page === 'home' ? [['home', 'Home', 'index.html']] : []), ['work', 'Work', 'studios/index.html'], ['about', 'About', 'about/index.html'], ['shop', 'Shop', 'shop/index.html'], ['contact', 'Contact', 'contact/index.html'], ['surprise', 'Surprise', 'surprise/index.html']];
  const ON = { home: 'home', studios: 'work', about: 'about', shop: 'shop', contact: 'contact' }[page];
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

  /* Word stacks and name indexes, built from data.js where a page asks for them */
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const num = i => String(i + 1).padStart(2, '0');
  document.querySelectorAll('[data-stack="projects"]').forEach(el => {
    el.innerHTML = D.projects.map((p, i) => `<a href="${url('studios/project.html?p=' + p.id)}" data-img="${url(p.poster || p.img)}"${p.video ? ` data-video="${url(p.video)}"` : ''}>${esc(p.name)}<sup>${num(i)}</sup></a>`).join('');
  });
  document.querySelectorAll('[data-names="posters"]').forEach(el => {
    el.innerHTML = D.posters.map((p, i) => `<a href="${url('shop/print.html?p=' + p.id)}" data-img="${url(p.img)}">${esc(p.name)}<sup>${num(i)}</sup></a>`).join(' ');
  });

  /* Page titles in the blue panels shrink to fit on one line */
  const fitTitles = () => document.querySelectorAll('.split-panel .split-title').forEach(el => {
    el.style.fontSize = '';
    const r = el.clientWidth / el.scrollWidth;
    if (r < 1) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * r * .98) + 'px';
  });
  fitTitles();
  if (document.fonts) document.fonts.ready.then(fitTitles);
  addEventListener('resize', fitTitles);

  /* Floating photo over a list: shows the item you hover, or the one in the middle of the screen as you scroll */
  document.querySelectorAll('.split-list').forEach(list => {
    const items = [...list.querySelectorAll('[data-img]')];
    const fl = list.querySelector('.float');
    if (!fl) return;
    if (!items.length) { fl.classList.add('empty'); return; }
    const box = fl.querySelector('.float-in');
    const layers = new Map();
    items.forEach(it => {
      const key = it.dataset.video || it.dataset.img;
      if (layers.has(key)) return;
      let m;
      if (it.dataset.video && !reduce) { m = document.createElement('video'); m.src = it.dataset.video; m.poster = it.dataset.img; m.muted = true; m.loop = true; m.playsInline = true; m.preload = 'none'; }
      else { m = document.createElement('img'); m.src = it.dataset.img; m.alt = ''; m.loading = 'lazy'; }
      box.appendChild(m); layers.set(key, m);
    });
    let cur = null, hovering = false;
    const show = it => {
      const m = layers.get(it.dataset.video || it.dataset.img);
      if (!m || m === cur) return;
      if (cur) { cur.classList.remove('on'); if (cur.pause) cur.pause(); }
      m.classList.add('on'); if (m.play) { m.preload = 'auto'; m.play().catch(() => {}); }
      cur = m;
    };
    show(items[0]);
    items.forEach(it => {
      it.addEventListener('pointerenter', () => { hovering = true; show(it); });
      it.addEventListener('pointerleave', () => { hovering = false; });
      it.addEventListener('focus', () => show(it));
    });
    const mid = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !hovering) show(e.target); }), { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(it => mid.observe(it));
  });

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

  /* Cursor: the classic pixel set (arrow, pointing hand, hourglass) from rw-designer.com "Classic".
     Arrow by default, hand on links and the draggable photo, hourglass while the page loads.
     On phones it jumps to wherever you touch and follows your finger. */
  {
    const root = document.documentElement;
    const SET = { arrow: [0, 0, 24, 42], pointer: [11, 0, 34, 44], wait: [13, 22, 26, 44] };
    const FILE = { arrow: 'arrow', pointer: 'hand', wait: 'hourglass' };
    body.insertAdjacentHTML('beforeend', `<div class="cur" aria-hidden="true" data-k="wait">${Object.entries(SET).map(([k, [hx, hy, w, h]]) =>
      `<img class="cur-${k}" src="${url('assets/cursor/' + FILE[k] + '.png')}" width="${w}" height="${h}" alt="" style="left:${-hx}px;top:${-hy}px">`).join('')}</div>`);
    const cur = body.querySelector('.cur');
    const LINK = 'a,button,[role="button"],label,select,summary,input[type="submit"],input[type="button"],.seg button,.opts button';
    let mx = -100, my = -100;
    let loading = document.readyState !== 'complete';
    addEventListener('load', () => { loading = false; cur.dataset.k = kind(document.elementFromPoint(mx, my)); });
    const kind = el => {
      if (loading) return 'wait';
      if (!el || !el.closest) return 'arrow';
      if (el.closest('.hero-portrait, .stage canvas') || el.closest(LINK)) return 'pointer';
      return 'arrow';
    };
    const place = (x, y, el) => {
      mx = x; my = y;
      cur.style.transform = `translate3d(${x}px,${y}px,0)`;
      cur.dataset.k = kind(el || document.elementFromPoint(x, y));
      root.classList.add('cur-on');
    };
    addEventListener('pointermove', e => place(e.clientX, e.clientY, e.target), { passive: true });
    addEventListener('pointerdown', e => place(e.clientX, e.clientY, e.target), { passive: true });
    addEventListener('pointerup', e => { cur.dataset.k = kind(document.elementFromPoint(e.clientX, e.clientY)); }, { passive: true });
    addEventListener('touchstart', e => { const t = e.touches[0]; if (t) place(t.clientX, t.clientY, e.target); }, { passive: true });
    addEventListener('touchmove', e => { const t = e.touches[0]; if (t) place(t.clientX, t.clientY); }, { passive: true });
    addEventListener('scroll', () => { if (root.classList.contains('cur-on')) cur.dataset.k = kind(document.elementFromPoint(mx, my)); }, { passive: true });
    document.addEventListener('mouseleave', () => root.classList.remove('cur-on'));
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) root.classList.add('cur-hide-native');
  }

  /* Smooth scroll */
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4) });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    window.BERNS_UI.lenis = lenis;
  }
})();
