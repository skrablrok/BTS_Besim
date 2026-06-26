/* projekti.js — responsive 3D project card renders */
(function () {
  if (typeof THREE === 'undefined') return;

  const METAL = new THREE.MeshPhysicalMaterial({
    color: 0xc8d4e8,
    metalness: 1.0,
    roughness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08
  });

  function box(w, h, d) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), METAL);
  }

  function lights(scene) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const k = new THREE.DirectionalLight(0xffffff, 1.9);
    k.position.set(4, 7, 5); scene.add(k);
    const f = new THREE.DirectionalLight(0x6688cc, 0.55);
    f.position.set(-5, 2, -3); scene.add(f);
    const r = new THREE.DirectionalLight(0x4466ff, 1.0);
    r.position.set(0, -2, -5); scene.add(r);
    const pt = new THREE.PointLight(0x8899ff, 0.8, 12);
    pt.position.set(2, 3, 2); scene.add(pt);
  }

  /* All active scenes — used by the resize handler */
  var allScenes = [];

  function makeScene(canvasId, buildFn, camX, camY, camZ, lx, ly, lz) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    /* Use parent width so we get the real CSS-rendered width */
    var W = canvas.parentElement.clientWidth || 320;
    var H = canvas.clientHeight || 220;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H, false);          /* false = don't touch CSS size */
    renderer.outputEncoding      = THREE.sRGBEncoding;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    var scene  = new THREE.Scene();
    lights(scene);

    var camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(camX, camY, camZ);
    camera.lookAt(lx, ly, lz);

    var group = new THREE.Group();
    buildFn(group);
    scene.add(group);

    var raf = null;
    function tick() {
      raf = requestAnimationFrame(tick);
      group.rotation.y += 0.006;
      renderer.render(scene, camera);
    }

    /* Only animate when visible */
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { if (!raf) tick(); }
      else { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.05 });
    obs.observe(canvas);

    allScenes.push({ renderer: renderer, camera: camera, canvas: canvas });
  }

  /* Resize all scenes when window changes */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      allScenes.forEach(function (s) {
        var W = s.canvas.parentElement.clientWidth || 320;
        var H = s.canvas.clientHeight || 220;
        s.renderer.setSize(W, H, false);
        s.camera.aspect = W / H;
        s.camera.updateProjectionMatrix();
      });
    }, 120);
  });

  /* ---------- Model 1: Fence / Railing ---------- */
  function buildFence(g) {
    var FW = 2.8, FH = 1.0, RAILR = 0.032, POSTR = 0.055, BALR = 0.016;
    [FH, 0.04].forEach(function (y) {
      var m = box(FW, RAILR * 2, RAILR * 2); m.position.set(0, y, 0); g.add(m);
    });
    [-FW / 2, 0, FW / 2].forEach(function (x) {
      var p = box(POSTR * 2, FH + 0.06, POSTR * 2);
      p.position.set(x, FH / 2, 0); g.add(p);
      var cap = new THREE.Mesh(new THREE.SphereGeometry(POSTR * 1.3, 8, 6), METAL);
      cap.position.set(x, FH + 0.06, 0); g.add(cap);
    });
    var BALS = 11;
    for (var i = 0; i < BALS; i++) {
      var x = -FW / 2 + 0.28 + i * (FW - 0.56) / (BALS - 1);
      var b = box(BALR * 2, FH - 0.12, BALR * 2);
      b.position.set(x, FH / 2 + 0.02, 0); g.add(b);
    }
    g.position.y = -0.55;
  }

  /* ---------- Model 2: Stairs ---------- */
  function buildStairs(g) {
    var NSTEPS = 7, SW = 1.8, SR = 0.18, SD = 0.28, TH = 0.05;
    var totalH = NSTEPS * SR, totalD = NSTEPS * SD;
    for (var i = 0; i < NSTEPS; i++) {
      var t = box(SW, TH, SD + 0.03);
      t.position.set(0, i * SR + TH / 2, -i * SD); g.add(t);
    }
    var ang = -Math.atan2(totalH, totalD);
    var len = Math.hypot(totalH, totalD);
    [-SW / 2 + 0.05, SW / 2 - 0.05].forEach(function (x) {
      var s = box(0.055, 0.055, len + 0.1);
      s.rotation.x = ang;
      s.position.set(x, totalH / 2, -totalD / 2 + 0.02); g.add(s);
    });
    for (var j = 0; j < NSTEPS; j += 2) {
      [-SW / 2 + 0.05, SW / 2 - 0.05].forEach(function (x) {
        var po = box(0.03, 0.35, 0.03);
        po.position.set(x, j * SR + 0.35 / 2 + TH, -j * SD); g.add(po);
      });
    }
    [-SW / 2 + 0.05, SW / 2 - 0.05].forEach(function (x) {
      var hr = box(0.03, 0.03, len + 0.1);
      hr.rotation.x = ang;
      hr.position.set(x, totalH + 0.33, -totalD / 2 + 0.02); g.add(hr);
    });
    g.position.set(0, -totalH / 2, totalD / 2 - 0.15);
  }

  /* ---------- Model 3: Sliding Doors ---------- */
  function buildDoors(g) {
    var DW = 0.95, DH = 1.85;
    var tr = box(DW * 2.5, 0.07, 0.10);
    tr.position.set(0, DH / 2 + 0.1, 0); g.add(tr);
    var fl = box(DW * 2.5, 0.03, 0.12);
    fl.position.set(0, -DH / 2 - 0.02, 0); g.add(fl);
    [-DW * 1.2, DW * 1.2].forEach(function (x) {
      var wp = box(0.07, DH + 0.3, 0.07); wp.position.set(x, 0, 0); g.add(wp);
    });
    [-DW / 2 - 0.06, DW / 2 + 0.06].forEach(function (px) {
      var top = box(DW, 0.05, 0.05); top.position.set(px, DH / 2, 0);    g.add(top);
      var bot = box(DW, 0.05, 0.05); bot.position.set(px, -DH / 2, 0);   g.add(bot);
      var le  = box(0.05, DH, 0.05); le.position.set(px - DW/2 + 0.025, 0, 0); g.add(le);
      var ri  = box(0.05, DH, 0.05); ri.position.set(px + DW/2 - 0.025, 0, 0); g.add(ri);
      var SLATS = 8;
      for (var s = 0; s < SLATS; s++) {
        var sl = box(DW - 0.1, 0.04, 0.06);
        sl.position.set(px, -DH / 2 + 0.22 + s * ((DH - 0.35) / (SLATS - 1)), 0.02);
        g.add(sl);
      }
      var ro = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), METAL);
      ro.position.set(px, DH / 2 + 0.06, 0); g.add(ro);
      var sign = px > 0 ? 0.18 : -0.18;
      var ha = box(0.03, 0.28, 0.03);
      ha.position.set(px - sign, 0, 0.05); g.add(ha);
    });
    g.position.y = -0.1;
  }

  /* ---------- Model 4: Steel Canopy ---------- */
  function buildCanopy(g) {
    [[-1.2, -0.9], [1.2, -0.9], [-1.2, 0.9], [1.2, 0.9]].forEach(function (xz) {
      var p = box(0.07, 2.0, 0.07); p.position.set(xz[0], 0, xz[1]); g.add(p);
    });
    [-0.9, 0.9].forEach(function (z) {
      var b = box(2.5, 0.07, 0.07); b.position.set(0, 1.0, z); g.add(b);
    });
    [-0.4, 0.4].forEach(function (x) {
      var c = box(0.06, 0.06, 1.85); c.position.set(x, 1.0, 0); g.add(c);
    });
    [-1.2, 1.2].forEach(function (x) {
      var e = box(0.07, 0.07, 1.85); e.position.set(x, 1.0, 0); g.add(e);
    });
    var roof = box(2.5, 0.03, 1.85); roof.position.set(0, 1.06, 0); g.add(roof);
    [[-1, 0.9], [1, 0.9], [-1, -0.9], [1, -0.9]].forEach(function (xz) {
      var br = box(0.04, 0.04, 0.55);
      br.rotation.x = Math.PI / 5 * Math.sign(xz[1]);
      br.position.set(xz[0] * 1.2, 0.65, xz[1] * 0.6); g.add(br);
    });
    g.position.y = -0.65;
  }

  /* ---------- Model 5: Fire Escape Stairs ---------- */
  function buildFireStairs(g) {
    var W = 0.9, H = 2.8, RUNGS = 9;
    [-W / 2, W / 2].forEach(function (x) {
      var r = box(0.055, H, 0.055); r.position.set(x, 0, 0); g.add(r);
    });
    for (var i = 0; i < RUNGS; i++) {
      var step = box(W - 0.05, 0.045, 0.26);
      step.position.set(0, -H / 2 + 0.3 + i * (H - 0.4) / (RUNGS - 1), 0.05); g.add(step);
    }
    var CAGE = 7;
    for (var j = 0; j < CAGE; j++) {
      var angle = (j / (CAGE - 1)) * Math.PI;
      var arcBar = box(0.025, 0.025, 0.7);
      arcBar.position.set(Math.cos(angle) * 0.52, H / 2 - 0.2 - j * 0.22, Math.sin(angle) * 0.28 + 0.3);
      g.add(arcBar);
    }
    var hoop = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.022, 6, 18, Math.PI), METAL);
    hoop.position.set(0, H / 2 - 0.2, 0.3); g.add(hoop);
    [-0.55, 0].forEach(function (y) {
      var wb = box(0.04, 0.04, 0.3); wb.position.set(0, y, -0.17); g.add(wb);
    });
    g.position.y = -0.6;
  }

  /* ---------- Model 6: Decorative Gate ---------- */
  function buildGate(g) {
    [-1.45, 1.45].forEach(function (x) {
      var col = box(0.18, 2.3, 0.18); col.position.set(x, 0, 0); g.add(col);
      var cap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), METAL);
      cap.scale.y = 0.6; cap.position.set(x, 1.22, 0); g.add(cap);
    });
    var BARS = 9;
    for (var i = 0; i < BARS; i++) {
      var x = -1.1 + i * 2.2 / (BARS - 1);
      var bar = box(0.04, 1.85, 0.04); bar.position.set(x, -0.1, 0); g.add(bar);
      var tip = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.2, 4), METAL);
      tip.position.set(x, 0.83, 0); g.add(tip);
    }
    [-0.55, 0.3].forEach(function (y) {
      var rail = box(2.5, 0.055, 0.055); rail.position.set(0, y, 0); g.add(rail);
    });
    var arch = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.026, 8, 22, Math.PI), METAL);
    arch.position.set(0, 0.92, 0); g.add(arch);
    [-0.32, 0.32].forEach(function (x) {
      var scroll = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 6, 12), METAL);
      scroll.position.set(x, 0.92, 0); g.add(scroll);
    });
    g.position.y = -0.5;
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    makeScene('proj-canvas-1', buildFence,       0,    0.6, 3.5,  0,  0.2,  0);
    makeScene('proj-canvas-2', buildStairs,      1.8,  1.0, 3.8,  0,  0.2, -0.4);
    makeScene('proj-canvas-3', buildDoors,       0,    0.2, 4.2,  0,  0,    0);
    makeScene('proj-canvas-4', buildCanopy,      2.2,  1.4, 3.8,  0,  0,    0);
    makeScene('proj-canvas-5', buildFireStairs,  1.4,  0.2, 3.8,  0,  0,    0.1);
    makeScene('proj-canvas-6', buildGate,        0,    0.2, 4.6,  0,  0.1,  0);
  });
})();
