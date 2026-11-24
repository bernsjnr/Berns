/* =========================================================
   BERNS: page to page (v9, Nov 2026). Loaded in <head> on every rebuilt page.
   Uses the browser's own cross-document view transitions (Chrome, Edge, Safari 18.2+):
   the old page fades, the new one lifts in, the top bar holds still, and a project's
   colour carries across: a file on Work grows into its case study and shrinks back
   into it on the way out. The next-project card grows into the next case study.
   Elements that can carry a project say so with data-vt-case="<project id>".
   Browsers without it (Firefox): a soft fade out and in instead.
   Reduced motion: none of it.
   ========================================================= */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cross = 'CSSViewTransitionRule' in window;

  const parse = u => { try { return new URL(u, location.href); } catch (e) { return null; } };
  const pid = u => { const x = parse(u); return x && /\/studios\/project\.html$/.test(x.pathname) ? x.searchParams.get('p') : null; };
  const isWork = u => { const x = parse(u); return !!x && /\/studios\/(index\.html)?$/.test(x.pathname); };
  const here = pid(location.href);
  const fromUrl = () => (window.navigation && navigation.activation && navigation.activation.from && navigation.activation.from.url) || document.referrer;
  window.BERNS_FROM = () => pid(fromUrl());

  /* Name the one element that carries the project across (only if it is on screen) */
  const carry = (id, vt) => {
    if (!id || !vt) return;
    const el = [...document.querySelectorAll('[data-vt-case]')].find(x => {
      if (x.dataset.vtCase !== id) return false;
      const r = x.getBoundingClientRect();
      return r.height > 0 && r.bottom > 0 && r.top < innerHeight;
    });
    if (!el) return;
    el.style.viewTransitionName = 'case';
    vt.finished.finally(() => { el.style.viewTransitionName = ''; });
  };

  if (cross) {
    /* Leaving: the clicked file (or the case study's opener, when heading back to Work) */
    addEventListener('pageswap', e => {
      if (!e.viewTransition) return;
      const to = e.activation && e.activation.entry && e.activation.entry.url;
      carry(pid(to) || (isWork(to) ? here : null), e.viewTransition);
    });
    /* Arriving: the case study's opener, or the file on Work for the project you came from */
    addEventListener('pagereveal', e => {
      if (!e.viewTransition) return;
      if (reduce) { e.viewTransition.skipTransition(); return; }
      carry(here || pid(fromUrl()), e.viewTransition);
    });
  } else if (!reduce) {
    /* No view transitions: fade in on arrival, fade out on the way to another page */
    root.classList.add('fade-in');
    addEventListener('click', e => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target || a.hasAttribute('download')) return;
      const u = parse(a.href);
      if (!u || u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      e.preventDefault();
      root.classList.add('leaving');
      setTimeout(() => { location.href = u.href; }, 240);
    });
    addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('leaving'); });
  }
})();
