/* Agent Frontier: drawings and interactions. No dependencies. */
(function(){
  'use strict';
  var PART = null;
  function register(id, def){ PART = def; }
  function makeApi(root){
    var offs = [], alive = true, stills = [], stillQueued = false;
    function redrawStills(){ if (stillQueued) return; stillQueued = true; requestAnimationFrame(function(){ stillQueued = false; if (alive) stills.forEach(function(f){ f(); }); }); }
    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var a = {
      reduced: reduced,
      // addEventListener that is removed when the prototype closes
      on: function(t, e, f, o){ t.addEventListener(e, f, o); offs.push(function(){ t.removeEventListener(e, f, o); }); },
      // per-frame callback fn(tSeconds, dtSeconds); with reduced motion it draws one still frame (and again on resize)
      raf: function(fn){
        if (reduced){ stills.push(function(){ fn(2.4, 0); }); redrawStills(); return; }
        var id, last = performance.now(), t0 = last;
        var loop = function(now){ if (!alive) return; var dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; fn(Math.max(0, (now - t0) / 1000), dt); id = requestAnimationFrame(loop); };
        id = requestAnimationFrame(loop);
        offs.push(function(){ cancelAnimationFrame(id); });
      },
      // 2D canvas sized to its CSS box at device pixel ratio; read st.w / st.h (CSS px) each frame
      canvas: function(cv){
        var st = { ctx: cv.getContext('2d'), w: 0, h: 0, dpr: 1 };
        var fit = function(){ var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(1, r.width), h = Math.max(1, r.height), pw = Math.round(w * dpr), ph = Math.round(h * dpr); st.dpr = dpr; st.w = w; st.h = h; if (cv.width !== pw || cv.height !== ph){ cv.width = pw; cv.height = ph; } st.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (reduced) redrawStills(); };
        fit();
        if (window.ResizeObserver){ var ro = new ResizeObserver(fit); ro.observe(cv); offs.push(function(){ ro.disconnect(); }); } else { a.on(window, 'resize', fit); }
        return st;
      },
      // true while el is near the viewport; use to skip drawing offscreen canvases
      near: function(node){
        var s = { v: true };
        if (window.IntersectionObserver){ var io = new IntersectionObserver(function(es){ s.v = es[0].isIntersecting; }, { rootMargin: '120px' }); io.observe(node); offs.push(function(){ io.disconnect(); }); }
        return function(){ return s.v; };
      },
      // scroll-in reveal that never hides content already on screen: adds .rv-pre to elements below the fold, swaps to .rv-in when they arrive
      reveal: function(nodes){
        if (reduced || !window.IntersectionObserver) return;
        var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.remove('rv-pre'); e.target.classList.add('rv-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
        Array.prototype.forEach.call(nodes, function(n){ if (n.getBoundingClientRect().top > window.innerHeight * 0.94){ n.classList.add('rv-pre'); io.observe(n); } });
        offs.push(function(){ io.disconnect(); });
      },
      // 0..1 as el travels up through the viewport
      progress: function(node){ var r = node.getBoundingClientRect(), vh = window.innerHeight; return Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height))); },
      every: function(ms, fn){ if (reduced) return; var id = setInterval(function(){ if (alive) fn(); }, ms); offs.push(function(){ clearInterval(id); }); },
      later: function(ms, fn){ var id = setTimeout(function(){ if (alive) fn(); }, ms); offs.push(function(){ clearTimeout(id); }); }
    };
    a._destroy = function(){ alive = false; offs.forEach(function(f){ try { f(); } catch (e) {} }); offs = []; };
    return a;
  }

register('af-k', {
  name: 'Frontier 5',
  site: 'af',
  round: 8,
  blurb: 'logo 暂用 ∂A 徽章：实心方块里反白的 ∂ 和带横杠的 A（∂A 在拓扑里是 A 的边界，即 the frontier of A）。底部 Logo 按钮可切方角或圆角，字标按钮切换字体。其余同上一轮：四步业务流程、六项 Deliverables、区分 human expert 与 agent 的 RL 流水线、可任意方向拖动的球体，Blog / News / Team / Contact 为独立页面。',
  bg: '#F4F5F7',
  fonts: 'family=Onest:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@1&family=Sora:wght@600&family=Space+Grotesk:wght@600&family=Michroma&family=Unbounded:wght@500',
  alts: [
    { label: 'Logo', n: 2, set: function(root, i){
      var MARKS = ["<svg width=\"28\" height=\"28\" viewBox=\"0 0 100 100\" aria-hidden=\"true\"><rect width=\"100\" height=\"100\" rx=\"0\" fill=\"currentColor\"/><g transform=\"translate(11.4 23.0) scale(0.54)\"><g transform=\"translate(1 0)\"><path d=\"M5 31C5 16 15 7 28 7C45 7 53 34 53 74A23 23 0 1 1 7 74A23 23 0 0 1 53 74\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"14.0\" stroke-linejoin=\"round\"/></g><g transform=\"translate(72.0 0)\"><path d=\"M0.00 100.00L27.50 0.00L42.50 0.00L70.00 100.00L55.40 100.00L35.00 25.82L14.60 100.00z\" fill=\"#FFFFFF\"/><path d=\"M24.77 63.0L45.23 63.0L48.77 75.88L21.23 75.88z\" fill=\"#FFFFFF\"/></g></g></svg>", "<svg width=\"28\" height=\"28\" viewBox=\"0 0 100 100\" aria-hidden=\"true\"><rect width=\"100\" height=\"100\" rx=\"20\" fill=\"currentColor\"/><g transform=\"translate(11.4 23.0) scale(0.54)\"><g transform=\"translate(1 0)\"><path d=\"M5 31C5 16 15 7 28 7C45 7 53 34 53 74A23 23 0 1 1 7 74A23 23 0 0 1 53 74\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"14.0\" stroke-linejoin=\"round\"/></g><g transform=\"translate(72.0 0)\"><path d=\"M0.00 100.00L27.50 0.00L42.50 0.00L70.00 100.00L55.40 100.00L35.00 25.82L14.60 100.00z\" fill=\"#FFFFFF\"/><path d=\"M24.77 63.0L45.23 63.0L48.77 75.88L21.23 75.88z\" fill=\"#FFFFFF\"/></g></g></svg>"];
      // fixed markup above, no user input: the badge with square corners, then with rounded ones
      Array.prototype.forEach.call(root.querySelectorAll('.brand .mk'), function(el){ el.innerHTML = MARKS[i]; });
    } },
    { label: '字标', n: 6, set: function(root, i){
      var WM = [["Sora 600", "font:600 .96em/1 'Sora',sans-serif;letter-spacing:-.03em", "Agent Frontier"], ["Space Grotesk 600", "font:600 1em/1 'Space Grotesk',sans-serif;letter-spacing:-.035em", "Agent Frontier"], ["Onest 600", "font:600 1em/1 'Onest',sans-serif;letter-spacing:-.035em", "Agent Frontier"], ["Michroma · 大写", "font:400 .7em/1 'Michroma',sans-serif;letter-spacing:.07em", "AGENT FRONTIER"], ["Geist Mono · 大写", "font:500 .74em/1 'Geist Mono',monospace;letter-spacing:.09em", "AGENT FRONTIER"], ["Unbounded 500", "font:500 .84em/1 'Unbounded',sans-serif;letter-spacing:-.03em", "Agent Frontier"]];
      Array.prototype.forEach.call(root.querySelectorAll('.brand .wm'), function(el){ el.style.cssText = WM[i][1]; el.textContent = WM[i][2]; });
    } }
  ],
  init: function(root, api){
    var TAU = Math.PI * 2, C30 = Math.cos(Math.PI / 6), INK = '13,16,20', BLUE = '43,75,255', ROSE = '194,42,94';
    var HUE = { swe: '43,75,255', radar: '224,86,10', game: '208,48,104', arm: '104,74,228', beam: '9,138,118', lab: '150,104,0', collab: '12,124,176', chip: '84,124,22', space: '34,52,120' };
    function sm(a, b, x){ var u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); }
    function mix(a, b, u){ a = a.split(','); b = b.split(','); return Math.round(+a[0] + (b[0] - a[0]) * u) + ',' + Math.round(+a[1] + (b[1] - a[1]) * u) + ',' + Math.round(+a[2] + (b[2] - a[2]) * u); }
    var seed = 7; function rnd(){ seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }

    // ---------- the isometric drawing language
    function P(o, x, y, z){ return [o.x + (x - y) * C30 * o.s, o.y + (x + y) * 0.5 * o.s - z * o.s]; }
    function poly(c, pts){ c.beginPath(); for (var i = 0; i < pts.length; i++){ if (i) c.lineTo(pts[i][0], pts[i][1]); else c.moveTo(pts[i][0], pts[i][1]); } }
    function seg(c, o, a, b){ var p = P(o, a[0], a[1], a[2]), q = P(o, b[0], b[1], b[2]); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
    function slab(c, o, rgb, glow, ghost){
      var a = 2, th = .34, t0 = P(o, -a, -a, 0), t1 = P(o, a, -a, 0), t2 = P(o, a, a, 0), t3 = P(o, -a, a, 0), b1 = P(o, a, -a, -th), b2 = P(o, a, a, -th), b3 = P(o, -a, a, -th);
      if (ghost){ c.setLineDash([4, 5]); c.lineWidth = 1.1; c.strokeStyle = 'rgba(' + INK + ',.3)'; poly(c, [t0, t1, t2, t3]); c.closePath(); c.stroke(); poly(c, [t3, b3, b2, b1, t1]); c.stroke(); c.setLineDash([]); return; }
      c.fillStyle = '#E4E7ED'; poly(c, [t3, t2, b2, b3]); c.closePath(); c.fill(); c.fillStyle = '#D9DDE5'; poly(c, [t1, t2, b2, b1]); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(' + INK + ',.85)'; c.lineWidth = 1.1; c.lineJoin = 'round';
      poly(c, [t3, b3, b2, b1, t1]); c.stroke(); c.beginPath(); c.moveTo(t2[0], t2[1]); c.lineTo(b2[0], b2[1]); c.stroke();
      var g = c.createLinearGradient(t0[0], t0[1], t2[0], t2[1]); g.addColorStop(0, 'rgba(' + rgb + ',' + (0.16 + glow * 0.16) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',.03)');
      poly(c, [t0, t1, t2, t3]); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill(); c.fillStyle = g; c.fill(); c.stroke();
      c.strokeStyle = 'rgba(' + INK + ',.07)'; c.lineWidth = 1; for (var i = -1; i <= 1; i++){ seg(c, o, [i, -a, 0], [i, a, 0]); seg(c, o, [-a, i, 0], [a, i, 0]); }
    }
    function box(c, o, x0, y0, x1, y1, z0, h, top, side, stroke){
      var z1 = z0 + h, A = P(o, x0, y0, z1), B = P(o, x1, y0, z1), C = P(o, x1, y1, z1), D = P(o, x0, y1, z1), Cb = P(o, x1, y1, z0), Db = P(o, x0, y1, z0), Bb = P(o, x1, y0, z0);
      c.strokeStyle = stroke; c.lineWidth = 1.1; c.lineJoin = 'round';
      poly(c, [D, C, Cb, Db]); c.closePath(); c.fillStyle = side; c.fill(); c.stroke();
      poly(c, [B, C, Cb, Bb]); c.closePath(); c.fillStyle = side; c.fill(); c.stroke();
      poly(c, [A, B, C, D]); c.closePath(); c.fillStyle = top; c.fill(); c.stroke();
    }
    function radar(c, o, rgb, t){
      var i, k, n = 40, th, p; c.lineWidth = 1;
      for (k = 1; k <= 3; k++){ c.strokeStyle = 'rgba(' + rgb + ',' + (0.3 + k * 0.12) + ')'; c.beginPath(); for (i = 0; i <= n; i++){ th = i / n * TAU; p = P(o, k * 0.6 * Math.cos(th), k * 0.6 * Math.sin(th), .02); if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); } c.stroke(); }
      var ang = t * 1.5;
      for (i = 0; i < 16; i++){ th = ang - i * 0.055; c.strokeStyle = 'rgba(' + rgb + ',' + (1 - i / 16) + ')'; c.lineWidth = i ? 1 : 2; seg(c, o, [0, 0, .02], [1.8 * Math.cos(th), 1.8 * Math.sin(th), .02]); }
      var bl = [[1.1, 0.7], [1.5, 2.6], [0.8, 4.1], [1.6, 5.3]];
      for (i = 0; i < bl.length; i++){
        var d = ((ang - bl[i][1]) % TAU + TAU) % TAU, al = Math.max(0, 1 - d / 3.8); p = P(o, bl[i][0] * Math.cos(bl[i][1]), bl[i][0] * Math.sin(bl[i][1]), .04);
        c.fillStyle = 'rgba(' + INK + ',' + al + ')'; c.beginPath(); c.arc(p[0], p[1], Math.max(1.6, o.s * .12), 0, TAU); c.fill();
        if (al > .55){ c.lineWidth = 1.2; c.strokeStyle = 'rgba(' + rgb + ',' + (al - .55) * 2 + ')'; c.beginPath(); c.arc(p[0], p[1], 3 + (1 - al) * o.s, 0, TAU); c.stroke(); }
      }
    }
    function beam(c, o, rgb, t){
      var d = 0.30 + 0.26 * Math.sin(t * 1.25), i, n = 14, u, u2, z1, z2, lw = Math.max(2, o.s * .13);
      c.lineCap = 'round'; c.lineWidth = lw; c.strokeStyle = 'rgba(' + INK + ',.9)'; seg(c, o, [-1.3, 0, 0], [-1.3, 0, 1.55]);
      c.lineWidth = 1; c.strokeStyle = 'rgba(' + INK + ',.4)'; seg(c, o, [-1.6, -.5, 0], [-1.0, .5, 0]); seg(c, o, [-1.6, .5, 0], [-1.0, -.5, 0]);
      c.setLineDash([3, 4]); c.strokeStyle = 'rgba(' + INK + ',.45)'; seg(c, o, [-1.3, 0, 1.55], [1.5, 0, 1.55]); c.setLineDash([]);
      c.lineWidth = lw;
      for (i = 0; i < n; i++){ u = i / n; u2 = (i + 1) / n; z1 = 1.55 - d * u * u * (3 - u) / 2; z2 = 1.55 - d * u2 * u2 * (3 - u2) / 2; var hot = (1 - u) > .55 && d > .44; c.strokeStyle = 'rgba(' + (hot ? HUE.game : rgb) + ',1)'; seg(c, o, [-1.3 + 2.8 * u, 0, z1], [-1.3 + 2.8 * u2, 0, z2]); }
      c.lineCap = 'butt'; c.lineWidth = 1.2; c.strokeStyle = 'rgba(' + INK + ',.8)'; seg(c, o, [1.5, 0, 1.55 - d], [1.5, 0, 1.0 - d]);
      var wq = P(o, 1.5, 0, .82 - d), ws = Math.max(3, o.s * .22); c.fillStyle = 'rgba(' + INK + ',.92)'; c.fillRect(wq[0] - ws, wq[1] - ws, ws * 2, ws * 2);
    }
    function swe(c, o, rgb, t){
      var y = .2, x0 = -1.6, x1 = 1.6, z0 = .12, z1 = 2.3, i, q;
      poly(c, [P(o, x0, y, z0), P(o, x1, y, z0), P(o, x1, y, z1), P(o, x0, y, z1)]); c.closePath(); c.fillStyle = 'rgba(255,255,255,.97)'; c.fill(); c.strokeStyle = 'rgba(' + INK + ',.9)'; c.lineWidth = 1.2; c.stroke();
      c.strokeStyle = 'rgba(' + INK + ',.35)'; c.lineWidth = 1; seg(c, o, [x0, y, z1 - .3], [x1, y, z1 - .3]);
      var rows = [1.3, 2.2, 1.7]; c.lineWidth = Math.max(1.6, o.s * .12); c.lineCap = 'round';
      for (i = 0; i < rows.length; i++){ c.strokeStyle = 'rgba(' + INK + ',.18)'; seg(c, o, [x0 + .3, y, z1 - .62 - i * .26], [x0 + .3 + rows[i], y, z1 - .62 - i * .26]); }
      c.lineCap = 'butt';
      var cyc = (t % 7) / 7, fixed = cyc > .55, col = fixed ? rgb : HUE.game, bx0 = x0 + .3, bx1 = fixed ? x0 + 1.7 : x0 + 2.75 + .05 * Math.sin(t * 22), bz0 = .36, bz1 = 1.0;
      poly(c, [P(o, bx0, y, bz0), P(o, bx1, y, bz0), P(o, bx1, y, bz1), P(o, bx0, y, bz1)]); c.closePath(); c.fillStyle = 'rgba(' + col + ',.18)'; c.fill(); c.lineWidth = 1.4; c.strokeStyle = 'rgba(' + col + ',1)'; c.stroke();
      c.strokeStyle = 'rgba(' + INK + ',.3)'; c.lineWidth = 1; poly(c, [P(o, x0 + 1.95, y, bz0), P(o, x1 - .25, y, bz0), P(o, x1 - .25, y, bz1), P(o, x0 + 1.95, y, bz1)]); c.closePath(); c.stroke();
      var cu = cyc < .55 ? cyc / .55 : 1, e = cu * cu * (3 - 2 * cu), cp = P(o, x0 + 2.9 - 1.5 * e, y - .02, 1.9 - 1.2 * e), k = Math.max(.55, o.s / 23);
      c.beginPath(); c.moveTo(cp[0], cp[1]); c.lineTo(cp[0] + 9.5 * k, cp[1] + 4.8 * k); c.lineTo(cp[0] + 4.4 * k, cp[1] + 5.8 * k); c.lineTo(cp[0] + 2.3 * k, cp[1] + 10.5 * k); c.closePath(); c.fillStyle = 'rgb(' + INK + ')'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#fff'; c.stroke();
      if (cyc > .52 && cyc < .7){ q = (cyc - .52) / .18; c.strokeStyle = 'rgba(' + rgb + ',' + (1 - q) + ')'; c.lineWidth = 1.4; c.beginPath(); c.arc(cp[0], cp[1], 4 + q * 18 * k, 0, TAU); c.stroke(); }
    }
    function arm(c, o, rgb, t, w, dt){
      var i, y, best = 9, target = 0, ys = [];
      c.lineWidth = 1; c.strokeStyle = 'rgba(' + INK + ',.4)'; seg(c, o, [.62, -1.9, .02], [.62, 1.9, .02]); seg(c, o, [1.5, -1.9, .02], [1.5, 1.9, .02]);
      for (i = 0; i < 4; i++){ y = ((t * .55 + i) % 4) - 2; ys.push(y); if (Math.abs(y) < best){ best = Math.abs(y); target = y; } }
      for (i = 0; i < 4; i++){ y = ys[i]; var hot = y === target && best < .9; poly(c, [P(o, .84, y - .2, .02), P(o, 1.28, y - .2, .02), P(o, 1.28, y + .2, .02), P(o, .84, y + .2, .02)]); c.closePath(); c.fillStyle = 'rgba(' + rgb + ',' + (hot ? .7 : .2) + ')'; c.fill(); c.strokeStyle = 'rgba(' + rgb + ',1)'; c.stroke(); }
      w.r = (w.r || 0) + ((best < .9 ? 1 : .25) - (w.r || 0)) * Math.min(1, (dt || 0.016) * 7);
      var r = w.r, sh = [-.9, 0, 1.0], tg = [1.06 * r - .25 * (1 - r), target * r, .32 + 1.0 * (1 - r)], el = [(sh[0] + tg[0]) / 2, (sh[1] + tg[1]) / 2, Math.max(sh[2], tg[2]) + .78], lw = Math.max(2, o.s * .15);
      c.lineCap = 'round'; c.strokeStyle = 'rgba(' + INK + ',.92)'; c.lineWidth = lw; seg(c, o, [-.9, 0, 0], sh); seg(c, o, sh, el); c.lineWidth = lw * .72; seg(c, o, el, tg); c.lineCap = 'butt';
      [sh, el].forEach(function(j){ var q = P(o, j[0], j[1], j[2]); c.fillStyle = '#fff'; c.beginPath(); c.arc(q[0], q[1], Math.max(2.2, o.s * .17), 0, TAU); c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(' + rgb + ',1)'; c.stroke(); });
      var g = P(o, tg[0], tg[1], tg[2]); c.fillStyle = 'rgba(' + rgb + ',1)'; c.beginPath(); c.arc(g[0], g[1], Math.max(1.8, o.s * .12), 0, TAU); c.fill();
    }
    function game(c, o, rgb, t){
      function tri(v){ v = ((v % 4) + 4) % 4; return v < 2 ? v - 1 : 3 - v; }
      c.lineWidth = 1; c.strokeStyle = 'rgba(' + INK + ',.35)'; poly(c, [P(o, -1.6, -1.6, .02), P(o, 1.6, -1.6, .02), P(o, 1.6, 1.6, .02), P(o, -1.6, 1.6, .02)]); c.closePath(); c.stroke();
      c.setLineDash([3, 4]); seg(c, o, [0, -1.6, .02], [0, 1.6, .02]); c.setLineDash([]);
      var bx = tri(t * 1.3) * 1.45, by = tri(t * 0.9 + .7) * 1.3, bz = .14 + Math.abs(Math.sin(t * 5)) * .4;
      c.lineWidth = Math.max(2, o.s * .15); c.lineCap = 'round'; c.strokeStyle = 'rgba(' + rgb + ',1)'; seg(c, o, [-1.6, by * .85 - .38, .06], [-1.6, by * .85 + .38, .06]); seg(c, o, [1.6, by * .7 - .38, .06], [1.6, by * .7 + .38, .06]); c.lineCap = 'butt';
      var sh = P(o, bx, by, .02); c.fillStyle = 'rgba(' + INK + ',.14)'; c.beginPath(); c.ellipse(sh[0], sh[1], o.s * .24, o.s * .12, 0, 0, TAU); c.fill();
      var b = P(o, bx, by, bz); c.fillStyle = 'rgb(' + INK + ')'; c.beginPath(); c.arc(b[0], b[1], Math.max(2, o.s * .14), 0, TAU); c.fill();
    }
    function lab(c, o, rgb, t){
      // an instrument's screen with a spectrum being traced, and the sample it is measuring
      var y = -.3, x0 = -1.6, x1 = 1.6, z0 = .12, z1 = 2.2, i, n = 46, cyc = (t % 6) / 6, pr = Math.min(1, cyc / .7), p;
      poly(c, [P(o, x0, y, z0), P(o, x1, y, z0), P(o, x1, y, z1), P(o, x0, y, z1)]); c.closePath(); c.fillStyle = 'rgba(255,255,255,.97)'; c.fill(); c.strokeStyle = 'rgba(' + INK + ',.9)'; c.lineWidth = 1.2; c.stroke();
      c.strokeStyle = 'rgba(' + INK + ',.4)'; c.lineWidth = 1; seg(c, o, [x0 + .3, y, z1 - .3], [x0 + .3, y, z0 + .3]); seg(c, o, [x0 + .3, y, z0 + .3], [x1 - .25, y, z0 + .3]);
      function f(u){ return .08 + .95 * Math.exp(-Math.pow((u - .36) / .075, 2)) + .5 * Math.exp(-Math.pow((u - .7) / .11, 2)) + .03 * Math.sin(u * 60); }
      c.strokeStyle = 'rgba(' + rgb + ',1)'; c.lineWidth = Math.max(1.4, o.s * .09); c.lineJoin = 'round'; c.beginPath();
      for (i = 0; i <= n * pr; i++){ var u = i / n; p = P(o, x0 + .3 + u * 2.6, y, z0 + .3 + f(u) * 1.25); if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }
      c.stroke(); if (p){ c.fillStyle = 'rgb(' + INK + ')'; c.beginPath(); c.arc(p[0], p[1], Math.max(1.8, o.s * .12), 0, TAU); c.fill(); }
      box(c, o, .1, .9, .8, 1.5, 0, .3, 'rgba(' + rgb + ',.3)', 'rgba(' + rgb + ',.14)', 'rgba(' + INK + ',.85)');
      c.setLineDash([3, 3]); c.lineDashOffset = -t * 14; c.strokeStyle = 'rgba(' + rgb + ',1)'; c.lineWidth = 1.3; seg(c, o, [-1.7, 1.2, .5], [.3, 1.2, .5]); c.setLineDash([]); c.lineDashOffset = 0;
      box(c, o, -1.9, 1.0, -1.6, 1.4, .3, .4, '#fff', '#E4E7ED', 'rgba(' + INK + ',.85)');
    }
    // two kinds of figure, never mixed up: an agent is angular and solid (a diamond head, its colour says which agent);
    // a human expert is round and outlined
    function pawn(c, x, y, k, rgb){
      c.fillStyle = 'rgba(' + INK + ',.13)'; c.beginPath(); c.ellipse(x, y, 6.4 * k, 2.7 * k, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgb(' + rgb + ')'; c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x - 4.8 * k, y); c.lineTo(x - 2.5 * k, y - 8.4 * k); c.lineTo(x + 2.5 * k, y - 8.4 * k); c.lineTo(x + 4.8 * k, y); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(x, y - 17.6 * k); c.lineTo(x + 4.4 * k, y - 13.2 * k); c.lineTo(x, y - 8.800 * k); c.lineTo(x - 4.4 * k, y - 13.2 * k); c.closePath(); c.fill(); c.stroke();
    }
    function human(c, x, y, k){
      c.fillStyle = 'rgba(' + INK + ',.13)'; c.beginPath(); c.ellipse(x, y, 6.8 * k, 2.7 * k, 0, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.strokeStyle = 'rgb(' + INK + ')'; c.lineWidth = Math.max(1.5, 1.15 * k); c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x - 5.8 * k, y); c.bezierCurveTo(x - 5.8 * k, y - 11.6 * k, x + 5.8 * k, y - 11.6 * k, x + 5.8 * k, y); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.arc(x, y - 13.3 * k, 4 * k, 0, TAU); c.fill(); c.stroke();
    }
    function collab(c, o, rgb, t){
      // one shared piece of work, changed from two sides at once, then reconciled
      var y = -.55, x0 = -1.25, x1 = 1.25, z0 = .12, z1 = 2.0, cyc = (t % 6) / 6, m = sm(.05, .45, cyc) * (1 - sm(.9, 1, cyc)), other = HUE.arm, k = Math.max(.62, o.s / 19), q;
      poly(c, [P(o, x0, y, z0), P(o, x1, y, z0), P(o, x1, y, z1), P(o, x0, y, z1)]); c.closePath(); c.fillStyle = 'rgba(255,255,255,.97)'; c.fill(); c.strokeStyle = 'rgba(' + INK + ',.9)'; c.lineWidth = 1.2; c.stroke();
      c.strokeStyle = 'rgba(' + INK + ',.35)'; c.lineWidth = 1; seg(c, o, [x0, y, z1 - .3], [x1, y, z1 - .3]);
      function blk(a, b, za, zb, col){ poly(c, [P(o, a, y, za), P(o, b, y, za), P(o, b, y, zb), P(o, a, y, zb)]); c.closePath(); c.fillStyle = 'rgba(' + col + ',.22)'; c.fill(); c.lineWidth = 1.3; c.strokeStyle = 'rgba(' + col + ',1)'; c.stroke(); }
      blk(x0 + .18, x0 + .18 + 1.25 * m, 1.0, 1.5, rgb); blk(x1 - .18 - 1.25 * m, x1 - .18, .34, .84, other);
      var ok = cyc > .5 && cyc < .9; c.setLineDash([2, 3]); c.strokeStyle = 'rgba(' + INK + ',' + (ok ? .75 : .3) + ')'; c.lineWidth = 1; seg(c, o, [0, y, .34], [0, y, 1.5]); c.setLineDash([]);
      c.setLineDash([3, 3]); c.lineDashOffset = -t * 14; c.lineWidth = 1.3;
      c.strokeStyle = 'rgba(' + rgb + ',1)'; seg(c, o, [-1.15, 1.25, .75], [-.75, y, 1.25]); c.strokeStyle = 'rgba(' + other + ',1)'; seg(c, o, [1.35, .85, .75], [.75, y, .6]);
      c.setLineDash([]); c.lineDashOffset = 0;
      q = P(o, -1.15, 1.25, 0); pawn(c, q[0], q[1], k, rgb); q = P(o, 1.35, .85, 0); pawn(c, q[0], q[1], k, other);
    }
    function chip(c, o, rgb, t){
      // a chip under check: the checks sweep the die, one fails, it is fixed
      var i, a, b, cyc = (t % 7) / 7, n = Math.floor(Math.min(1, cyc / .62) * 16), lw = Math.max(1.5, o.s * .09), z = .28;
      c.lineCap = 'round'; c.lineWidth = lw; c.strokeStyle = 'rgba(' + INK + ',.75)';
      for (i = -2; i <= 2; i++){ var p = i * .44; seg(c, o, [p, 1.3, .14], [p, 1.72, .02]); seg(c, o, [1.3, p, .14], [1.72, p, .02]); seg(c, o, [p, -1.3, .14], [p, -1.72, .02]); seg(c, o, [-1.3, p, .14], [-1.72, p, .02]); }
      c.lineCap = 'butt';
      box(c, o, -1.3, -1.3, 1.3, 1.3, 0, z, '#fff', '#E4E7ED', 'rgba(' + INK + ',.9)');
      for (a = 0; a < 4; a++) for (b = 0; b < 4; b++){
        var idx = a * 4 + b, lit = idx < n, bad = idx === 9 && lit && cyc < .8, xa = -.94 + a * .49, ya = -.94 + b * .49;
        poly(c, [P(o, xa, ya, z), P(o, xa + .41, ya, z), P(o, xa + .41, ya + .41, z), P(o, xa, ya + .41, z)]); c.closePath();
        c.fillStyle = bad ? 'rgba(' + HUE.game + ',' + (.55 + .35 * Math.sin(t * 9)) + ')' : 'rgba(' + rgb + ',' + (lit ? .6 : .08) + ')'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(' + (bad ? HUE.game : rgb) + ',' + (lit ? 1 : .45) + ')'; c.stroke();
      }
    }
    function space(c, o, rgb, t){
      // a ground station and a spacecraft that is only in contact for part of each orbit
      var i, n = 48, th, p, a = t * .62, Ro = 1.6, zc = 1.75, k = Math.max(1.6, o.s * .1);
      function orb(th2){ return [Ro * Math.cos(th2), Ro * Math.sin(th2) * .62, zc + .42 * Math.sin(th2)]; }
      box(c, o, -.5, .55, .2, 1.25, 0, .3, '#fff', '#E4E7ED', 'rgba(' + INK + ',.85)');
      c.lineWidth = Math.max(1.4, o.s * .08); c.lineCap = 'round'; c.strokeStyle = 'rgba(' + INK + ',.9)';
      seg(c, o, [-.15, .9, .3], [-.15, .9, .62]); seg(c, o, [-.15, .9, .62], [-.52, .9, .98]); seg(c, o, [-.15, .9, .62], [.22, .9, .98]); c.lineCap = 'butt';
      c.setLineDash([2, 4]); c.lineWidth = 1; c.strokeStyle = 'rgba(' + INK + ',.38)'; c.beginPath();
      for (i = 0; i <= n; i++){ th = i / n * TAU; var q = orb(th); p = P(o, q[0], q[1], q[2]); if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); } c.stroke(); c.setLineDash([]);
      var sp = orb(a), vis = sm(.05, .4, Math.sin(a)); p = P(o, sp[0], sp[1], sp[2]);
      if (vis > .02){ c.setLineDash([3, 3]); c.lineDashOffset = -t * 18; c.lineWidth = 1.4; c.strokeStyle = 'rgba(' + rgb + ',' + vis + ')'; seg(c, o, [-.15, .9, .82], sp); c.setLineDash([]); c.lineDashOffset = 0; }
      c.lineWidth = Math.max(1.6, o.s * .1); c.strokeStyle = 'rgba(' + INK + ',.85)'; c.beginPath(); c.moveTo(p[0] - k * 3.4, p[1]); c.lineTo(p[0] + k * 3.4, p[1]); c.stroke();
      c.fillStyle = vis > .5 ? 'rgb(' + rgb + ')' : '#fff'; c.strokeStyle = 'rgb(' + (vis > .5 ? rgb : INK) + ')'; c.lineWidth = 1.4; c.fillRect(p[0] - k * 1.3, p[1] - k * 1.3, k * 2.6, k * 2.6); c.strokeRect(p[0] - k * 1.3, p[1] - k * 1.3, k * 2.6, k * 2.6);
    }
    var DRAW = { radar: radar, beam: beam, swe: swe, arm: arm, game: game, lab: lab, collab: collab, chip: chip, space: space };

    // ---------- hero: a globe of domains that can be turned any way round. The frontier line stays where it is
    // and the globe moves under it: a domain arrives as a dashed outline and becomes a built world as it crosses.
    // New domains are new places on the globe; the open slots are the ones still to come.
    var cv = root.getElementById('frontier'), st = api.canvas(cv), near = api.near(cv);
    var DEG = Math.PI / 180, N = 2600, BX = new Float32Array(N), BY = new Float32Array(N), BZ = new Float32Array(N), GK = new Uint8Array(N), i;
    for (i = 0; i < N; i++){ var gy = 1 - (i + .5) / N * 2, gr = Math.sqrt(1 - gy * gy), gl = i * 2.399963229728653; BX[i] = gr * Math.sin(gl); BY[i] = gy; BZ[i] = gr * Math.cos(gl); GK[i] = rnd() < .055 ? 1 : 0; }
    var B = [0, 1, 2, 3, 4].map(function(){ return { xy: new Float32Array(N * 2), n: 0 }; });
    var STYLE = ['rgba(13,16,20,.2)', 'rgba(13,16,20,.4)', 'rgba(13,16,20,.72)', 'rgba(43,75,255,1)', 'rgba(13,16,20,1)'], SIZE = [1.4, 1.6, 1.8, 2.3, 2.5];
    var TILT = 20 * DEG, CT = Math.cos(TILT), SN = Math.sin(TILT), LF = 32 * DEG, SLF = Math.sin(LF), CLF = Math.cos(LF), PERIOD = 84, ROT0 = 87.6 * DEG;
    var SLOTS = [
      { k: 'collab', label: 'HUMAN–AGENT TEAMS',        lat: 34 },
      { k: 'swe',    label: 'SOFTWARE ENGINEERING',     lat: -22 },
      { k: '',       label: 'NEXT DOMAIN',              lat: 6 },
      { k: 'radar',  label: 'REAL-TIME OPERATIONS',     lat: 36 },
      { k: 'game',   label: 'GAMES',                    lat: -26 },
      { k: 'arm',    label: 'EMBODIED AGENTS',          lat: 2 },
      { k: '',       label: 'NEXT DOMAIN',              lat: 32 },
      { k: 'beam',   label: 'DESIGN AND MANUFACTURING', lat: -24 },
      { k: 'lab',    label: 'LABORATORY SCIENCE',       lat: 5 },
      { k: 'chip',   label: 'CHIP DESIGN',              lat: 35 },
      { k: '',       label: 'NEXT DOMAIN',              lat: -22 },
      { k: 'space',  label: 'SPACE OPERATIONS',         lat: 3 },
      { k: '',       label: 'NEXT DOMAIN',              lat: 33 },
      { k: '',       label: 'NEXT DOMAIN',              lat: -25 }
    ];
    SLOTS.forEach(function(w, n){ var lon = n * TAU / SLOTS.length, cl = Math.cos(w.lat * DEG); w.v = [cl * Math.sin(lon), Math.sin(w.lat * DEG), cl * Math.cos(lon)]; w.w = {}; });
    var PAWNS = [{ cur: null, from: null, u: 1, rgb: BLUE, nth: 0 }, { cur: null, from: null, u: 1, rgb: INK, nth: 2 }];
    // the reader's own turn of the globe, kept as a rotation matrix so it can go any way round
    var U = [1, 0, 0, 0, 1, 0, 0, 0, 1], drag = null, tch = null, Rnow = 300;
    function mul(a, b){ var o = [], r, k2; for (r = 0; r < 3; r++) for (k2 = 0; k2 < 3; k2++) o.push(a[r * 3] * b[k2] + a[r * 3 + 1] * b[3 + k2] + a[r * 3 + 2] * b[6 + k2]); return o; }
    function rotY(a){ var c2 = Math.cos(a), s2 = Math.sin(a); return [c2, 0, s2, 0, 1, 0, -s2, 0, c2]; }
    function rotX(a){ var c2 = Math.cos(a), s2 = Math.sin(a); return [1, 0, 0, 0, c2, -s2, 0, s2, c2]; }
    function turn(dx, dy){
      U = mul(mul(rotY(dx), rotX(dy)), U);
      var a = U.slice(0, 3), b = U.slice(3, 6), n1 = Math.hypot(a[0], a[1], a[2]); a = a.map(function(v){ return v / n1; });
      var d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; b = b.map(function(v, k2){ return v - d * a[k2]; }); var n2 = Math.hypot(b[0], b[1], b[2]); b = b.map(function(v){ return v / n2; });
      U = a.concat(b, [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]);
      if (api.reduced) frontier(2.4, 0);
    }
    api.on(cv, 'pointerdown', function(e){ if (e.pointerType === 'touch') return; drag = { x: e.clientX, y: e.clientY }; cv.style.cursor = 'grabbing'; if (cv.setPointerCapture) try { cv.setPointerCapture(e.pointerId); } catch (er) {} });
    api.on(cv, 'pointermove', function(e){ if (!drag) return; turn((e.clientX - drag.x) / Rnow, (e.clientY - drag.y) / Rnow); drag.x = e.clientX; drag.y = e.clientY; });
    function drop(){ drag = null; cv.style.cursor = ''; }
    api.on(cv, 'pointerup', drop); api.on(cv, 'pointercancel', drop);
    // touch: a swipe that starts sideways turns the globe (then any way); one that starts up or down scrolls the page
    api.on(cv, 'touchstart', function(e){ var p = e.touches[0]; tch = e.touches.length === 1 ? { x: p.clientX, y: p.clientY, mode: '' } : null; }, { passive: true });
    api.on(cv, 'touchmove', function(e){
      if (!tch) return; var p = e.touches[0], dx = p.clientX - tch.x, dy = p.clientY - tch.y;
      if (!tch.mode){ if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; tch.mode = Math.abs(dx) >= Math.abs(dy) ? 'rot' : 'scroll'; }
      if (tch.mode === 'rot'){ if (e.cancelable) e.preventDefault(); turn(dx / Rnow, dy / Rnow); tch.x = p.clientX; tch.y = p.clientY; }
    }, { passive: false });
    api.on(cv, 'touchend', function(){ tch = null; }); api.on(cv, 'touchcancel', function(){ tch = null; });
    function tag(c, text, cx, y, rgb, maxW, size){
      c.font = '500 ' + size + "px 'Geist Mono', monospace"; c.textBaseline = 'top'; c.textAlign = 'left';
      var lines = [text], k;
      if (c.measureText(text).width + 13 > maxW && text.indexOf(' ') > 0){
        var parts = text.split(' '), best = 1, bd = 1e9;
        for (k = 1; k < parts.length; k++){ var d = Math.abs(c.measureText(parts.slice(0, k).join(' ')).width - c.measureText(parts.slice(k).join(' ')).width); if (d < bd){ bd = d; best = k; } }
        lines = [parts.slice(0, best).join(' '), parts.slice(best).join(' ')];
      }
      var w0 = c.measureText(lines[0]).width, x0 = cx - (w0 + 13) / 2;
      c.fillStyle = 'rgba(' + rgb + ',1)'; c.fillRect(x0, y + 1.5, 7, 7); c.fillStyle = 'rgba(' + INK + ',.88)'; c.fillText(lines[0], x0 + 13, y);
      if (lines[1]) c.fillText(lines[1], cx - c.measureText(lines[1]).width / 2 + 6.5, y + size + 3);
    }
    function frontier(t, dt){
      var c = st.ctx, W = st.w, H = st.h, small = W < 700, R = small ? W * .5 : Math.min((H - 150) / 2, W * .36, 320), cx = W / 2, cy = small ? R + 104 : H * .5 + 14, k, j, p, q, pen;
      Rnow = R;
      var M = mul(U, rotY(-(ROT0 + t * TAU / PERIOD))), m0 = M[0], m1 = M[1], m2 = M[2], m3 = M[3], m4 = M[4], m5 = M[5], m6 = M[6], m7 = M[7], m8 = M[8];
      // a point on the globe's own surface -> [screen x, screen y, depth toward the viewer, distance past the frontier line, side of that line]
      function pv(bx, by, bz, rad){ var x = m0 * bx + m1 * by + m2 * bz, y = m3 * bx + m4 * by + m5 * bz, z = m6 * bx + m7 * by + m8 * bz; return [cx + x * rad, cy - (y * CT - z * SN) * rad, y * SN + z * CT, x * CLF - z * SLF, x * SLF + z * CLF]; }
      // a point fixed in the view (the frontier line does not turn with the globe)
      function fixed(cl, sl, lon, rad){ var x = cl * Math.sin(lon), z0 = cl * Math.cos(lon); return [cx + x * rad, cy - (sl * CT - z0 * SN) * rad, sl * SN + z0 * CT]; }
      c.clearRect(0, 0, W, H);
      c.fillStyle = 'rgba(' + INK + ',.055)'; c.beginPath(); c.ellipse(cx, cy + R + 24, R * .8, R * .065, 0, 0, TAU); c.fill();
      var body = c.createRadialGradient(cx - R * .38, cy - R * .5, R * .08, cx, cy, R); body.addColorStop(0, '#FFFFFF'); body.addColorStop(1, '#EBEEF3');
      c.fillStyle = body; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill();
      var fp = fixed(1, 0, LF, R), dg = c.createRadialGradient(fp[0], fp[1], 0, fp[0], fp[1], R * .62); dg.addColorStop(0, 'rgba(' + BLUE + ',.13)'); dg.addColorStop(1, 'rgba(' + BLUE + ',0)');
      c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip(); c.fillStyle = dg; c.fillRect(fp[0] - R, fp[1] - R, R * 2, R * 2); c.restore();
      // the charted side has a grid; the side the line has not reached has none
      c.lineWidth = 1; c.strokeStyle = 'rgba(' + INK + ',.1)';
      for (k = -60; k <= 60; k += 20){ var cl = Math.cos(k * DEG), sl = Math.sin(k * DEG); pen = 0; c.beginPath();
        for (j = 0; j <= 72; j++){ var lo = j * 5 * DEG; p = pv(cl * Math.sin(lo), sl, cl * Math.cos(lo), R); if (p[2] > 0 && p[3] < 0){ if (pen) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); pen = 1; } else pen = 0; } c.stroke(); }
      for (k = 0; k < 18; k++){ var lo2 = k * 20 * DEG, sl2 = Math.sin(lo2), cl2 = Math.cos(lo2); pen = 0; c.beginPath();
        for (j = 0; j <= 40; j++){ var ph = (-90 + j * 4.5) * DEG, cp2 = Math.cos(ph); p = pv(cp2 * sl2, Math.sin(ph), cp2 * cl2, R); if (p[2] > 0 && p[3] < 0){ if (pen) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); pen = 1; } else pen = 0; } c.stroke(); }
      for (k = 0; k < 5; k++) B[k].n = 0;
      for (var n = 0; n < N; n++){
        var bx = BX[n], by = BY[n], bz = BZ[n], x = m0 * bx + m1 * by + m2 * bz, y = m3 * bx + m4 * by + m5 * bz, z = m6 * bx + m7 * by + m8 * bz;
        if (y * SN + z * CT <= .03) continue;
        var d = x * CLF - z * SLF, e = x * SLF + z * CLF, bk;
        if (e > 0 && d > -.03 && d < .03) bk = 3; else if (d >= 0){ if (n % 3) continue; bk = 0; } else bk = GK[n] ? 4 : (e > 0 && d > -.42 ? 2 : 1);
        q = B[bk]; q.xy[q.n * 2] = cx + x * R; q.xy[q.n * 2 + 1] = cy - (y * CT - z * SN) * R; q.n++;
      }
      for (k = 0; k < 5; k++){ var sz = SIZE[k], hs = sz / 2, bb = B[k]; c.fillStyle = STYLE[k]; for (j = 0; j < bb.n; j++) c.fillRect(bb.xy[j * 2] - hs, bb.xy[j * 2 + 1] - hs, sz, sz); }
      c.strokeStyle = 'rgba(' + INK + ',.3)'; c.lineWidth = 1.2; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
      [[7, .13], [1.7, 1]].forEach(function(lw){ pen = 0; c.strokeStyle = 'rgba(' + BLUE + ',' + lw[1] + ')'; c.lineWidth = lw[0]; c.lineCap = 'round'; c.beginPath();
        for (j = 0; j <= 60; j++){ var ph2 = (-90 + j * 3) * DEG; p = fixed(Math.cos(ph2), Math.sin(ph2), LF, R); if (p[2] > 0){ if (pen) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); pen = 1; } else pen = 0; } c.stroke(); c.lineCap = 'butt'; });

      // the worlds: each one stands on a pin above its place on the globe
      var s0 = small ? Math.max(12.5, R / 16) : R / 14.4, list = [], fresh = [];
      for (k = 0; k < SLOTS.length; k++){
        var w = SLOTS[k], sp = pv(w.v[0], w.v[1], w.v[2], R), z2 = sp[2], on = w.k && sp[3] < -.03 ? 1 : 0;
        w.b = (w.b === undefined || !dt) ? on : w.b + (on - w.b) * Math.min(1, dt * 2.6);
        w.sd = sp[3]; w.z = z2; w.vis = sm(-.1, .14, z2); if (w.vis <= 0) continue;
        var sc = s0 * (.62 + .38 * Math.max(0, z2)), out = pv(w.v[0], w.v[1], w.v[2], R * 1.07);
        w.sp = sp; w.o = { x: out[0], y: out[1] - sc * 4.5 + Math.sin(t * .9 + k * 1.7) * 2.5, s: sc }; list.push(w);
        if (on && z2 > .22) fresh.push(w);
      }
      list.sort(function(a2, b2){ return a2.z - b2.z; }); fresh.sort(function(a2, b2){ return b2.sd - a2.sd; });
      for (j = 0; j < list.length; j++){
        var ww = list[j], ow = ww.o, rgb = ww.k ? HUE[ww.k] : INK, bq = ww.b, va = ww.vis;
        c.globalAlpha = va; c.fillStyle = 'rgba(' + INK + ',.08)'; c.beginPath(); c.ellipse(ww.sp[0], ww.sp[1] + 2, ow.s * 1.5, ow.s * .42, 0, 0, TAU); c.fill();
        c.setLineDash([2, 4]); c.strokeStyle = 'rgba(' + INK + ',.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(ww.sp[0], ww.sp[1]); c.lineTo(ow.x, ow.y + ow.s * 2.34); c.stroke(); c.setLineDash([]);
        c.fillStyle = 'rgb(' + (bq > .5 ? rgb : INK) + ')'; c.beginPath(); c.arc(ww.sp[0], ww.sp[1], 2.7, 0, TAU); c.fill();
        if (bq < .995){ c.globalAlpha = va * (1 - bq); slab(c, ow, INK, 0, true);
          if (!ww.k){ c.strokeStyle = 'rgb(' + BLUE + ')'; c.lineWidth = 1.8; c.lineCap = 'round'; seg(c, ow, [-.62, 0, 0], [.62, 0, 0]); seg(c, ow, [0, -.62, 0], [0, .62, 0]); c.lineCap = 'butt'; } }
        if (bq > .005){ c.globalAlpha = va * bq; slab(c, ow, rgb, bq < .97 ? 1 : 0, false); DRAW[ww.k](c, ow, rgb, t, ww.w, dt); }
        c.globalAlpha = 1;
        if (bq > .02 && bq < .98){ c.strokeStyle = 'rgba(' + BLUE + ',' + (1 - bq) + ')'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(ow.x, ow.y, ow.s * (2.4 + 2.6 * bq), ow.s * (1.2 + 1.3 * bq), 0, 0, TAU); c.stroke(); }
        var la2 = va * sm(small ? .42 : .2, small ? .6 : .42, ww.z);
        if (la2 > .01){ var lp = P(ow, 2, 2, -.34); c.globalAlpha = la2 * (ww.k ? .55 + .45 * bq : .8); tag(c, ww.label, ow.x, lp[1] + 8, !ww.k ? BLUE : bq > .5 ? rgb : INK, small ? 96 : 150, small ? 9 : 10); c.globalAlpha = 1; }
      }
      // the agents: each moves to the next world as soon as it is built
      for (k = 0; k < PAWNS.length; k++){
        var pw = PAWNS[k], want = fresh.length ? fresh[Math.min(pw.nth, fresh.length - 1)] : null;
        if (k && want === PAWNS[0].cur) want = null;
        if (want && want !== pw.cur && pw.u >= 1){ pw.from = pw.cur; pw.cur = want; pw.u = pw.from && dt ? 0 : 1; }
        if (!pw.cur || !pw.cur.o) continue;
        pw.u = Math.min(1, pw.u + (dt || 1) / 1.15);
        var e3 = pw.u * pw.u * (3 - 2 * pw.u), A = pw.u < 1 && pw.from && pw.from.o ? pw.from.o : pw.cur.o, Bo = pw.cur.o, al = Math.min(pw.cur.vis, sm(.1, .3, pw.cur.z));
        if (al <= 0) continue;
        var ax = A.x + (Bo.x - A.x) * e3, ay = A.y + A.s * 1.25 + (Bo.y + Bo.s * 1.25 - A.y - A.s * 1.25) * e3 - Math.sin(e3 * Math.PI) * (small ? 26 : 44);
        c.globalAlpha = al; pawn(c, ax, ay, Math.max(.95, Bo.s / 15), pw.rgb); c.globalAlpha = 1;
      }
    }

    // ---------- domains: the offer in three small drawings, then the line of worlds already built
    var tiles = Array.prototype.map.call(root.querySelectorAll('canvas[data-tile]'), function(el){ return { k: el.getAttribute('data-tile'), st: api.canvas(el), w: {} }; });
    function tile(g, t, dt){
      var c = g.st.ctx, W = g.st.w, H = g.st.h, o = { x: W / 2, y: H * 0.56, s: Math.min(21, W / 8.6, H / 7.1) };
      c.clearRect(0, 0, W, H); slab(c, o, HUE[g.k], 0, false); DRAW[g.k](c, o, HUE[g.k], t, g.w, dt);
    }
    function ghost(c, o){
      slab(c, o, INK, 0, true);
      c.strokeStyle = 'rgb(' + BLUE + ')'; c.lineWidth = 1.9; c.lineCap = 'round'; seg(c, o, [-.66, 0, 0], [.66, 0, 0]); seg(c, o, [0, -.66, 0], [0, .66, 0]); c.lineCap = 'butt';
    }
    var nexts = Array.prototype.map.call(root.querySelectorAll('canvas[data-next]'), function(el){ return api.canvas(el); });
    function nextTile(g, t){
      var c = g.ctx, W = g.w, H = g.h;
      c.clearRect(0, 0, W, H); ghost(c, { x: W / 2, y: H * .56 + Math.sin(t * .9) * 3, s: Math.min(21, W / 8.6, H / 7.1) });
    }
    var belt = root.getElementById('belt'), bnear = api.near(belt);
    var flows = Array.prototype.map.call(root.querySelectorAll('canvas[data-flow]'), function(el){ return { k: el.getAttribute('data-flow'), st: api.canvas(el), near: api.near(el) }; });
    function flow(g, t){
      var c = g.st.ctx, W = g.st.w, H = g.st.h, s = Math.min(23, W / 8.6, H / 7.2), o = { x: W / 2, y: H * .6, s: s }, q, n, p;
      c.clearRect(0, 0, W, H);
      if (g.k === 'bring'){
        // a domain nobody has built yet
        ghost(c, { x: o.x + s * .5, y: o.y + Math.sin(t * .9) * 3, s: s }); human(c, o.x - s * 3.1, o.y + s * 1.5, Math.max(.95, s / 14.5));
      } else if (g.k === 'build'){
        // the environment goes up layer by layer
        var cyc = (t % 5.5) / 5.5, lay = api.reduced ? 3 : Math.max(0, Math.min(3, (cyc - .06) / .2));
        slab(c, o, BLUE, .5, false); c.globalAlpha = api.reduced ? 1 : 1 - sm(.92, 1, cyc); cube(c, o, lay, BLUE); c.globalAlpha = 1;
        q = P(o, -1.5, 1.45, 0); pawn(c, q[0], q[1] - (lay < 3 ? Math.abs(Math.sin(t * 5)) * 2.5 : 0), Math.max(.9, s / 15), INK);
      } else if (g.k === 'run'){
        // evaluation and post-training: a benchmark's checks on the floor, a reward curve on the screen, the agent in front of it
        var y0 = -.75, x0 = -1.55, x1 = 1.55, z0 = .12, z1 = 2.15, N2 = 40, pr = api.reduced ? 1 : Math.min(1, ((t % 6) / 6) / .7);
        slab(c, o, BLUE, 0, false);
        poly(c, [P(o, x0, y0, z0), P(o, x1, y0, z0), P(o, x1, y0, z1), P(o, x0, y0, z1)]); c.closePath(); c.fillStyle = 'rgba(255,255,255,.97)'; c.fill(); c.strokeStyle = 'rgba(' + INK + ',.9)'; c.lineWidth = 1.2; c.stroke();
        c.strokeStyle = 'rgba(' + INK + ',.4)'; c.lineWidth = 1; seg(c, o, [x0 + .28, y0, z1 - .25], [x0 + .28, y0, z0 + .28]); seg(c, o, [x0 + .28, y0, z0 + .28], [x1 - .22, y0, z0 + .28]);
        c.strokeStyle = 'rgb(' + BLUE + ')'; c.lineWidth = Math.max(1.6, s * .1); c.lineJoin = 'round'; c.beginPath();
        for (n = 0; n <= N2 * pr; n++){ var u = n / N2; p = P(o, x0 + .28 + u * 2.5, y0, z0 + .3 + (.1 + .8 * (1 - Math.exp(-3.2 * u)) + .03 * Math.sin(u * 23)) * 1.45); if (n) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }
        c.stroke(); if (p){ c.fillStyle = 'rgb(' + INK + ')'; c.beginPath(); c.arc(p[0], p[1], Math.max(1.8, s * .12), 0, TAU); c.fill(); }
        for (n = 0; n < 3; n++){ var xa = .2 + n * .52; poly(c, [P(o, xa, 1.0, .02), P(o, xa + .38, 1.0, .02), P(o, xa + .38, 1.38, .02), P(o, xa, 1.38, .02)]); c.closePath(); c.fillStyle = pr > (n + 1) * .28 ? 'rgb(' + BLUE + ')' : '#fff'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = 'rgb(' + BLUE + ')'; c.stroke(); }
        q = P(o, -1.25, 1.3, 0); pawn(c, q[0], q[1], Math.max(.9, s / 15), BLUE);
      } else {
        // what comes back: an agent that is better at this work, and the loop that keeps improving it
        var cy3 = api.reduced ? .99 : (t % 6.4) / 6.4, stp = Math.min(3, Math.floor(cy3 * 4)), hf = api.reduced ? 1 : Math.min(1, ((cy3 * 4) % 1) / .45), ez = hf * hf * (3 - 2 * hf), th;
        slab(c, o, BLUE, .4, false);
        c.setLineDash([4, 4]); c.lineDashOffset = api.reduced ? 0 : -t * 16; c.strokeStyle = 'rgb(' + BLUE + ')'; c.lineWidth = 1.5; c.beginPath();
        for (n = 0; n <= 44; n++){ th = -.9 + n / 44 * 5.3; p = P(o, 1.72 * Math.cos(th), 1.72 * Math.sin(th), .03); if (n) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); } c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
        th = -.9 + 5.3; p = P(o, 1.72 * Math.cos(th), 1.72 * Math.sin(th), .03); var p0 = P(o, 1.72 * Math.cos(th - .2), 1.72 * Math.sin(th - .2), .03), an = Math.atan2(p[1] - p0[1], p[0] - p0[0]);
        c.fillStyle = 'rgb(' + BLUE + ')'; c.beginPath(); c.moveTo(p[0] + Math.cos(an) * 7, p[1] + Math.sin(an) * 7); c.lineTo(p[0] + Math.cos(an + 2.4) * 6, p[1] + Math.sin(an + 2.4) * 6); c.lineTo(p[0] + Math.cos(an - 2.4) * 6, p[1] + Math.sin(an - 2.4) * 6); c.closePath(); c.fill();
        for (n = 0; n < 4; n++) box(c, o, -1.36 + n * .7, -.36, -1.36 + n * .7 + .6, .4, 0, .24 + n * .32, n <= stp ? 'rgb(' + mix('255,255,255', BLUE, .42) + ')' : '#fff', n <= stp ? 'rgb(' + mix('255,255,255', BLUE, .2) + ')' : '#E4E7ED', 'rgba(' + INK + ',.85)');
        var pv0 = Math.max(0, stp - 1), xa2 = -1.06 + pv0 * .7, xb2 = -1.06 + stp * .7, za2 = .24 + pv0 * .32, zb2 = .24 + stp * .32;
        q = P(o, xa2 + (xb2 - xa2) * ez, .02, za2 + (zb2 - za2) * ez + Math.sin(ez * Math.PI) * .5); pawn(c, q[0], q[1], Math.max(.9, s / 15), BLUE);
      }
    }

    // ---------- one environment, drawn as its layers: nothing here belongs to a single project
    var scv = root.getElementById('stack'), sst = api.canvas(scv), snear = api.near(scv);
    var ENVL = ['data', 'tools', 'logic'];
    var USES = { env: ENVL, bench: ENVL.concat(['tasks', 'verifier']), data: ['tasks', 'traces'], rl: ENVL.concat(['verifier']), agent: ['tools', 'tasks', 'verifier'], rsi: ['data', 'tools', 'logic', 'tasks', 'traces', 'verifier'] }, USE_ORDER = ['env', 'bench', 'data', 'rl', 'agent', 'rsi'];
    var LAY = ['data', 'tools', 'logic', 'tasks', 'traces', 'verifier'], use = 'env', picked = false, la = { data: 1, tools: 1, logic: 1, tasks: .2, traces: .2, verifier: .2 }, rlA = 0, agA = 0;
    var useBtns = root.querySelectorAll('.use');
    function setUse(u){
      use = u;
      Array.prototype.forEach.call(useBtns, function(bn){ var on = bn.getAttribute('data-use') === u; bn.classList.toggle('on', on); bn.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    }
    Array.prototype.forEach.call(useBtns, function(bn){ api.on(bn, 'click', function(){ picked = true; setUse(bn.getAttribute('data-use')); }); });
    api.every(3600, function(){ if (!picked && snear()) setUse(USE_ORDER[(USE_ORDER.indexOf(use) + 1) % USE_ORDER.length]); });
    var RUN = [[-1.5, 1.2], [-.7, .3], [-.9, -.9], [.3, -.6], [.5, .7], [1.5, .1]];
    function stack(t, dt){
      var c = sst.ctx, W = sst.w, H = sst.h, nar = W < 480, s = Math.min(34, W / (nar ? 14.6 : 11.4), H / 20.2), DZ = 2.55, o = { x: W * (nar ? 0.46 : 0.43), y: H - s * 3.2, s: s }, n, k, a, col, z, q;
      c.clearRect(0, 0, W, H);
      for (n = 0; n < LAY.length; n++){ k = LAY[n]; var tg = USES[use].indexOf(k) >= 0 ? 1 : .2; la[k] += (tg - la[k]) * (dt ? Math.min(1, dt * 6) : 1); }
      rlA += ((use === 'rl' || use === 'agent' || use === 'rsi' ? 1 : 0) - rlA) * (dt ? Math.min(1, dt * 6) : 1);
      agA += ((use === 'agent' || use === 'rsi' ? 1 : 0) - agA) * (dt ? Math.min(1, dt * 6) : 1);
      c.setLineDash([2, 5]); c.lineWidth = 1; c.strokeStyle = 'rgba(' + INK + ',.24)';
      [[-2, -2], [2, -2], [2, 2], [-2, 2]].forEach(function(p2){ seg(c, o, [p2[0], p2[1], 0], [p2[0], p2[1], 5 * DZ]); }); c.setLineDash([]);
      function A(base){ return 'rgba(' + col + ',' + (base + (1 - base) * a) + ')'; }
      function tint(lo, hi){ return 'rgba(' + col + ',' + (lo + (hi - lo) * a) + ')'; }
      function plane(zz, fill){
        poly(c, [P(o, -2, -2, zz), P(o, 2, -2, zz), P(o, 2, 2, zz), P(o, -2, 2, zz)]); c.closePath();
        c.fillStyle = 'rgba(255,255,255,' + fill + ')'; c.fill(); c.fillStyle = 'rgba(' + BLUE + ',' + (.07 * a) + ')'; c.fill(); c.lineWidth = 1 + .5 * a; c.strokeStyle = A(.3); c.stroke();
      }
      function name(txt, zz){
        var p2 = P(o, 2, -2, zz); c.font = "500 11px 'Geist Mono', monospace"; c.textAlign = 'left'; c.textBaseline = 'middle';
        c.strokeStyle = A(.3); c.lineWidth = 1; c.beginPath(); c.moveTo(p2[0] + 4, p2[1]); c.lineTo(p2[0] + (nar ? 12 : 18), p2[1]); c.stroke(); c.fillStyle = A(.5);
        var tx = p2[0] + (nar ? 17 : 24), cut = nar && txt.length > 13 ? txt.lastIndexOf(' ') : -1;
        if (cut > 0){ c.fillText(txt.slice(0, cut), tx, p2[1] - 6); c.fillText(txt.slice(cut + 1), tx, p2[1] + 7.5); } else c.fillText(txt, tx, p2[1] + .5);
      }
      function flat(x0, y0, x1, y1, zz){ poly(c, [P(o, x0, y0, zz), P(o, x1, y0, zz), P(o, x1, y1, zz), P(o, x0, y1, zz)]); c.closePath(); }
      // data and state: the domain's records, and values that keep changing
      a = (la.data - .2) / .8; col = mix(INK, BLUE, a); z = 0;
      var th = .34, t1 = P(o, 2, -2, 0), t2 = P(o, 2, 2, 0), t3 = P(o, -2, 2, 0), b1 = P(o, 2, -2, -th), b2 = P(o, 2, 2, -th), b3 = P(o, -2, 2, -th);
      c.fillStyle = '#E4E7ED'; poly(c, [t3, t2, b2, b3]); c.closePath(); c.fill(); c.fillStyle = '#D9DDE5'; poly(c, [t1, t2, b2, b1]); c.closePath(); c.fill();
      c.strokeStyle = A(.4); c.lineWidth = 1.1; poly(c, [t3, b3, b2, b1, t1]); c.stroke(); c.beginPath(); c.moveTo(t2[0], t2[1]); c.lineTo(b2[0], b2[1]); c.stroke();
      plane(0, 1);
      var live = Math.floor(t * 1.6);
      for (n = 0; n < 4; n++) for (k = 0; k < 3; k++){ var hot = (n * 3 + k + live) % 7 === 0; flat(-1.65 + k * .62, .1 + n * .44, -1.65 + k * .62 + .54, .1 + n * .44 + .34, 0); c.fillStyle = hot ? tint(.3, .75) : tint(.05, .14); c.fill(); c.lineWidth = 1; c.strokeStyle = A(.3); c.stroke(); }
      c.lineWidth = 1.5; c.strokeStyle = A(.45); c.beginPath(); for (n = 0; n <= 30; n++){ var xw = .45 + n / 30 * 1.35; q = P(o, xw, 1.05 + .36 * Math.sin(xw * 5 - t * 2.4), 0); if (n) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); } c.stroke();
      name('DATA AND STATE', 0);
      if (rlA > .02){ q = P(o, 2, 2, -th); c.font = "500 11px 'Geist Mono', monospace"; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = 'rgba(' + BLUE + ',' + rlA + ')'; c.fillText(use === 'rsi' ? 'ROUND ' + (1 + Math.floor(t / 1.8) % 9) : 'INSTANCE ' + (4471 + Math.floor(t / 1.2) * 37 % 900), q[0], q[1] + 9); }
      // tools and equipment: whatever the field already works with, software and machines alike
      a = (la.tools - .2) / .8; col = mix(INK, BLUE, a); z = DZ; plane(z, .95);
      flat(-1.7, -1.62, .15, .2, z); c.fillStyle = 'rgba(255,255,255,.92)'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = A(.4); c.stroke(); seg(c, o, [-1.7, -1.22, z], [.15, -1.22, z]);
      c.lineCap = 'round'; c.lineWidth = Math.max(1.6, s * .07);
      for (n = 0; n < 3; n++){ c.strokeStyle = A(.28); seg(c, o, [-1.45, -.86 + n * .36, z], [-1.45 + [1.25, .8, 1.05][n], -.86 + n * .36, z]); }
      c.lineCap = 'butt';
      box(c, o, .6, .5, 1.7, 1.6, z, .2, tint(.1, .26), tint(.05, .16), A(.45));
      var hz = z + .62 + .26 * Math.sin(t * 1.1); c.lineCap = 'round'; c.lineWidth = Math.max(2.2, s * .1); c.strokeStyle = A(.5);
      seg(c, o, [1.15, 1.05, z + .2], [1.15, 1.05, hz]); seg(c, o, [1.15, 1.05, hz], [.5, 1.05, hz + .2]); c.lineCap = 'butt';
      q = P(o, .5, 1.05, hz + .2); c.fillStyle = A(.65); c.beginPath(); c.arc(q[0], q[1], s * .11, 0, TAU); c.fill();
      var cu = .5 + .5 * Math.sin(t * .7), cp = P(o, -1.2 + 1.25 * cu, .78 + .5 * cu, z), pk = Math.max(.95, s / 24);
      if (agA > .02){
        // the agent itself is a deliverable: a ring for the post-trained agent, a turning one for the loop it improves in
        c.strokeStyle = 'rgba(' + BLUE + ',' + agA + ')'; c.lineWidth = 1.6; if (use === 'rsi'){ c.setLineDash([5, 4]); c.lineDashOffset = -t * 22; }
        c.beginPath(); c.ellipse(cp[0], cp[1] - 1, 15 * pk * (1 + (use === 'rsi' ? 0 : .12 * Math.sin(t * 3))), 6.4 * pk * (1 + (use === 'rsi' ? 0 : .12 * Math.sin(t * 3))), 0, 0, TAU); c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
      }
      pawn(c, cp[0], cp[1], pk, agA > .5 ? BLUE : INK);
      c.font = "500 11px 'Geist Mono', monospace"; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillStyle = agA > .5 ? 'rgb(' + BLUE + ')' : 'rgba(' + INK + ',.82)'; c.fillText(agA > .5 ? 'YOUR AGENT' : 'AGENT', cp[0], cp[1] - 18.5 * pk);
      name('TOOLS AND EQUIPMENT', DZ);
      // business logic: the rules a piece of work has to pass through
      a = (la.logic - .2) / .8; col = mix(INK, BLUE, a); z = 2 * DZ; plane(z, .93);
      c.lineWidth = 1.3; c.strokeStyle = A(.45);
      seg(c, o, [-.75, 0, z], [-.5, 0, z]); seg(c, o, [.5, 0, z], [.72, 0, z]); seg(c, o, [.72, -.95, z], [.72, .95, z]); seg(c, o, [.72, -.95, z], [.95, -.95, z]); seg(c, o, [.72, .95, z], [.95, .95, z]);
      flat(-1.65, -.42, -.75, .42, z); c.fillStyle = tint(.05, .16); c.fill(); c.stroke();
      poly(c, [P(o, -.5, 0, z), P(o, 0, -.5, z), P(o, .5, 0, z), P(o, 0, .5, z)]); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.stroke();
      var br = Math.floor(t / 2.2) % 2;
      flat(.95, -1.37, 1.75, -.53, z); c.fillStyle = br ? tint(.05, .16) : tint(.3, .75); c.fill(); c.stroke();
      flat(.95, .53, 1.75, 1.37, z); c.fillStyle = br ? tint(.3, .75) : tint(.05, .16); c.fill(); c.stroke();
      var fu = (t / 2.2) % 1, fx, fy; if (fu < .4){ fx = -1.2 + fu / .4 * 1.2; fy = 0; } else if (fu < .6){ fx = (fu - .4) / .2 * .72; fy = 0; } else { fx = .72 + Math.max(0, (fu - .8) / .2) * .23; fy = (br ? 1 : -1) * Math.min(1, (fu - .6) / .2) * .95; }
      q = P(o, fx, fy, z); c.fillStyle = A(.6); c.beginPath(); c.arc(q[0], q[1], s * .11, 0, TAU); c.fill();
      name('BUSINESS LOGIC', 2 * DZ);
      // tasks: requests a professional would receive
      a = (la.tasks - .2) / .8; col = mix(INK, BLUE, a); z = 3 * DZ; plane(z, .93);
      for (n = 0; n < 3; n++){
        var x0 = -1.62 + n * 1.14; flat(x0, -1.05, x0 + .96, 1.05, z); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = A(.4); c.stroke();
        c.lineCap = 'round'; c.lineWidth = Math.max(1.5, s * .065); for (k = 0; k < 4; k++){ c.strokeStyle = A(k ? .26 : .5); seg(c, o, [x0 + .16, -.7 + k * .42, z], [x0 + .16 + [.6, .64, .42, .56][(k + n) % 4], -.7 + k * .42, z]); } c.lineCap = 'butt';
      }
      name('TASKS', 3 * DZ);
      // traces and replay: every step of a run, in order
      a = (la.traces - .2) / .8; col = mix(INK, BLUE, a); z = 4 * DZ; plane(z, .6);
      c.lineWidth = 1.3; c.strokeStyle = A(.4); c.setLineDash([3, 3]); c.beginPath(); RUN.forEach(function(p2, r){ var p3 = P(o, p2[0], p2[1], z); if (r) c.lineTo(p3[0], p3[1]); else c.moveTo(p3[0], p3[1]); }); c.stroke(); c.setLineDash([]);
      RUN.forEach(function(p2, r){ var p3 = P(o, p2[0], p2[1], z), m = s * .13; c.fillStyle = '#fff'; c.strokeStyle = A(.5); c.lineWidth = 1.4; c.beginPath(); if (r % 2){ c.moveTo(p3[0], p3[1] - m * 1.3); c.lineTo(p3[0] + m * 1.3, p3[1]); c.lineTo(p3[0], p3[1] + m * 1.3); c.lineTo(p3[0] - m * 1.3, p3[1]); c.closePath(); } else c.arc(p3[0], p3[1], m, 0, TAU); c.fill(); c.stroke(); });
      var ru = (t * .22) % 1 * (RUN.length - 1), ri = Math.floor(ru), rf = ru - ri, r0 = RUN[ri], r1 = RUN[Math.min(RUN.length - 1, ri + 1)], rp = P(o, r0[0] + (r1[0] - r0[0]) * rf, r0[1] + (r1[1] - r0[1]) * rf, z);
      c.fillStyle = A(.55); c.beginPath(); c.arc(rp[0], rp[1], s * .12, 0, TAU); c.fill();
      name('TRACES AND REPLAY', 4 * DZ);
      // verifier: each requirement checked on its own
      a = (la.verifier - .2) / .8; col = mix(INK, BLUE, a); z = 5 * DZ; plane(z, .93);
      var vc = (t % 5) / 5;
      for (n = 0; n < 3; n++){
        var yv = -1.05 + n * 1.05, done = vc > (n + 1) * .22;
        c.lineCap = 'round'; c.lineWidth = Math.max(1.8, s * .08); c.strokeStyle = A(.3); seg(c, o, [-1.5, yv, z], [-1.5 + [2.1, 1.7, 2.3][n], yv, z]); c.lineCap = 'butt';
        flat(1.05, yv - .24, 1.53, yv + .24, z); c.fillStyle = done ? A(.4) : '#fff'; c.fill(); c.lineWidth = 1.3; c.strokeStyle = A(.45); c.stroke();
      }
      name('VERIFIER', 5 * DZ);
      if (rlA > .02){
        var v0 = P(o, -2, 2, 5 * DZ), v1 = P(o, -2, 2, DZ), bx = Math.max(12, v0[0] - s * 1.7);
        c.strokeStyle = 'rgba(' + BLUE + ',' + rlA + ')'; c.lineWidth = 1.5; c.setLineDash([4, 4]); c.lineDashOffset = -t * 18;
        c.beginPath(); c.moveTo(v0[0] - 4, v0[1]); c.bezierCurveTo(bx, v0[1] + 10, bx, v1[1] - 70, v1[0] - 42, v1[1] - 16); c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
        c.fillStyle = 'rgba(' + BLUE + ',' + rlA + ')'; c.beginPath(); c.moveTo(v1[0] - 38, v1[1] - 11); c.lineTo(v1[0] - 49, v1[1] - 15); c.lineTo(v1[0] - 40, v1[1] - 22); c.closePath(); c.fill();
        c.font = "500 11px 'Geist Mono', monospace"; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('REWARD', Math.max(4, bx - 14), (v0[1] + v1[1]) / 2 - 16);
      }
    }

    // ---------- the training run (seeded, illustrative): reward per episode, its running mean, held-out checks
    var ccv = root.getElementById('curve'), cst = api.canvas(ccv), cnear = api.near(ccv), RAW = [], EMA = [], EV = [], M = 300, noise = 0, ema = 0.2;
    seed = 23;
    for (i = 0; i < M; i++){
      var uu = i / (M - 1), base = 0.17 + 0.6 * (1 - Math.exp(-3.4 * uu)) + 0.018 * Math.sin(uu * 21);
      noise = noise * 0.55 + (rnd() - 0.5) * 0.11; var dip = rnd() < 0.035 ? -(0.05 + rnd() * 0.09) : 0;
      var v = Math.max(0.02, Math.min(0.98, base + noise + dip)); RAW.push(v); ema = i ? ema + (v - ema) * 0.09 : v; EMA.push(ema);
      if (i % 27 === 13) EV.push([i, Math.max(0.02, ema - 0.045 + (rnd() - 0.5) * 0.04)]);
    }
    function curve(t){
      var c = cst.ctx, W = cst.w, H = cst.h, sm2 = W < 520, L = sm2 ? 40 : 52, Rm = 18, Tm = 40, Bm = 104, pw = W - L - Rm, ph = H - Tm - Bm;
      var cyc = (t % 17) / 17, pr = api.reduced ? 1 : Math.min(1, cyc / 0.72), nI = Math.max(2, Math.floor(pr * (M - 1))), k, x, y;
      function X(n){ return L + n / (M - 1) * pw; } function Y(v2){ return Tm + (1 - v2) * ph; }
      c.clearRect(0, 0, W, H); c.font = "400 11px 'Geist Mono', monospace"; c.textBaseline = 'middle';
      for (k = 0; k <= 4; k++){ y = Y(k / 4); c.strokeStyle = k ? '#E6E9EE' : '#B9C0CC'; c.lineWidth = 1; c.beginPath(); c.moveTo(L, y + .5); c.lineTo(L + pw, y + .5); c.stroke(); c.fillStyle = '#737D8C'; c.textAlign = 'right'; c.fillText((k / 4).toFixed(2), L - 9, y); }
      c.textAlign = 'center'; c.textBaseline = 'top';
      for (k = 0; k <= 4; k++){ x = L + k / 4 * pw; c.strokeStyle = '#B9C0CC'; c.beginPath(); c.moveTo(x + .5, Tm + ph); c.lineTo(x + .5, Tm + ph + 4); c.stroke(); c.fillStyle = '#737D8C'; c.fillText(k === 0 ? '0' : (k * 0.5) + 'k', x, Tm + ph + 8); }
      c.textAlign = 'right'; c.fillText('training step', L + pw, Tm + ph + 23);
      // area under the running mean, then the per-episode line, the mean and the held-out points
      c.beginPath(); c.moveTo(X(0), Y(0)); for (k = 0; k <= nI; k++) c.lineTo(X(k), Y(EMA[k])); c.lineTo(X(nI), Y(0)); c.closePath(); c.fillStyle = 'rgba(' + BLUE + ',.06)'; c.fill();
      c.lineJoin = 'round'; c.strokeStyle = 'rgba(' + BLUE + ',.3)'; c.lineWidth = 1; c.beginPath(); for (k = 0; k <= nI; k++){ if (k) c.lineTo(X(k), Y(RAW[k])); else c.moveTo(X(k), Y(RAW[k])); } c.stroke();
      c.strokeStyle = 'rgb(' + BLUE + ')'; c.lineWidth = 2.2; c.beginPath(); for (k = 0; k <= nI; k++){ if (k) c.lineTo(X(k), Y(EMA[k])); else c.moveTo(X(k), Y(EMA[k])); } c.stroke();
      for (k = 0; k < EV.length; k++){ if (EV[k][0] > nI) break; c.fillStyle = '#fff'; c.strokeStyle = 'rgb(' + INK + ')'; c.lineWidth = 1.6; c.beginPath(); c.arc(X(EV[k][0]), Y(EV[k][1]), 3.6, 0, TAU); c.fill(); c.stroke(); }
      c.strokeStyle = 'rgba(' + BLUE + ',.3)'; c.lineWidth = 1; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(X(nI), Y(EMA[nI])); c.lineTo(X(nI), Tm + ph); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(' + BLUE + ',.18)'; c.beginPath(); c.arc(X(nI), Y(EMA[nI]), 9, 0, TAU); c.fill(); c.fillStyle = 'rgb(' + BLUE + ')'; c.beginPath(); c.arc(X(nI), Y(EMA[nI]), 4, 0, TAU); c.fill();
      // legend and the live value
      c.textBaseline = 'middle'; c.textAlign = 'left'; c.font = "400 11px 'Geist Mono', monospace"; var lx = L + 2, ly = 16;
      c.strokeStyle = 'rgb(' + BLUE + ')'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + 16, ly); c.stroke(); c.fillStyle = '#566070'; c.fillText('running mean', lx + 22, ly);
      if (!sm2){ var l2 = lx + 128; c.fillStyle = '#fff'; c.strokeStyle = 'rgb(' + INK + ')'; c.lineWidth = 1.6; c.beginPath(); c.arc(l2 + 4, ly, 3.6, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#566070'; c.fillText('held-out tasks', l2 + 14, ly); }
      c.textAlign = 'right'; c.fillStyle = 'rgb(' + INK + ')'; c.font = "500 22px 'Onest', sans-serif"; c.fillText(EMA[nI].toFixed(3), L + pw, ly);
      // one cell per episode: the darker the cell, the higher its reward
      var cy0 = H - 58, cw = sm2 ? 6 : 8, gap = 2, cells = Math.floor(pw / (cw + gap)), filled = Math.floor(pr * cells);
      for (k = 0; k < cells; k++){ var idx = Math.min(M - 1, Math.floor(k / cells * M)); c.fillStyle = k <= filled ? 'rgba(' + BLUE + ',' + (0.12 + 0.88 * RAW[idx]).toFixed(3) + ')' : '#ECEEF2'; c.fillRect(L + k * (cw + gap), cy0, cw, 16); }
      c.textAlign = 'left'; c.textBaseline = 'top'; c.font = "400 11px 'Geist Mono', monospace"; c.fillStyle = '#566070';
      var ep = Math.round(nI / (M - 1) * 16000);
      c.fillText('episode ' + ep.toLocaleString('en-US') + '  ·  reward ' + RAW[nI].toFixed(2), L, cy0 + 26);
      c.textAlign = 'right'; c.fillStyle = '#737D8C'; if (!sm2) c.fillText('reward per episode', L + pw, cy0 + 26);
    }

    // ---------- how an RL environment is built: six stations, and the agents that work them
    var pcv = root.getElementById('pipe'), pst = api.canvas(pcv), pnear = api.near(pcv), GREEN = '36,128,62', NS = 6;
    var PD = [4.0, 4.0, 5.8, 4.6, 4.4, 5.2], PT = [0], PEND = 3.2, TR = .15, pOff = 0, pNow = 0, pOn = -2, rt = { x: -1.5, y: 1.45 };
    for (i = 0; i < NS; i++) PT.push(PT[i] + PD[i]);
    var PTOT = PT[NS] + PEND;
    // what each station reports, and when (as a share of its time)
    var ROWS = [
      [['WORK', 'SET BY EXPERT', .12], ['VERSIONS', 'PINNED', .32], ['NETWORK', 'OFF', .5], ['TASKS + REWARD', 'WRITTEN', .74]],
      [['RIGHT SOLUTION', 'REWARDED', .3], ['SECOND ROUTE', 'REWARDED', .56], ['NEAR MISS', 'NO REWARD', .82]],
      [['BACK DOOR', 'CLOSED', .25], ['REWARD HACKING', 'FIXED', .62], ['LUCKY GUESS', 'UNDER 1%', .8], ['EVERY LOOPHOLE', 'NOW A TEST', .97]],
      [['SANDBOX', 'SEALED', .1], ['TASK FILES', 'WITHHELD', .3], ['EVERY EPISODE', 'RECORDED', .86]],
      [['FAILED EPISODES', 'READ', .4], ["AGENT'S LIMIT", 'COUNTED', .58], ["TASK'S FAULT", 'SENT BACK', .74], ['EXPERT', 'SIGNS OFF', .9]],
      [['ALL CHECKS', 'PASSED', .1], ['REWARD', 'ON', .32], ['EVERY EPISODE', 'SCORED', .7]]
    ];
    var BUILD = '12,124,176';
    var WHO = [[['HUMAN EXPERT', INK, 'h'], ['BUILDER AGENT', BUILD, 'a']], [['VERIFIER', BLUE, 'v']], [['RED-TEAM AGENT', ROSE, 'a']], [['FRONTIER AGENTS', HUE.arm, 'a']], [['AUDIT AGENT', GREEN, 'a'], ['HUMAN EXPERT', INK, 'h']], [['YOUR AGENT', BLUE, 'a']]];
    var stepBtns = root.querySelectorAll('.step');
    function setStep(k){ if (k === pOn) return; pOn = k; Array.prototype.forEach.call(stepBtns, function(bn, n){ bn.classList.toggle('on', n === k); bn.classList.toggle('done', n < k); }); }
    Array.prototype.forEach.call(stepBtns, function(bn){ api.on(bn, 'click', function(){ pOff = PT[+bn.getAttribute('data-step')] + .01 - pNow; }); });
    function mark(c, x, y, r, ok){
      c.fillStyle = 'rgb(' + (ok ? BLUE : ROSE) + ')'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = Math.max(1.4, r * .26); c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
      if (ok){ c.moveTo(x - r * .46, y + r * .02); c.lineTo(x - r * .12, y + r * .38); c.lineTo(x + r * .48, y - r * .34); }
      else { c.moveTo(x - r * .36, y - r * .36); c.lineTo(x + r * .36, y + r * .36); c.moveTo(x + r * .36, y - r * .36); c.lineTo(x - r * .36, y + r * .36); }
      c.stroke(); c.lineCap = 'butt';
    }
    function cube(c, o, lay, rgb){
      // the environment with its tasks, as three layers: the world, the tasks, and the verifier that gives the reward
      var ga = c.globalAlpha;
      for (var n = 0; n < 3; n++){
        var v = Math.max(0, Math.min(1, lay - n)); if (v <= 0) break;
        c.globalAlpha = ga * v;
        box(c, o, -.62, -.62, .62, .62, n * .36 + (1 - v) * 1.5, .36, n === 2 ? 'rgb(' + mix('255,255,255', rgb, .3) + ')' : '#fff', n === 2 ? 'rgb(' + mix('228,231,237', rgb, .22) + ')' : '#E4E7ED', 'rgba(' + INK + ',.88)');
      }
      c.globalAlpha = ga;
    }
    function pipe(t, dt){
      var c = pst.ctx, W = pst.w, H = pst.h, one = W < 900, tt = api.reduced ? PTOT - .01 : (((t + pOff) % PTOT) + PTOT) % PTOT, k, n, q;
      pNow = t;
      var act = NS; for (k = 0; k < NS; k++) if (tt < PT[k + 1]){ act = k; break; }
      setStep(act);
      var s = one ? Math.min(27, W / 13.5) : Math.min(25, W / 52), cyS = one ? H * .66 : H * .585, fs = one ? 10.5 : (W < 1100 ? 9.5 : 10.5), shown = Math.min(NS - 1, act);
      function ox(n2){ return one ? W / 2 : W * (n2 + .5) / NS; }
      function prog(n2){ return Math.max(0, Math.min(1, (tt - PT[n2]) / PD[n2])); }
      function rows(k2, o, u, v){
        var R2 = ROWS[k2], rh = fs + 6.5, x0 = one ? 14 : o.x - Math.min(W * .074, 82), y0 = one ? 46 : 14, n2;
        c.font = '500 ' + fs + "px 'Geist Mono', monospace"; c.textAlign = 'left'; c.textBaseline = 'top';
        for (n2 = 0; n2 < R2.length; n2++){
          var al = u >= 1 ? 1 : sm(R2[n2][2], R2[n2][2] + .04, v); if (al <= 0) continue;
          c.globalAlpha = al; c.fillStyle = 'rgba(' + INK + ',.78)'; c.fillText(R2[n2][0], x0, y0 + n2 * rh);
          c.fillStyle = 'rgb(' + BLUE + ')'; c.fillText(R2[n2][1], x0 + c.measureText(R2[n2][0] + '  ').width, y0 + n2 * rh);
        }
        c.globalAlpha = 1;
      }
      function who(k2, o, al){
        var L2 = WHO[k2], y1 = o.y + s * 2.34 + 14, n2;
        c.font = '500 ' + fs + "px 'Geist Mono', monospace"; c.textBaseline = 'top'; c.textAlign = 'left'; c.globalAlpha = al;
        for (n2 = 0; n2 < L2.length; n2++){
          var w2 = c.measureText(L2[n2][0]).width, x1 = o.x - (w2 + 13) / 2, yy = y1 + n2 * (fs + 6);
          var kd = L2[n2][2], my = yy + fs * .5 - .5;
          if (kd === 'h'){ c.strokeStyle = 'rgb(' + INK + ')'; c.lineWidth = 1.4; c.beginPath(); c.arc(x1 + 3.5, my, 3.4, 0, TAU); c.stroke(); }
          else if (kd === 'a'){ c.fillStyle = 'rgb(' + L2[n2][1] + ')'; c.beginPath(); c.moveTo(x1 + 3.5, my - 4.5); c.lineTo(x1 + 8, my); c.lineTo(x1 + 3.5, my + 4.5); c.lineTo(x1 - 1, my); c.closePath(); c.fill(); }
          else { c.fillStyle = 'rgb(' + L2[n2][1] + ')'; c.fillRect(x1, my - 3.5, 7, 7); }
          c.fillStyle = 'rgba(' + INK + ',.85)'; c.fillText(L2[n2][0], x1 + 13, yy);
        }
        c.globalAlpha = 1;
      }
      function station(k2, u){
        var o = { x: ox(k2), y: cyS, s: s }, done = u >= 1, on = u > 0 && !done, v = k2 === 0 ? u : Math.max(0, (u - TR) / (1 - TR)), here = on && (k2 === 0 || u >= TR), n2, f, pp;
        if (u <= 0){ c.globalAlpha = .6; slab(c, o, INK, 0, true); c.globalAlpha = 1; who(k2, o, .45); return; }
        slab(c, o, [BUILD, BLUE, ROSE, HUE.arm, GREEN, BLUE][k2], on ? .7 : 0, false);
        if (k2 === 0){
          if (on) cube(c, o, Math.max(0, (v - .08) / .22), BUILD);
          q = P(o, -1.55, 1.45, 0); human(c, q[0], q[1], s / 15);
          q = P(o, 1.62, .5, 0); pawn(c, q[0], q[1] - (on && v < .76 ? Math.abs(Math.sin(t * 5)) * 2.5 : 0), s / 15, BUILD);
        } else if (k2 === 1){
          if (here) cube(c, o, 3, BLUE);
          if (here) for (n2 = 0; n2 < 3; n2++){
            f = (v - .08 - n2 * .26) / .2; if (f <= 0) continue;
            var tone = n2 === 2 ? ROSE : BLUE, m = s * .22;
            if (f < 1){ q = P(o, -1.95 + f * 1.25, 0, .55); c.fillStyle = 'rgb(' + tone + ')'; c.strokeStyle = '#fff'; c.lineWidth = 1.2; poly(c, [[q[0], q[1] - m], [q[0] + m, q[1]], [q[0], q[1] + m], [q[0] - m, q[1]]]); c.closePath(); c.fill(); c.stroke(); }
            else { if (f < 1.3){ q = P(o, 0, 0, 1.08); c.strokeStyle = 'rgba(' + tone + ',' + (1 - (f - 1) / .3) + ')'; c.lineWidth = 2; c.beginPath(); c.ellipse(q[0], q[1], s * (1.1 + (f - 1) * 2), s * (.55 + (f - 1)), 0, 0, TAU); c.stroke(); }
              q = P(o, 0, 0, 1.08); mark(c, q[0] + (n2 - 1) * s * .8, q[1] - s * 1.2, s * .3, n2 < 2); }
          }
        } else if (k2 === 2){
          var PR2 = [[-1.75, -.7], [.5, -1.75], [1.75, .45], [-.3, 1.75]], A0 = [.03, .27, .64, .82], A1 = [.25, .62, .8, .97], cur = -1;
          for (n2 = 0; n2 < 4; n2++){
            f = done ? 1 : (v - A0[n2]) / (A1[n2] - A0[n2]); if (!here && !done) f = 0; if (f <= 0) continue; if (f < 1) cur = n2;
            var g = Math.min(1, f / (n2 === 1 ? .3 : .62)), fin = f >= 1; pp = PR2[n2];
            c.setLineDash([3, 3]); c.lineDashOffset = fin ? 0 : -t * 16; c.lineWidth = 1.4; c.strokeStyle = fin ? 'rgba(' + INK + ',.3)' : 'rgb(' + ROSE + ')'; seg(c, o, [pp[0], pp[1], .5], [pp[0] * (1 - g * .58), pp[1] * (1 - g * .58), .5]); c.setLineDash([]); c.lineDashOffset = 0;
            if (g >= 1 && !(n2 === 1 && f < .64)){ q = P(o, pp[0] * .42, pp[1] * .42, .5); c.strokeStyle = 'rgb(' + BLUE + ')'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(q[0], q[1] - s * .36); c.lineTo(q[0], q[1] + s * .36); c.stroke(); c.lineCap = 'butt'; }
          }
          if (here) cube(c, o, 3, cur === 1 && v > .375 && v < .49 ? ROSE : BLUE);
          var home = cur < 0 ? [-1.5, 1.45] : PR2[cur]; rt.x += (home[0] - rt.x) * (dt ? Math.min(1, dt * 7) : 1); rt.y += (home[1] - rt.y) * (dt ? Math.min(1, dt * 7) : 1);
          q = P(o, rt.x * 1.04, rt.y * 1.04, 0); pawn(c, q[0], q[1], s / 15, ROSE);
        } else if (k2 === 3){
          var PA3 = [[-1.5, -.9], [-.35, 1.55], [1.55, .35]], HU = [HUE.arm, HUE.radar, HUE.beam], E3 = [.5, .66, .86];
          c.setLineDash([2, 4]); c.lineWidth = 1; c.strokeStyle = 'rgba(' + INK + ',.42)';
          [[-2, -2], [2, -2], [2, 2], [-2, 2]].forEach(function(p2){ seg(c, o, [p2[0], p2[1], 0], [p2[0], p2[1], 2.2]); });
          poly(c, [P(o, -2, -2, 2.2), P(o, 2, -2, 2.2), P(o, 2, 2, 2.2), P(o, -2, 2, 2.2)]); c.closePath(); c.stroke(); c.setLineDash([]);
          q = P(o, -2, -2, 2.2); c.font = '500 ' + (fs - 1) + "px 'Geist Mono', monospace"; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillStyle = 'rgba(' + INK + ',.6)'; c.fillText('SEALED', q[0], q[1] - 5);
          for (n2 = 0; n2 < 3; n2++){
            f = done ? 1 : here ? Math.max(0, Math.min(1, (v - .05 - n2 * .04) / (E3[n2] - .05 - n2 * .04))) : 0; pp = PA3[n2];
            if (here && f > 0){ c.lineWidth = 1.8; c.strokeStyle = 'rgb(' + HU[n2] + ')'; seg(c, o, [pp[0], pp[1], .5], [pp[0] * (1 - f * .56), pp[1] * (1 - f * .56), .5]); }
          }
          if (here) cube(c, o, 3, BLUE);
          for (n2 = 0; n2 < 3; n2++){
            f = done ? 1 : here ? (v - .05 - n2 * .04) / (E3[n2] - .05 - n2 * .04) : 0; pp = PA3[n2];
            q = P(o, pp[0], pp[1], 0); pawn(c, q[0], q[1], s / 16.5, HU[n2]);
            if (f >= 1) mark(c, q[0] + s * .5, q[1] - s * 1.12, s * .27, n2 === 0);
          }
        } else if (k2 === 4){
          var f4 = done ? 1 : here ? Math.max(0, Math.min(1, (v - .06) / .6)) : 0, th;
          c.strokeStyle = 'rgb(' + GREEN + ')'; c.lineWidth = 1.6; c.beginPath();
          for (n2 = 0; n2 <= Math.floor(44 * f4); n2++){ th = n2 / 44 * TAU - 2.2; q = P(o, 1.28 * Math.cos(th), 1.28 * Math.sin(th), .04); if (n2) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); } c.stroke();
          for (n2 = 0; n2 < 4; n2++) if (f4 > (n2 + 1) / 4 - .02){ th = (n2 + 1) / 4 * TAU - 2.2; q = P(o, 1.28 * Math.cos(th), 1.28 * Math.sin(th), .04); c.fillStyle = '#fff'; c.beginPath(); c.arc(q[0], q[1], s * .13, 0, TAU); c.fill(); c.stroke(); }
          if (here) cube(c, o, 3, BLUE);
          q = P(o, -1.55, 1.45, 0); pawn(c, q[0], q[1], s / 15, GREEN); q = P(o, 1.62, .5, 0); human(c, q[0], q[1], s / 15);
          if (here && v > .86){ q = P(o, 0, 0, 1.08); mark(c, q[0], q[1] - s * .95, s * .44, 1); }
        } else {
          // training: the agent acts on the task, and the verifier's score comes back as its reward
          var run = here || done, tv = done ? 1 : v;
          if (run) for (n2 = 0; n2 < 5; n2++){ var hb = (.3 + n2 * .26) * sm(.1 + n2 * .14, .26 + n2 * .14, tv); if (hb > .02) box(c, o, .5 + n2 * .29, -1.8, .5 + n2 * .29 + .21, -1.5, 0, hb, 'rgb(' + mix('255,255,255', BLUE, .6) + ')', 'rgb(' + mix('255,255,255', BLUE, .34) + ')', 'rgb(' + BLUE + ')'); }
          if (run) cube(c, o, 3, BLUE);
          if (run){
            c.lineWidth = 1.6; c.strokeStyle = 'rgba(' + INK + ',.85)'; seg(c, o, [-1.5, 1.2, .5], [-.68, .52, .5]);
            var a1 = P(o, -.2, 0, 1.1), a2 = P(o, -1.5, 1.2, 1.32), mx = (a1[0] + a2[0]) / 2 - s * .5, my = Math.min(a1[1], a2[1]) - s * 1.5;
            c.setLineDash([4, 4]); c.lineDashOffset = api.reduced ? 0 : t * 20; c.strokeStyle = 'rgb(' + BLUE + ')'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(a1[0], a1[1]); c.quadraticCurveTo(mx, my, a2[0], a2[1]); c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
            c.fillStyle = 'rgb(' + BLUE + ')'; c.beginPath(); c.moveTo(a2[0], a2[1] + 4); c.lineTo(a2[0] - 5, a2[1] - 5); c.lineTo(a2[0] + 4.5, a2[1] - 5.5); c.closePath(); c.fill();
            c.font = '500 ' + fs + "px 'Geist Mono', monospace"; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText('REWARD', mx + s * .1, my + s * .55);
          }
          q = P(o, -1.5, 1.2, 0); pawn(c, q[0], q[1], s / 15, BLUE);
        }
        if (done && k2 < NS - 1){ q = P(o, 0, 0, 0); mark(c, q[0], q[1] - s * .3, s * .46, 1); }
        rows(k2, o, u, v); who(k2, o, 1);
      }
      c.clearRect(0, 0, W, H);
      if (one){
        for (k = 0; k < NS; k++){ var bx = 14 + k * 34, cur5 = k === shown && act < NS, dn = k < act; c.fillStyle = cur5 ? 'rgb(' + INK + ')' : dn ? 'rgb(' + BLUE + ')' : '#fff'; c.fillRect(bx, 12, 27, 21); if (!cur5 && !dn){ c.strokeStyle = '#C6CCD6'; c.lineWidth = 1; c.strokeRect(bx + .5, 12.5, 26, 20); }
          c.fillStyle = cur5 || dn ? '#fff' : '#737D8C'; c.font = "500 10.5px 'Geist Mono', monospace"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('0' + (k + 1), bx + 13.5, 23); }
      } else {
        for (k = 0; k < NS - 1; k++){
          var lit = prog(k + 1) > 0, xa = ox(k) + s * 3.62, xb = ox(k + 1) - s * 3.62;
          c.strokeStyle = c.fillStyle = 'rgba(' + (lit ? BLUE : INK) + ',' + (lit ? 1 : .32) + ')'; c.lineWidth = 1.3; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(xa, cyS); c.lineTo(xb - 7, cyS); c.stroke(); c.setLineDash([]);
          c.beginPath(); c.moveTo(xb, cyS); c.lineTo(xb - 8, cyS - 4.5); c.lineTo(xb - 8, cyS + 4.5); c.closePath(); c.fill();
        }
      }
      for (k = 0; k < NS; k++){ if (one && k !== shown) continue; station(k, prog(k)); }
      if (act >= 1 && act <= NS - 1 && prog(act) < TR){
        var e = sm(0, 1, prog(act) / TR), x0 = one ? -s * 3 : ox(act - 1), x1 = ox(act);
        cube(c, { x: x0 + (x1 - x0) * e, y: cyS - Math.sin(e * Math.PI) * s * (one ? .5 : 1.5), s: s }, 3, BLUE);
      }
      if (!api.reduced && tt > PTOT - .5){ c.fillStyle = 'rgba(244,245,247,' + sm(PTOT - .5, PTOT, tt) + ')'; c.fillRect(0, 0, W, H); }
    }

    api.raf(function(t, dt){
      var g;
      if (near()) frontier(t, dt);
      for (g = 0; g < flows.length; g++) if (flows[g].near()) flow(flows[g], t);
      if (bnear()){ for (g = 0; g < tiles.length; g++) tile(tiles[g], t, dt); for (g = 0; g < nexts.length; g++) nextTile(nexts[g], t); }
      if (snear()) stack(t, dt);
      if (pnear()) pipe(t, dt);
      if (cnear()) curve(t);
    });

    // ---------- headline: the last word turns through the four things we build, and the line re-centres as it changes
    var wi = 0, swEl = root.getElementById('swap');
    api.on(window, 'resize', function(){ swEl.style.width = ''; });
    api.every(2800, function(){
      var words = (swEl.getAttribute('data-words') || '').split('|'), el = swEl.firstElementChild;
      wi = (wi + 1) % words.length; swEl.style.width = el.offsetWidth + 'px'; el.classList.add('out');
      api.later(290, function(){ el.textContent = words[wi]; swEl.style.width = el.offsetWidth + 'px'; el.classList.remove('out'); el.classList.add('pre'); void el.offsetWidth; el.classList.remove('pre'); });
    });

    // ---------- pages: Blog, News, Team and Contact are pages of their own; in this prototype they are views that swap in place
    var views = root.querySelectorAll('.view');
    function go(v, at){
      Array.prototype.forEach.call(views, function(el){ el.hidden = el.getAttribute('data-view') !== v; });
      Array.prototype.forEach.call(root.querySelectorAll('.links a'), function(a){ a.classList.toggle('cur', v !== 'home' && a.getAttribute('data-go') === v); });
      var tgt = at ? root.getElementById(at) : null;
      if (tgt) tgt.scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0);
    }
    api.on(root.querySelector('.page'), 'click', function(e){
      var a = e.target && e.target.closest ? e.target.closest('[data-go]') : null; if (!a) return;
      e.preventDefault(); go(a.getAttribute('data-go'), a.getAttribute('data-at'));
    });

    api.reveal(root.querySelectorAll('[data-rv]'));
  }
});

  PART.init(document, makeApi(document));
})();
