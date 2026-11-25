/* =========================================================
   BERNS: Work copy from a Google Sheet (Nov 2026, Berns's call).
   Berns edits the Text column of "Berns website: Work copy" in his Google Drive; Work and the case
   studies pick it up. The sheet is shared as "anyone with the link can view" and read as CSV.
   Each row's Key (last column) is "<project id>|<path>", e.g. this-bed-i-made|chapters.1.text.0.
   An empty optional paragraph is skipped; a filled one is added.
   Speed: the last copy is kept in this browser for 2 minutes, so moving between pages is instant.
   After that (or with ?fresh in the URL) the page waits for the sheet, up to 1.5s, then falls back
   to the last copy it had, or to the copy in data.js. Google can take a few minutes to serve an edit.
   ========================================================= */
(() => {
  const D = window.BERNS;
  if (!D || !D.copySheet) { window.BERNS_COPY = Promise.resolve(); return; }
  const URL_ = `https://docs.google.com/spreadsheets/d/${D.copySheet}/gviz/tq?tqx=out:csv&headers=1&sheet=Work`;
  const KEY = 'berns-copy', FRESH = 120000, WAIT = 1500;

  /* CSV with quoted cells and line breaks inside them */
  const parse = t => {
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.length > 1).map(r => [r[r.length - 1].trim(), r[r.length - 2]]).filter(([k]) => k.includes('|'));
  };

  /* Put each text where its key points, but only into places that already exist (or the next paragraph) */
  const apply = pairs => {
    pairs.forEach(([key, text]) => {
      const [id, path] = key.split('|');
      const p = D.projects.find(x => x.id === id);
      if (!p || !path) return;
      const seg = path.split('.');
      let o = p;
      for (let i = 0; i < seg.length - 1; i++) { o = o == null ? o : o[seg[i]]; }
      if (o == null || typeof o !== 'object') return;
      const last = seg[seg.length - 1];
      const val = String(text == null ? '' : text).replace(/\s+$/, '');
      if (Array.isArray(o)) {
        const n = +last;
        if (n < o.length) o[n] = val; else if (n === o.length && val) o.push(val);
      } else if (last in o) {
        if (last === 'name' && !val) return; /* never blank a title */
        o[last] = val;
      }
    });
    /* an emptied paragraph or list line disappears */
    D.projects.forEach(p => {
      (p.chapters || []).forEach(c => { if (c.text) c.text = c.text.filter(Boolean); });
      if (p.made) p.made = p.made.filter(Boolean);
    });
  };

  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
  const force = /[?&]fresh\b/.test(location.search);
  const get = () => fetch(URL_, { cache: 'no-store' })
    .then(r => r.ok ? r.text() : Promise.reject(r.status))
    .then(t => { const pairs = parse(t); if (!pairs.length) throw 'empty'; try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), pairs })); } catch (_) {} return pairs; });

  if (!force && cached && Date.now() - cached.t < FRESH) {
    apply(cached.pairs);
    window.BERNS_COPY = Promise.resolve();
    get().catch(() => {});
  } else {
    const late = new Promise(r => setTimeout(() => r(null), WAIT));
    window.BERNS_COPY = Promise.race([get().catch(() => null), late])
      .then(pairs => { const use = pairs || (cached && cached.pairs); if (use) apply(use); })
      .catch(() => {});
  }
})();
