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
              <span class="f f-back"></span><span class="f f-l"></span><span class="f f-r"></span><span class="f f-t"></span>
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
    root.addEventListener('pointerover', e => { if (e.pointerType === 'touch') return; const b = e.target.closest('.book'); if (b) focusBook(b); });
    root.addEventListener('pointerleave', () => focusBook(null));
    root.addEventListener('focusin', e => { const b = e.target.closest('.book'); if (b) focusBook(b); });
    root.addEventListener('focusout', () => focusBook(null));
  }
  phone.addEventListener('change', build);
  build();
})();
