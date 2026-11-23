/* Small QR code encoder: byte mode, error correction level M, versions 1-10 (up to ~210 characters).
 * AshaQR.svg(text, { color, background, margin }) returns an <svg> string; AshaQR.matrix(text) returns rows of 0/1. */
(function (g) {
  'use strict';
  var EC = [null, [10, [[1, 16]]], [16, [[1, 28]]], [26, [[1, 44]]], [18, [[2, 32]]], [24, [[2, 43]]], [16, [[4, 27]]], [18, [[4, 31]]], [22, [[2, 38], [2, 39]]], [22, [[3, 36], [2, 37]]], [26, [[4, 43], [1, 44]]]];
  var ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
  var EXP = [], LOG = [];
  (function () { var x = 1; for (var i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  function mul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
  function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; }
  function genPoly(n) { var p = [1]; for (var i = 0; i < n; i++) { var q = zeros(p.length + 1); for (var j = 0; j < p.length; j++) { q[j] ^= p[j]; q[j + 1] ^= mul(p[j], EXP[i]); } p = q; } return p; }
  function rs(data, n) { var gp = genPoly(n), r = data.concat(zeros(n)); for (var i = 0; i < data.length; i++) { var c = r[i]; if (c) for (var j = 0; j < gp.length; j++) r[i + j] ^= mul(gp[j], c); } return r.slice(data.length); }
  function utf8(s) { var u = unescape(encodeURIComponent(s)), out = []; for (var i = 0; i < u.length; i++) out.push(u.charCodeAt(i)); return out; }
  function capacity(v) { var c = 0; EC[v][1].forEach(function (b) { c += b[0] * b[1]; }); return c; }

  function codewords(bytes, v) {
    var bits = [];
    function put(val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach(function (b) { put(b, 8); });
    var cap = capacity(v);
    put(0, Math.min(4, cap * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) { var x = 0; for (var k = 0; k < 8; k++) x = (x << 1) | bits[i + k]; data.push(x); }
    for (var p = 0; data.length < cap; p++) data.push(p % 2 ? 0x11 : 0xEC);
    var info = EC[v], blocks = [], ecs = [], off = 0;
    info[1].forEach(function (grp) { for (var c = 0; c < grp[0]; c++) { var b = data.slice(off, off + grp[1]); off += grp[1]; blocks.push(b); ecs.push(rs(b, info[0])); } });
    var out = [], max = 0; blocks.forEach(function (b) { max = Math.max(max, b.length); });
    for (i = 0; i < max; i++) blocks.forEach(function (b) { if (i < b.length) out.push(b[i]); });
    for (i = 0; i < info[0]; i++) ecs.forEach(function (e) { out.push(e[i]); });
    return out;
  }

  function base(v) {
    var n = 17 + 4 * v, m = [], f = [], y, x;
    for (y = 0; y < n; y++) { m.push(zeros(n)); f.push(zeros(n)); }
    function set(x, y, d) { m[y][x] = d ? 1 : 0; f[y][x] = 1; }
    function finder(cx, cy) { for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) { var X = cx + dx, Y = cy + dy; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; var d = Math.max(Math.abs(dx), Math.abs(dy)); set(X, Y, d !== 2 && d !== 4); } }
    for (var i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    finder(3, 3); finder(n - 4, 3); finder(3, n - 4);
    var al = ALIGN[v], last = al.length - 1;
    for (var a = 0; a < al.length; a++) for (var b = 0; b < al.length; b++) {
      if ((a === 0 && b === 0) || (a === 0 && b === last) || (a === last && b === 0)) continue;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) set(al[a] + dx, al[b] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    // reserve format areas (written per mask later) and the dark module
    for (i = 0; i < 9; i++) { f[8][i] = 1; f[i][8] = 1; }
    for (i = 0; i < 8; i++) { f[8][n - 1 - i] = 1; f[n - 1 - i][8] = 1; }
    set(8, n - 8, 1);
    if (v >= 7) {
      var r = v; for (i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      var vb = (v << 12) | r;
      for (i = 0; i < 18; i++) { var bit = (vb >>> i) & 1, A = n - 11 + i % 3, B = Math.floor(i / 3); set(A, B, bit); set(B, A, bit); }
    }
    return { n: n, m: m, f: f };
  }
  function place(q, words) {
    var n = q.n, i = 0, total = words.length * 8;
    for (var right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < n; vert++) for (var j = 0; j < 2; j++) {
        var x = right - j, up = ((right + 1) & 2) === 0, y = up ? n - 1 - vert : vert;
        if (!q.f[y][x] && i < total) { q.m[y][x] = (words[i >>> 3] >>> (7 - (i & 7))) & 1; i++; }
      }
    }
  }
  var MASK = [
    function (x, y) { return (x + y) % 2 === 0; }, function (x, y) { return y % 2 === 0; }, function (x) { return x % 3 === 0; }, function (x, y) { return (x + y) % 3 === 0; },
    function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; }, function (x, y) { return x * y % 2 + x * y % 3 === 0; },
    function (x, y) { return (x * y % 2 + x * y % 3) % 2 === 0; }, function (x, y) { return ((x + y) % 2 + x * y % 3) % 2 === 0; }
  ];
  function format(m, n, mask) {
    var data = (0 << 3) | mask, r = data; // level M = 00
    for (var i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    var bits = ((data << 10) | r) ^ 0x5412, bit = function (k) { return (bits >>> k) & 1; };
    for (i = 0; i <= 5; i++) m[i][8] = bit(i);
    m[7][8] = bit(6); m[8][8] = bit(7); m[8][7] = bit(8);
    for (i = 9; i < 15; i++) m[8][14 - i] = bit(i);
    for (i = 0; i < 8; i++) m[8][n - 1 - i] = bit(i);
    for (i = 8; i < 15; i++) m[n - 15 + i][8] = bit(i);
    m[n - 8][8] = 1;
  }
  function penalty(m, n) {
    var p = 0, x, y, run, dark = 0;
    for (y = 0; y < n; y++) { run = 1; for (x = 1; x < n; x++) { if (m[y][x] === m[y][x - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
    for (x = 0; x < n; x++) { run = 1; for (y = 1; y < n; y++) { if (m[y][x] === m[y - 1][x]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
    for (y = 0; y < n - 1; y++) for (x = 0; x < n - 1; x++) { var c = m[y][x]; if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3; }
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) dark += m[y][x];
    p += Math.floor(Math.abs(dark * 20 - n * n * 10) / (n * n)) * 10;
    return p;
  }
  function matrix(text) {
    var bytes = utf8(text), v = 1;
    while (v <= 10 && 4 + (v < 10 ? 8 : 16) + bytes.length * 8 > capacity(v) * 8) v++;
    if (v > 10) throw new Error('QR text too long');
    var words = codewords(bytes, v), best = null, bestP = Infinity;
    for (var k = 0; k < 8; k++) {
      var q = base(v); place(q, words);
      for (var y = 0; y < q.n; y++) for (var x = 0; x < q.n; x++) if (!q.f[y][x] && MASK[k](x, y)) q.m[y][x] ^= 1;
      format(q.m, q.n, k);
      var p = penalty(q.m, q.n); if (p < bestP) { bestP = p; best = q.m; }
    }
    return best;
  }
  function svg(text, o) {
    o = o || {}; var m = matrix(text), n = m.length, q = o.margin == null ? 4 : o.margin, s = n + q * 2, d = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (m[y][x]) d += 'M' + (x + q) + ' ' + (y + q) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + s + ' ' + s + '" shape-rendering="crispEdges"' + (o.label ? ' role="img" aria-label="' + o.label + '"' : '') + '>' +
      (o.background === 'none' ? '' : '<rect width="' + s + '" height="' + s + '" fill="' + (o.background || '#fff') + '"/>') + '<path d="' + d + '" fill="' + (o.color || '#000') + '"/></svg>';
  }
  g.AshaQR = { svg: svg, matrix: matrix };
})(window);
