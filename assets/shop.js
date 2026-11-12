/* =========================================================
   BERNS: Shop (v9, Nov 2026)
   Double-sided prints on a curved rack, tilted on a diagonal (after the A24 disc gallery reference).
   Scroll, swipe, arrow keys or tap one. The print in hand is full size and lifted; the others step back along the rack.
   Tap the print in hand to open it. The rack loops.
   Content from assets/data.js (posters, sizes).
   ========================================================= */
(() => {
  const D = window.BERNS;
  const base = document.body.dataset.base || '';
  const $ = s => document.querySelector(s);
  const stage = $('[data-stage]'), crate = $('[data-crate]');
  const cap = { name: $('[data-cap-name]'), meta: $('[data-cap-meta]'), link: $('[data-cap-link]') };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const from = Math.min(...D.sizes.map(s => s.price));
  const pad = n => String(n).padStart(2, '0');
  const list = D.posters;
  const n0 = list.length;

  /* each print is a thin double-sided slab: the same artwork on both sides, so it reads from any angle */
  crate.innerHTML = '<div class="rig" data-rig>' + list.map((p, i) => `
    <a class="book" href="print.html?p=${encodeURIComponent(p.id)}" data-i="${i}" aria-label="${p.name}, from £${from}" draggable="false">
      <span class="slab">
        <span class="f f-front"><img src="${base + p.img}" alt="" ${i > 3 ? 'loading="lazy"' : ''} draggable="false"></span>
        <span class="f f-back" aria-hidden="true"><img src="${base + p.img}" alt="" ${i > 3 ? 'loading="lazy"' : ''} draggable="false"></span>
        <span class="f e e-t"></span><span class="f e e-b"></span><span class="f e e-l"></span><span class="f e e-r"></span>
      </span>
    </a>`).join('') + '</div>';
  const rig = crate.firstElementChild;
  const books = [...rig.children];

  let pos = 0, target = 0, raf = 0, active = -1;
  const n = list.length;
  const mod = v => ((v % n) + n) % n;
  const idx = () => mod(Math.round(pos));
  /* the crate loops: every print sits at its shortest distance round the ring from the one in hand */
  const wrap = d => { d = mod(d); return d >= n / 2 ? d - n : d; };
  const smooth = t => t * t * (3 - 2 * t);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* The prints hang on a curved wall in front of you, like a rack in a shop, the whole row tilted on a diagonal.
     d = how far a print is from the one in hand. The one in hand is full size and lifted; the rest step back,
     smaller, each turned in toward you. The row leans into the direction you scroll. */
  const STEP = 0.33;      /* radians round the arc per print */
  const RX = 3.4, RZ = 2.4; /* arc size, in print widths */
  function layout() {
    const W = crate.clientWidth, H = crate.clientHeight;
    const vel = target - pos;
    const lean = reduce ? 0 : clamp(Math.sign(vel) * Math.sqrt(Math.abs(vel)) * 0.055, -0.3, 0.3);
    books.forEach((b, i) => {
      const d = wrap(i - pos), a = Math.abs(d);
      const ang = clamp(d * STEP, -1.3, 1.3);
      const x = Math.sin(ang) * RX * W;
      const z = (1 - Math.cos(ang)) * RZ * W + (a < 1 ? (1 - a) * 0.3 * W : 0);
      const y = -(1 - Math.min(1, a)) * 0.05 * H;
      const sc = Math.max(0.8, 1.08 - a * 0.2);
      const ry = -ang * 57.2958 + lean * (a < 0.5 ? 1 : 1.12) * 57.2958;
      const rz = -lean * 0.32 * (a < 0.5 ? 0.7 : 1) * 57.2958;
      const op = clamp((3.6 - a) / 0.8, 0, 1);
      b.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      b.style.opacity = op.toFixed(3);
      b.style.pointerEvents = op < 0.3 || a > 3 ? 'none' : '';
      /* fade by darkening toward the ink, not see-through, so prints never show each other through */
      b.style.setProperty('--dim', Math.min(0.85, 0.34 * smooth(Math.min(1, a)) + Math.max(a - 1, 0) * 0.16).toFixed(3));
      b.tabIndex = idx() === i ? 0 : -1;
    });
  }
  function caption() {
    const i = idx(), p = list[i];
    cap.name.textContent = p.name;
    cap.meta.textContent = `Edition of ${p.edition || 50} · from £${from}`;
    cap.link.href = books[i].href;
  }
  function changed() { const i = idx(); if (i !== active) { const first = active < 0; active = i; caption(); if (!first && window.BERNS_HAPTIC) window.BERNS_HAPTIC(10); } }
  function tick() {
    const d = target - pos;
    pos = reduce || Math.abs(d) < 0.001 ? target : pos + d * 0.14;
    layout(); changed();
    raf = pos !== target ? requestAnimationFrame(tick) : 0;
  }
  function go(i) { target = i; if (!raf) raf = requestAnimationFrame(tick); }

  /* wheel / trackpad: one print per nudge */
  let acc = 0, accT = 0;
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const now = performance.now(); if (now - accT > 220) acc = 0; accT = now;
    acc += d;
    if (Math.abs(acc) > 60) { go(Math.round(target) + Math.sign(acc)); acc = 0; }
  }, { passive: false });

  /* drag / swipe: pull up (or left) to go deeper into the crate, down (or right) to come back */
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    drag = { x: e.clientX, y: e.clientY, start: pos, moved: false, id: e.pointerId, last: e.clientY, t: performance.now(), v: 0 };
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; try { stage.setPointerCapture(drag.id); } catch (_) {} stage.classList.add('dragging'); }
    if (!drag.moved) return;
    const m = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    const now = performance.now(); drag.v = (m - drag.last) / Math.max(1, now - drag.t); drag.last = m; drag.t = now;
    pos = target = drag.start - m / (crate.clientWidth * 1.2);
    layout(); changed();
  });
  const end = () => {
    if (!drag) return;
    stage.classList.remove('dragging');
    if (drag.moved) go(Math.round(pos) - Math.max(-1, Math.min(1, Math.round(drag.v * 1.2))));
    setTimeout(() => { drag = null; }, 0);
  };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);

  /* a drag never opens a print; tapping one further back brings it up; tapping the lifted one opens it */
  crate.addEventListener('click', e => {
    const b = e.target.closest('.book'); if (!b) return;
    if (drag && drag.moved) { e.preventDefault(); return; }
    const i = +b.dataset.i;
    if (i !== idx()) { e.preventDefault(); go(Math.round(pos) + wrap(i - Math.round(pos))); }
  });
  crate.addEventListener('dragstart', e => e.preventDefault());
  crate.addEventListener('focusin', e => { const b = e.target.closest('.book'); if (b && +b.dataset.i !== idx()) go(Math.round(pos) + wrap(+b.dataset.i - Math.round(pos))); });

  $('[data-prev]').addEventListener('click', () => go(Math.round(target) - 1));
  $('[data-next]').addEventListener('click', () => go(Math.round(target) + 1));

  addEventListener('keydown', e => {
    if (root.classList.contains('menu-open')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(target) + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(target) - 1); }
  });
  addEventListener('resize', layout);

  layout(); changed();
  /* the first print lifts out on arrival */
  if (!reduce) { pos = 2.6; layout(); requestAnimationFrame(() => go(0)); }
})();
