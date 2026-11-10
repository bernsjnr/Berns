/* =========================================================
   BERNS: Shop (v9, Nov 2026)
   A crate of prints, stacked front to back like records in a box.
   Scroll, swipe, arrow keys or tap one further back: the print you land on lifts out of the crate
   so you can see more of it; the ones you have passed drop down in front. Tap the lifted print to open it.
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

  crate.innerHTML = list.map((p, i) => `
    <a class="book" href="print.html?p=${encodeURIComponent(p.id)}" data-i="${i}" aria-label="${p.name}, from £${from}" draggable="false">
      <span class="slab">
        <span class="f f-front"><img src="${base + p.img}" alt="" ${i > 3 ? 'loading="lazy"' : ''} draggable="false"></span>
        <span class="f f-t" style="background-image:url('${base + p.img}')"></span>
      </span>
    </a>`).join('');
  const books = [...crate.children];

  let pos = 0, target = 0, raf = 0, active = -1;
  const n = list.length;
  const mod = v => ((v % n) + n) % n;
  const idx = () => mod(Math.round(pos));
  /* the crate loops: every print sits at its shortest distance round the ring from the one in hand */
  const wrap = d => { d = mod(d); return d >= n / 2 ? d - n : d; };
  const LIFT = 0.16; /* how far the print in hand lifts out, as a share of its height */
  const smooth = t => t * t * (3 - 2 * t);

  /* d = how far a print is from the one in hand. Behind (d > 0): standing, stepping back into the box.
     In hand (d = 0): lifted out. Passed (d < 0): dropped down and leaning forward, tucked behind the front of the crate. */
  function layout() {
    const H = crate.clientHeight;
    books.forEach((b, i) => {
      const d = wrap(i - pos);
      let ty, tz, rx, op = 1, lift = 0;
      if (d >= 0) {
        lift = smooth(Math.max(0, 1 - d));
        /* spaced right out: each print behind steps well clear of the one in front, and fades with distance */
        ty = -lift * LIFT * H - Math.min(d, 1) * 0.1 * H - d * 0.075 * H; tz = -d * 0.02 * H; rx = 0;
        op = Math.max(0, Math.min(1, (5.6 - d) / 0.7));
      } else {
        const p = smooth(Math.min(1, -d));
        ty = (1 - p) * -LIFT * H + p * 0.6 * H; tz = -d * 0.03 * H; rx = -10 * p;
        op = Math.max(0, Math.min(1, (1 + d) / 0.35));
        lift = 1 - p;
      }
      b.style.transform = `translate3d(0,${ty.toFixed(1)}px,${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg)`;
      b.style.zIndex = 200 - Math.round((d + n) * 10) % 1000 + (d < 0 ? 400 : 0);
      b.style.zIndex = d >= 0 ? 300 - Math.round(d * 10) : 100 + Math.round(d * 10);
      b.style.opacity = op.toFixed(3);
      b.style.pointerEvents = op < 0.3 || d < -0.5 ? 'none' : '';
      /* fade by darkening toward the ink (not by see-through), so the prints behind stay solid and never show each other through */
      b.style.setProperty('--dim', (d <= 1 ? 0.5 * smooth(Math.max(0, d)) : Math.min(0.8, 0.5 + (d - 1) * 0.08)).toFixed(3));
      b.style.setProperty('--lift', lift.toFixed(3));
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
    pos = target = drag.start - m / (crate.clientHeight * 0.3);
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

  addEventListener('keydown', e => {
    if (root.classList.contains('menu-open')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(target) + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(target) - 1); }
  });
  addEventListener('resize', layout);

  layout(); changed();
  /* the first print lifts out on arrival */
  if (!reduce) { pos = 0.999; layout(); requestAnimationFrame(() => go(0)); }
})();
