/* =========================================================
   BERNS: core behaviour (v9, Nov 2026)
   Live date and time, battery, full-screen menu, rotatable
   photo, pixel cursor. Pages set <body data-base="../"> so
   asset paths work from any folder.
   ========================================================= */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const base = body.dataset.base || '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Name: on touch screens (no hover) the first tap shows (ALSO KNOWN AS 'BERNS') for a few seconds;
     a second tap follows the link. On the page it links to, taps just toggle it. */
  {
    const a = document.querySelector('.bar-name a');
    if (a && matchMedia('(hover: none)').matches) {
      let t;
      const here = new URL(a.href, location.href).pathname === location.pathname;
      a.addEventListener('click', e => {
        if (!a.classList.contains('show')) {
          e.preventDefault();
          a.classList.add('show');
          clearTimeout(t); t = setTimeout(() => a.classList.remove('show'), 3500);
        } else if (here) { e.preventDefault(); a.classList.remove('show'); clearTimeout(t); }
      });
      document.addEventListener('pointerdown', e => { if (!a.contains(e.target)) a.classList.remove('show'); }, { passive: true });
    }
  }

  /* Date and time, in the visitor's own time zone, like a device status bar */
  {
    const el = document.querySelector('[data-clock]');
    if (el) {
      const date = el.querySelector('.clock-date');
      const time = el.querySelector('.clock-time');
      const D = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const p = n => String(n).padStart(2, '0');
      let last = '';
      const tick = () => {
        const d = new Date();
        const t = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
        if (t !== last) {
          last = t;
          date.textContent = `${D[d.getDay()]}, ${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()} · `;
          time.textContent = t;
          el.setAttribute('datetime', d.toISOString());
        }
      };
      tick();
      setInterval(tick, 250);
    }
  }

  /* Typewriter (Home): the first role types out, holds, backspaces and moves to the next, like someone typing a message.
     "A" becomes "An" before a vowel. The line's box is held at its tallest version so the layout never jumps.
     Reduced motion: stays on "designer". */
  {
    const hl = document.querySelector('[data-roles]');
    if (hl && !reduce) {
      const roles = hl.dataset.roles.split('|');
      const out = hl.querySelector('.type');
      const art = document.querySelector('.home-line .art');
      const box = document.querySelector('.home-say');
      const article = r => /^[aeiou]/i.test(r) ? 'An' : 'A';
      /* hold the box at the tallest the line gets with any role */
      const size = () => {
        const keep = [out.textContent, art.textContent];
        box.style.minHeight = '';
        let max = 0;
        roles.forEach(r => { out.textContent = r; art.textContent = article(r); max = Math.max(max, box.offsetHeight); });
        [out.textContent, art.textContent] = keep;
        box.style.minHeight = max + 'px';
      };
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(size);
      addEventListener('resize', size);
      const wait = ms => new Promise(r => setTimeout(r, ms));
      (async () => {
        let i = 0;
        await wait(2600);
        for (;;) {
          const cur = roles[i];
          hl.classList.add('typing');
          for (let n = cur.length; n > 0; n--) { out.textContent = cur.slice(0, n - 1); await wait(38 + Math.random() * 20); }
          i = (i + 1) % roles.length;
          const next = roles[i];
          art.textContent = article(next);
          await wait(260);
          for (let n = 1; n <= next.length; n++) { out.textContent = next.slice(0, n); await wait(70 + Math.random() * 60); }
          hl.classList.remove('typing');
          await wait(next === 'designer' ? 2600 : 1900);
        }
      })();
    }
  }

  /* Marquee: double the logo set so the line can slide by half and loop without a seam.
     Speed is set from the width so it always drifts at the same calm pace. */
  document.querySelectorAll('[data-marquee]').forEach(ul => {
    [...ul.children].forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.removeAttribute('aria-label'); ul.appendChild(c); });
    const pace = () => ul.style.setProperty('--dur', Math.max(14, ul.scrollWidth / 2 / 60).toFixed(1) + 's');
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(pace);
    addEventListener('resize', pace);
  });

  /* Battery: the visitor's real level where the browser exposes it (Chrome, Edge, Android).
     Everywhere else (Safari, iPhone, Firefox) it shows a full battery. */
  {
    const el = document.querySelector('[data-battery]');
    if (el) el.hidden = false;
    if (el && navigator.getBattery) {
      navigator.getBattery().then(b => {
        const fill = el.querySelector('.fill');
        const draw = () => {
          const lvl = Math.max(0.06, b.level);
          fill.setAttribute('width', (28 * lvl).toFixed(1));
          el.classList.toggle('charging', b.charging);
          el.setAttribute('aria-label', `Battery ${Math.round(b.level * 100)}%${b.charging ? ', charging' : ''}`);
          el.title = `${Math.round(b.level * 100)}%`;
        };
        draw();
        b.addEventListener('levelchange', draw);
        b.addEventListener('chargingchange', draw);
      }).catch(() => {});
    }
  }

  /* Menu: MENU + opens a full-screen Berns Blue takeover and becomes CLOSE −. Esc closes. */
  {
    const btn = document.querySelector('[data-menu-btn]');
    const menu = document.getElementById('menu');
    const lbl = btn && btn.querySelector('.lbl');
    if (btn && menu) {
      const links = [...menu.querySelectorAll('a')];
      const set = open => {
        root.classList.toggle('menu-open', open);
        btn.setAttribute('aria-expanded', open);
        lbl.textContent = open ? 'Close' : 'Menu';
        menu.inert = !open;
        if (open) setTimeout(() => links[0] && links[0].focus({ preventScroll: true }), reduce ? 0 : 120);
      };
      menu.inert = true;
      btn.addEventListener('click', () => set(!root.classList.contains('menu-open')));
      addEventListener('keydown', e => {
        if (e.key === 'Escape' && root.classList.contains('menu-open')) { set(false); btn.focus(); }
      });
      /* Same-page link (Home on the home page) just closes the menu */
      links.forEach(a => a.addEventListener('click', e => {
        if (a.getAttribute('aria-current') === 'page') { e.preventDefault(); set(false); }
      }));
    }
  }

  /* Photos: straight portrait prints. Pick one up and move it anywhere (mouse or finger); no turning.
     It stays where you leave it; arrow keys nudge it when focused; double-click puts it back.
     On long pages a print stays inside its [data-bounds] chapter, otherwise on screen. */
  document.querySelectorAll('[data-rotate]').forEach(ph => {
    /* About on phones: prints stay put (dragging them while scrolling was confusing) */
    if (ph.closest('.chap') && matchMedia('(max-width: 760px)').matches) {
      ph.removeAttribute('data-rotate'); ph.removeAttribute('tabindex'); ph.removeAttribute('role');
      ph.setAttribute('aria-label', ph.getAttribute('aria-label').replace(' Drag to move it around.', ''));
      return;
    }
    let x = 0, y = 0, drag = null;
    const box = ph.closest('[data-bounds]');
    const apply = () => { ph.style.setProperty('--x', x.toFixed(1) + 'px'); ph.style.setProperty('--y', y.toFixed(1) + 'px'); };
    /* the rect still shows the last applied position (x0, y0), so shift it by what's changed since */
    const keepIn = (x0 = x, y0 = y) => {
      const r = ph.getBoundingClientRect();
      const b = box ? box.getBoundingClientRect() : { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
      const cx = r.left + r.width / 2 + (x - x0), cy = r.top + r.height / 2 + (y - y0);
      x += Math.max(b.left + 16, Math.min(b.right - 16, cx)) - cx;
      y += Math.max(b.top + 16, Math.min(b.bottom - 16, cy)) - cy;
    };
    ph.addEventListener('pointerdown', e => { ph.setPointerCapture(e.pointerId); ph.classList.remove('settle'); drag = { px: e.clientX, py: e.clientY }; });
    ph.addEventListener('pointermove', e => {
      if (!drag) return;
      const x0 = x, y0 = y;
      x += e.clientX - drag.px; y += e.clientY - drag.py;
      drag.px = e.clientX; drag.py = e.clientY;
      keepIn(x0, y0); apply();
    });
    const drop = () => { drag = null; };
    ph.addEventListener('pointerup', drop);
    ph.addEventListener('pointercancel', drop);
    ph.addEventListener('dblclick', () => { ph.classList.add('settle'); x = 0; y = 0; apply(); });
    ph.addEventListener('keydown', e => {
      const s = e.shiftKey ? 40 : 10, x0 = x, y0 = y;
      if (e.key === 'ArrowLeft') x -= s; else if (e.key === 'ArrowRight') x += s;
      else if (e.key === 'ArrowUp') y -= s; else if (e.key === 'ArrowDown') y += s;
      else if (e.key === 'Home' || e.key === '0') { x = 0; y = 0; }
      else return;
      e.preventDefault(); ph.classList.add('settle'); keepIn(x0, y0); apply();
    });
    addEventListener('resize', () => { keepIn(); apply(); });
    apply();
  });

  /* Scrolled: once you leave the top, the fixed bar sits on a solid band in the page colour,
     so titles slide under it instead of through the clock */
  {
    const s = () => root.classList.toggle('scrolled', scrollY > 40);
    addEventListener('scroll', s, { passive: true }); s();
  }

  /* Grounds: the chapter holding the middle of the screen sets the page colour (ink, white or blue) */
  {
    const chaps = [...document.querySelectorAll('body [data-ground]')];
    if (chaps.length) {
      let cur = '';
      const pick = () => {
        const mid = innerHeight / 2;
        const c = chaps.find(s => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
        const g = c ? c.dataset.ground : 'ink';
        if (g !== cur) { cur = g; root.dataset.ground = g; }
      };
      addEventListener('scroll', pick, { passive: true });
      addEventListener('resize', pick);
      pick();
    }
  }

  /* Reveals: fade up into place when they come on screen */
  {
    const els = document.querySelectorAll('[data-reveal]');
    if (els.length) {
      if (reduce || !('IntersectionObserver' in window)) els.forEach(el => el.classList.add('in'));
      else {
        const io = new IntersectionObserver(es => es.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        }), { rootMargin: '0px 0px -12% 0px' });
        els.forEach(el => io.observe(el));
      }
    }
  }

  /* Opening scene (About): pinned while you scroll. 0 to 35%: the greeting holds. 30 to 50%: it fades and shrinks away.
     50 to 92%: the one-line bio appears word by word. */
  {
    const scene = document.querySelector('[data-hello]');
    if (scene) {
      const greet = scene.querySelector('.hello-greet');
      const say = scene.querySelector('.hello-say');
      /* split the line into words, keeping any highlight spans whole */
      const words = [];
      [...say.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.appendChild(s); words.push(s);
          });
          n.replaceWith(frag);
        } else { n.classList.add('w'); words.push(n); }
      });
      const ease = (a, b, p) => Math.max(0, Math.min(1, (p - a) / (b - a)));
      const step = () => {
        const r = scene.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
        greet.style.setProperty('--g', ease(.3, .5, p).toFixed(3));
        const n = Math.round(ease(.5, .92, p) * words.length);
        words.forEach((w, i) => w.classList.toggle('on', i < n));
        scene.classList.toggle('past', p > .05);
      };
      if (reduce) words.forEach(w => w.classList.add('on'));
      else { addEventListener('scroll', () => requestAnimationFrame(step), { passive: true }); addEventListener('resize', step); step(); }
    }
  }

  /* Cursor: the classic pixel set (arrow, pointing hand, hourglass), now 75% of the old size.
     The art is drawn at 2x pixels, so at 75% each art pixel lands on exactly 3 device pixels on a retina screen.
     Arrow by default, hand on links, buttons and the photo, hourglass until the page has loaded.
     Desktop hides the system cursor; on phones it jumps to wherever you touch and follows your finger. */
  {
    const K = 0.75;
    const SET = { arrow: ['arrow', 0, 0, 24, 42], pointer: ['hand', 11, 0, 34, 44], wait: ['hourglass', 13, 22, 26, 44] };
    body.insertAdjacentHTML('beforeend', `<div class="cur" aria-hidden="true" data-k="wait">${Object.entries(SET).map(([k, [f, hx, hy, w, h]]) =>
      `<img class="cur-${k}" src="${base}assets/cursor/${f}.png" width="${w * K}" height="${h * K}" alt="" style="left:${-hx * K}px;top:${-hy * K}px">`).join('')}</div>`);
    const cur = body.querySelector('.cur');
    const LINK = 'a,button,[role="button"],[data-rotate],label,select,summary';
    let mx = -100, my = -100;
    let loading = document.readyState !== 'complete';
    const kind = el => {
      if (loading) return 'wait';
      if (!el || !el.closest) return 'arrow';
      return el.closest(LINK) ? 'pointer' : 'arrow';
    };
    addEventListener('load', () => { loading = false; cur.dataset.k = kind(document.elementFromPoint(mx, my)); });
    const place = (x, y, el) => {
      mx = x; my = y;
      cur.style.transform = `translate3d(${x}px,${y}px,0)`;
      cur.dataset.k = kind(el || document.elementFromPoint(x, y));
      root.classList.add('cur-on');
    };
    addEventListener('pointermove', e => place(e.clientX, e.clientY, document.elementFromPoint(e.clientX, e.clientY)), { passive: true });
    addEventListener('pointerdown', e => place(e.clientX, e.clientY, e.target), { passive: true });
    addEventListener('pointerup', e => { cur.dataset.k = kind(document.elementFromPoint(e.clientX, e.clientY)); }, { passive: true });
    document.addEventListener('mouseleave', () => root.classList.remove('cur-on'));
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) root.classList.add('cur-hide-native');
  }
})();
