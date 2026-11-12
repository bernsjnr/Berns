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
     The surprise: nothing says what is in here. One button picks a
     game at random (never the same one twice running).
     --------------------------------------------------------- */
  const GAMES = { connect4, wordsearch, snake, wordle, noughts };
  const NAMES = Object.keys(GAMES);
  const againBtn = $('[data-restart]'), nextBtn = $('[data-next]'), countEl = $('[data-count]');
  let cur = null, last = '', count = 0;

  function intro() {
    stage.innerHTML = '';
    const w = el('div', 'sur-intro');
    w.append(el('h2', 'sur-h scale', 'Surprise?'), el('p', 'sur-p', 'I hid a few small games in here. Press the button and see what you get.'));
    const b = el('button', 'btn btn-solid', 'Surprise me'); b.type = 'button'; b.addEventListener('click', () => { tick(10); draw(); });
    w.appendChild(b); stage.appendChild(w);
    againBtn.hidden = nextBtn.hidden = true; ui.msg(''); ui.hint(''); ui.score(''); countEl.textContent = '';
  }
  function draw() {
    if (cur) cur.stop();
    let n; do { n = NAMES[rnd(NAMES.length)]; } while (n === last && NAMES.length > 1);
    last = n; count++;
    stage.innerHTML = ''; ui.msg(''); ui.hint(''); ui.score('');
    cur = GAMES[n](stage);
    againBtn.hidden = nextBtn.hidden = false;
    countEl.textContent = 'Surprise ' + String(count).padStart(2, '0');
  }
  nextBtn.addEventListener('click', e => { e.currentTarget.blur(); tick(8); draw(); });
  againBtn.addEventListener('click', e => { e.currentTarget.blur(); tick(6); if (cur) cur.reset(); });
  intro();
})();
