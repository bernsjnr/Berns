/* =========================================================
   BERNS: Shop (v9, Nov 2026)
   The prints stand on shelves like books, turned away. Hover, focus or tap one
   to turn it face on; its neighbours make room. Content from assets/data.js (posters, sizes).
   ========================================================= */
(() => {
  const D = window.BERNS;
  const base = document.body.dataset.base || '';
  const root = document.querySelector('[data-shelves]');
  const cap = { name: document.querySelector('[data-cap-name]'), meta: document.querySelector('[data-cap-meta]'), link: document.querySelector('[data-cap-link]') };
  const phone = matchMedia('(max-width: 760px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const from = Math.min(...D.sizes.map(s => s.price));
  document.querySelector('[data-count]').textContent = `${String(D.posters.length).padStart(2, '0')} prints`;

  const idle = () => {
    cap.name.textContent = 'Prints, checked, signed and posted by me.';
    cap.meta.textContent = D.sizes.map(s => s.label).join(', ') + ' · framed or unframed';
    cap.link.hidden = true;
  };

  function build() {
    const per = phone.matches ? 3 : 6;
    const rows = [];
    for (let i = 0; i < D.posters.length; i += per) rows.push(D.posters.slice(i, i + per));
    root.innerHTML = rows.map((r, ri) => `
      <div class="shelf">
        <div class="shelf-row">${r.map((p, i) => `
          <a class="book" href="print.html?p=${encodeURIComponent(p.id)}" data-id="${p.id}" aria-label="${p.name}, from £${from}">
            <span class="slab">
              <span class="f f-front"><img src="${base + p.img}" alt="" ${ri ? 'loading="lazy"' : ''} draggable="false"></span>
              ${['back', 'l', 'r', 't'].map(k => `<span class="f f-${k}" style="background-image:url('${base + p.img}')"></span>`).join('')}
            </span>
          </a>`).join('')}
        </div>
        <div class="shelf-board" aria-hidden="true"></div>
      </div>`).join('');
    idle();
  }

  /* turn one face on; the books either side shuffle away to make room */
  function focusBook(el) {
    document.querySelectorAll('.shelf-row').forEach(row => {
      const books = [...row.children];
      const h = books.indexOf(el);
      row.classList.toggle('has-active', h > -1);
      books.forEach((b, i) => {
        b.classList.toggle('on', i === h);
        b.style.setProperty('--o', h < 0 ? 0 : Math.sign(i - h));
      });
    });
    if (!el) { idle(); return; }
    const p = D.posters.find(x => x.id === el.dataset.id);
    cap.name.textContent = p.name;
    cap.meta.textContent = `Edition of ${p.edition || 50} · from £${from}`;
    cap.link.href = el.href; cap.link.hidden = false;
    if (window.BERNS_HAPTIC) window.BERNS_HAPTIC(8);
  }

  if (!phone.matches || true) {
    root.addEventListener('pointerover', e => { if (e.pointerType === 'touch' || drag) return; const b = e.target.closest('.book'); if (b) focusBook(b); else if (root.querySelector('.book.on')) focusBook(null); });
    root.addEventListener('pointerleave', () => { if (!drag) focusBook(null); });
    root.addEventListener('focusin', e => { const b = e.target.closest('.book'); if (b) focusBook(b); });
    root.addEventListener('focusout', () => focusBook(null));
  }
  /* Movable: drag a print anywhere with a mouse or pen (not touch, so phones can still scroll). It stays where you drop it;
     Reset puts them all back on the shelves. A drag never opens the print. */
  const resetBtn = document.querySelector('[data-reset]');
  let drag = null, suppress = false, zi = 10;
  root.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' || e.button > 0) return;
    const b = e.target.closest('.book'); if (!b) return;
    drag = { b, x: e.clientX, y: e.clientY, dx: parseFloat(b.dataset.dx) || 0, dy: parseFloat(b.dataset.dy) || 0, moved: false, id: e.pointerId };
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const mx = e.clientX - drag.x, my = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(mx, my) > 6) {
      drag.moved = true; drag.b.classList.add('dragging'); drag.b.closest('.shelf').style.zIndex = ++zi;
      try { drag.b.setPointerCapture(drag.id); } catch (_) {}
      focusBook(drag.b);
    }
    if (!drag.moved) return;
    const b = drag.b; b.dataset.dx = drag.dx + mx; b.dataset.dy = drag.dy + my;
    b.style.setProperty('--dx', b.dataset.dx + 'px'); b.style.setProperty('--dy', b.dataset.dy + 'px');
  });
  const drop = () => {
    if (!drag) return;
    if (drag.moved) { drag.b.classList.remove('dragging'); drag.b.classList.add('moved'); suppress = true; resetBtn.hidden = false; setTimeout(() => { suppress = false; }, 50); }
    drag = null;
  };
  addEventListener('pointerup', drop); addEventListener('pointercancel', drop);
  root.addEventListener('click', e => { if (suppress) { e.preventDefault(); suppress = false; } }, true);
  root.addEventListener('dragstart', e => e.preventDefault());
  resetBtn.addEventListener('click', () => {
    root.querySelectorAll('.book').forEach(b => { delete b.dataset.dx; delete b.dataset.dy; b.style.removeProperty('--dx'); b.style.removeProperty('--dy'); b.classList.remove('moved'); });
    root.querySelectorAll('.shelf').forEach(s => { s.style.zIndex = ''; });
    resetBtn.hidden = true;
  });
  phone.addEventListener('change', () => { build(); resetBtn.hidden = true; });
  build();
})();
