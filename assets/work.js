/* =========================================================
   BERNS: Work page (v9, Nov 2026)
   A swipeable stack of cards (Apple Music style coverflow), filters
   (All, Animation, Design, Art direction) and a Folders view.
   Content comes from assets/data.js (projects: tags, folder, bg, ink).
   Swipe or drag, arrow keys, trackpad/wheel, or tap a side card.
   ========================================================= */
(() => {
  const D = window.BERNS;
  const root = document.documentElement;
  const base = document.body.dataset.base || '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);

  const stage = $('[data-stage]');
  const deck = $('[data-deck]');
  const foldersEl = $('[data-folders]');
  const filtersEl = $('[data-filters]');
  const viewBtns = [...document.querySelectorAll('[data-view]')];
  const chip = $('[data-folder-chip]');
  const cap = {
    n: $('[data-cap-n]'), name: $('[data-cap-name]'), meta: $('[data-cap-meta]'),
    link: $('[data-cap-link]'), count: $('[data-cap-count]')
  };

  const TAGS = ['All', 'Animation', 'Design', 'Art direction'];
  const FOLDERS = [...new Set(D.projects.map(p => p.folder))];
  const pad = n => String(n).padStart(2, '0');
  const url = p => `project.html?p=${encodeURIComponent(p.id)}`;

  let tag = 'All', folder = null, view = 'cards';
  let list = [], cards = [];
  let pos = 0, target = 0, raf = 0, active = -1;

  /* ---------- Filters ---------- */
  filtersEl.innerHTML = TAGS.map((t, i) =>
    `<button type="button" class="f" data-tag="${t}" aria-pressed="${t === tag}">${t}</button>${i < TAGS.length - 1 ? '<span aria-hidden="true">, </span>' : ''}`).join('');
  filtersEl.addEventListener('click', e => {
    const b = e.target.closest('[data-tag]'); if (!b) return;
    tag = b.dataset.tag; setView('cards'); build();
  });
  chip.addEventListener('click', () => { folder = null; build(); });
  viewBtns.forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

  function setView(v) {
    view = v;
    viewBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.view === v));
    document.body.dataset.workView = v;
    if (v === 'folders') { pauseAll(); buildFolders(); }
  }

  /* ---------- Cards ---------- */
  function media(p, eager) {
    const src = base + (p.poster || p.img);
    return `<img src="${src}" alt="" ${eager ? '' : 'loading="lazy"'} draggable="false">` +
      (p.video ? `<video muted loop playsinline preload="none" poster="${src}" data-src="${base + p.video}"></video>` : '');
  }
  function build() {
    list = D.projects.filter(p => (tag === 'All' || p.tags.includes(tag)) && (!folder || p.folder === folder));
    [...filtersEl.querySelectorAll('[data-tag]')].forEach(b => b.setAttribute('aria-pressed', b.dataset.tag === tag));
    chip.hidden = !folder;
    if (folder) chip.querySelector('span').textContent = folder;
    deck.innerHTML = list.map((p, i) => `
      <a class="card${p.ink ? ' card--ink' : ''}" href="${url(p)}" style="--bg:${p.bg}" data-i="${i}" aria-label="${p.name}${p.client ? ', ' + p.client : ''}" draggable="false">
        <span class="card-n mono">${pad(i + 1)}</span>
        <span class="card-media">${media(p, i < 3)}</span>
        <span class="card-name">${p.name}</span>
        <span class="card-tag mono">${p.discipline}</span>
      </a>`).join('');
    cards = [...deck.children];
    pos = target = 0; active = -1;
    if (!list.length) deck.innerHTML = '<p class="empty mono">Nothing here yet</p>';
    layout(true); caption();
  }

  /* place every card around the current position: centre flat, neighbours turned away into depth */
  function layout() {
    const w = deck.clientWidth;
    cards.forEach((c, i) => {
      const d = i - pos, a = Math.abs(d), s = Math.sign(d), near = Math.min(a, 1), far = Math.max(a - 1, 0);
      const x = s * (near * 0.64 + far * 0.24) * w;
      const z = -(near * 0.42 + far * 0.14) * w;
      const ry = -s * near * 40;
      c.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
      c.style.zIndex = 100 - Math.round(a * 10);
      c.style.setProperty('--dim', (near * 0.5 + far * 0.1).toFixed(3));
      c.style.opacity = a > 4.2 ? 0 : 1;
      c.style.pointerEvents = a > 4.2 ? 'none' : '';
      c.tabIndex = Math.round(pos) === i ? 0 : -1;
    });
  }
  function tick() {
    const d = target - pos;
    pos = reduce || Math.abs(d) < 0.001 ? target : pos + d * 0.16;
    layout();
    const i = Math.round(pos);
    if (i !== active) { active = i; caption(); }
    if (pos !== target) raf = requestAnimationFrame(tick); else { raf = 0; playActive(); }
  }
  function go(i) {
    target = Math.max(0, Math.min(list.length - 1, i));
    pauseAll();
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function caption() {
    const p = list[Math.round(pos)];
    if (!p) { cap.name.textContent = ''; cap.meta.textContent = ''; cap.count.textContent = '00 / 00'; cap.link.hidden = true; return; }
    cap.name.textContent = p.name;
    cap.meta.textContent = [p.client, p.discipline, p.year].filter(Boolean).join(' · ');
    cap.link.href = url(p); cap.link.hidden = false;
    cap.count.textContent = `${pad(Math.round(pos) + 1)} / ${pad(list.length)}`;
  }

  /* only the card in the middle plays its loop */
  function pauseAll() { deck.querySelectorAll('video').forEach(v => { v.pause(); v.classList.remove('on'); }); }
  function playActive() {
    if (reduce || view !== 'cards') return;
    const v = cards[Math.round(pos)] && cards[Math.round(pos)].querySelector('video');
    if (!v) return;
    if (!v.src) v.src = v.dataset.src;
    v.play().then(() => v.classList.add('on')).catch(() => {});
  }

  /* ---------- Input: drag / swipe, wheel, keys, tap ---------- */
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    if (view !== 'cards' || e.button > 0) return;
    drag = { x: e.clientX, start: pos, t: performance.now(), moved: false, last: e.clientX, v: 0, id: e.pointerId };
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; stage.setPointerCapture(drag.id); stage.classList.add('dragging'); pauseAll(); }
    if (!drag.moved) return;
    const now = performance.now();
    drag.v = (e.clientX - drag.last) / Math.max(1, now - drag.t); drag.last = e.clientX; drag.t = now;
    const step = deck.clientWidth * 0.64;
    pos = target = Math.max(-0.4, Math.min(list.length - 0.6, drag.start - dx / step));
    layout();
    const i = Math.round(pos); if (i !== active) { active = i; caption(); }
  });
  const end = () => {
    if (!drag) return;
    stage.classList.remove('dragging');
    /* a quick flick carries one extra card, never more */
    if (drag.moved) go(Math.round(pos) - Math.max(-1, Math.min(1, Math.round(drag.v * 1.2))));
    setTimeout(() => { drag = null; }, 0);
  };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);

  /* a drag never opens a card; tapping a side card brings it to the middle; tapping the middle card opens it */
  deck.addEventListener('click', e => {
    const c = e.target.closest('.card'); if (!c) return;
    if (drag && drag.moved) { e.preventDefault(); return; }
    const i = +c.dataset.i;
    if (i !== Math.round(pos)) { e.preventDefault(); go(i); }
  });
  deck.addEventListener('dragstart', e => e.preventDefault());

  let acc = 0, accT = 0;
  stage.addEventListener('wheel', e => {
    if (view !== 'cards') return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    e.preventDefault();
    const now = performance.now(); if (now - accT > 220) acc = 0; accT = now;
    acc += d;
    if (Math.abs(acc) > 70) { go(Math.round(target) + Math.sign(acc)); acc = 0; }
  }, { passive: false });

  addEventListener('keydown', e => {
    if (view !== 'cards' || root.classList.contains('menu-open')) return;
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(target) + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(target) - 1); }
  });
  $('[data-prev]').addEventListener('click', () => go(Math.round(target) - 1));
  $('[data-next]').addEventListener('click', () => go(Math.round(target) + 1));
  addEventListener('resize', () => layout());

  /* ---------- Folders: a stack of sleeves per folder; open one to swipe through it ---------- */
  function buildFolders() {
    foldersEl.innerHTML = FOLDERS.map(f => {
      const ps = D.projects.filter(p => p.folder === f);
      const top = ps[0];
      return `<button type="button" class="folder" data-folder="${f}">
        <span class="folder-stack" aria-hidden="true">
          ${ps.slice(1, 3).reverse().map((p, k) => `<span class="sheet sheet--${k}" style="--bg:${p.bg}"></span>`).join('')}
          <span class="sheet-top" style="--bg:${top.bg}"><img src="${base + (top.poster || top.img)}" alt="" loading="lazy"></span>
        </span>
        <span class="folder-name">${f}</span>
        <span class="folder-count mono">${pad(ps.length)} ${ps.length === 1 ? 'project' : 'projects'}</span>
      </button>`;
    }).join('');
  }
  foldersEl.addEventListener('click', e => {
    const b = e.target.closest('[data-folder]'); if (!b) return;
    folder = b.dataset.folder; tag = 'All'; setView('cards'); build();
  });

  build();
  setView('cards');
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => layout());
})();
