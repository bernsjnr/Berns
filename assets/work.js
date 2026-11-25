/* =========================================================
   BERNS: Work page (v9, Nov 2026). The file stack.
   Every project is a file in its own colour, stacked newest first; each title peeks out
   above the next file. Every file starts closed. Tap a file to open its preview (media, one
   line, Read the case study); tap the open file to read the case study. Desktop and phones.
   On desktop a file lifts out of the pile as you hover it. See all opens every file.
   Filter: one button with a dropdown holding both groups, what it is (Animation, Design,
   Art direction) and who it was for (The Guardian, Studio clients, Community, Personal).
   Tap an option to pick it, tap again to clear it. Content: assets/data.js.
   ========================================================= */
(() => {
  const D = window.BERNS;
  const base = document.body.dataset.base || '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);

  const stack = $('[data-stack]');
  const flt = $('[data-flt]');
  const fltBtn = $('[data-flt-btn]');
  const panel = $('[data-flt-panel]');
  const fltN = $('[data-flt-n]');
  const label = $('[data-label]');
  const count = $('[data-count]');
  const allBtn = $('[data-all]');
  const empty = $('[data-empty]');

  const TAGS = ['Animation', 'Design', 'Art direction'];
  const ORDER = ['The Guardian', 'Studio clients', 'Community', 'Personal'];
  const FOLDERS = [...new Set(D.projects.map(p => p.folder))].sort((a, b) => (ORDER.indexOf(a) + 99) % 99 - (ORDER.indexOf(b) + 99) % 99);
  const pad = n => String(n).padStart(2, '0');
  const url = p => `project.html?p=${encodeURIComponent(p.id)}`;
  const haptic = ms => { if (window.BERNS_HAPTIC) window.BERNS_HAPTIC(ms); };
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let tag = null, folder = null, all = false, cur = null, first = true;

  /* ---------- Filter dropdown ---------- */
  const opt = (k, v) => `<button type="button" class="flt-o" data-${k}="${esc(v)}" aria-pressed="false"><span class="flt-box" aria-hidden="true"></span>${esc(v)}</button>`;
  panel.innerHTML = `
    <div class="flt-g" role="group" aria-label="What it is"><p class="flt-l">What it is</p>${TAGS.map(t => opt('tag', t)).join('')}</div>
    <div class="flt-g" role="group" aria-label="Who it was for"><p class="flt-l">Who it was for</p>${FOLDERS.map(f => opt('folder', f)).join('')}</div>
    <button type="button" class="flt-clear" data-flt-clear>Clear filters</button>`;
  const setOpen = on => {
    panel.hidden = !on;
    fltBtn.setAttribute('aria-expanded', on);
    flt.classList.toggle('on', on);
  };
  fltBtn.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('click', e => { if (!panel.hidden && !flt.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); fltBtn.focus(); } });
  panel.addEventListener('click', e => {
    const t = e.target.closest('[data-tag]'), f = e.target.closest('[data-folder]');
    if (t) tag = tag === t.dataset.tag ? null : t.dataset.tag;
    else if (f) folder = folder === f.dataset.folder ? null : f.dataset.folder;
    else if (e.target.closest('[data-flt-clear]')) { tag = folder = null; setOpen(false); }
    else return;
    haptic(8); build();
  });
  $('[data-clear]').addEventListener('click', () => { tag = folder = null; build(); });
  allBtn.addEventListener('click', () => {
    all = !all;
    allBtn.setAttribute('aria-pressed', all);
    allBtn.textContent = all ? 'Stack' : 'See all';
    stack.classList.toggle('all', all);
    [...stack.children].forEach(li => li.classList.toggle('open', all || li === cur));
    play();
  });

  /* ---------- Files ---------- */
  function media(p) {
    if (p.video) return `<video muted loop playsinline preload="none" poster="${base + (p.poster || p.img)}" data-src="${base + p.video}"></video>`;
    return `<img src="${base + (p.img || p.cover)}" alt="" loading="lazy" draggable="false">`;
  }
  function file(p, i) {
    const n = pad(D.projects.indexOf(p) + 1);
    const side = [p.discipline, p.year].filter(Boolean).map(esc).join(' &middot; ');
    return `<li class="file" style="--bg:${p.bg};--fg:${D.fgOn(p.bg)};--i:${i}">
      <a class="file-a" href="${url(p)}" data-vt-case="${p.id}" draggable="false">
        <span class="file-head">
          <span class="file-title">${esc(p.name)}</span>
          <span class="file-side mono"><span class="file-disc">${side}</span><span class="file-n">${n}</span></span>
        </span>
        <span class="file-body"><span class="file-in"><span class="file-grid">
          <span class="file-media">${media(p)}</span>
          <span class="file-text">
            <span class="file-sum">${esc(p.summary || p.discipline)}</span>
            <span class="file-foot">
              <span class="file-meta mono">${[p.client, p.year].filter(Boolean).map(esc).join(' &middot; ') || esc(p.discipline)}</span>
              <span class="file-go mono"><span class="go">Read the case study</span></span>
            </span>
          </span>
        </span></span></span>
        <span class="file-tail" aria-hidden="true"><span class="file-peek mono">${esc(p.summary || '')}</span></span>
      </a>
    </li>`;
  }

  function build() {
    const list = D.projects.filter(p => (!tag || p.tags.includes(tag)) && (!folder || p.folder === folder));
    panel.querySelectorAll('[data-tag]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tag === tag));
    panel.querySelectorAll('[data-folder]').forEach(b => b.setAttribute('aria-pressed', b.dataset.folder === folder));
    const n = (tag ? 1 : 0) + (folder ? 1 : 0);
    fltN.textContent = n ? ` (${n})` : '';
    panel.querySelector('[data-flt-clear]').hidden = !n;
    label.textContent = n ? [tag, folder].filter(Boolean).join(', ') : 'Recently added';
    count.textContent = `(${list.length})`;
    empty.hidden = !!list.length;
    stack.innerHTML = list.map(file).join('');
    /* every file starts closed. Coming back from a case study, skip the sweep (so the case study
       can shrink back into its file) and bring that file into view. */
    const back = first && window.BERNS_FROM ? window.BERNS_FROM() : null;
    stack.classList.remove('in');
    if (!back) { void stack.offsetWidth; stack.classList.add('in'); }
    const lis = [...stack.children];
    cur = null;
    lis.forEach(li => li.classList.toggle('open', all));
    const from = back && lis.find(li => li.querySelector('.file-a').dataset.vtCase === back);
    if (from) {
      const r = from.getBoundingClientRect();
      if (r.top > innerHeight * .6) scrollTo(0, scrollY + r.top - innerHeight * .4);
    }
    first = false;
    watch(); play();
  }

  /* Pull a file open. The file you tapped stays under your finger while the others slide,
     then the page eases down if the open file runs off the bottom. */
  function open(li, anchor) {
    if (li === cur || all) return;
    const top0 = li.getBoundingClientRect().top;
    if (cur) cur.classList.remove('open');
    li.classList.add('open'); cur = li;
    haptic(12);
    play();
    if (!anchor || reduce) return;
    const t0 = performance.now();
    const step = () => {
      const d = li.getBoundingClientRect().top - top0;
      if (Math.abs(d) > .5) scrollBy(0, d);
      if (performance.now() - t0 < 820) requestAnimationFrame(step);
      else {
        const r = li.getBoundingClientRect(), barH = 96;
        const over = r.bottom - innerHeight + 24;
        if (over > 0) scrollBy({ top: Math.min(over, r.top - barH), behavior: 'smooth' });
      }
    };
    requestAnimationFrame(step);
  }

  stack.addEventListener('click', e => {
    const a = e.target.closest('.file-a'); if (!a) return;
    const li = a.parentElement;
    if (all || li.classList.contains('open')) return;          /* open file: go to the case study */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; /* new tab: let it through */
    e.preventDefault();
    open(li, true);
  });
  /* Keyboard: a file opens as you tab onto it, Enter reads it */
  stack.addEventListener('focusin', e => {
    const a = e.target.closest('.file-a');
    if (a && a.matches(':focus-visible')) open(a.parentElement, false);
  });
  stack.addEventListener('dragstart', e => e.preventDefault());

  /* Only open files on screen play their loop */
  let io = null;
  const seen = new Set();
  function watch() {
    if (io) io.disconnect();
    seen.clear();
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)); play(); }, { threshold: .2 });
    stack.querySelectorAll('video').forEach(v => io.observe(v));
  }
  function play() {
    stack.querySelectorAll('video').forEach(v => {
      const on = !reduce && v.closest('.file').classList.contains('open') && (seen.has(v) || !io);
      if (on) {
        if (!v.src) v.src = v.dataset.src;
        v.play().then(() => v.classList.add('on')).catch(() => {});
      } else if (!v.paused) v.pause();
    });
  }

  build();
})();
