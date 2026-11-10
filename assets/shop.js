/* =========================================================
   BERNS: Shop (v9, Nov 2026)
   A stack of double-sided prints that turn on the X axis.
   Scroll, swipe, arrow keys or tap one: the print you land on stands square to you, the ones to come lie back above,
   the ones passed flip over (showing their info side) and lie below. Tap the print in hand to open it.
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

  const sizesTxt = D.sizes.map(z => z.label.replace(/\s/g, '')).join(' · ');
  /* each print is a thin double-sided slab: the artwork on the front, a plain info sheet on the back */
  crate.innerHTML = list.map((p, i) => `
    <a class="book" href="print.html?p=${encodeURIComponent(p.id)}" data-i="${i}" aria-label="${p.name}, from £${from}" draggable="false">
      <span class="slab">
        <span class="f f-front"><img src="${base + p.img}" alt="" ${i > 3 ? 'loading="lazy"' : ''} draggable="false"></span>
        <span class="f f-back" aria-hidden="true"><span class="bk">
          <span class="bk-n mono">${pad(i + 1)} / ${pad(n0)}</span>
          <span class="bk-name">${p.name}</span>
          <span class="bk-rows">
            <span class="bk-row"><i class="mono">Edition</i><b>${p.edition || 50}, signed and numbered</b></span>
            <span class="bk-row"><i class="mono">Sizes</i><b>${sizesTxt}</b></span>
            <span class="bk-row"><i class="mono">From</i><b>£${from}</b></span>
            <span class="bk-row"><i class="mono">Made by</i><b>Printed, checked and posted by Berns</b></span>
          </span>
          <span class="bk-mark scale">Berns</span>
        </span></span>
        <span class="f e e-t"></span><span class="f e e-b"></span><span class="f e e-l"></span><span class="f e e-r"></span>
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

  /* d = how far a print is from the one in hand.
     In hand (d = 0): square on to you. Still to come (d > 0): turned back on the X axis, lying away above, front showing.
     Passed (d < 0): flipped over past the vertical so the back shows, lying forward below. */
  const TILT = 72, FLIP = 108;
  function layout() {
    const H = crate.clientHeight;
    books.forEach((b, i) => {
      const d = wrap(i - pos), a = Math.abs(d), sg = Math.sign(d) || 1;
      const s1 = smooth(Math.min(1, a));
      const ty = sg * ((d >= 0 ? 0.74 : 0.62) * H * s1 + Math.max(a - 1, 0) * 0.2 * H);
      const tz = (1 - Math.min(1, a)) * 0.12 * H - a * 0.05 * H;
      const rx = d >= 0 ? TILT * s1 : -FLIP * s1;
      const op = Math.max(0, Math.min(1, (3.4 - a) / 0.6));
      b.style.transform = `translate3d(0,${ty.toFixed(1)}px,${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg)`;
      b.style.zIndex = 300 - Math.round(a * 10);
      b.style.opacity = op.toFixed(3);
      b.style.pointerEvents = op < 0.3 || a > 2.6 ? 'none' : '';
      /* fade by darkening toward the ink, not see-through, so prints never show each other through */
      b.style.setProperty('--dim', Math.min(0.85, a <= 1 ? 0.38 * smooth(a) : 0.38 + (a - 1) * 0.22).toFixed(3));
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
    pos = target = drag.start - m / (crate.clientHeight * 0.45);
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
