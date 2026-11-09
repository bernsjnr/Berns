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

  /* Photo: drag (mouse or finger) to turn it, up to 20deg either way. Stays where you leave it.
     Arrow keys turn it when focused; double-click straightens it. */
  {
    const ph = document.querySelector('[data-rotate]');
    if (ph) {
      const MAX = 20;
      let a = parseFloat(getComputedStyle(ph).getPropertyValue('--a')) || 0;
      let drag = null;
      const clamp = v => Math.max(-MAX, Math.min(MAX, v));
      const apply = () => { ph.style.setProperty('--a', a.toFixed(2) + 'deg'); ph.setAttribute('aria-valuenow', Math.round(a)); };
      const angle = e => {
        const r = ph.getBoundingClientRect();
        return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
      };
      ph.addEventListener('pointerdown', e => {
        ph.setPointerCapture(e.pointerId);
        ph.classList.remove('settle');
        drag = { from: angle(e), start: a };
      });
      ph.addEventListener('pointermove', e => {
        if (!drag) return;
        let d = angle(e) - drag.from;
        if (d > 180) d -= 360; else if (d < -180) d += 360;
        a = clamp(drag.start + d);
        apply();
      });
      const drop = () => { drag = null; };
      ph.addEventListener('pointerup', drop);
      ph.addEventListener('pointercancel', drop);
      ph.addEventListener('dblclick', () => { ph.classList.add('settle'); a = 0; apply(); });
      ph.addEventListener('keydown', e => {
        const step = e.shiftKey ? 5 : 1;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') a = clamp(a - step);
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') a = clamp(a + step);
        else if (e.key === 'Home' || e.key === '0') a = 0;
        else return;
        e.preventDefault();
        ph.classList.add('settle');
        apply();
      });
      apply();
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
