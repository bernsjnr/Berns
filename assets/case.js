/* =========================================================
   BERNS: case study (studios/project.html?p=<id>), v9, Nov 2026.
   After Berns's editorial references (the green Dev Hynes story):
   1. Opener in the project's own colour: title, line, the work in a thin frame, a short summary.
   2. Scroll and the frame opens up: the work grows until it fills the screen, the words drift away.
   3. The write-up reads on white: facts, then each section (label, a lede, the rest), a pull quote
      in the project's colour, extra media between sections.
   4. The close, then the next project waiting at the bottom as a file in its own colour.
   The colour is set in the page head before the first paint (see project.html).
   ========================================================= */
(() => {
  const D = window.BERNS;
  const P = D.projects;
  const p = window.BERNS_CASE || P[0];
  const i = P.indexOf(p);
  const next = P[(i + 1) % P.length];
  const base = document.body.dataset.base || '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const by = q => [q.client, q.discipline, q.year].filter(Boolean).map(esc).join(' &middot; ');

  document.title = `${p.name}. Bernard Bannor`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc && p.summary) desc.content = p.summary;

  /* Text colour that holds up on white: the project's colour if it is dark enough, otherwise ink */
  const lum = hex => {
    const c = hex.replace('#', '').match(/../g).map(h => { const v = parseInt(h, 16) / 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  };
  const accent = 1.05 / (lum(p.bg) + .05) >= 3.2 ? p.bg : 'var(--ink)';

  /* Hero: the cover if there is one, otherwise the loop or the still */
  const heroSrc = p.cover || (p.video ? p.poster : p.img);
  const hero = p.cover || !p.video
    ? `<img src="${base + heroSrc}" alt="${esc(p.name)}" draggable="false">`
    : `<video muted loop playsinline preload="metadata" poster="${base + p.poster}" src="${base + p.video}" aria-label="${esc(p.name)}"></video>`;
  const fig = m => m.video
    ? `<figure class="cs-fig" data-reveal><video muted loop playsinline preload="none" poster="${base + m.poster}" data-src="${base + m.video}"></video></figure>`
    : `<figure class="cs-fig" data-reveal><img src="${base + m.img}" alt="" loading="lazy"></figure>`;

  /* Write-up: "## Heading" starts a section; the first paragraph is the lede */
  const secs = [];
  (p.about || '').split('\n').forEach(l => {
    l = l.trim(); if (!l) return;
    if (l.startsWith('## ')) secs.push({ h: l.slice(3), ps: [] });
    else { if (!secs.length) secs.push({ h: 'The story', ps: [] }); secs[secs.length - 1].ps.push(l); }
  });
  const gallery = (p.gallery || []).slice();
  let body = '';
  secs.forEach((s, k) => {
    body += `<section class="cs-sec" data-reveal>
      <div class="cs-sec-h"><p class="cs-sec-n mono">${pad(k + 1)}</p><h2 class="cs-sec-t">${esc(s.h)}</h2></div>
      <div class="cs-sec-body">${s.ps.map((t, j) => /^Credits:/i.test(t) ? `<p class="cs-credit mono">${esc(t)}</p>` : `<p${k === 0 && j === 0 ? ' class="lede"' : ''}>${esc(t)}</p>`).join('')}</div>
    </section>`;
    if (k === 0 && p.quote) body += `<blockquote class="cs-quote scale" data-reveal><p>${esc(p.quote)}</p></blockquote>`;
    if (k >= 1 && gallery.length) body += fig(gallery.shift());
  });
  if (!secs.length) body += `<section class="cs-sec" data-reveal><div class="cs-sec-h"><p class="cs-sec-n mono">01</p><h2 class="cs-sec-t">The story</h2></div><div class="cs-sec-body"><p class="lede">The full write-up is on its way.</p></div></section>`;
  body += gallery.map(fig).join('');

  const facts = [['Client', p.client], ['Discipline', p.discipline], ['Year', p.year], ['Filed under', p.tags.join(', ')]].filter(([, v]) => v);

  document.getElementById('case').innerHTML = `
    <section class="cs-open" data-ground="project" aria-labelledby="cs-t">
      <div class="cs-pin" data-vt-case="${p.id}">
        <div class="cs-top">
          <p class="cs-crumb mono cs-rise"><a href="index.html">Work</a> / ${pad(i + 1)}</p>
          <h1 class="cs-title scale cs-rise" id="cs-t">${esc(p.name)}</h1>
          <p class="cs-by mono cs-rise">${by(p)}</p>
        </div>
        <div class="cs-slot" data-slot></div>
        <div class="cs-bot">
          <p class="cs-sum cs-rise">${esc(p.summary || '')}</p>
          <p class="cs-cue mono cs-rise" aria-hidden="true">Scroll to read</p>
        </div>
        <span class="cs-ring" data-ring aria-hidden="true"></span>
        <figure class="cs-hero" data-hero>${hero}</figure>
      </div>
    </section>

    <article class="cs-read" data-ground="white" style="--accent:${accent}" aria-label="The write-up">
      <ul class="cs-facts" data-reveal>${facts.map(([k, v]) => `<li><span class="mono">${k}</span><span>${esc(v)}</span></li>`).join('')}</ul>
      ${body}
    </article>

    <section class="chap close" data-ground="ink" aria-labelledby="close-t">
      <span class="chap-n mono" data-reveal>Let&rsquo;s talk</span>
      <h2 class="close-title scale" id="close-t" data-reveal>Time to bring your ideas to life.</h2>
      <a class="close-mail" href="mailto:info@bernsds.com" data-reveal="2">info@bernsds.com</a>
      <div class="btns" data-reveal="3">
        <a class="btn mono" href="mailto:info@bernsds.com?subject=Studio%20enquiry"><span class="go">Studio enquiry</span></a>
        <a class="btn mono" href="mailto:info@bernsds.com?subject=Presenting%20booking"><span class="go">Presenting booking</span></a>
      </div>
    </section>

    <div class="cs-end">
      <a class="cs-next" href="project.html?p=${encodeURIComponent(next.id)}" data-vt-case="${next.id}" style="--bg:${next.bg};--fg:${next.ink ? 'var(--ink)' : 'var(--white)'}">
        <span class="cs-next-l mono"><span>Next project</span><span>${pad(P.indexOf(next) + 1)}</span></span>
        <span class="cs-next-t scale">${esc(next.name)}</span>
        <span class="cs-next-by mono">${by(next)}</span>
        <span class="cs-next-go mono"><span class="go">Open it</span></span>
      </a>
    </div>`;

  /* ---------- The frame opens up ----------
     The work sits in a thin frame in the opener. Scrolling through the pinned opener grows it
     until it fills the width (or the height, under the bar), and the words drift up and away. */
  const sec = document.querySelector('.cs-open');
  const pin = sec.querySelector('.cs-pin');
  const slot = sec.querySelector('[data-slot]');
  const ring = sec.querySelector('[data-ring]');
  const fg = sec.querySelector('[data-hero]');
  const top = sec.querySelector('.cs-top');
  const bot = sec.querySelector('.cs-bot');
  const media = fg.firstElementChild;
  let aspect = p.cover ? 1 : 16 / 9;
  let F = null, T = null;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const measure = () => {
    const pr = pin.getBoundingClientRect();
    const s = slot.getBoundingClientRect();
    const gap = Math.max(6, Math.min(12, innerWidth * .008));
    /* frame: the work fitted inside the slot, with room for the ring */
    let w = s.width - gap * 2, h = w / aspect;
    if (h > s.height - gap * 2) { h = Math.max(40, s.height - gap * 2); w = h * aspect; }
    F = { x: s.left - pr.left + (s.width - w) / 2, y: s.top - pr.top + (s.height - h) / 2, w, h, gap };
    /* open: as wide as the screen, kept under the bar */
    const bar = document.querySelector('.bar');
    const t0 = bar ? bar.getBoundingClientRect().bottom + 12 : 80;
    const room = pr.height - t0 - 20;
    let W = pr.width, H = W / aspect;
    if (H > room) { H = room; W = H * aspect; }
    T = { x: (pr.width - W) / 2, y: t0 + (room - H) / 2, w: W, h: H };
    fg.style.left = T.x + 'px'; fg.style.top = T.y + 'px';
    fg.style.width = T.w + 'px'; fg.style.height = T.h + 'px';
    ring.style.left = F.x - gap + 'px'; ring.style.top = F.y - gap + 'px';
    ring.style.width = F.w + gap * 2 + 'px'; ring.style.height = F.h + gap * 2 + 'px';
  };
  const draw = () => {
    if (!F) return;
    const r = sec.getBoundingClientRect();
    const span = Math.max(1, r.height - innerHeight);
    const prog = reduce ? 0 : clamp(-r.top / span);
    const e = ease(clamp((prog - .04) / .72));
    const x = F.x + (T.x - F.x) * e, y = F.y + (T.y - F.y) * e, w = F.w + (T.w - F.w) * e;
    fg.style.transform = `translate3d(${(x - T.x).toFixed(2)}px,${(y - T.y).toFixed(2)}px,0) scale(${(w / T.w).toFixed(4)})`;
    const words = 1 - clamp(prog / .32);
    top.style.opacity = bot.style.opacity = words.toFixed(3);
    top.style.transform = `translateY(${(-(1 - words) * 48).toFixed(1)}px)`;
    bot.style.transform = `translateY(${((1 - words) * 32).toFixed(1)}px)`;
    ring.style.opacity = (1 - clamp(prog / .12)).toFixed(3);
    pin.classList.toggle('opened', e > .98);
  };
  fg.style.transformOrigin = '0 0';
  const relayout = () => { measure(); draw(); };
  if (media.tagName === 'IMG') {
    const fit = () => { if (media.naturalWidth) { aspect = media.naturalWidth / media.naturalHeight; relayout(); } };
    if (media.complete) fit(); else media.addEventListener('load', fit, { once: true });
  } else media.addEventListener('loadedmetadata', () => { if (media.videoWidth) { aspect = media.videoWidth / media.videoHeight; relayout(); } }, { once: true });
  /* Big Scale titles: step the size down until the longest word fits the width */
  const fitTitles = () => document.querySelectorAll('.cs-title,.cs-next-t').forEach(t => {
    t.style.fontSize = '';
    let f = parseFloat(getComputedStyle(t).fontSize), n = 0;
    while (t.scrollWidth > t.clientWidth + 1 && n++ < 14) { f *= .95; t.style.fontSize = f + 'px'; }
  });
  fitTitles();
  relayout();
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; draw(); }); } }, { passive: true });
  addEventListener('resize', () => { fitTitles(); relayout(); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fitTitles(); relayout(); });

  /* Loops play only while they are on screen */
  if ('IntersectionObserver' in window) {
    const vo = new IntersectionObserver(es => es.forEach(en => {
      const v = en.target;
      if (en.isIntersecting && !reduce) { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); }
      else v.pause();
    }), { threshold: .2 });
    document.querySelectorAll('#case video').forEach(v => vo.observe(v));
  }

  /* A light tick as the frame opens fully */
  let was = false;
  addEventListener('scroll', () => {
    const on = pin.classList.contains('opened');
    if (on && !was && window.BERNS_HAPTIC) window.BERNS_HAPTIC(14);
    was = on;
  }, { passive: true });
})();
