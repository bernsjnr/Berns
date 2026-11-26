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
(window.BERNS_COPY || Promise.resolve()).then(() => { /* after the copy from the sheet is in (assets/copy.js) */
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
    : `<video muted loop playsinline${reduce ? '' : ' autoplay'} preload="auto" poster="${base + p.poster}" src="${base + (p.videoSm && innerWidth < 760 ? p.videoSm : p.video)}" aria-label="${esc(p.name)}"></video>`; /* phones get the lighter cut (videoSm) and it starts loading straight away */
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
    /* The quote, set in the record's own lettering. A pinned scene, like About: scroll and the first line
       fades up out of the dark, then the second, like the end credits; it holds, then lets you go. */
    const quote = () => p.quoteArt
      ? `<section class="cs-mantra" data-mantra data-ground="ink" role="img" aria-label="${esc(p.quote)}" style="--gold:${p.quoteArt.colour || '#F4DC8B'}">
          <div class="cs-mantra-pin">${p.quoteArt.lines.map(l => `<span class="ln" style="--r:${l.r};--m:url('${base + l.img}')"></span>`).join('')}</div>
        </section>`
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
      if (m.sleeve) return `<div class="cs-cell" style="--r:${m.r || 1}">
        <div class="cs-media cs-3d" data-sleeve='${esc(JSON.stringify({ front: base + m.sleeve.front, back: base + m.sleeve.back }))}' tabindex="0" role="group" aria-roledescription="3D object" aria-label="${esc(m.cap || 'The sleeve')}. Drag or use the arrow keys to turn it.">
          <img class="cs-3d-poster" src="${base + m.sleeve.front}" alt="" loading="lazy" decoding="async" draggable="false">
        </div>
        ${m.cap ? `<p class="cs-cap mono"><span>${n}</span>${esc(m.cap)}</p>` : ''}
      </div>`;
      const media = m.video
        ? `<video muted loop playsinline preload="none" poster="${base + m.poster}" data-src="${base + m.video}"${m.cap ? ` aria-label="${esc(m.cap)}"` : ''}></video>`
        : `<img src="${base + m.img}" alt="${esc(m.cap || '')}" loading="lazy" decoding="async">`;
      /* scrub: a play/pause and a slider under the loop, so it can be watched start to end */
      const scrub = m.video && m.scrub ? `<div class="cs-scrub"><button class="cs-pp mono" type="button">Pause</button>
          <input type="range" min="0" max="1000" step="1" value="0" aria-label="Scrub through ${esc(m.cap || 'the video')}">
          <span class="cs-time mono" aria-hidden="true">0:00</span></div>` : '';
      return `<div class="cs-cell" style="--r:${m.r || 1}">
        <div class="cs-media"${m.bg ? ` style="background:${m.bg}"` : ''}>${media}</div>${scrub}
        ${m.cap ? `<p class="cs-cap mono"><span>${n}</span>${esc(m.cap)}</p>` : ''}
      </div>`;
    };
    const row = w => {
      if (w.row === 'coin') return `<figure class="cs-row r-coin" data-reveal>
        <div class="cs-coin" data-coin='${esc(JSON.stringify({ faces: w.faces.map(f => base + f) }))}' tabindex="0" role="group" aria-roledescription="3D object" aria-label="${esc(w.label || 'Coin')}, both faces. Drag or use the arrow keys to turn it.">
          <button class="cs-coin-flip mono" type="button" hidden>Turn it</button>
        </div>
        ${w.cap ? `<figcaption class="cs-cap mono"><span>${pad(++fn)}</span>${esc(w.cap)}</figcaption>` : ''}</figure>`;
      /* A laptop with a live mock of the site: click the tiles, scroll the pages, or watch the tour.
         { row: 'laptop', start: 'hub', tour: [ids], pages: { id: { img, url, links: [{ to, x, y, w, h, label }] } } }
         Link boxes are fractions of the page image (0 to 1). */
      if (w.row === 'laptop') return `<figure class="cs-row r-laptop" data-reveal>
        <div class="lap" data-laptop="${esc(JSON.stringify({ start: w.start, tour: w.tour || [], pages: w.pages }))}">
          <div class="lap-lid"><div class="lap-screen">
            <div class="lap-bar"><i></i><i></i><i></i>
              <button class="lap-back" type="button" aria-label="Back">&larr;</button>
              <span class="lap-url mono"></span></div>
            <div class="lap-view" tabindex="0" aria-label="Scrollable page preview"><div class="lap-page"><img alt="" decoding="async"></div></div>
            <img class="lap-cursor" src="${base}assets/cursor/arrow.png" alt="" aria-hidden="true">
          </div></div>
          <div class="lap-base"></div>
        </div>
        <div class="lap-ui"><p class="lap-hint mono"></p><button class="lap-tour mono" type="button">Play the tour</button></div>
        ${w.cap ? `<figcaption class="cs-cap mono"><span>${pad(++fn)}</span>${esc(w.cap)}</figcaption>` : ''}
      </figure>`;
      if (w.row === 'film') return `<figure class="cs-row r-film${w.r && w.r < 1 ? ' tall' : ''}"${w.r ? ` style="--r:${w.r}"` : ''} data-reveal>
        <div class="cs-film">
          <button class="cs-play" type="button"${w.src ? ` data-src="${base + w.src}"` : ` data-yt="${esc(w.youtube)}"`} data-title="${esc(w.title || p.name)}" aria-label="Play ${esc(w.title || 'the film')}">
            <img src="${/^https?:/.test(w.poster) ? w.poster : base + w.poster}" alt="" loading="lazy" decoding="async" onload="if(this.naturalWidth<=120)this.onerror()" onerror="if(this.dataset.f){this.onerror=null;this.onload=null;this.src='${base + (w.still || 'assets/work/tbim/title-card.webp')}'}else{this.dataset.f=1;this.src='https://i.ytimg.com/vi/${esc(w.youtube)}/hqdefault.jpg'}">
            <span class="cs-play-b mono"><svg viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1l10 6-10 6z" fill="currentColor"/></svg>Play the film</span>
          </button>
        </div>
        <figcaption class="cs-cap mono"><span>${pad(++fn)}</span><span class="t">${esc(w.cap || '')}${w.youtube ? ` <a href="https://www.youtube.com/watch?v=${esc(w.youtube)}" target="_blank" rel="noopener">Watch on YouTube</a>` : ''}</span></figcaption></figure>`;
      /* An embedded social post on the text column: { row: 'post', embed, url, h, cap } */
      if (w.row === 'post') return `<figure class="cs-row r-text r-post" data-reveal>
        <div class="cs-post" style="--h:${w.h || 640}"><iframe src="${esc(w.embed)}" title="${esc(w.cap || 'Post')}" loading="lazy" allowfullscreen></iframe></div>
        <figcaption class="cs-cap mono"><span>${pad(++fn)}</span><span class="t">${esc(w.cap || '')} <a href="${esc(w.url)}" target="_blank" rel="noopener">View on LinkedIn</a></span></figcaption></figure>`;
      if (w.row === 'stories') return stories(w);
      /* A looping carousel: three in view and a hint of the next; swipe, drag, scroll or the arrows */
      if (w.row === 'carousel') return `<figure class="cs-row r-carousel" data-reveal>
        <div class="cs-car" data-carousel tabindex="0" role="region" aria-roledescription="carousel" aria-label="${esc(w.cap || 'Merch')}"><div class="cs-car-track">${w.items.map(cell).join('')}</div></div>
        <div class="cs-car-nav"><button class="cs-car-b" type="button" data-dir="-1" aria-label="Previous"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button><button class="cs-car-b" type="button" data-dir="1" aria-label="Next"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div>
      </figure>`;
      if (w.row === 'palette') return `<figure class="cs-row r-palette" data-reveal>
        <div class="cs-swatches" style="--n:${w.colours.length}">${w.colours.map(([nm, hex]) => `<div class="cs-sw"><span style="background:${hex}"></span><p class="mono">${esc(nm)}<br>${hex}</p></div>`).join('')}</div>
        ${w.cap ? `<figcaption class="cs-cap mono"><span>${pad(++fn)}</span>${esc(w.cap)}</figcaption>` : ''}</figure>`;
      const tall = w.items.every(m => (m.r || 1) <= 1.05);
      return `<figure class="cs-row r-${w.row}${tall ? ' tall' : ''}${w.sync ? '" data-sync="1' : ''}${w.cap && w.items.some(m => m.cap) ? ' set' : ''}"${w.bg || w.w ? ` style="${w.bg ? `--row-bg:${w.bg};` : ''}${w.w ? `--w:${w.w}` : ''}"` : ''} data-reveal>
        <div class="cs-cells"${/^(trio|quad)$/.test(w.row) ? ` style="--rmax:${Math.max(...w.items.map(m => m.r || 1))}"` : ''}>${w.items.map(cell).join('')}</div>${/^(trio|quad)$/.test(w.row) ? `
        <div class="cs-swipe" aria-hidden="true"><span class="cs-swipe-n mono">1 / ${w.items.length}</span><span class="cs-swipe-b"><button class="cs-car-b" type="button" tabindex="-1" data-dir="-1"><svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button><button class="cs-car-b" type="button" tabindex="-1" data-dir="1"><svg viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></span></div>` : ''}
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
      <a class="cs-next" href="project.html?p=${encodeURIComponent(next.id)}" data-vt-case="${next.id}" style="--bg:${next.bg};--fg:${next.fg || D.fgOn(next.bg)}">
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
      if (en.isIntersecting && !reduce && !v.dataset.hold) { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); }
      else v.pause();
    }), { threshold: .2 });
    document.querySelectorAll('#case video:not(.ig video)').forEach(v => { if (!v.closest('[data-sync]')) vo.observe(v); });
    /* Laptop rows: a clickable, scrollable mock of the live pages, with an auto tour until you take over */
    document.querySelectorAll('#case [data-laptop]').forEach(lap => {
      const cfg = JSON.parse(lap.dataset.laptop), P = cfg.pages;
      const fig = lap.closest('figure'), screen = lap.querySelector('.lap-screen'), view = lap.querySelector('.lap-view');
      const page = lap.querySelector('.lap-page'), img = page.querySelector('img'), url = lap.querySelector('.lap-url');
      const back = lap.querySelector('.lap-back'), cur = lap.querySelector('.lap-cursor');
      const hint = fig.querySelector('.lap-hint'), tourBtn = fig.querySelector('.lap-tour');
      const hist = []; let now = null, run = 0, touring = false;
      Object.values(P).forEach(pg => { pg.src = base + pg.img; });
      const say = t => { hint.textContent = t; };
      const show = (id, push) => {
        if (push && now) hist.push(now);
        now = id; const pg = P[id];
        img.src = pg.src; url.textContent = pg.url || '';
        page.querySelectorAll('.lap-hot').forEach(h => h.remove());
        (pg.links || []).forEach(l => {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'lap-hot'; b.dataset.to = l.to; b.setAttribute('aria-label', l.label || 'Open');
          Object.assign(b.style, { left: l.x * 100 + '%', top: l.y * 100 + '%', width: l.w * 100 + '%', height: l.h * 100 + '%' });
          b.addEventListener('click', () => { stop(); show(l.to, true); });
          page.appendChild(b);
        });
        view.scrollTop = 0; back.disabled = !hist.length;
        if (!touring) say(pg.links && pg.links.length ? 'Click an article or the film' : 'Scroll to read, then go back');
      };
      back.addEventListener('click', () => { stop(); if (hist.length) { const id = hist.pop(); show(id); } });
      /* The tour */
      const wait = (ms, id) => new Promise(r => setTimeout(() => r(id === run), ms));
      const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const scrollTo = (y, ms, id) => new Promise(r => {
        const y0 = view.scrollTop, t0 = performance.now();
        const f = t => { if (id !== run) return r(false); const k = Math.min(1, (t - t0) / ms); view.scrollTop = y0 + (y - y0) * ease(k); k < 1 ? requestAnimationFrame(f) : r(true); };
        requestAnimationFrame(f);
      });
      const point = el => { const a = screen.getBoundingClientRect(), b = el.getBoundingClientRect();
        cur.style.transform = `translate(${b.left - a.left + b.width / 2}px, ${b.top - a.top + b.height / 2}px)`; };
      const tap = async (el, id) => { point(el); if (!await wait(950, id)) return false; el.classList.add('on'); cur.classList.add('click');
        if (!await wait(380, id)) return false; cur.classList.remove('click'); el.classList.remove('on'); return true; };
      const tour = async () => {
        const id = ++run; touring = true; tourBtn.hidden = true; cur.style.opacity = 1; say('Touring the site. Scroll or click to take over');
        while (id === run) {
          for (const to of cfg.tour) {
            if (now !== cfg.start) { hist.length = 0; show(cfg.start); }
            const hot = page.querySelector(`.lap-hot[data-to="${to}"]`); if (!hot) continue;
            if (!await wait(700, id)) return;
            const y = Math.max(0, hot.offsetTop - view.clientHeight * .25);
            if (!await scrollTo(y, 900, id)) return;
            if (!await tap(hot, id)) return;
            show(to, true);
            if (!await wait(700, id)) return;
            const end = Math.min(page.offsetHeight - view.clientHeight, page.offsetHeight * .55);
            if (!await scrollTo(end, 4200, id)) return;
            if (!await wait(600, id)) return;
            if (!await tap(back, id)) return;
            show(hist.pop());
          }
        }
      };
      const stop = () => { if (!touring) return; run++; touring = false; cur.style.opacity = 0; cur.classList.remove('click');
        tourBtn.hidden = reduce; const pg = P[now]; say(pg.links && pg.links.length ? 'Click an article or the film' : 'Scroll to read, then go back'); };
      ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(e => view.addEventListener(e, stop, { passive: true }));
      tourBtn.addEventListener('click', () => { hist.length = 0; show(cfg.start); tour(); });
      tourBtn.hidden = true;
      show(cfg.start);
      let started = false;
      new IntersectionObserver(es => {
        const on = es[0].isIntersecting;
        if (on && !started) { started = true; if (reduce) { tourBtn.hidden = true; } else tour(); }
        else if (!on && touring) { run++; touring = false; cur.style.opacity = 0; tourBtn.hidden = false; }
      }, { threshold: .45 }).observe(lap);
    });

    /* Rows with sync: true start together and stay locked to the first loop (e.g. Monzo's pot titles) */
    document.querySelectorAll('#case [data-sync]').forEach(row => {
      const vs = [...row.querySelectorAll('video')], lead = vs[0];
      let ready = null;
      const load = () => ready || (ready = Promise.all(vs.map(v => new Promise(r => {
        if (!v.src) v.src = v.dataset.src;
        v.preload = 'auto';
        if (v.readyState >= 3) r(); else { v.addEventListener('canplaythrough', r, { once: true }); setTimeout(r, 4000); }
      }))));
      lead && lead.addEventListener('timeupdate', () => vs.slice(1).forEach(v => {
        if (!v.paused && Math.abs(v.currentTime - lead.currentTime) > .08) v.currentTime = lead.currentTime;
      }));
      new IntersectionObserver(es => {
        if (es[0].isIntersecting && !reduce) load().then(() => { vs.forEach(v => { v.currentTime = 0; }); vs.forEach(v => v.play().catch(() => {})); });
        else vs.forEach(v => v.pause());
      }, { threshold: .2 }).observe(row);
    });
  }

  /* Trios and quads swipe on phones: a count and arrows so it reads as a carousel */
  document.querySelectorAll('#case .cs-swipe').forEach(nav => {
    const track = nav.parentElement.querySelector('.cs-cells'), cells = [...track.children], n = nav.querySelector('.cs-swipe-n');
    const at = () => { const x = track.scrollLeft + track.clientWidth / 2; let k = 0, d = 1e9;
      cells.forEach((c, j) => { const e = Math.abs(c.offsetLeft - track.offsetLeft + c.offsetWidth / 2 - x); if (e < d) { d = e; k = j; } }); return k; };
    const paint = () => { const k = at(); n.textContent = `${k + 1} / ${cells.length}`;
      nav.querySelector('[data-dir="-1"]').disabled = k === 0; nav.querySelector('[data-dir="1"]').disabled = k === cells.length - 1; };
    nav.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const c = cells[Math.max(0, Math.min(cells.length - 1, at() + +b.dataset.dir))];
      track.scrollTo({ left: c.offsetLeft - track.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    }));
    let t; track.addEventListener('scroll', () => { cancelAnimationFrame(t); t = requestAnimationFrame(paint); }, { passive: true });
    paint();
  });

  /* Scrubbable loops: drag the slider to any point, Pause holds it there */
  document.querySelectorAll('.cs-scrub').forEach(sc => {
    const v = sc.parentElement.querySelector('video');
    const range = sc.querySelector('input'), pp = sc.querySelector('.cs-pp'), tm = sc.querySelector('.cs-time');
    const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    const load = () => { if (!v.src && v.dataset.src) v.src = v.dataset.src; };
    const sync = () => { pp.textContent = v.paused ? 'Play' : 'Pause'; };
    let dragging = false, was = false;
    const paint = () => {
      if (v.duration) { if (!dragging) range.value = Math.round(v.currentTime / v.duration * 1000); tm.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`; }
      range.style.setProperty('--p', range.value / 10 + '%');
    };
    v.addEventListener('timeupdate', paint); v.addEventListener('loadedmetadata', paint);
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
    (function f() { if (!v.paused) paint(); requestAnimationFrame(f); })();
    pp.addEventListener('click', () => {
      load();
      if (v.paused) { delete v.dataset.hold; v.play().catch(() => {}); } else { v.dataset.hold = '1'; v.pause(); }
    });
    const start = () => { load(); if (!dragging) { dragging = true; was = !v.paused; v.pause(); } };
    const end = () => { if (!dragging) return; dragging = false; if (was && !v.dataset.hold) v.play().catch(() => {}); };
    range.addEventListener('pointerdown', start); range.addEventListener('keydown', start);
    range.addEventListener('pointerup', end); range.addEventListener('keyup', end); range.addEventListener('change', end);
    range.addEventListener('input', () => {
      load();
      const go = () => { v.currentTime = range.value / 1000 * v.duration; paint(); };
      if (v.duration) go(); else v.addEventListener('loadedmetadata', go, { once: true });
    });
    sync();
  });

  /* The quote scene: progress through the pinned section drives each line */
  const mantra = document.querySelector('[data-mantra]');
  if (mantra) {
    const lines = [...mantra.querySelectorAll('.ln')];
    const landed = lines.map(() => false);
    const step = (a, b, v) => clamp((v - a) / (b - a));
    const paint = () => {
      const r = mantra.getBoundingClientRect();
      const prog = reduce ? .5 : clamp(-r.top / Math.max(1, r.height - innerHeight));
      const out = 1 - step(.84, 1, prog);
      lines.forEach((l, j) => {
        const a = step(.1 + j * .24, .32 + j * .24, prog);
        const e = 1 - Math.pow(1 - a, 3);
        l.style.opacity = (e * out).toFixed(3);
        l.style.transform = `translateY(${((1 - e) * 18 - (1 - out) * 24).toFixed(1)}px) scale(${(1.04 - e * .04).toFixed(4)})`;
        if (a >= 1 && !landed[j] && window.BERNS_HAPTIC) window.BERNS_HAPTIC(12);
        landed[j] = a >= 1;
      });
    };
    let tk = false;
    addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(() => { tk = false; paint(); }); } }, { passive: true });
    addEventListener('resize', paint);
    paint();
  }

  /* Carousel: the set is laid out three times; drifting past either end jumps back by one set, so it never ends */
  document.querySelectorAll('[data-carousel]').forEach(car => {
    const track = car.querySelector('.cs-car-track');
    const orig = [...track.children];
    orig.forEach(c => { const a = c.cloneNode(true), b = c.cloneNode(true); a.setAttribute('aria-hidden', 'true'); b.setAttribute('aria-hidden', 'true'); track.insertBefore(a, orig[0]); track.appendChild(b); });
    const setW = () => orig[0].offsetLeft - track.children[0].offsetLeft;
    const home = () => { car.style.scrollSnapType = 'none'; car.scrollLeft = setW(); car.offsetWidth; car.style.scrollSnapType = ''; };
    let W = 0;
    const fit = () => { W = setW(); home(); };
    requestAnimationFrame(fit); addEventListener('resize', fit);
    let jt = 0;
    car.addEventListener('scroll', () => {
      clearTimeout(jt);
      jt = setTimeout(() => {
        const x = car.scrollLeft;
        if (x < W * .5 || x > W * 1.5) { car.style.scrollSnapType = 'none'; car.scrollLeft = x < W * .5 ? x + W : x - W; car.offsetWidth; car.style.scrollSnapType = ''; }
      }, 120);
    }, { passive: true });
    const by = dir => { const c = orig[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0); car.scrollBy({ left: dir * c, behavior: reduce ? 'auto' : 'smooth' }); if (window.BERNS_HAPTIC) window.BERNS_HAPTIC(8); };
    car.parentElement.querySelectorAll('.cs-car-b').forEach(b => b.addEventListener('click', () => by(+b.dataset.dir)));
    car.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); by(e.key === 'ArrowRight' ? 1 : -1); } });
    /* mouse drag on desktop */
    let dg = null;
    car.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; dg = { x: e.clientX, l: car.scrollLeft, moved: false }; car.style.scrollSnapType = 'none'; });
    addEventListener('pointermove', e => { if (!dg) return; const dx = e.clientX - dg.x; if (Math.abs(dx) > 3) { dg.moved = true; car.classList.add('drag'); } car.scrollLeft = dg.l - dx; });
    addEventListener('pointerup', () => { if (!dg) return; dg = null; car.classList.remove('drag'); car.style.scrollSnapType = ''; });
    car.addEventListener('dragstart', e => e.preventDefault());
  });

  /* The coin: three.js, only once it is near the screen (assets/coin.js) */
  const coins = document.querySelectorAll('[data-coin],[data-sleeve]');
  if (coins.length) {
    const load = () => {
      if (document.querySelector('script[data-coin-js]')) return;
      const s = document.createElement('script');
      s.src = base + 'assets/coin.js?v=5'; s.dataset.coinJs = ''; s.async = true;
      document.head.appendChild(s);
    };
    if ('IntersectionObserver' in window) {
      const co = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { co.disconnect(); load(); } }, { rootMargin: '600px 0px' });
      coins.forEach(c => co.observe(c));
    } else load();
  }

  /* The film: the title card until you press play, then YouTube (no-cookie) in its place */
  document.querySelectorAll('.cs-play').forEach(b => b.addEventListener('click', () => {
    /* a film we host ourselves (src): our own player, with sound, in place of the card */
    if (b.dataset.src) {
      const v = document.createElement('video');
      Object.assign(v, { src: b.dataset.src, controls: true, playsInline: true, autoplay: true });
      v.setAttribute('aria-label', b.dataset.title);
      b.replaceWith(v); v.play().catch(() => {});
      return;
    }
    const id = encodeURIComponent(b.dataset.yt);
    const f = document.createElement('iframe');
    const origin = /^https?:/.test(location.origin) ? `&origin=${encodeURIComponent(location.origin)}` : '';
    f.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1&enablejsapi=1${origin}`;
    f.title = b.dataset.title;
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.allowFullscreen = true;
    const box = b.parentElement;
    b.replaceWith(f);
    /* listen to the player: error 101/150/153 means it will not play here, so hand over to YouTube */
    f.addEventListener('load', () => f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*'));
    const onMsg = e => {
      if (e.source !== f.contentWindow) return;
      let d; try { d = JSON.parse(e.data); } catch (_) { return; }
      if (d.event === 'onError') {
        removeEventListener('message', onMsg);
        box.innerHTML = `<a class="cs-film-out" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener"><img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" alt=""><span class="cs-play-b mono">Watch it on YouTube</span></a>`;
      }
    };
    addEventListener('message', onMsg);
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
});
