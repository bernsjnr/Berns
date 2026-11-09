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

  /* Photo: pick it up and move it anywhere on screen (mouse or finger). Like a real print, grabbing it
     off-centre makes it turn as you drag, but never past 20deg either way. Stays where you leave it.
     Arrow keys turn it when focused; double-click puts it back, straight.
     Works for every [data-rotate] print. On long pages a print stays inside its [data-bounds] chapter. */
  document.querySelectorAll('[data-rotate]').forEach(ph => {
    {
      const MAX = 20;
      let a = parseFloat(getComputedStyle(ph).getPropertyValue('--a')) || 0;
      let x = 0, y = 0, drag = null;
      const clamp = v => Math.max(-MAX, Math.min(MAX, v));
      const apply = () => {
        ph.style.setProperty('--x', x.toFixed(1) + 'px');
        ph.style.setProperty('--y', y.toFixed(1) + 'px');
        ph.style.setProperty('--a', a.toFixed(2) + 'deg');
        ph.setAttribute('aria-valuenow', Math.round(a));
      };
      const box = ph.closest('[data-bounds]');
      /* Keep at least the middle of the photo on screen (or inside its chapter) */
      const keepIn = (x0 = x, y0 = y) => {
        /* the rect still shows the last applied position (x0, y0), so shift it by what's changed since */
        const r = ph.getBoundingClientRect();
        const b = box ? box.getBoundingClientRect() : { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
        const cx = r.left + r.width / 2 + (x - x0), cy = r.top + r.height / 2 + (y - y0);
        const nx = Math.max(b.left + 16, Math.min(b.right - 16, cx)), ny = Math.max(b.top + 16, Math.min(b.bottom - 16, cy));
        x += nx - cx; y += ny - cy;
      };
      ph.addEventListener('pointerdown', e => {
        ph.setPointerCapture(e.pointerId);
        ph.classList.remove('settle');
        const r = ph.getBoundingClientRect();
        drag = { px: e.clientX, py: e.clientY, ox: e.clientX - (r.left + r.width / 2), oy: e.clientY - (r.top + r.height / 2), size: Math.max(r.width, r.height) };
      });
      ph.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
        drag.px = e.clientX; drag.py = e.clientY;
        const x0 = x, y0 = y;
        x += dx; y += dy;
        if (!reduce) {
          /* turn = grab offset x movement (a little torque); grabbing near the middle just moves it */
          const t = (drag.ox * dy - drag.oy * dx) / (drag.size * drag.size) * 57.3 * 0.9;
          const before = a;
          a = clamp(a + t);
          /* the grab point turns with the photo */
          const rad = (a - before) * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
          [drag.ox, drag.oy] = [drag.ox * c - drag.oy * s, drag.ox * s + drag.oy * c];
        }
        keepIn(x0, y0);
        apply();
      });
      const drop = () => { drag = null; };
      ph.addEventListener('pointerup', drop);
      ph.addEventListener('pointercancel', drop);
      ph.addEventListener('dblclick', () => { ph.classList.add('settle'); a = 0; x = 0; y = 0; apply(); });
      ph.addEventListener('keydown', e => {
        const step = e.shiftKey ? 5 : 1;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') a = clamp(a - step);
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') a = clamp(a + step);
        else if (e.key === 'Home' || e.key === '0') { a = 0; x = 0; y = 0; }
        else return;
        e.preventDefault();
        ph.classList.add('settle');
        apply();
      });
      addEventListener('resize', () => { keepIn(); apply(); });
      apply();
    }
  });

  /* Scrolled: lets the fixed bar put a solid band behind itself once you've left the top */
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
    const LINK = 'a,button,[role="button"],[role="slider"],label,select,summary';
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
