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
  /* The frame round the work: one solid line, white or ink, whichever reads better on the project colour */
  const L = lum(p.bg);
  const ringColour = 1.05 / (L + .05) >= (L + .05) / (lum('#1A1A1A') + .05) ? '#FFFFFF' : '#1A1A1A';

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
  if (!secs.length && !p.chapters) body += `<section class="cs-sec" data-reveal><div class="cs-sec-h"><p class="cs-sec-n mono">01</p><h2 class="cs-sec-t">The story</h2></div><div class="cs-sec-body"><p class="lede">The full write-up is on its way.</p></div></section>`;
  body += gallery.map(fig).join('');

  /* ---------- Editorial chapters (Nov 2026) ----------
     A project can carry `chapters` instead of `about`: [{ h, text: [...], rows: [...] }].
     Each row lays its media out at the media's own shape (r = width / height, so a row of
     different shapes lines up on one height, no cropping):
       full    edge to edge         wide    one piece, page width     offset  one piece, pushed right
       pair    two side by side     trio    three                      quad    four
       palette colour swatches: colours: [[name, hex], ...]
     Items: { img, r, cap } or { video, poster, r, cap }. Row options: bg (ground behind the work), cap.
     Phones: pairs of portraits stay side by side, everything else stacks; trios and quads swipe.
     Then `made` (what I made) and `credits` ([[label, text], ...]) close the read. */
  if (p.chapters) {
    body = '';
    let fn = 0;
    /* The quote, set in the record's own lettering, fading up a line at a time like the end credits */
    const quote = () => p.quoteArt
      ? `<figure class="cs-mantra" data-reveal role="img" aria-label="${esc(p.quote)}" style="--gold:${p.quoteArt.colour || '#F4DC8B'}">
          ${p.quoteArt.lines.map((l, j) => `<span class="ln" style="--r:${l.r};--m:url('${base + l.img}');--d:${(.25 + j * 1.5).toFixed(2)}s"></span>`).join('')}
        </figure>`
      : `<blockquote class="cs-quote scale" data-reveal><p>${esc(p.quote)}</p></blockquote>`;
    /* Instagram stories, as they ran: a phone you can tap through */
    const stories = w => {
      const n = pad(++fn);
      const ico = {
        heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.6 8.4 3.4 5 6.8 5c2.1 0 3.4 1.2 4.2 2.5h2C13.8 6.2 15.1 5 17.2 5c3.4 0 5.2 3.4 4.1 6.3C19.5 15.9 12 20.5 12 20.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
        send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 3 2.5 10.2l7.2 2.9L13 21z M9.7 13.1 21.5 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
      };
      return `<figure class="cs-row r-stories" data-reveal>
        <div class="ig" data-stories tabindex="0" role="region" aria-roledescription="stories" aria-label="${esc(w.cap || 'Stories')}. Left and right arrows move between stories, space pauses.">
          <div class="ig-phone">
            <div class="ig-screen">
              <div class="ig-slides">${w.items.map((m, j) => `<div class="ig-slide${j ? '' : ' on'}" data-ms="${m.ms || 5000}" data-ago="${esc(m.ago || '')}" aria-hidden="${j ? 'true' : 'false'}">${m.video
                ? `<video muted playsinline preload="none" poster="${base + m.poster}" data-src="${base + m.video}" aria-label="${esc(m.cap || '')}"></video>`
                : `<img src="${base + m.img}" alt="${esc(m.cap || '')}" loading="lazy" decoding="async">`}</div>`).join('')}</div>
              <div class="ig-top">
                <div class="ig-bars">${w.items.map(() => '<span><i></i></span>').join('')}</div>
                <div class="ig-head"><img src="${base + w.avatar}" alt="" width="32" height="32"><b>${esc(w.handle)}</b><span class="ig-ago">${esc(w.items[0].ago || '')}</span></div>
              </div>
              <button class="ig-tap ig-prev" type="button" tabindex="-1" aria-label="Previous story"></button>
              <button class="ig-tap ig-next" type="button" tabindex="-1" aria-label="Next story"></button>
              <div class="ig-foot" aria-hidden="true"><span class="ig-reply">Send message</span>${ico.heart}${ico.send}</div>
            </div>
          </div>
        </div>
        ${w.cap ? `<figcaption class="cs-cap mono"><span>${n}</span>${esc(w.cap)}</figcaption>` : ''}
      </figure>`;
    };
    const cell = m => {
      const n = pad(++fn);
      const media = m.video
        ? `<video muted loop playsinline preload="none" poster="${base + m.poster}" data-src="${base + m.video}"${m.cap ? ` aria-label="${esc(m.cap)}"` : ''}></video>`
        : `<img src="${base + m.img}" alt="${esc(m.cap || '')}" loading="lazy" decoding="async">`;
      return `<div class="cs-cell" style="--r:${m.r || 1}">
        <div class="cs-media"${m.bg ? ` style="background:${m.bg}"` : ''}>${media}</div>
        ${m.cap ? `<p class="cs-cap mono"><span>${n}</span>${esc(m.cap)}</p>` : ''}
      </div>`;
    };
    const row = w => {
      if (w.row === 'coin') return `<figure class="cs-row r-coin" data-reveal>
        <div class="cs-coin" data-coin='${esc(JSON.stringify({ faces: w.faces.map(f => base + f) }))}' tabindex="0" role="group" aria-roledescription="3D object" aria-label="${esc(w.label || 'Coin')}, both faces. Drag or use the arrow keys to turn it.">
          <img class="cs-coin-poster" src="${base + w.poster}" alt="" draggable="false">
          <button class="cs-coin-flip mono" type="button" hidden>Turn it</button>
        </div>
        ${w.cap ? `<figcaption class="cs-cap mono"><span>${pad(++fn)}</span>${esc(w.cap)}</figcaption>` : ''}</figure>`;
      if (w.row === 'film') return `<figure class="cs-row r-film" data-reveal>
        <div class="cs-film">
          <button class="cs-play" type="button" data-yt="${esc(w.youtube)}" data-title="${esc(w.title || p.name)}" aria-label="Play ${esc(w.title || 'the film')}">
            <img src="${base + w.poster}" alt="" loading="lazy" decoding="async">
            <span class="cs-play-b mono"><svg viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1l10 6-10 6z" fill="currentColor"/></svg>Play the film</span>
          </button>
        </div>
        <figcaption class="cs-cap mono"><span>${pad(++fn)}</span><span class="t">${esc(w.cap || '')} <a href="https://www.youtube.com/watch?v=${esc(w.youtube)}" target="_blank" rel="noopener">Watch on YouTube</a></span></figcaption></figure>`;
      if (w.row === 'stories') return stories(w);
      if (w.row === 'palette') return `<figure class="cs-row r-palette" data-reveal>
        <div class="cs-swatches">${w.colours.map(([nm, hex]) => `<div class="cs-sw"><span style="background:${hex}"></span><p class="mono">${esc(nm)}<br>${hex}</p></div>`).join('')}</div>
        ${w.cap ? `<figcaption class="cs-cap mono"><span>${pad(++fn)}</span>${esc(w.cap)}</figcaption>` : ''}</figure>`;
      const tall = w.items.every(m => (m.r || 1) <= 1.05);
      return `<figure class="cs-row r-${w.row}${tall ? ' tall' : ''}${w.cap && w.items.some(m => m.cap) ? ' set' : ''}"${w.bg ? ` style="--row-bg:${w.bg}"` : ''} data-reveal>
        <div class="cs-cells">${w.items.map(cell).join('')}</div>
        ${w.cap ? `<figcaption class="cs-cap mono">${w.items.some(m => m.cap) ? '' : `<span>${pad(++fn)}</span>`}${esc(w.cap)}</figcaption>` : ''}
      </figure>`;
    };
    p.chapters.forEach((c, k) => {
      body += `<section class="cs-sec" data-reveal>
        <div class="cs-sec-h"><p class="cs-sec-n mono">${pad(k + 1)}</p><h2 class="cs-sec-t">${esc(c.h)}</h2></div>
        <div class="cs-sec-body">${(c.text || []).map((t, j) => `<p${k === 0 && j === 0 ? ' class="lede"' : ''}>${esc(t)}</p>`).join('')}</div>
      </section>`;
      if (k === 0 && p.quote) body += quote();
      body += (c.rows || []).map(row).join('');
    });
    if (p.made || p.credits) body += `<section class="cs-sec cs-index" data-reveal>
      <div class="cs-sec-h"><p class="cs-sec-n mono">${pad(p.chapters.length + 1)}</p><h2 class="cs-sec-t">Credits</h2></div>
      <div class="cs-sec-body">
        ${p.made ? `<p class="cs-index-l mono">What I made</p><ol class="cs-made">${p.made.map((m, j) => `<li><span class="mono">${pad(j + 1)}</span>${esc(m)}</li>`).join('')}</ol>` : ''}
        ${p.credits ? `<dl class="cs-credits">${p.credits.map(([a, b]) => `<div><dt class="mono">${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>` : ''}
      </div>
    </section>`;
  }

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
      <a class="cs-next" href="project.html?p=${encodeURIComponent(next.id)}" data-vt-case="${next.id}" style="--bg:${next.bg};--fg:${D.fgOn(next.bg)}">
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
  ring.style.setProperty('--ring', ringColour);
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
    const gap = innerWidth < 760 ? 2 : 3; /* the frame's line width: it hugs the work, no gap */
    /* frame: the work fitted inside the slot, with room for the line */
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
    ring.style.setProperty('--ring-w', gap + 'px');
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
    document.querySelectorAll('#case video:not(.ig video)').forEach(v => vo.observe(v));
  }

  /* The coin: three.js, only once it is near the screen (assets/coin.js) */
  const coins = document.querySelectorAll('[data-coin]');
  if (coins.length) {
    const load = () => {
      if (document.querySelector('script[data-coin-js]')) return;
      const s = document.createElement('script');
      s.src = base + 'assets/coin.js?v=1'; s.dataset.coinJs = ''; s.async = true;
      document.head.appendChild(s);
    };
    if ('IntersectionObserver' in window) {
      const co = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { co.disconnect(); load(); } }, { rootMargin: '600px 0px' });
      coins.forEach(c => co.observe(c));
    } else load();
  }

  /* The film: the title card until you press play, then YouTube (no-cookie) in its place */
  document.querySelectorAll('.cs-play').forEach(b => b.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.yt)}?autoplay=1&rel=0&playsinline=1`;
    f.title = b.dataset.title;
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    b.replaceWith(f);
    f.focus();
  }));

  /* Stories: tap the right side for the next, the left for the last, hold to pause. Plays while on screen. */
  document.querySelectorAll('[data-stories]').forEach(ig => {
    const slides = [...ig.querySelectorAll('.ig-slide')];
    const bars = [...ig.querySelectorAll('.ig-bars i')];
    const ago = ig.querySelector('.ig-ago');
    let k = 0, t = 0, last = 0, paused = false, seen = false, raf = 0;
    const media = j => slides[j].querySelector('video');
    const len = j => { const v = media(j); return v && v.duration ? v.duration * 1000 : +slides[j].dataset.ms; };
    const show = j => {
      const v0 = media(k); if (v0) v0.pause();
      k = (j + slides.length) % slides.length; t = 0;
      slides.forEach((s, n) => { s.classList.toggle('on', n === k); s.setAttribute('aria-hidden', n === k ? 'false' : 'true'); });
      bars.forEach((b, n) => { b.style.transform = `scaleX(${n < k ? 1 : 0})`; });
      ago.textContent = slides[k].dataset.ago;
      const v = media(k);
      if (v) { if (!v.src) v.src = v.dataset.src; v.currentTime = 0; if (seen && !paused) v.play().catch(() => {}); }
    };
    const tick = now => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, now - (last || now)); last = now;
      if (!seen || paused) return;
      const v = media(k);
      t = v && v.duration ? v.currentTime * 1000 : t + dt;
      bars[k].style.transform = `scaleX(${Math.min(1, t / len(k)).toFixed(4)})`;
      if (t >= len(k) - 30 && !reduce) show(k + 1);
    };
    const setPause = on => {
      paused = on; ig.classList.toggle('paused', on);
      const v = media(k); if (v) { if (on || !seen) v.pause(); else v.play().catch(() => {}); }
    };
    show(0);
    raf = requestAnimationFrame(tick);
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => {
      seen = e.isIntersecting && !reduce; setPause(paused);
    }), { threshold: .5 }).observe(ig);
    /* hold to pause, a quick tap moves on */
    let down = 0;
    ig.querySelectorAll('.ig-tap').forEach(b => {
      b.addEventListener('pointerdown', () => { down = performance.now(); setPause(true); });
      b.addEventListener('pointerup', () => { const held = performance.now() - down > 260; setPause(false); if (!held) { show(k + (b.classList.contains('ig-next') ? 1 : -1)); if (window.BERNS_HAPTIC) window.BERNS_HAPTIC(8); } });
      b.addEventListener('pointerleave', () => { if (paused && down) { down = 0; setPause(false); } });
      b.addEventListener('click', e => { if (e.detail === 0) show(k + (b.classList.contains('ig-next') ? 1 : -1)); });
      b.addEventListener('contextmenu', e => e.preventDefault());
    });
    ig.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(k + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(k - 1); }
      else if (e.key === ' ') { e.preventDefault(); setPause(!paused); }
    });
  });

  /* A light tick as the frame opens fully */
  let was = false;
  addEventListener('scroll', () => {
    const on = pin.classList.contains('opened');
    if (on && !was && window.BERNS_HAPTIC) window.BERNS_HAPTIC(14);
    was = on;
  }, { passive: true });
})();
