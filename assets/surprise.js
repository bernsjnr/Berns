/* =========================================================
   BERNS: Surprise (v9, Nov 2026)
   Five small games, kept secret: one button picks one at random.
   Plain JS, no libraries. Again restarts it, Surprise me draws another.
   ========================================================= */
(() => {
  const $ = s => document.querySelector(s);
  const stage = $('[data-stage]'), msgEl = $('[data-msg]'), hintEl = $('[data-hint]'), scoreEl = $('[data-score]');
  const tick = ms => { if (window.BERNS_HAPTIC) window.BERNS_HAPTIC(ms || 8); };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = n => Math.floor(Math.random() * n);
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} }
  };
  const ui = {
    msg: t => { msgEl.textContent = t; },
    hint: t => { hintEl.textContent = t; },
    score: t => { scoreEl.textContent = t; }
  };
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  /* ---------------------------------------------------------
     Noughts and crosses: you are X and go first, I am O.
     I play the best move most of the time, but not always.
     --------------------------------------------------------- */
  function noughts(root) {
    const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let b, over, busy, tally = noughts.tally || (noughts.tally = { you: 0, me: 0, draw: 0 });
    const wrap = el('div', 'g g-ttt'), cells = [];
    for (let i = 0; i < 9; i++) {
      const c = el('button', 'ttt-c'); c.type = 'button'; c.setAttribute('aria-label', 'Square ' + (i + 1));
      c.addEventListener('click', () => play(i));
      wrap.appendChild(c); cells.push(c);
    }
    root.appendChild(wrap);

    const win = bd => { for (const l of LINES) if (bd[l[0]] && bd[l[0]] === bd[l[1]] && bd[l[0]] === bd[l[2]]) return l; return null; };
    function best(bd, who) {   /* minimax: +1 O wins, -1 X wins */
      const w = win(bd); if (w) return { s: bd[w[0]] === 'O' ? 1 : -1 };
      const free = bd.map((v, i) => v ? -1 : i).filter(i => i >= 0);
      if (!free.length) return { s: 0 };
      let top = { s: who === 'O' ? -2 : 2, m: free[0] };
      for (const i of free) {
        bd[i] = who; const r = best(bd, who === 'O' ? 'X' : 'O'); bd[i] = null;
        if (who === 'O' ? r.s > top.s : r.s < top.s) top = { s: r.s, m: i };
      }
      return top;
    }
    function draw() {
      cells.forEach((c, i) => { c.textContent = b[i] || ''; c.classList.toggle('x', b[i] === 'X'); c.classList.toggle('o', b[i] === 'O'); c.disabled = !!b[i] || over; });
    }
    function finish() {
      const w = win(b);
      if (w) { over = true; w.forEach(i => cells[i].classList.add('hit')); const you = b[w[0]] === 'X'; you ? tally.you++ : tally.me++; ui.msg(you ? 'You got me. Nicely done.' : 'That one is mine.'); }
      else if (b.every(Boolean)) { over = true; tally.draw++; ui.msg('A draw. Go again?'); }
      score(); draw(); return over;
    }
    function score() { ui.score(`You ${tally.you} · Berns ${tally.me} · Draws ${tally.draw}`); }
    function play(i) {
      if (over || busy || b[i]) return;
      tick(); b[i] = 'X'; draw();
      if (finish()) return;
      busy = true; ui.msg('My turn.');
      setTimeout(() => {
        const free = b.map((v, k) => v ? -1 : k).filter(k => k >= 0);
        const m = Math.random() < 0.2 ? free[rnd(free.length)] : best(b, 'O').m;
        b[m] = 'O'; busy = false; tick(6); draw();
        if (!finish()) ui.msg('Your move.');
      }, reduce ? 0 : 380);
    }
    function reset() { b = Array(9).fill(null); over = false; busy = false; cells.forEach(c => c.classList.remove('hit')); draw(); score(); ui.msg('Your move. You are X.'); ui.hint('Click a square'); }
    reset();
    return { reset, stop() {} };
  }

  /* ---------------------------------------------------------
     Connect 4: you are white, I am blue. Four in a row wins.
     Click a column, or use the arrow keys and Enter.
     --------------------------------------------------------- */
  function connect4(root) {
    const R = 6, C = 7;
    let b, over, busy, col = 3, tally = connect4.tally || (connect4.tally = { you: 0, me: 0, draw: 0 });
    const wrap = el('div', 'g g-c4'), board = el('div', 'c4-board'), cells = [];
    board.setAttribute('role', 'group'); board.setAttribute('aria-label', 'Connect 4 board');
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const d = el('button', 'c4-c'); d.type = 'button'; d.dataset.c = c; d.setAttribute('aria-label', 'Column ' + (c + 1));
      d.addEventListener('click', () => drop(c));
      d.addEventListener('pointerenter', () => { col = c; ghost(); });
      board.appendChild(d); cells.push(d);
    }
    wrap.appendChild(board); root.appendChild(wrap);

    const idx = (r, c) => r * C + c;
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    function line(bd) {
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const p = bd[idx(r, c)]; if (!p) continue;
        for (const [dr, dc] of dirs) {
          const cs = [[r, c]];
          for (let k = 1; k < 4; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= R || cc < 0 || cc >= C || bd[idx(rr, cc)] !== p) break; cs.push([rr, cc]); }
          if (cs.length === 4) return { p, cs };
        }
      }
      return null;
    }
    const open = (bd, c) => { for (let r = R - 1; r >= 0; r--) if (!bd[idx(r, c)]) return r; return -1; };
    function evaluate(bd) {   /* from my point of view (2) */
      let s = 0;
      for (let r = 0; r < R; r++) if (bd[idx(r, 3)] === 2) s += 3; else if (bd[idx(r, 3)] === 1) s -= 3;
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of dirs) {
        let me = 0, you = 0, ok = true;
        for (let k = 0; k < 4; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= R || cc < 0 || cc >= C) { ok = false; break; } const v = bd[idx(rr, cc)]; if (v === 2) me++; else if (v === 1) you++; }
        if (!ok || (me && you)) continue;
        if (me === 3) s += 50; else if (me === 2) s += 6; if (you === 3) s -= 70; else if (you === 2) s -= 6;
      }
      return s;
    }
    const order = [3, 2, 4, 1, 5, 0, 6];
    function search(bd, depth, a, bt, who) {   /* alpha-beta, returns score for 2 */
      const w = line(bd); if (w) return w.p === 2 ? 100000 + depth : -100000 - depth;
      if (!depth || bd.every(Boolean)) return evaluate(bd);
      let best = who === 2 ? -Infinity : Infinity;
      for (const c of order) {
        const r = open(bd, c); if (r < 0) continue;
        bd[idx(r, c)] = who;
        const v = search(bd, depth - 1, a, bt, who === 2 ? 1 : 2);
        bd[idx(r, c)] = 0;
        if (who === 2) { best = Math.max(best, v); a = Math.max(a, v); } else { best = Math.min(best, v); bt = Math.min(bt, v); }
        if (bt <= a) break;
      }
      return best;
    }
    function pick() {
      let bestC = -1, bestV = -Infinity;
      for (const c of order) {
        const r = open(b, c); if (r < 0) continue;
        b[idx(r, c)] = 2; const v = search(b, 4, -Infinity, Infinity, 1); b[idx(r, c)] = 0;
        if (v > bestV) { bestV = v; bestC = c; }
      }
      return bestC;
    }
    function paint(last) {
      cells.forEach((d, i) => {
        d.classList.toggle('you', b[i] === 1); d.classList.toggle('me', b[i] === 2);
        d.classList.toggle('new', i === last && !reduce);
      });
    }
    function ghost() {
      cells.forEach(d => d.classList.remove('ghost', 'col'));
      if (over || busy) return;
      const r = open(b, col); if (r < 0) return;
      cells.forEach(d => { if (+d.dataset.c === col) d.classList.add('col'); });
      cells[idx(r, col)].classList.add('ghost');
    }
    function score() { ui.score(`You ${tally.you} · Berns ${tally.me} · Draws ${tally.draw}`); }
    function end() {
      const w = line(b);
      if (w) { over = true; w.cs.forEach(([r, c]) => cells[idx(r, c)].classList.add('hit')); if (w.p === 1) { tally.you++; ui.msg('Four in a row. You win.'); } else { tally.me++; ui.msg('Four in a row. That one is mine.'); } }
      else if (b.every(Boolean)) { over = true; tally.draw++; ui.msg('The board is full. A draw.'); }
      score(); ghost(); return over;
    }
    function drop(c) {
      if (over || busy) return;
      const r = open(b, c); if (r < 0) return;
      tick(); b[idx(r, c)] = 1; paint(idx(r, c));
      if (end()) return;
      busy = true; ghost(); ui.msg('My turn.');
      setTimeout(() => {
        const m = pick(), rr = open(b, m); b[idx(rr, m)] = 2; busy = false; tick(6); paint(idx(rr, m));
        if (!end()) { ui.msg('Your move.'); ghost(); }
      }, reduce ? 0 : 450);
    }
    const key = e => {
      if (e.key === 'ArrowLeft') { col = (col + C - 1) % C; ghost(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { col = (col + 1) % C; ghost(); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { drop(col); e.preventDefault(); }
    };
    addEventListener('keydown', key);
    function reset() { b = Array(R * C).fill(0); over = false; busy = false; cells.forEach(d => d.classList.remove('hit')); paint(-1); ghost(); score(); ui.msg('Your move. You are white.'); ui.hint('Click a column, or use the arrow keys and Enter'); }
    reset();
    return { reset, stop() { removeEventListener('keydown', key); } };
  }

  /* ---------------------------------------------------------
     Snake: arrow keys or WASD, or swipe. Eat the blue squares.
     --------------------------------------------------------- */
  function snake(root) {
    const N = 20, BEST = 'berns-snake-best';
    const wrap = el('div', 'g g-snake'), cv = el('canvas', 'snake-cv');
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Snake board');
    wrap.appendChild(cv); root.appendChild(wrap);
    const x = cv.getContext('2d');
    let size = 0, body, dir, next, food, state, score, best = +store.get(BEST) || 0, timer = 0, speed;

    function fit() {
      const r = wrap.getBoundingClientRect(), s = Math.floor(Math.min(r.width, r.height));
      const dpr = Math.min(devicePixelRatio || 1, 3);
      size = s; cv.style.width = s + 'px'; cv.style.height = s + 'px'; cv.width = cv.height = Math.round(s * dpr);
      x.setTransform(dpr, 0, 0, dpr, 0, 0); render();
    }
    function placeFood() {
      do { food = [rnd(N), rnd(N)]; } while (body.some(p => p[0] === food[0] && p[1] === food[1]));
    }
    function render() {
      const c = size / N;
      x.clearRect(0, 0, size, size);
      x.fillStyle = '#1A1A1A'; x.fillRect(0, 0, size, size);
      x.strokeStyle = '#FFFFFF'; x.lineWidth = 1; x.strokeRect(0.5, 0.5, size - 1, size - 1);
      if (!body) return;
      x.fillStyle = '#080CDF'; x.fillRect(food[0] * c + 1, food[1] * c + 1, c - 2, c - 2);
      x.strokeStyle = '#FFFFFF'; x.strokeRect(food[0] * c + 1.5, food[1] * c + 1.5, c - 3, c - 3);
      x.fillStyle = '#FFFFFF';
      body.forEach((p, i) => { const g = i === 0 ? 0 : 1; x.fillRect(p[0] * c + g, p[1] * c + g, c - g * 2, c - g * 2); });
    }
    function status() { ui.score(`Score ${score} · Best ${best}`); }
    function step() {
      dir = next;
      const h = [body[0][0] + dir[0], body[0][1] + dir[1]];
      const eat = h[0] === food[0] && h[1] === food[1];
      const tail = eat ? body : body.slice(0, -1);
      if (h[0] < 0 || h[1] < 0 || h[0] >= N || h[1] >= N || tail.some(p => p[0] === h[0] && p[1] === h[1])) return die();
      body.unshift(h);
      if (eat) { score++; tick(10); if (score > best) { best = score; store.set(BEST, best); } placeFood(); speed = Math.max(60, 120 - score * 3); restartTimer(); status(); }
      else body.pop();
      render();
    }
    function restartTimer() { clearInterval(timer); timer = setInterval(step, speed); }
    function die() {
      clearInterval(timer); state = 'over'; tick(30);
      ui.msg(score > 0 ? `Game over. You got ${score}.` : 'Game over.'); ui.hint('Press any arrow key, or tap, to go again');
    }
    function go(d) {
      if (state === 'over') { reset(); }
      if (state === 'ready') { state = 'run'; ui.msg(''); ui.hint('Arrow keys, WASD or swipe'); restartTimer(); }
      if (d[0] + dir[0] === 0 && d[1] + dir[1] === 0) return;   /* no U-turns */
      next = d;
    }
    const KEYS = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
    const key = e => { const d = KEYS[e.key]; if (!d || e.metaKey || e.ctrlKey || e.altKey) return; e.preventDefault(); go(d); };
    addEventListener('keydown', key);
    let t0 = null;
    const ts = e => { const t = e.changedTouches[0]; t0 = [t.clientX, t.clientY]; };
    const te = e => {
      if (!t0) return; const t = e.changedTouches[0], dx = t.clientX - t0[0], dy = t.clientY - t0[1]; t0 = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) { if (state === 'over') reset(); return; }
      go(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
    };
    const tm = e => { if (state === 'run') e.preventDefault(); };
    wrap.addEventListener('touchstart', ts, { passive: true });
    wrap.addEventListener('touchend', te, { passive: true });
    wrap.addEventListener('touchmove', tm, { passive: false });
    wrap.addEventListener('click', () => { if (state === 'over') reset(); });
    const ro = new ResizeObserver(fit); ro.observe(wrap);
    function reset() {
      clearInterval(timer);
      body = [[10, 10], [9, 10], [8, 10]]; dir = next = [1, 0]; score = 0; speed = 120; state = 'ready';
      placeFood(); status(); ui.msg('Press an arrow key, or swipe, to start.'); ui.hint('Arrow keys, WASD or swipe'); render();
    }
    fit(); reset();
    return { reset, stop() { clearInterval(timer); removeEventListener('keydown', key); ro.disconnect(); } };
  }

  /* ---------------------------------------------------------
     Wordle: six tries for a five letter word. Blue = right place,
     white = in the word, dark = not in it. Any five letters count.
     --------------------------------------------------------- */
  const WORDS = ('about above actor adapt admit adult after again agent agree ahead alarm album alert alike alive allow alone along alter among angle angry ankle apart apple apply arena argue arise armed aside asset avoid awake award aware basic beach began begin being below bench black blame blank blend blind block blood bloom board boost brain brand brave bread break breed brick brief bring broad brown brush build bunch burst buyer cabin cable carry catch cause chain chair charm chart chase cheap check chest chief child chose civil claim class clean clear clerk click climb clock close cloth cloud coach coast color count court cover craft crash crazy cream cross crowd crown curve cycle daily dance death delay depth dirty doubt dozen draft drama dream dress drink drive early earth eight elite empty enemy enjoy enter equal error event every exact exist extra faith false fancy fault field fifth fight final first flame flash fleet floor focus force frame fresh front fruit funny ghost giant given glass globe grace grade grain grand grant grape grass great green greet group grown guard guess guest guide happy heart heavy hello honey horse hotel house human humor ideal image index inner input issue ivory joint judge juice knife known label large laser later laugh layer learn least leave legal lemon level light limit linen local logic loose lucky lunch magic major maker march match maybe mayor media metal might minor mixed model money month moral motor mount mouse mouth movie music naive nerve never newly night noble noise north novel nurse ocean offer often olive onion orbit order other outer owner paint panel paper party pause peace pearl phase phone photo piano piece pilot pitch place plain plane plant plate point polar poster pound power press price pride print prior prize proof proud pulse queen quick quiet quote radio raise range rapid ratio reach ready realm reply rhythm rider right river rough round route royal rural salad scale scene scope score sense serve seven shade shape share sharp sheet shelf shift shine shirt shock shore short sight silly since skill sleep slice small smart smile smoke solid solve sound south space spare speak speed spend spice split sport staff stage stamp stand start state steam steel stick stone store storm story strip study style sugar suite sunny super sweet table taste teach thank their theme there thick thing think third three throw tight title today token total touch tough tower track trade trail train treat trend trial tribe trick truck truly trust truth twice under union unity until upper urban usage usual valid value video vivid voice waste watch water weave wheel where which while white whole whose woman world worry worth would write wrong young youth zebra').split(' ');
  function wordle(root) {
    const ROWS = 6, L = 5;
    let answer, row, col, over, gen = 0, tally = wordle.tally || (wordle.tally = { won: 0, played: 0 });
    const wrap = el('div', 'g g-wordle'), grid = el('div', 'wd-grid'), kb = el('div', 'wd-kb');
    const tiles = [];
    for (let r = 0; r < ROWS; r++) { const rowEl = el('div', 'wd-row'); tiles.push([]); for (let c = 0; c < L; c++) { const t = el('div', 'wd-t'); rowEl.appendChild(t); tiles[r].push(t); } grid.appendChild(rowEl); }
    const keys = {};
    ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].forEach((rw, i) => {
      const k = el('div', 'wd-krow');
      if (i === 2) { const e = el('button', 'wd-k wd-wide mono', 'Enter'); e.type = 'button'; e.addEventListener('click', ev => { ev.currentTarget.blur(); press('Enter'); }); k.appendChild(e); }
      [...rw].forEach(ch => { const b = el('button', 'wd-k mono', ch); b.type = 'button'; b.addEventListener('click', ev => { ev.currentTarget.blur(); press(ch); }); keys[ch] = b; k.appendChild(b); });
      if (i === 2) { const e = el('button', 'wd-k wd-wide mono', 'Del'); e.type = 'button'; e.setAttribute('aria-label', 'Delete'); e.addEventListener('click', ev => { ev.currentTarget.blur(); press('Backspace'); }); k.appendChild(e); }
      kb.appendChild(k);
    });
    wrap.append(grid, kb); root.appendChild(wrap);

    function press(k) {
      if (over) return;
      if (k === 'Enter') return submit();
      if (k === 'Backspace') { if (col > 0) { col--; const t = tiles[row][col]; t.textContent = ''; t.classList.remove('f'); } return; }
      if (/^[a-z]$/i.test(k) && col < L) { const t = tiles[row][col]; t.textContent = k.toUpperCase(); t.classList.add('f'); col++; tick(4); }
    }
    function submit() {
      if (col < L) { ui.msg('Five letters, please.'); shake(); return; }
      const g = tiles[row].map(t => t.textContent.toLowerCase());
      const res = Array(L).fill('x'), left = {};
      for (let i = 0; i < L; i++) { if (g[i] === answer[i]) res[i] = 'c'; else left[answer[i]] = (left[answer[i]] || 0) + 1; }
      for (let i = 0; i < L; i++) if (res[i] === 'x' && left[g[i]] > 0) { res[i] = 'p'; left[g[i]]--; }
      const r = row, my = gen; over = true;   /* locked while the tiles turn */
      res.forEach((s, i) => setTimeout(() => {
        if (my !== gen) return;
        const t = tiles[r][i]; t.classList.add('rev', s === 'c' ? 'c' : s === 'p' ? 'p' : 'x');
        const kk = keys[g[i]], rank = { x: 1, p: 2, c: 3 };
        const cur = kk.dataset.s ? { x: 1, p: 2, c: 3 }[kk.dataset.s] : 0;
        if (rank[s] > cur) { kk.dataset.s = s; }
      }, reduce ? 0 : i * 260));
      setTimeout(() => {
        if (my !== gen) return;
        const word = g.join('');
        if (word === answer) { tally.won++; tally.played++; over = true; ui.msg(row === 0 ? 'First go. That is cheeky.' : `Got it in ${row + 1}.`); score(); return; }
        row++; col = 0;
        if (row === ROWS) { tally.played++; over = true; ui.msg(`It was ${answer.toUpperCase()}.`); score(); return; }
        over = false; ui.msg(`${ROWS - row} ${ROWS - row === 1 ? 'try' : 'tries'} left.`); score();
      }, reduce ? 0 : L * 260 + 80);
    }
    function shake() { const rw = grid.children[row]; rw.classList.remove('shake'); void rw.offsetWidth; rw.classList.add('shake'); }
    function score() { ui.score(`Won ${tally.won} of ${tally.played}`); }
    const key = e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter' || e.key === 'Backspace' || /^[a-z]$/i.test(e.key)) { press(e.key); if (e.key === 'Enter' || e.key === 'Backspace') e.preventDefault(); }
    };
    addEventListener('keydown', key);
    function reset() {
      gen++; answer = WORDS[rnd(WORDS.length)]; row = 0; col = 0; over = false;
      tiles.flat().forEach(t => { t.textContent = ''; t.className = 'wd-t'; });
      Object.values(keys).forEach(k => { delete k.dataset.s; });
      score(); ui.msg('Guess the five letter word.'); ui.hint('Type, then press Enter');
    }
    reset();
    return { reset, stop() { removeEventListener('keydown', key); } };
  }

  /* ---------------------------------------------------------
     Word search: drag from the first letter to the last.
     Words run across, down and on the diagonals, some backwards.
     --------------------------------------------------------- */
  const POOL = ['DESIGN', 'MOTION', 'POSTER', 'PRINT', 'STUDIO', 'CULTURE', 'SPORT', 'PRESENT', 'HOST', 'BRAND', 'FRAME', 'LONDON', 'TRACK', 'PLAY', 'IDEAS', 'BERNS', 'EDITION', 'CREATIVE', 'COMMUNITY', 'GUARDIAN', 'RUN', 'BLUE'];
  function wordsearch(root) {
    const N = 12, WORDS_N = 8;
    const wrap = el('div', 'g g-ws'), grid = el('div', 'ws-grid'), list = el('ul', 'ws-list');
    grid.style.setProperty('--n', N);
    wrap.append(grid, list); root.appendChild(wrap);
    let letters, words, found, cells = [], sel = null;
    const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0]];

    function build() {
      for (let tries = 0; tries < 50; tries++) {
        const g = Array.from({ length: N }, () => Array(N).fill(''));
        const pick = [...POOL].sort(() => Math.random() - 0.5).slice(0, WORDS_N), placed = [];
        let ok = true;
        for (const w of pick.sort((a, b) => b.length - a.length)) {
          let done = false;
          for (let a = 0; a < 300 && !done; a++) {
            const [dr, dc] = DIRS[rnd(DIRS.length)], r = rnd(N), c = rnd(N);
            const er = r + dr * (w.length - 1), ec = c + dc * (w.length - 1);
            if (er < 0 || er >= N || ec < 0 || ec >= N) continue;
            let fit = true;
            for (let k = 0; k < w.length; k++) { const v = g[r + dr * k][c + dc * k]; if (v && v !== w[k]) { fit = false; break; } }
            if (!fit) continue;
            for (let k = 0; k < w.length; k++) g[r + dr * k][c + dc * k] = w[k];
            placed.push(w); done = true;
          }
          if (!done) { ok = false; break; }
        }
        if (!ok) continue;
        const A = 'ABCDEFGHIJKLMNOPRSTUW';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!g[r][c]) g[r][c] = A[rnd(A.length)];
        return { g, words: placed.sort() };
      }
      return null;
    }
    function reset() {
      const r = build(); letters = r.g; words = r.words; found = new Set();
      grid.innerHTML = ''; cells = [];
      for (let i = 0; i < N * N; i++) { const c = el('div', 'ws-c', letters[Math.floor(i / N)][i % N]); c.dataset.r = Math.floor(i / N); c.dataset.c = i % N; grid.appendChild(c); cells.push(c); }
      list.innerHTML = ''; words.forEach(w => list.appendChild(el('li', 'mono', w)));
      status(); ui.msg('Find all eight words.'); ui.hint('Drag from the first letter to the last');
    }
    function status() { ui.score(`Found ${found.size} of ${words.length}`); }
    const at = (r, c) => cells[r * N + c];
    function cellFrom(e) { const t = document.elementFromPoint(e.clientX, e.clientY); return t && t.classList && t.classList.contains('ws-c') ? t : null; }
    function path(a, b) {
      const dr = b.r - a.r, dc = b.c - a.c;
      if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return null;
      const n = Math.max(Math.abs(dr), Math.abs(dc)), sr = Math.sign(dr), sc = Math.sign(dc), out = [];
      for (let k = 0; k <= n; k++) out.push([a.r + sr * k, a.c + sc * k]);
      return out;
    }
    function mark(p) { cells.forEach(c => c.classList.remove('sel')); if (p) p.forEach(([r, c]) => at(r, c).classList.add('sel')); }
    grid.addEventListener('pointerdown', e => {
      const c = cellFrom(e); if (!c) return;
      e.preventDefault(); try { grid.setPointerCapture(e.pointerId); } catch (_) {}
      sel = { a: { r: +c.dataset.r, c: +c.dataset.c }, p: [[+c.dataset.r, +c.dataset.c]] }; mark(sel.p); tick(4);
    });
    grid.addEventListener('pointermove', e => {
      if (!sel) return; const c = cellFrom(e); if (!c) return;
      const p = path(sel.a, { r: +c.dataset.r, c: +c.dataset.c });
      if (p && p.length !== sel.p.length) { sel.p = p; mark(p); tick(3); }
    });
    const up = () => {
      if (!sel) return;
      const s = sel.p.map(([r, c]) => letters[r][c]).join(''), rv = [...s].reverse().join('');
      const hit = words.find(w => !found.has(w) && (w === s || w === rv));
      if (hit) {
        found.add(hit); sel.p.forEach(([r, c]) => at(r, c).classList.add('found'));
        [...list.children].find(li => li.textContent === hit).classList.add('done');
        tick(14); status(); ui.msg(found.size === words.length ? 'That is all of them. Nicely done.' : `${hit}. Good eye.`);
      }
      mark(null); sel = null;
    };
    grid.addEventListener('pointerup', up); grid.addEventListener('pointercancel', up);
    reset();
    return { reset, stop() {} };
  }

  /* ---------------------------------------------------------
     Coffee: pick a drink (or make your own), pour it layer by
     layer into a spinning pixel glass, then tap the cup to drink it.
     three.js drawn small and scaled up crisp, like the sign on the
     holding page. Loaded only when needed.
     --------------------------------------------------------- */
  let threeP = null;
  const loadThree = () => threeP || (threeP = new Promise((res, rej) => {
    if (window.THREE) return res();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js'; s.async = true;
    s.onload = () => res(); s.onerror = () => { threeP = null; rej(new Error('three')); };
    document.head.appendChild(s);
  }));
  const ING = {
    e: { name: 'Espresso', col: 0x2B1608, hex: '#2B1608' },
    w: { name: 'Hot water', col: 0xA9C1FF, hex: '#A9C1FF' },
    m: { name: 'Oat milk', col: 0xEBDAC0, hex: '#EBDAC0' },
    f: { name: 'Foam', col: 0xFFFFFF, hex: '#FFFFFF' },
    c: { name: 'Chocolate', col: 0x7A4222, hex: '#7A4222' }
  };
  const DRINKS = [
    { name: 'Espresso', mix: 'e' }, { name: 'Americano', mix: 'eewww' }, { name: 'Flat white', mix: 'eemmm' },
    { name: 'Latte', mix: 'emmmf' }, { name: 'Cappuccino', mix: 'emmff' }, { name: 'Mocha', mix: 'cemmf' }
  ];
  const sig = s => [...s].sort().join('');
  const oat = d => (d.mix.includes('m') ? 'oat ' : '') + d.name.toLowerCase();   /* it is always oat milk */
  const an = w => (/^[aeiou]/.test(w) ? 'an ' : 'a ') + w;
  const runs = mix => { const out = []; for (const k of mix) { const l = out[out.length - 1]; if (l && l[0] === k) l[1]++; else out.push([k, 1]); } return out.map(([k, n]) => ING[k].name + (n > 1 ? ' x' + n : '')).join(', '); };
  function judge(mix, target) {
    if (target) {
      const low = oat(target);
      if (mix === target.mix) return `Spot on. A proper ${low}.`;
      if (sig(mix) === sig(target.mix)) return `That is ${an(low)}, just not by the book.`;
    }
    const exact = DRINKS.find(d => d.mix === mix), same = DRINKS.find(d => sig(d.mix) === sig(mix));
    const d = exact || same;
    if (d) return target ? `Not the ${oat(target)}, but it is ${an(oat(d))}.` : (exact ? `That is ${an(oat(d))}.` : `Basically ${an(oat(d))}.`);
    if (/^w+$/.test(mix)) return 'That is hot water. Bold.';
    return 'Your own recipe. I would drink it.';
  }

  function coffee(root) {
    const T = window.THREE, CAP = 6;
    const tally = coffee.tally || (coffee.tally = { made: 0 });
    const wrap = el('div', 'g g-coffee'), view = el('div', 'cf-view'), cv = el('canvas', 'cf-cv'), ticket = el('div', 'cf-ticket'), row = el('div', 'cf-row');
    cv.width = 200; cv.height = 190;
    view.appendChild(cv); wrap.append(view, ticket, row); root.appendChild(wrap);

    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: false, alpha: true }); }
    catch (_) { ui.msg('The coffee machine is broken. Try Surprise me again.'); return { reset() {}, stop() {} }; }
    renderer.setPixelRatio(1); renderer.setSize(200, 190, false);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 200 / 190, 0.1, 50);
    cam.position.set(0, 2.6, 5.0); cam.lookAt(0, 0.88, 0);
    const ramp = new T.DataTexture(Uint8Array.from([120, 190, 255]), 3, 1, T.LuminanceFormat);
    ramp.minFilter = ramp.magFilter = T.NearestFilter; ramp.needsUpdate = true;
    const toon = (color, extra) => new T.MeshToonMaterial(Object.assign({ color, gradientMap: ramp }, extra));
    scene.add(new T.DirectionalLight(0xffffff, 0.8).translateX(-2).translateY(5).translateZ(3));
    scene.add(new T.AmbientLight(0xffffff, 0.4));

    /* saucer */
    const plate = new T.Mesh(new T.CylinderGeometry(1.05, 0.95, 0.07, 28), toon(0xffffff)); plate.position.y = -0.035; scene.add(plate);

    /* the glass: a lathe, thin and see-through, with a Berns Blue label and a handle */
    const cup = new T.Group(); scene.add(cup);
    const Y0 = 0.14, UH = 0.2, rin = y => 0.50 + (y - Y0) * (0.08 / 1.26);
    const prof = [[0, 0], [0.52, 0], [0.62, 1.4], [0.58, 1.4], [0.5, Y0], [0, Y0]].map(p => new T.Vector2(p[0], p[1]));
    const glass = new T.Mesh(new T.LatheGeometry(prof, 24), toon(0xffffff, { transparent: true, opacity: 0.14, side: T.DoubleSide, depthWrite: false }));
    glass.renderOrder = 2; cup.add(glass);
    const rim = new T.Mesh(new T.TorusGeometry(0.6, 0.018, 4, 24), toon(0xffffff)); rim.rotation.x = Math.PI / 2; rim.position.y = 1.4; cup.add(rim);
    const handle = new T.Mesh(new T.TorusGeometry(0.27, 0.05, 6, 10, Math.PI), toon(0xffffff)); handle.rotation.z = -Math.PI / 2; handle.position.set(0.57, 0.74, 0); cup.add(handle);
    { /* label */
      const tc = document.createElement('canvas'); tc.width = 64; tc.height = 26; const g = tc.getContext('2d');
      g.fillStyle = '#080CDF'; g.fillRect(0, 0, 64, 26); g.fillStyle = '#fff';
      const GL = { B: ['11110','10001','10001','11110','10001','10001','11110'], E: ['11111','10000','10000','11110','10000','10000','11111'], R: ['11110','10001','10001','11110','10100','10010','10001'], N: ['10001','11001','10101','10101','10011','10001','10001'], S: ['01111','10000','10000','01110','00001','00001','11110'] };
      [...'BERNS'].forEach((ch, ci) => GL[ch].forEach((r, ry) => [...r].forEach((bit, rx) => { if (bit === '1') g.fillRect(17 + ci * 6 + rx - 2, 9 + ry, 1, 1); })));
      const tex = new T.CanvasTexture(tc); tex.magFilter = tex.minFilter = T.NearestFilter; tex.generateMipmaps = false;
      const L = 1.7, band = new T.Mesh(new T.CylinderGeometry(0.612, 0.575, 0.4, 20, 1, true, -L / 2, L), toon(0xffffff, { map: tex }));
      band.position.y = 0.62; cup.add(band);
    }

    /* the drink: six slices, each filled by a level that eases up when you pour */
    const mats = {}; for (const k in ING) mats[k] = toon(ING[k].col);
    const units = [];
    for (let i = 0; i < CAP; i++) {
      const g = new T.CylinderGeometry(rin(Y0 + (i + 1) * UH) - 0.012, rin(Y0 + i * UH) - 0.012, UH, 24); g.translate(0, UH / 2, 0);
      const m = new T.Mesh(g, mats.e); m.position.y = Y0 + i * UH; m.visible = false; cup.add(m); units.push(m);
    }
    const stream = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 1, 6), mats.e); stream.visible = false; scene.add(stream);
    const steam = [0, 1, 2, 3].map(() => { const m = new T.Mesh(new T.BoxGeometry(0.08, 0.08, 0.08), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); m.visible = false; scene.add(m); return m; });

    /* state */
    let stack = [], target = null, phase = 'pick', lvl = 0, ang = 0.5, vel = reduce ? 0 : 0.7, drag = false, lx = 0, dv = 0, down = null, dying = 0, raf = 0, t = 0, last = performance.now();
    const AUTO = reduce ? 0 : 0.7;

    function paint() {
      units.forEach((m, i) => { const f = Math.max(0, Math.min(1, lvl - i)); m.visible = f > 0.002; if (stack[i]) m.material = mats[stack[i]]; m.scale.y = Math.max(f, 0.001); });
    }
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      if (!drag) { vel += (AUTO - vel) * Math.min(1, dt * 0.8); ang += vel * dt; }
      cup.rotation.y = ang;
      const goal = phase === 'drinking' ? 0 : stack.length, sp = phase === 'drinking' ? 3.2 : (goal < lvl ? 8 : 4.2);
      if (reduce) lvl = goal; else lvl += Math.sign(goal - lvl) * Math.min(Math.abs(goal - lvl), sp * dt);
      if (phase === 'drinking') { dying += dt; cup.position.y = reduce ? 0 : Math.sin(Math.min(1, dying / 1.3) * Math.PI) * 0.28; if (lvl <= 0.001 && dying > 0.9) { finishDrink(); } }
      paint();
      const pouring = !reduce && phase === 'make' && stack.length && lvl < stack.length - 0.03 && lvl >= stack.length - 1.02;
      stream.visible = pouring;
      if (pouring) { const top = 2.7, bot = Y0 + lvl * UH + 0.02; stream.material = mats[stack[stack.length - 1]]; stream.scale.y = top - bot; stream.position.y = (top + bot) / 2; }
      steam.forEach((s, k) => {
        const on = !reduce && lvl > 0.5 && phase !== 'drinking';
        s.visible = on; if (!on) return;
        const ph = (t * 0.3 + k / 4) % 1, top = Y0 + lvl * UH;
        s.position.set(Math.sin(t * 1.4 + k * 2) * 0.22 + (k - 1.5) * 0.12, top + 0.15 + ph * 0.6, Math.cos(t + k) * 0.1);
        s.material.opacity = Math.sin(ph * Math.PI) * 0.75; s.rotation.y = t + k;
      });
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    /* spin by hand; a tap on the finished cup drinks it */
    view.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; down = [e.clientX, e.clientY]; view.setPointerCapture(e.pointerId); });
    view.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - lx; lx = e.clientX; ang += dx * 0.012; dv = dx * 0.012 * 60; });
    const release = e => {
      if (!drag) return; drag = false; vel = dv; dv = 0;
      if (e.type === 'pointerup' && down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 8) { vel = AUTO; sip(); }
    };
    view.addEventListener('pointerup', release); view.addEventListener('pointercancel', release);
    cv.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && phase === 'done') { e.preventDefault(); sip(); } });

    /* the controls */
    const chip = (label, on, cls, hex) => {
      const b = el('button', 'chip mono' + (cls ? ' ' + cls : '')); b.type = 'button';
      if (hex) { const s = el('i', 'sw'); s.style.background = hex; b.appendChild(s); }
      b.appendChild(document.createTextNode(label)); b.addEventListener('click', on); return b;
    };
    function drawTicket() {
      ticket.innerHTML = '';
      if (!target || phase === 'pick') return;
      [...target.mix].forEach((k, i) => {
        const s = el('i', 'cf-t'); s.style.setProperty('--c', ING[k].hex);
        if (stack[i] === k) s.classList.add('on'); else if (stack[i]) { s.classList.add('off'); s.textContent = '×'; }
        ticket.appendChild(s);
      });
    }
    function menu() {
      row.innerHTML = ''; drawTicket();
      if (phase === 'pick') {
        DRINKS.forEach(d => row.appendChild(chip(d.name, () => choose(d))));
        row.appendChild(chip('Your own', () => choose(null), 'chip-solid'));
      } else if (phase === 'make') {
        Object.keys(ING).forEach(k => row.appendChild(chip(ING[k].name, () => pour(k), '', ING[k].hex)));
        if (stack.length) { row.appendChild(chip('Undo', undo)); row.appendChild(chip('Done', done, 'chip-solid')); }
      }
    }
    function choose(d) {
      tick(8); target = d; stack = []; phase = 'make'; ui.msg(d ? `Making ${an(oat(d))}.` : 'Your own, then.');
      ui.hint(d ? runs(d.mix) : 'Pour whatever you like, up to six'); ui.score(tally.made ? `Made ${tally.made}` : ''); menu();
    }
    function pour(k) {
      if (stack.length >= CAP) { ui.msg('Full to the brim. Hit Done.'); return; }
      tick(10); stack.push(k); menu();
      if (stack.length >= CAP) ui.msg('Full to the brim. Hit Done.');
      else if (target && stack.some((c, i) => c !== target.mix[i])) ui.msg('Not quite the recipe. Undo, or carry on.');
      else ui.msg(target ? `Making ${an(oat(target))}.` : 'Your own, then.');
    }
    function undo() {
      tick(6); stack.pop(); menu();
      ui.msg(target ? `Making ${an(oat(target))}.` : 'Your own, then.');
    }
    function done() {
      tick(14); phase = 'done'; tally.made++; ui.msg(judge(stack.join(''), target)); ui.hint('Tap the cup to drink it'); ui.score(`Made ${tally.made}`);
      cv.setAttribute('role', 'button'); cv.setAttribute('tabindex', '0'); cv.setAttribute('aria-label', 'Drink it'); menu();
    }
    function sip() {
      if (phase !== 'done') return;
      tick(12); phase = 'drinking'; dying = 0; ui.msg('Ahh.'); ui.hint(''); cv.removeAttribute('role'); cv.removeAttribute('tabindex');
    }
    function finishDrink() {
      phase = 'pick'; stack = []; target = null; lvl = 0; cup.position.y = 0; dying = 0;
      ui.msg('Cheers. Another?'); ui.hint('Pick a coffee, or make your own'); menu();
    }
    function reset() {
      phase = 'pick'; stack = []; target = null; lvl = 0; cup.position.y = 0; dying = 0;
      cv.removeAttribute('role'); cv.removeAttribute('tabindex');
      ui.msg('What are we making?'); ui.hint('Pick a coffee, or make your own'); ui.score(tally.made ? `Made ${tally.made}` : ''); menu();
    }
    reset();
    return { reset, stop() { cancelAnimationFrame(raf); try { renderer.dispose(); renderer.forceContextLoss(); } catch (_) {} } };
  }

  /* ---------------------------------------------------------
     Fry plantain: slice it, oil the pan, drop the slices in, flip
     them when they are golden, serve before they burn. Pixel art
     drawn on a small canvas and scaled up crisp.
     --------------------------------------------------------- */
  function plantain(root) {
    const W = 160, H = 120, PX0 = 18, PX1 = 128, MAXCUT = 8;
    const tally = plantain.tally || (plantain.tally = { made: 0 });
    const wrap = el('div', 'g g-coffee'), view = el('div', 'cf-view'), cv = el('canvas', 'cf-cv'), row = el('div', 'cf-row');
    cv.width = W; cv.height = H; view.appendChild(cv); wrap.append(view, row); root.appendChild(wrap);
    const g = cv.getContext('2d');

    /* colours: pale flesh to gold to brown to black */
    const STOPS = [[0, [234, 227, 165]], [0.3, [232, 200, 96]], [0.5, [217, 160, 48]], [0.7, [176, 110, 28]], [0.88, [107, 58, 20]], [1, [43, 22, 8]]];
    const ramp = c => {
      c = Math.max(0, Math.min(1, Math.round(c * 20) / 20));
      for (let i = 1; i < STOPS.length; i++) if (c <= STOPS[i][0]) {
        const a = STOPS[i - 1], b = STOPS[i], k = (c - a[0]) / (b[0] - a[0]);
        return 'rgb(' + [0, 1, 2].map(j => Math.round(a[1][j] + (b[1][j] - a[1][j]) * k)).join(',') + ')';
      }
      return 'rgb(43,22,8)';
    };
    const side = c => c >= 0.38 && c <= 0.7 ? 1 : c < 0.38 ? c / 0.38 : Math.max(0, 1 - (c - 0.7) / 0.3);
    const ell = (cx, cy, rx, ry, col) => {
      g.fillStyle = col;
      for (let y = -Math.round(ry); y <= Math.round(ry); y++) {
        const h = rx * Math.sqrt(Math.max(0, 1 - (y / ry) * (y / ry)));
        g.fillRect(Math.round(cx - h), Math.round(cy + y), Math.max(1, Math.round(2 * h)), 1);
      }
    };

    /* state */
    const PC = [78, 62], POR = [64, 46], PIR = [58, 41];
    let phase, cuts, queue, slices, oiled, oilT, flash, bubbles, bt, t = 0, last = performance.now(), raf = 0, warned, eatT;
    const pieces = () => { const b = [PX0, ...cuts, PX1]; return b.slice(1).map((x, i) => x - b[i]); };
    const yc = (x, i) => 62 - 6 * Math.sin(Math.PI * (x - PX0) / (PX1 - PX0));

    function drawPlantain() {
      const b = [PX0, ...cuts, PX1], off = 2;
      for (let i = 0; i < b.length - 1; i++) for (let x = b[i]; x < b[i + 1] - (i < b.length - 2 ? 1 : 0); x++) {
        const tt = (x - PX0) / (PX1 - PX0), h = Math.round(4 + 7 * Math.sqrt(Math.sin(Math.PI * tt))), cy = Math.round(yc(x)), X = x + i * off;
        g.fillStyle = '#EAE3A5'; g.fillRect(X, cy - h, 1, 2 * h);
        g.fillStyle = '#F6F2C8'; g.fillRect(X, cy - h, 1, 1);
        g.fillStyle = '#CFC57E'; g.fillRect(X, cy + h - 2, 1, 2);
        if ((x * 7 + i * 13) % 23 === 0) { g.fillStyle = '#B9A95A'; g.fillRect(X, cy - 2 + ((x * 5) % 5), 1, 1); }
      }
      if (flash && t - flash.t < 0.14) { g.fillStyle = '#fff'; g.fillRect(flash.x + (cuts.indexOf(flash.cut) + 1) * off - 1, 36, 1, 52); }
    }

    function drawPan(plate) {
      ell(PC[0], PC[1], POR[0], POR[1], '#fff');
      ell(PC[0], PC[1], PIR[0], PIR[1], plate ? '#F1F2F3' : '#2B2B2B');
      if (!plate) {
        g.fillStyle = '#fff'; g.fillRect(PC[0] + POR[0] - 2, PC[1] - 2, 20, 4);
        if (oiled) { const k = Math.min(1, oilT); ell(PC[0], PC[1], PIR[0] * k * 0.92, PIR[1] * k * 0.92, '#3A3A3A'); g.fillStyle = '#8A9095'; g.fillRect(PC[0] - 40, PC[1] - 24, 6, 1); g.fillRect(PC[0] - 36, PC[1] - 22, 2, 1); }
      }
    }

    function drawSlice(s) {
      const f = s.flip, sq = f > 0 ? Math.max(0.15, Math.abs(Math.cos(Math.PI * f))) : 1, lift = f > 0 ? Math.sin(Math.PI * f) * 9 : 0;
      const top = f > 0 && f < 0.5 ? 1 - s.top : s.top, cy = s.y - s.drop - lift;
      if (f === 0) ell(s.x, cy + 2, s.rx, s.ry, ramp(s.c[1 - top]));            /* the underside peeks out below: that is the one frying */
      ell(s.x, cy, s.rx, s.ry * sq, ramp(s.c[top]));
      if (f === 0) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(Math.round(s.x - s.rx * 0.4), Math.round(cy - s.ry * 0.45), 2, 1); }
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt; bt += dt;
      if (oiled) oilT = Math.min(1, oilT + dt * 2.5);
      if (phase === 'pan') {
        slices.forEach(s => {
          if (s.drop > 0) { s.drop = Math.max(0, s.drop - dt * 90); return; }
          if (s.flip > 0) { s.flip += dt / 0.35; if (s.flip >= 1) { s.flip = 0; s.top = 1 - s.top; } return; }
          const d = Math.hypot((s.x - PC[0]) / PIR[0], (s.y - PC[1]) / PIR[1]);
          s.c[1 - s.top] += dt * 0.07 * (1.25 - 0.5 * Math.min(1, d));
        });
        if (!warned && slices.some(s => Math.max(s.c[0], s.c[1]) > 0.88)) { warned = true; ui.msg('Something is catching.'); }
      }
      if (phase === 'eating') { eatT += dt; if (eatT > 0.2) { eatT = 0; slices.shift(); tick(6); if (!slices.length) { reset(); } } }
      if (bt > 0.12) { bt = 0; bubbles = []; if (!reduce && phase === 'pan') slices.forEach(s => { if (s.drop < 1) for (let k = 0; k < 2; k++) { const a = Math.random() * 6.28; bubbles.push([s.x + Math.cos(a) * (s.rx + 2), s.y + 2 + Math.sin(a) * (s.ry + 1)]); } }); }
      g.clearRect(0, 0, W, H);
      if (phase === 'cut') drawPlantain();
      else {
        drawPan(phase === 'done' || phase === 'eating');
        slices.slice().sort((a, b) => a.y - b.y).forEach(drawSlice);
        g.fillStyle = '#fff'; bubbles.forEach(p => g.fillRect(Math.round(p[0]), Math.round(p[1]), 1, 1));
        if (!reduce && phase === 'pan') slices.forEach((s, i) => { if (Math.max(s.c[0], s.c[1]) > 0.88) { g.fillStyle = '#8A9095'; for (let k = 0; k < 3; k++) g.fillRect(Math.round(s.x + Math.sin(t * 3 + k + i) * 3), Math.round(s.y - 6 - ((t * 14 + k * 6) % 18)), 2, 2); } });
      }
      raf = requestAnimationFrame(frame);
    }

    /* controls */
    const chip = (label, on, cls) => { const b = el('button', 'chip mono' + (cls ? ' ' + cls : ''), label); b.type = 'button'; b.addEventListener('click', on); return b; };
    function menu() {
      row.innerHTML = '';
      if (phase === 'cut') {
        if (cuts.length) row.appendChild(chip('Undo', () => { tick(5); cuts.pop(); menu(); }));
        if (cuts.length >= 2) row.appendChild(chip('Into the pan', toPan, 'chip-solid'));
      } else if (phase === 'pan') {
        if (!oiled) row.appendChild(chip('Add oil', () => { tick(8); oiled = true; oilT = 0; ui.msg('Oil is going. Drop them in.'); ui.hint(`${queue.length} slices. Tap the pan to drop one, tap a slice to flip it`); menu(); }));
        if (slices.length) row.appendChild(chip('Serve', serve, 'chip-solid'));
      }
    }
    function toPan() {
      tick(10); phase = 'pan'; oiled = false; oilT = 0; slices = []; warned = false;
      queue = pieces().map(w => Math.max(7, Math.min(13, Math.round(5 + w * 0.35))));
      ui.msg('Oil first.'); ui.hint('Hit Add oil'); menu();
    }
    function serve() {
      let sc = 0, raw = 0, burnt = 0; const n = slices.length;
      slices.forEach(s => { sc += (side(s.c[0]) + side(s.c[1])) / 2; if (Math.min(s.c[0], s.c[1]) < 0.2) raw++; if (Math.max(s.c[0], s.c[1]) > 0.88) burnt++; });
      const avg = sc / n;
      tick(14); phase = 'done'; tally.made++; ui.score(`Fried ${tally.made}`);
      ui.msg(avg >= 0.88 ? 'Golden both sides. Proper plantain.' : avg >= 0.7 ? 'Nice. A couple of uneven ones.' : burnt >= n / 2 ? 'Burnt. Turn them sooner next time.' : raw >= n / 2 ? 'Still pale. Give them longer.' : 'A mixed batch. Still eating it.');
      ui.hint('Tap the plate to eat'); cv.setAttribute('role', 'button'); cv.setAttribute('tabindex', '0'); cv.setAttribute('aria-label', 'Eat it'); menu();
    }
    function eat() { if (phase !== 'done') return; tick(8); phase = 'eating'; eatT = 0; ui.msg('Mmm.'); ui.hint(''); cv.removeAttribute('role'); cv.removeAttribute('tabindex'); }
    const pt = e => { const r = cv.getBoundingClientRect(), sc = Math.min(r.width / W, r.height / H); return [(e.clientX - r.left - (r.width - W * sc) / 2) / sc, (e.clientY - r.top - (r.height - H * sc) / 2) / sc]; };
    cv.addEventListener('pointerdown', e => {
      const [x, y] = pt(e);
      if (phase === 'cut') {
        if (cuts.length >= MAXCUT) { ui.msg('That is plenty of slices.'); return; }
        const bd = [PX0, ...cuts, PX1]; let px = Math.round(x); for (let i = 0; i < bd.length - 1; i++) if (x - i * 2 >= bd[i] && x - i * 2 < bd[i + 1]) { px = Math.round(x - i * 2); break; }   /* undo the little spread between slices */
        if (px < PX0 + 7 || px > PX1 - 7 || Math.abs(y - yc(px)) > 18 || cuts.some(c => Math.abs(c - px) < 8)) return;
        cuts.push(px); cuts.sort((a, b) => a - b); flash = { x: px, t, cut: px }; tick(8); ui.msg(`${cuts.length + 1} slices.`); menu();
      } else if (phase === 'pan') {
        const hit = slices.find(s => s.drop < 1 && s.flip === 0 && Math.abs(x - s.x) <= s.rx + 2 && Math.abs(y - s.y) <= s.ry + 3);
        if (hit) { hit.flip = 0.001; tick(8); return; }
        if (!oiled) { ui.msg('Oil first.'); return; }
        if (!queue.length) return;
        const d = Math.hypot((x - PC[0]) / PIR[0], (y - PC[1]) / PIR[1]), rx = queue[0], ry = Math.round(rx * 0.62);
        if (d > 0.82) { ui.msg('Keep them in the pan.'); return; }
        if (slices.some(s => Math.abs(x - s.x) < (rx + s.rx) * 0.85 && Math.abs(y - s.y) < (ry + s.ry) * 0.95)) { ui.msg('Give it room.'); return; }
        queue.shift(); slices.push({ x, y, rx, ry, c: [0, 0], top: 0, flip: 0, drop: 22 }); tick(10);
        ui.msg(queue.length ? 'In it goes.' : 'All in. Keep an eye on them.'); ui.hint(queue.length ? `${queue.length} left. Tap a slice to flip it` : 'Tap a slice to flip it. Serve when golden'); menu();
      } else if (phase === 'done') eat();
    });
    cv.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && phase === 'done') { e.preventDefault(); eat(); } });
    function reset() {
      phase = 'cut'; cuts = []; queue = []; slices = []; oiled = false; oilT = 0; flash = null; bubbles = []; bt = 0; warned = false; eatT = 0;
      cv.removeAttribute('role'); cv.removeAttribute('tabindex');
      ui.msg('Slice the plantain.'); ui.hint('Tap along it to cut'); ui.score(tally.made ? `Fried ${tally.made}` : ''); menu();
    }
    reset(); raf = requestAnimationFrame(frame);
    return { reset, stop() { cancelAnimationFrame(raf); } };
  }

  /* ---------------------------------------------------------
     The surprise: nothing says what is in here. One button picks a
     game at random (never the same one twice running).
     --------------------------------------------------------- */
  const GAMES = { connect4, wordsearch, snake, wordle, noughts, coffee, plantain };
  let NAMES = Object.keys(GAMES);
  const againBtn = $('[data-restart]'), nextBtn = $('[data-next]'), countEl = $('[data-count]');
  let cur = null, last = '', count = 0;

  function intro() {
    stage.innerHTML = '';
    const w = el('div', 'sur-intro');
    w.append(el('h2', 'sur-h scale', 'Surprise'));
    const b = el('button', 'btn btn-solid', 'Surprise me'); b.type = 'button'; b.addEventListener('click', () => { tick(10); draw(); });
    w.appendChild(b); stage.appendChild(w);
    againBtn.hidden = nextBtn.hidden = true; ui.msg(''); ui.hint(''); ui.score('');
  }
  let token = 0;
  function draw() {
    if (cur) { cur.stop(); cur = null; }
    let n; do { n = NAMES[rnd(NAMES.length)]; } while (n === last && NAMES.length > 1);
    last = n; count++;
    stage.innerHTML = ''; ui.msg(''); ui.hint(''); ui.score('');
    againBtn.hidden = nextBtn.hidden = false;
    const my = ++token;
    if (n !== 'coffee') { cur = GAMES[n](stage); return; }
    /* the coffee needs three.js: wait for it, and if it never comes, draw something else */
    loadThree().then(() => { if (my === token) cur = coffee(stage); }, () => { if (my === token) { NAMES = NAMES.filter(x => x !== 'coffee'); last = ''; count--; draw(); } });
  }
  nextBtn.addEventListener('click', e => { e.currentTarget.blur(); tick(8); draw(); });
  againBtn.addEventListener('click', e => { e.currentTarget.blur(); tick(6); if (cur) cur.reset(); });
  intro();
  if ('requestIdleCallback' in window) requestIdleCallback(() => loadThree().catch(() => {})); else setTimeout(() => loadThree().catch(() => {}), 1500);
})();
