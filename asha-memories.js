/*
 * Asha's Kitchen logo intro — "Every plate, from its own home" (storyboard A3), all in gold. 5.5 s; the site is usable from 4.7 s.
 *
 * On a gold ground, soft golden memories of India come up one place at a time (Hyderabad, Mysuru, Madurai, Kerala), each
 * giving up its dish, then a memory of America where Butter Chicken and Gulab Jamun join. Every plate floats to its seat at
 * one round table; a gold ring draws round it, the name rises, the ring becomes the line under KITCHEN, a light passes
 * across the logo, and an Indian arch opens into the website.
 *
 *   <link rel="stylesheet" href="intro/asha-intro.css">
 *   <script src="intro/asha-memories.js" data-target="[data-ak-logo]" data-base="intro/img/"></script>   (in <head>)
 *
 * URL helpers: ?nointro, ?intro, ?t=2.4 (freeze), ?speed=0.5, ?pace=7 (whole intro in 7 s), ?plain
 */
(function () {
  'use strict';

  var TOTAL = 5.7, OPEN = 4.9;
  var script = document.currentScript;
  var CFG = {
    target: (script && script.getAttribute('data-target')) || '[data-ak-logo]',
    base: (script && script.getAttribute('data-base')) || 'intro/img/',
  };
  var Q = new URLSearchParams(location.search);
  var COVER = '#dcae55', RING = '#b07f25', INK = '#173212', ARCH = [143, 100, 32];

  // ---- memories: all in the middle, behind the table; w = width as a share of the window (landscape) or phone column ----
  var MEMS = [
    { src: 'in_charminar', mask: 1, lb: 'HYDERABAD',        at: .05, end: 1.0, wL: .40, wP: 1.1 },
    { src: 'in_mysore',    mask: 2, lb: 'MYSURU',           at: .85, end: 1.4, wL: .60, wP: 1.5 },
    { src: 'in_madurai',   mask: 3, lb: 'MADURAI',          at: 1.2, end: 2.0, wL: .34, wP: .95 },
    { src: 'in_kerala',    mask: 4, lb: 'ALLEPPEY, KERALA', at: 1.8, end: 2.3, wL: .60, wP: 1.5 },
    { src: 'us_liberty',   mask: 5, lb: 'AMERICA',          at: 2.1, end: 3.2, wL: .34, wP: .95 },
  ];
  var ASPECT = { biryani: 1.049, dosa: 0.9867, idli: 0.9933, butter: 1.0638, gongura: 1.0619, coffee: 0.9817, fish: 1.0417, jamun: 0.9767,
    in_charminar: 0.8, in_kerala: 1.4876, in_madurai: 0.6723, in_mysore: 1.4876, us_liberty: 0.6723 };
  // one rhythm: every plate rises in the middle, out of its memory, then takes the next seat clockwise from 12 o'clock
  var DISHES = [
    { id: 'biryani', name: 'DUM BIRYANI' },
    { id: 'gongura', name: 'GONGURA CHICKEN' },
    { id: 'dosa',    name: 'MASALA DOSA' },
    { id: 'idli',    name: 'IDLI & VADA' },
    { id: 'coffee',  name: 'FILTER COFFEE' },
    { id: 'fish',    name: 'FISH CURRY' },
    { id: 'butter',  name: 'BUTTER CHICKEN' },
    { id: 'jamun',   name: 'GULAB JAMUN' },
  ];
  var FIRST = .45, BEAT = .30, RISE = .28, FLOAT = .40, SEAT_W = .112;
  DISHES.forEach(function (d, j) { d.at = FIRST + j * BEAT; d.seated = d.at + RISE + FLOAT; });
  var T = { ring: [3.15, 3.5], leaf: [3.25, 3.5], widen: [3.45, 3.85], asha: [3.5, 4.0], kitchen: [3.95, 4.4], swoosh: [3.97, 4.47],
    unroll: [3.95, 4.45], drift: [3.95, 4.55], shine: [4.45, 4.87], turn: [3.2, 4.6] };
  var LOGO_AR = 1280 / 546;
  var LEAF = { x: 0.234375, y: 0.344322, w: 0.121875, h: 0.212454 };
  var CUT_A = 'inset(0 0 33.25% 0)', K_TOP = 56.14, K_BOT = 27.39;

  // ---- helpers ----
  var c01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var prog = function (t, a, b) { return c01((t - a) / (b - a)); };
  var outCubic = function (x) { return 1 - Math.pow(1 - x, 3); };
  var inCubic = function (x) { return x * x * x; };
  var inOutCubic = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var inOutSine = function (x) { return -(Math.cos(Math.PI * x) - 1) / 2; };
  var D2R = Math.PI / 180;
  function el(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
  function img(src, parent) { var i = el('img', '', parent); i.alt = ''; i.decoding = 'async'; i.src = src; return i; }
  function place(e, x, y, w, h, r, s, o) {
    e.style.transform = 'translate3d(' + (x - w / 2).toFixed(2) + 'px,' + (y - h / 2).toFixed(2) + 'px,0) rotate(' + r.toFixed(2) + 'deg) scale(' + s.toFixed(4) + ')';
    e.style.opacity = o <= 0.001 ? '0' : o >= 0.999 ? '1' : o.toFixed(3);
  }
  function archPath(ctx, cx, top, w, h) {
    var l = cx - w / 2, r = cx + w / 2, s = top + h * 0.36;
    ctx.moveTo(l, top + h); ctx.lineTo(l, s);
    ctx.bezierCurveTo(l, top + h * 0.17, cx - w * 0.30, top + h * 0.11, cx - w * 0.10, top + h * 0.05);
    ctx.bezierCurveTo(cx - w * 0.04, top + h * 0.03, cx - w * 0.01, top + h * 0.012, cx, top);
    ctx.bezierCurveTo(cx + w * 0.01, top + h * 0.012, cx + w * 0.04, top + h * 0.03, cx + w * 0.10, top + h * 0.05);
    ctx.bezierCurveTo(cx + w * 0.30, top + h * 0.11, r, top + h * 0.17, r, s);
    ctx.lineTo(r, top + h); ctx.closePath();
  }

  // ---------------------------------------------------------------
  function Intro() {
    this.t = 0; this.done = false;
    var self = this;
    this.finished = new Promise(function (res) { self._resolve = res; });
  }

  Intro.prototype.build = function () {
    var B = CFG.base, root = this.root = el('div', 'ak-intro ak-gold');
    root.setAttribute('aria-hidden', 'true');
    root.style.setProperty('--ak-sh', .38);
    this.cv = el('canvas', 'ak-cv', root);
    this.ctx = this.cv.getContext('2d');
    this.noise = this.makeNoise();
    var self = this;
    this.mems = MEMS.map(function (m) {
      var e = el('div', 'ak-el ak-mem', root); img(B + 'p/' + m.src + '.webp', e);
      e.style.webkitMaskImage = e.style.maskImage = 'url(' + B + 'm/mask-' + m.mask + '.png)';
      var lb = m.lb ? el('div', 'ak-memlb', root) : null; if (lb) lb.textContent = m.lb;
      return { m: m, e: e, lb: lb };
    });
    this.dishes = DISHES.map(function (d, j) {
      var e = el('div', 'ak-el ak-dish', root); var im = img(B + 'd/' + d.id + '.webp', e);
      var lb = el('div', 'ak-seatlb', root); lb.textContent = d.name;
      return { d: d, e: e, im: im, j: j, lb: lb };
    });
    var lg = this.logo = el('div', 'ak-el ak-logo', root);
    var a = el('div', 'ak-cut', lg); a.style.clipPath = CUT_A;
    this.ashaIn = el('div', '', a); img(B + 'logo/asha-green.webp', this.ashaIn);
    this.kCut = el('div', 'ak-cut', lg);
    this.kIn = el('div', '', this.kCut); img(B + 'logo/kitchen-green.webp', this.kIn);
    this.sw = el('div', 'ak-swoosh', lg); img(B + 'logo/swoosh.webp', this.sw);
    this.shineHalo = el('div', 'ak-shine-halo', lg);
    this.shineWrap = el('div', 'ak-shine', this.shineHalo);
    this.shineWrap.style.webkitMaskImage = this.shineWrap.style.maskImage = 'url(' + B + 'logo/logo-cream.webp)';
    this.shine = el('i', '', this.shineWrap);
    this.leaf = el('div', 'ak-el ak-leaf', root); img(B + 'logo/leaf.webp', this.leaf);
    document.body.appendChild(root);
    this.layout();
    this._onResize = function () { self.layout(); self.frame(self.t); };
    window.addEventListener('resize', this._onResize);
  };

  Intro.prototype.makeNoise = function () {
    try {
      var c = document.createElement('canvas'); c.width = c.height = 128;
      var g = c.getContext('2d'), d = g.createImageData(128, 128);
      for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 12; }
      g.putImageData(d, 0, 0); return c;
    } catch (e) { return null; }
  };

  Intro.prototype.urls = function () {
    var B = CFG.base, u = [];
    MEMS.forEach(function (m) { u.push(B + 'p/' + m.src + '.webp'); u.push(B + 'm/mask-' + m.mask + '.png'); });
    DISHES.forEach(function (d) { u.push(B + 'd/' + d.id + '.webp'); });
    ['asha-green', 'kitchen-green', 'swoosh', 'leaf', 'logo-cream'].forEach(function (n) { u.push(B + 'logo/' + n + '.webp'); });
    return u;
  };

  Intro.prototype.layout = function () {
    var W = this.W = window.innerWidth, H = this.H = window.innerHeight;
    var dpr = this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.cv.width = Math.round(W * dpr); this.cv.height = Math.round(H * dpr);
    this.cv.style.width = W + 'px'; this.cv.style.height = H + 'px';
    var port = this.port = W / H < 0.9, S = this.S = {};
    S.C = { x: W / 2, y: H / 2 };
    if (!port) {
      S.sw = Math.min(W, H * 16 / 9); S.sh = S.sw * 9 / 16; S.ox = (W - S.sw) / 2; S.oy = (H - S.sh) / 2;
      S.unitR = S.sw * 1.08; S.R = .385 * S.sh; S.rxB = .60 * S.sh; S.ryB = .45 * S.sh;
      S.gR = .239 * S.sh; S.grxB = .25 * S.sw; S.gryB = .313 * S.sh; S.ringW = Math.max(2, .0028 * S.sw);
      S.Lw = .5 * S.sw; S.font = Math.max(10, Math.min(14, .0085 * S.sw));
    } else {
      var pw = Math.min(W, H / 1.9);
      S.sw = pw; S.ox = (W - pw) / 2; S.unitR = pw * 2.1; S.R = .355 * pw; S.rxB = .50 * pw; S.ryB = .62 * pw;
      S.gR = .25 * pw * .9; S.grxB = .43 * pw; S.gryB = .27 * pw; S.ringW = Math.max(2, .008 * pw);
      S.Lw = .80 * pw; S.font = 10;
      S.C.y = H * .54;
    }
    S.Lh = S.Lw / LOGO_AR; S.leafBase = LEAF.w * S.Lw * 1.3;
    this.root.style.setProperty('--ak-cap', S.font + 'px');
    S.seatW = SEAT_W * S.unitR; S.riseW = S.seatW * 1.5;
    this.mems.forEach(function (o) {
      o.on = true;
      o.w = (port ? o.m.wP * S.sw : o.m.wL * W); o.h = o.w / ASPECT[o.m.src];
      o.x = S.C.x; o.y = S.C.y;
      o.e.style.width = o.w + 'px'; o.e.style.height = o.h + 'px';
      // the place name sits under the plate rising in the middle
      if (o.lb) { o.lx = S.C.x; o.ly = S.C.y + S.riseW * .56 + S.font * 1.4; }
    });
    this.dishes.forEach(function (o) {
      o.seatW = S.seatW; o.base = S.riseW; o.bh = o.base / ASPECT[o.d.id];
      o.e.style.width = o.base + 'px'; o.e.style.height = o.bh + 'px';
      o.ang = (-90 + o.j * 45) * D2R;
      o.lb.style.display = port ? 'none' : '';
    });
    this.leaf.style.width = S.leafBase + 'px'; this.leaf.style.height = S.leafBase * 0.7436 + 'px';
    this.logo.style.width = S.Lw + 'px'; this.logo.style.height = S.Lh + 'px';
  };

  Intro.prototype.seat = function (o, t) {
    var S = this.S, C = S.C;
    var e1 = inOutCubic(prog(t, T.widen[0], T.widen[1])), e2 = inCubic(prog(t, T.drift[0], T.drift[1]));
    var grow = lerp(1, 1.75, e2), th = 16 * inOutSine(prog(t, T.turn[0], T.turn[1])) * D2R;
    var rx = lerp(S.R, S.rxB, e1) * grow, ry = lerp(S.R, S.ryB, e1) * grow;
    return { x: C.x + Math.cos(o.ang + th) * rx, y: C.y + Math.sin(o.ang + th) * ry, sf: lerp(1, .86, e1) * lerp(1, .84, e2), rot: th / D2R };
  };
  Intro.prototype.target = function () {
    var e = document.querySelector(CFG.target);
    if (e) { var r = e.getBoundingClientRect(); if (r.width > 0) return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }
    return { x: this.W / 2, y: 44, w: Math.min(160, this.W * .3) };
  };

  // ---------------------------------------------------------------
  Intro.prototype.frame = function (t) {
    this.t = t;
    var S = this.S, W = this.W, H = this.H, C = S.C, ctx = this.ctx, dpr = this.dpr, self = this;

    // ---- gold ground (with the arch cut out of it at the end) ----
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    var a = prog(t, OPEN, TOTAL), archTop = null, aw = 0, ah = 0;
    if (a > 0) {
      aw = Math.max(W, 1.01 * H) * 1.08 * Math.pow(a, 1.6); ah = aw * 1.55; archTop = H + 2 - ah;
      ctx.beginPath(); ctx.rect(0, 0, W, H); archPath(ctx, W / 2, archTop, aw, ah); ctx.clip('evenodd');
    }
    var big = Math.hypot(W, H) * .62;
    var bg = ctx.createRadialGradient(W / 2, H * .46, 0, W / 2, H * .46, big);
    bg.addColorStop(0, '#f6e3ab'); bg.addColorStop(.42, '#e4bb67'); bg.addColorStop(.8, '#bf8c35'); bg.addColorStop(1, '#9c6b24');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // a slow sheen of light across the gold, like foil
    var sx = lerp(-.4, 1.4, (t / TOTAL)) * W;
    var sh = ctx.createLinearGradient(sx - W * .35, 0, sx + W * .35, H * .5);
    sh.addColorStop(0, 'rgba(255,248,225,0)'); sh.addColorStop(.5, 'rgba(255,248,225,.16)'); sh.addColorStop(1, 'rgba(255,248,225,0)');
    ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
    // the gold ring: draws round the table, widens round the name, unrolls into the line under KITCHEN
    var rd = outCubic(prog(t, T.ring[0], T.ring[1])), un = inOutCubic(prog(t, T.unroll[0], T.unroll[1]));
    if (rd > 0 && un < 1) {
      var e1 = inOutCubic(prog(t, T.widen[0], T.widen[1]));
      var rx = lerp(S.gR, S.grxB, e1), ry = lerp(S.gR, S.gryB, e1), a0, a1;
      if (un <= 0) { a0 = -Math.PI / 2; a1 = a0 + Math.PI * 2 * rd; } else { a1 = Math.PI * .75; a0 = a1 - Math.PI * 2 * (1 - un); }
      ctx.beginPath(); ctx.ellipse(C.x, C.y, rx, ry, 0, a0, a1);
      ctx.strokeStyle = RING; ctx.lineWidth = S.ringW; ctx.lineCap = 'round'; ctx.stroke();
    }
    // the table, set for eight: a faint circle and eight seat marks appearing clockwise, each covered as its plate arrives
    var ta = prog(t, .05, .4) * (1 - prog(t, T.ring[0], T.ring[1] + .1));
    if (ta > 0) {
      ctx.beginPath(); ctx.arc(C.x, C.y, S.R, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(140,96,30,' + (.28 * ta).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.stroke();
      for (var j = 0; j < 8; j++) {
        var ma = prog(t, .08 + j * .045, .22 + j * .045) * (1 - prog(t, DISHES[j].seated - .12, DISHES[j].seated)) * ta;
        if (ma <= 0) continue;
        var an = (-90 + j * 45) * D2R, mx = C.x + Math.cos(an) * S.R, my = C.y + Math.sin(an) * S.R;
        ctx.beginPath(); ctx.arc(mx, my, Math.max(3, S.seatW * .045), 0, Math.PI * 2); ctx.fillStyle = 'rgba(120,80,22,' + (.75 * ma).toFixed(3) + ')'; ctx.fill();
        ctx.beginPath(); ctx.arc(mx, my, S.seatW * .5, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(140,96,30,' + (.35 * ma).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.stroke();
      }
    }
    if (this.noise) { ctx.fillStyle = ctx.createPattern(this.noise, 'repeat'); ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    if (a > 0) {
      var ao = prog(a, 0, .08) * (1 - prog(a, .7, .95));
      if (ao > 0) {
        ctx.beginPath(); archPath(ctx, W / 2, archTop, aw, ah + 4); ctx.strokeStyle = 'rgba(' + ARCH + ',' + ao.toFixed(3) + ')'; ctx.lineWidth = 3; ctx.stroke();
        ctx.beginPath(); archPath(ctx, W / 2, archTop - 12 - aw * .02, aw + 24 + aw * .04, ah + 16); ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(' + ARCH + ',' + (ao * .8).toFixed(3) + ')'; ctx.stroke();
      }
    }

    // ---- memories: one at a time in the middle, coming up slowly, soft and shapeless, then melting away ----
    this.mems.forEach(function (o) {
      var m = o.m;
      var fin = inOutSine(prog(t, m.at, m.at + .45)), fout = inOutSine(prog(t, m.end, m.end + .45));
      var op = fin * (1 - fout) * .8;
      if (op <= 0.002) { o.e.style.opacity = '0'; if (o.lb) o.lb.style.opacity = '0'; return; }
      var drift = prog(t, m.at, m.end + .45);
      place(o.e, o.x, o.y, o.w, o.h, 0, lerp(1.06, 1, outCubic(drift)), op);
      if (o.lb) {
        var lo = outCubic(prog(t, m.at + .15, m.at + .45)) * (1 - prog(t, m.end - .05, m.end + .25));
        o.lb.style.transform = 'translate3d(' + o.lx.toFixed(1) + 'px,' + o.ly.toFixed(1) + 'px,0) translate(-50%,-50%)';
        o.lb.style.opacity = (lo * .9).toFixed(3);
      }
    });

    // ---- plates: each rises in the middle out of its memory, then moves straight out to the next seat ----
    var dfade = 1 - prog(t, 4.05, 4.55);
    this.dishes.forEach(function (o) {
      var d = o.d, e = o.e;
      var kr = prog(t, d.at, d.at + RISE), kf = inOutCubic(prog(t, d.at + RISE, d.seated));
      if (kr <= 0 || dfade <= 0) { e.style.opacity = '0'; o.lb.style.opacity = '0'; return; }
      var s = self.seat(o, t), er = outCubic(kr);
      var x = lerp(C.x, s.x, kf), y = lerp(C.y + (1 - er) * S.riseW * .08, s.y, kf);
      var w = lerp(S.riseW * lerp(.7, 1, er), S.seatW * s.sf, kf);
      var r = lerp(-8 * (1 - er), s.rot, kf);
      var gilt = 1 - prog(kr, .15, 1);
      o.im.style.filter = gilt > .01 ? 'sepia(' + gilt.toFixed(2) + ') saturate(' + (1 + 1.4 * gilt).toFixed(2) + ') brightness(' + (1 + .2 * gilt).toFixed(2) + ') drop-shadow(0 1.1vmin 1.4vmin rgba(80,45,5,.38))' : '';
      place(e, x, y, o.base, o.bh, r, w / o.base, c01(kr * 2) * dfade);
      // its name, just outside its seat
      if (!self.port) {
        var lo = outCubic(prog(t, d.seated - .05, d.seated + .25)) * (1 - prog(t, 3.3, 3.55));
        if (lo > 0) {
          var ca = Math.cos(o.ang), sa = Math.sin(o.ang), off = S.seatW * .6 + S.font * 1.3;
          o.lb.style.transform = 'translate3d(' + (s.x + ca * off * 1.32).toFixed(1) + 'px,' + (s.y + sa * off).toFixed(1) + 'px,0) translate(-50%,-50%)';
        }
        o.lb.style.opacity = lo.toFixed(3);
      }
    });

    // ---- the logo, in its own green and gold on the gold ground ----
    var ls = lerp(.88, 1, inOutCubic(prog(t, T.asha[0], T.kitchen[1])));
    var gp = inOutCubic(prog(t, OPEN, TOTAL - .05));
    var lx = C.x, ly = C.y;
    if (gp > 0) { var Tg = this.target(); lx = lerp(C.x, Tg.x, gp); ly = lerp(C.y, Tg.y, gp); ls = lerp(1, Tg.w / S.Lw, gp); }
    var showLogo = t >= T.asha[0];
    place(this.logo, lx, ly, S.Lw, S.Lh, 0, ls, showLogo ? 1 : 0);
    if (showLogo) {
      var ea = outCubic(prog(t, T.asha[0], T.asha[1]));
      this.ashaIn.style.transform = 'translate3d(0,' + ((1 - ea) * 72).toFixed(2) + '%,0)';
      this.ashaIn.style.opacity = prog(t, T.asha[0], T.asha[0] + .24).toFixed(3);
      var ek = outCubic(prog(t, T.kitchen[0], T.kitchen[1]));
      this.kCut.style.clipPath = 'inset(' + K_TOP + '% ' + ((1 - ek) * 100).toFixed(2) + '% ' + K_BOT + '% 0)';
      this.kIn.style.transform = 'translate3d(0,' + ((1 - ek) * 10).toFixed(2) + '%,0)';
      var ew = inOutCubic(prog(t, T.swoosh[0], T.swoosh[1]));
      this.sw.style.clipPath = 'inset(-2% ' + ((1 - ew) * 100).toFixed(2) + '% -2% 0)';
      var shp = prog(t, T.shine[0], T.shine[1]);
      this.shineHalo.style.opacity = (shp > 0 && shp < 1) ? '1' : '0';
      this.shine.style.transform = 'translate3d(' + lerp(-70, 70, inOutSine(shp)).toFixed(1) + '%,0,0)';
    }

    // ---- the gold leaf drops into the middle of the table, then settles into the A ----
    if (t < T.leaf[0]) { this.leaf.style.opacity = '0'; }
    else {
      var lsx = lx + (LEAF.x + LEAF.w / 2 - .5) * S.Lw * ls, lsy = ly + (LEAF.y + LEAF.h / 2 - .5) * S.Lh * ls;
      var slot = (LEAF.w * S.Lw * ls) / S.leafBase;
      var ed = outCubic(prog(t, T.leaf[0], T.leaf[1])), es = inOutCubic(prog(t, T.asha[0] + .02, T.asha[1] + .05));
      var x0l = C.x, y0l = C.y - (this.port ? .4 * S.sw : .3 * S.sh) * (1 - ed);
      var x2 = lerp(x0l, lsx, es), y2 = lerp(y0l, lsy, es) - Math.sin(Math.PI * es) * .05 * S.sw * .56;
      var sc = lerp(lerp(1.5, 1, ed), slot, es), rr = lerp(lerp(-70, -6, ed), 0, es);
      place(this.leaf, x2, y2, S.leafBase, S.leafBase * 0.7436, rr, sc, prog(t, T.leaf[0], T.leaf[0] + .15));
    }
    if (t >= OPEN && !this.opened) { this.opened = true; this.root.classList.add('is-open'); }
  };

  // ---------------------------------------------------------------
  Intro.prototype.run = function () {
    var self = this, speed = +(Q.get('speed') || 1), pace = +(Q.get('pace') || TOTAL);
    var rate = speed * (TOTAL / pace), start = null;
    this.frame(0);
    document.documentElement.classList.remove('ak-wait');
    this.root.setAttribute('data-ready', '1');
    function tick(now) {
      if (self.done) return;
      if (start == null) start = now;
      var t = ((now - start) / 1000) * rate;
      if (t >= TOTAL) { self.frame(TOTAL); self.finish(); return; }
      self.frame(t);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    this.listenSkip();
  };
  Intro.prototype.listenSkip = function () {
    var self = this;
    this._skip = function (ev) {
      if (self.done) return;
      if (ev && ev.type === 'keydown' && (ev.metaKey || ev.ctrlKey || ev.altKey)) return;
      self.skip();
    };
    ['pointerdown', 'keydown', 'wheel', 'touchmove'].forEach(function (n) { window.addEventListener(n, self._skip, { passive: true }); });
  };
  Intro.prototype.skip = function () {
    if (this.done) return;
    var root = this.root, self = this;
    document.documentElement.classList.remove('ak-on', 'ak-wait');
    root.style.transition = 'opacity .35s ease'; root.style.pointerEvents = 'none'; root.style.opacity = '0';
    this.done = true;
    setTimeout(function () { self.cleanup(); }, 380);
  };
  Intro.prototype.finish = function () { this.done = true; this.cleanup(); };
  Intro.prototype.cleanup = function () {
    var h = document.documentElement, self = this;
    h.classList.remove('ak-on', 'ak-wait'); h.classList.add('ak-intro-done');
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    if (this._skip) ['pointerdown', 'keydown', 'wheel', 'touchmove'].forEach(function (n) { window.removeEventListener(n, self._skip); });
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    this._resolve();
  };

  // the simple version: the logo on gold (reduced motion, or the pictures are late)
  Intro.prototype.runPlain = function () {
    var self = this, root = this.root, start = null, S = this.S;
    this.mems.forEach(function (o) { o.e.style.display = 'none'; if (o.lb) o.lb.style.display = 'none'; });
    this.dishes.forEach(function (o) { o.e.style.display = 'none'; o.lb.style.display = 'none'; });
    document.documentElement.classList.remove('ak-wait');
    root.setAttribute('data-ready', '1');
    this.ashaIn.style.transform = this.kIn.style.transform = 'none';
    this.kCut.style.clipPath = 'inset(' + K_TOP + '% 0 ' + K_BOT + '% 0)';
    this.sw.style.clipPath = 'none';
    var ctx = this.ctx;
    function f(t) {
      var W = self.W, H = self.H;
      ctx.setTransform(self.dpr, 0, 0, self.dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1 - prog(t, 1.3, 1.9); ctx.fillStyle = COVER; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
      var inn = outCubic(prog(t, 0, .6)), gl = inOutCubic(prog(t, 1.3, 2.0)), Tg = self.target();
      var x = lerp(S.C.x, Tg.x, gl), y = lerp(S.C.y + (1 - inn) * 14, Tg.y, gl), s = lerp(1, Tg.w / S.Lw, gl);
      place(self.logo, x, y, S.Lw, S.Lh, 0, s, inn);
      place(self.leaf, x + (LEAF.x + LEAF.w / 2 - .5) * S.Lw * s, y + (LEAF.y + LEAF.h / 2 - .5) * S.Lh * s, S.leafBase, S.leafBase * 0.7436, 0, (LEAF.w * S.Lw * s) / S.leafBase, inn);
      if (t >= 1.3) root.classList.add('is-open');
    }
    if (Q.has('t')) { f(+Q.get('t')); return; }
    function tick(now) {
      if (self.done) return;
      if (start == null) start = now;
      var t = (now - start) / 1000;
      if (t >= 2.0) { f(2.0); self.finish(); return; }
      f(t); requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    this.listenSkip();
  };

  // ---------------------------------------------------------------
  function shouldSkip() {
    if (Q.has('nointro') || Q.has('table') || Q.has('counter')) return true;
    if (Q.has('intro') || Q.has('t')) return false;
    try { var n = performance.getEntriesByType('navigation')[0]; if (n && n.type === 'back_forward') return true; } catch (e) {}
    return false;
  }
  var intro = null;
  function play() {
    var h = document.documentElement;
    if (shouldSkip()) { h.classList.remove('ak-wait'); h.classList.add('ak-intro-done'); return Promise.resolve(); }
    intro = new Intro();
    intro.build();
    h.classList.add('ak-on');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || Q.has('plain')) { intro.runPlain(); return intro.finished; }
    var freeze = Q.has('t') ? +Q.get('t') : null;
    var ready = false, budget = freeze != null ? 30000 : 4000;
    var loads = intro.urls().map(function (u) {
      return new Promise(function (res) { var i = new Image(); i.onload = i.onerror = function () { (i.decode ? i.decode() : Promise.resolve()).then(res, res); }; i.src = u; });
    });
    var timer = setTimeout(function () { if (!ready) { ready = true; intro.runPlain(); } }, budget);
    Promise.all(loads).then(function () {
      if (ready) return;
      ready = true; clearTimeout(timer);
      if (freeze != null) {
        h.classList.remove('ak-wait');
        intro.frame(Math.min(freeze, TOTAL));
        intro.root.setAttribute('data-ready', '1');
        if (freeze >= TOTAL) h.classList.remove('ak-on');
        return;
      }
      intro.run();
    });
    return intro.finished;
  }

  if (!shouldSkip()) {
    document.documentElement.classList.add('ak-wait');
    document.documentElement.style.setProperty('--ak-cover', COVER);
    try {
      var head = document.head || document.getElementsByTagName('head')[0];
      Intro.prototype.urls().forEach(function (u) { var l = document.createElement('link'); l.rel = 'preload'; l.as = 'image'; l.href = u; head.appendChild(l); });
    } catch (e) {}
  }
  window.AshaIntro = {
    play: play,
    get intro() { return intro; },
    frame: function (t) { if (intro) intro.frame(t); },
    state: function () { return intro ? { t: +intro.t.toFixed(3), done: intro.done, port: intro.port, W: intro.W, H: intro.H } : null; },
    TOTAL: TOTAL, OPEN: OPEN,
  };
  window.AshaIntroDone = new Promise(function (res) {
    var go = function () { play().then(res); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  });
})();
