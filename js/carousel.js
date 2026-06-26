/* ============================================================
   carousel.js — 3D Hero Carousel (Three.js required)
============================================================ */

/* Guard: do nothing if Three.js is not loaded */
if (typeof THREE === 'undefined') {
  console.warn('carousel.js: THREE is not defined — skipping 3D carousel.');
}

/* ================================================================
   3D HERO CAROUSEL — fence → stairs → sliding doors (Three.js)
================================================================ */
function initFence3D() {
  var container = document.getElementById('heroCanvas3d');
  if (!container || typeof THREE === 'undefined') return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, container.offsetWidth / container.offsetHeight, 0.1, 100);
  camera.position.set(0, 0.15, 6.2);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.outputEncoding    = THREE.sRGBEncoding;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.9;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x202030, 1.0));
  var key    = new THREE.DirectionalLight(0xffffff, 5.0); key.position.set(4, 8, 6);    scene.add(key);
  var fill   = new THREE.DirectionalLight(0x9bbfff, 3.0); fill.position.set(-5, 2, 2);  scene.add(fill);
  var rim    = new THREE.DirectionalLight(0xffffff, 3.5); rim.position.set(-1, -5, -4); scene.add(rim);
  var accent = new THREE.PointLight(0x0033e7, 6.0, 18);  accent.position.set(3, 3, 3);  scene.add(accent);
  var warm   = new THREE.PointLight(0xfff0e0, 2.0, 12);  warm.position.set(-2, -2, 4);  scene.add(warm);

  var steel = new THREE.MeshPhysicalMaterial({
    color: 0xdce8f0, metalness: 1.0, roughness: 0.06,
    clearcoat: 1.0, clearcoatRoughness: 0.04, reflectivity: 1.0,
  });

  /* ---- MODEL 1: FENCE (ograda) ---- */
  function buildFence() {
    var g = new THREE.Group();
    var FW = 3.2, FH = 2.1, RAILR = 0.040, POSTR = 0.068, BALR = 0.019, BALS = 9;

    function hBar(r, len, y) {
      var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 18), steel);
      m.rotation.z = Math.PI / 2; m.position.y = y; return m;
    }
    function vBar(r, h, x, y) {
      var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.12, h, 14), steel);
      m.position.set(x, y, 0); return m;
    }
    function sph(r, x, y) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), steel);
      m.position.set(x, y, 0); return m;
    }

    g.add(hBar(RAILR,       FW - POSTR * 1.6,  FH / 2));
    g.add(hBar(RAILR * 0.8, FW - POSTR * 1.6,  0));
    g.add(hBar(RAILR,       FW - POSTR * 1.6, -FH / 2));

    [-FW / 2, FW / 2].forEach(function (x) {
      g.add(vBar(POSTR, FH + 0.22, x, 0));
      g.add(sph(POSTR * 1.4, x, (FH + 0.22) / 2 + POSTR * 1.4));
      var fl = new THREE.Mesh(new THREE.CylinderGeometry(POSTR * 2.4, POSTR * 2.4, 0.035, 18), steel);
      fl.position.set(x, -(FH + 0.22) / 2 - 0.017, 0); g.add(fl);
    });

    var balH    = FH - RAILR * 2;
    var balSpan = (FW - POSTR * 2) / (BALS + 1);
    for (var i = 1; i <= BALS; i++) {
      var bx = -FW / 2 + POSTR + balSpan * i;
      g.add(vBar(BALR, balH, bx, 0));
      g.add(sph(BALR * 1.6, bx, balH / 2 + BALR * 0.8));
    }
    return g;
  }

  /* ---- MODEL 2: STAIRS (stopnice) ---- */
  function buildStairs() {
    var g      = new THREE.Group();
    var NSTEPS = 8;
    var SW     = 2.2;    // step width
    var SR     = 0.20;   // rise per step
    var SD     = 0.30;   // run per step
    var TH     = 0.055;  // tread thickness
    var STRR   = 0.030;  // stringer radius
    var BALR   = 0.018;  // baluster radius
    var RAILR  = 0.022;  // handrail radius
    var POST_H = 0.88;   // handrail post height

    var totalH = NSTEPS * SR;   // 1.6
    var totalD = NSTEPS * SD;   // 2.4
    var offY   = -totalH / 2;   // -0.8
    var offZ   = -totalD / 2;   // -1.2

    function cyl(r, h, x, y, z) {
      var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), steel);
      m.position.set(x, y, z); return m;
    }
    function box(w, h, d, x, y, z) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), steel);
      m.position.set(x, y, z); return m;
    }

    // Treads — bottom step at front (z positive), top step at back (z negative)
    for (var i = 0; i < NSTEPS; i++) {
      var tY = offY + i * SR + TH / 2;
      var tZ = offZ + (NSTEPS - 1 - i) * SD + SD / 2;
      g.add(box(SW, TH, SD + 0.012, 0, tY, tZ));
    }

    // Diagonal stringers (side beams)
    var diagLen    = Math.sqrt(totalH * totalH + totalD * totalD); // ≈ 2.88
    var stairAngle = -Math.atan2(totalD, totalH);  // tilt: top→back, bottom→front

    [-SW / 2, SW / 2].forEach(function (x) {
      var s = cyl(STRR, diagLen + 0.12, x, 0, 0);
      s.rotation.x = stairAngle;
      g.add(s);
    });

    // Handrail posts along right side (every 2 steps)
    for (var j = 0; j <= NSTEPS; j += 2) {
      var pY = offY + j * SR + TH;
      var pZ = offZ + (NSTEPS - j) * SD;
      g.add(cyl(BALR, POST_H, SW / 2, pY + POST_H / 2, pZ));
    }

    // Handrail (same angle, offset up by post height)
    var diagLen2 = diagLen * 0.96;
    var rail = new THREE.Mesh(new THREE.CylinderGeometry(RAILR, RAILR, diagLen2, 12), steel);
    rail.position.set(SW / 2, TH + POST_H, 0);
    rail.rotation.x = stairAngle;
    g.add(rail);

    // Left rail (mirror)
    var railL = rail.clone();
    railL.position.x = -SW / 2;
    g.add(railL);

    return g;
  }

  /* ---- MODEL 3: SLIDING DOORS (drsna vrata) ---- */
  function buildDoors() {
    var g      = new THREE.Group();
    var DW     = 1.1;    // single door panel width
    var DH     = 2.2;    // door height (taller = more door-like)
    var FT     = 0.040;  // frame bar half-size
    var TRACK_W = DW * 2 + 0.35;

    function tube(r, len, axis, x, y, z) {
      var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), steel);
      if (axis === 'x') m.rotation.z = Math.PI / 2;
      if (axis === 'z') m.rotation.x = Math.PI / 2;
      m.position.set(x, y, z); return m;
    }
    function box(w, h, d, x, y, z) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), steel);
      m.position.set(x, y, z); return m;
    }

    // ---- Top track beam (prominent rectangular rail) ----
    g.add(box(TRACK_W + 0.1, FT * 2.2, FT * 2.2, 0, DH / 2 + FT * 1.6, 0));

    // ---- Bottom floor threshold ----
    g.add(box(TRACK_W + 0.1, FT * 0.9, FT * 2.8, 0, -DH / 2 - FT * 0.45, 0));

    // ---- Side wall posts ----
    g.add(tube(FT * 1.3, DH + FT * 6, 'y', -(TRACK_W / 2 + 0.04), 0, 0));
    g.add(tube(FT * 1.3, DH + FT * 6, 'y',  (TRACK_W / 2 + 0.04), 0, 0));

    function buildPanel(ox, oz) {
      var p = new THREE.Group();

      // Outer frame (4 sturdy bars)
      p.add(tube(FT, DW, 'x', 0,      DH / 2, 0));   // top rail
      p.add(tube(FT, DW, 'x', 0,     -DH / 2, 0));   // bottom rail
      p.add(tube(FT, DH, 'y', -DW / 2, 0, 0));       // left stile
      p.add(tube(FT, DH, 'y',  DW / 2, 0, 0));       // right stile

      // ---- Roller hangers on top track (unmistakably "door on track") ----
      var RR = FT * 1.5;
      [-DW / 3.5, DW / 3.5].forEach(function (hx) {
        // Wheel body
        p.add(tube(RR, RR * 0.6, 'x', hx, DH / 2 + RR * 0.8 + FT * 1.1, 0));
        // Hanger arm connecting wheel to door top
        p.add(box(FT * 0.8, FT * 2.5, FT * 0.8, hx, DH / 2 + FT * 0.3, 0));
      });

      // ---- Horizontal lock rail (mid-height) — clearly door, not fence ----
      p.add(tube(FT * 0.75, DW - FT * 2.2, 'x', 0, DH * 0.08, 0));

      // ---- Inner fill: horizontal louvre slats ----
      var innerH   = DH - FT * 2.2;
      var innerW   = DW - FT * 2.5;
      var NSLATS   = 9;
      var slatH    = (innerH / NSLATS) * 0.58;   // slat thickness
      var slotStep = innerH / NSLATS;

      for (var s = 0; s < NSLATS; s++) {
        var sy = -innerH / 2 + slotStep * s + slotStep * 0.5;
        p.add(box(innerW, slatH, FT * 1.2, 0, sy, 0));
      }

      // ---- Handle: prominent vertical grip bar ----
      var handleH = 0.52;
      var handleX = DW / 2 - FT * 2.0;
      // Grip bar (extends outward in Z so it reads as 3D)
      p.add(box(FT * 1.6, handleH, FT * 1.6, handleX, 0, FT * 3.2));
      // Upper bracket
      p.add(box(FT * 0.7, FT * 0.7, FT * 3.8, handleX,  handleH * 0.46, FT * 1.4));
      // Lower bracket
      p.add(box(FT * 0.7, FT * 0.7, FT * 3.8, handleX, -handleH * 0.46, FT * 1.4));

      p.position.set(ox, 0, oz);
      return p;
    }

    // Panel 1 — almost closed (left of center)
    g.add(buildPanel(-DW * 0.1, 0));
    // Panel 2 — clearly slid open to the right (and slightly behind)
    g.add(buildPanel(DW * 0.75, -0.07));

    return g;
  }

  /* ---- Instantiate all models ---- */
  var models = [buildFence(), buildStairs(), buildDoors()];
  models.forEach(function (m, i) { m.visible = (i === 0); scene.add(m); });

  var mirror = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 0.8),
    new THREE.MeshPhysicalMaterial({ color: 0x8aaacc, metalness: 0.8, roughness: 0.3, opacity: 0.16, transparent: true })
  );
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = -1.25;
  scene.add(mirror);

  /* ---- Carousel state machine ---- */
  var SHOW_TIME    = 4.5;   // seconds each model is displayed
  var OUT_TIME     = 1.1;   // seconds for spin-out transition
  var IN_TIME      = 0.65;  // seconds for spin-in transition
  var NORMAL_SPEED = 0.35;  // rad/s while showing
  var MAX_SPEED    = 16.0;  // rad/s peak during spin-out

  var clock    = new THREE.Clock();
  var elapsed  = 0;
  var modelIdx = 0;
  var phase    = 'show';
  var phaseT   = 0;

  function easeOut(t) { var u = 1 - t; return 1 - u * u * u; }

  (function animate() {
    requestAnimationFrame(animate);
    var dt = clock.getDelta();
    elapsed += dt;
    phaseT  += dt;

    var cur  = models[modelIdx];
    var nIdx = (modelIdx + 1) % 3;
    var nxt  = models[nIdx];

    if (phase === 'show') {
      cur.rotation.y += NORMAL_SPEED * dt;
      cur.position.y  = Math.sin(elapsed * 0.55) * 0.07;

      if (phaseT >= SHOW_TIME) {
        phase  = 'out';
        phaseT = 0;
        nxt.visible = true;
        nxt.scale.setScalar(0.001);
        nxt.rotation.y = cur.rotation.y + Math.PI;
      }
    }
    else if (phase === 'out') {
      var t = Math.min(phaseT / OUT_TIME, 1);

      // Speed: quadratic ramp → rockets up fast from the start
      var speedE = t * t;
      var speed  = NORMAL_SPEED + speedE * (MAX_SPEED - NORMAL_SPEED);
      cur.rotation.y += speed * dt;

      // Scale: hold full size for first 35%, then collapse hard
      var shrinkT = Math.max(0, (t - 0.35) / 0.65);
      cur.scale.setScalar(1 - shrinkT * shrinkT);

      // Next: start appearing from 50% of the transition onward
      var growT = Math.max(0, (t - 0.5) / 0.5);
      nxt.rotation.y += NORMAL_SPEED * dt;
      nxt.scale.setScalar(growT * 0.65);

      if (t >= 1) {
        cur.visible = false;
        cur.scale.setScalar(1);
        phase  = 'in';
        phaseT = 0;
      }
    }
    else if (phase === 'in') {
      var t2 = Math.min(phaseT / IN_TIME, 1);
      var e  = easeOut(t2);
      nxt.rotation.y += NORMAL_SPEED * dt;
      nxt.scale.setScalar(0.65 + e * 0.35);
      nxt.position.y  = Math.sin(elapsed * 0.55) * 0.07 * e;

      if (t2 >= 1) {
        nxt.scale.setScalar(1);
        modelIdx = nIdx;
        phase    = 'show';
        phaseT   = 0;
      }
    }

    accent.position.x = Math.sin(elapsed * 0.6) * 4;
    accent.position.z = Math.cos(elapsed * 0.6) * 4;
    renderer.render(scene, camera);
  }());

  window.addEventListener('resize', function () {
    if (!container.offsetWidth) return;
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  });
}

function startFence() {
  requestAnimationFrame(function () { requestAnimationFrame(initFence3D); });
}

if (typeof THREE !== 'undefined') {
  startFence();
} else {
  window.addEventListener('load', function () {
    if (typeof THREE !== 'undefined') startFence();
  });
}
