/* ============================================================
   BT INŽENIRING — inzeniring.js
============================================================ */

(function () {
  'use strict';

  /* ---- Core DOM refs ---- */
  const nav         = document.getElementById('nav');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobOverlay  = document.getElementById('mobOverlay');
  const mobLinks    = document.querySelectorAll('.mob-link');
  const heroBg      = document.querySelector('.hero__bg');
  const heroOverlay = document.querySelector('.hero__overlay');
  const hero        = document.querySelector('.hero');

  /* ================================================================
     SCROLL PROGRESS BAR
  ================================================================ */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  /* ================================================================
     CUSTOM CURSOR  (desktop / pointer: fine only)
  ================================================================ */
  (function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -200, my = -200, rx = -200, ry = -200;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    (function lerp() {
      rx += (mx - rx) * 0.10;
      ry += (my - ry) * 0.10;
      ring.style.left = rx.toFixed(1) + 'px';
      ring.style.top  = ry.toFixed(1) + 'px';
      requestAnimationFrame(lerp);
    }());

    document.querySelectorAll('a, button, .svc-card, .ind-card, .acard').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        dot.classList.add('cursor--hover');
        ring.classList.add('cursor--hover');
      });
      el.addEventListener('mouseleave', function () {
        dot.classList.remove('cursor--hover');
        ring.classList.remove('cursor--hover');
      });
    });
  }());

  /* ================================================================
     MAGNETIC BUTTONS
  ================================================================ */
  document.querySelectorAll('.btn-primary, .btn-ghost, .nav__link--cta').forEach(function (btn) {
    btn.addEventListener('mouseenter', function () {
      btn.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease, background 0.3s ease';
    });
    btn.addEventListener('mousemove', function (e) {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.3;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.3;
      btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, background 0.3s ease';
      btn.style.transform  = '';
    });
  });

  /* ================================================================
     CANVAS PARTICLE NETWORK  (hero background)
  ================================================================ */
  (function initParticles() {
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;';
    hero.insertBefore(canvas, hero.querySelector('.hero__container'));

    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const N   = 60;
    const pts = Array.from({ length: N }, function () {
      return {
        x:  Math.random() * W,
        y:  Math.random() * H,
        r:  Math.random() * 1.5 + 0.4,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        a:  Math.random() * 0.45 + 0.12,
      };
    });

    (function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < N; i++) {
        var p = pts[i];
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120,175,255,' + p.a + ')';
        ctx.fill();

        for (var j = i + 1; j < N; j++) {
          var q    = pts[j];
          var dx   = p.x - q.x;
          var dy   = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(70,130,255,' + (0.12 * (1 - dist / 115)) + ')';
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }());
  }());

  /* ================================================================
     COMBINED SCROLL HANDLER  (rAF-throttled)
  ================================================================ */
  var scrollPending = false;

  function updateOnScroll() {
    var sy = window.scrollY;

    /* nav */
    nav.classList.toggle('scrolled', sy > 60);

    /* progress */
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (sy / docH * 100) + '%';

    /* hero bg parallax */
    if (heroBg) {
      heroBg.style.transform = 'scale(1.08) translateY(' + (sy * 0.28) + 'px)';
    }

    /* about photo parallax */
    var onas  = document.querySelector('.o-nas');
    var photo = document.querySelector('.about-photo');
    if (photo && onas) {
      var r   = onas.getBoundingClientRect();
      var prg = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      if (prg > 0 && prg < 1) {
        photo.style.transform = 'translateY(' + ((prg - 0.5) * 50) + 'px)';
      }
    }

    scrollPending = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollPending) {
      requestAnimationFrame(updateOnScroll);
      scrollPending = true;
    }
  }, { passive: true });
  updateOnScroll();

  /* ================================================================
     MOBILE MENU
  ================================================================ */
  function openMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    mobOverlay.classList.add('active');
    document.body.classList.add('menu-open');
  }
  function closeMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
  hamburger.addEventListener('click', function () {
    mobileMenu.classList.contains('active') ? closeMenu() : openMenu();
  });
  mobOverlay.addEventListener('click', closeMenu);
  mobLinks.forEach(function (l) { l.addEventListener('click', closeMenu); });

  /* ================================================================
     SMOOTH ANCHOR SCROLL
  ================================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 16,
        behavior: 'smooth',
      });
      closeMenu();
    });
  });

  /* ================================================================
     HERO ENTRANCE  — staggered fade-up
  ================================================================ */
  ['.hero__badge', '.hero__title', '.hero__sub', '.hero__btns', '.hero__scroll-hint']
    .map(function (s) { return document.querySelector(s); })
    .filter(Boolean)
    .forEach(function (el, i) {
      el.style.cssText += 'opacity:0;transform:translateY(30px);transition:opacity .8s ease,transform .8s ease;';
      setTimeout(function () {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      }, 260 + i * 145);
    });

  /* ================================================================
     HERO MOUSE GLOW
  ================================================================ */
  if (hero && heroOverlay) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
      var y = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
      heroOverlay.style.background =
        'linear-gradient(135deg,rgba(0,15,50,.88) 0%,rgba(0,51,231,.28) 100%),' +
        'radial-gradient(520px circle at ' + x + '% ' + y + '%,rgba(30,90,255,.18),transparent 70%)';
    });
    hero.addEventListener('mouseleave', function () { heroOverlay.style.background = ''; });
  }

  /* ================================================================
     WORD-BY-WORD HEADING REVEAL
  ================================================================ */
  document.querySelectorAll('.section-head h2').forEach(function (h2) {
    if (h2.children.length) return;
    var words = h2.textContent.trim().split(/\s+/);
    h2.innerHTML = words.map(function (w) {
      return '<span class="wr-word"><span class="wr-inner">' + w + '</span></span>';
    }).join(' ');
  });

  if ('IntersectionObserver' in window) {
    var wordObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.wr-word').forEach(function (w, i) {
          setTimeout(function () { w.classList.add('active'); }, i * 90);
        });
        wordObs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.section-head h2').forEach(function (h2) {
      wordObs.observe(h2);
    });
  }

  /* ================================================================
     SCROLL REVEAL  — .reveal elements  (3D perspective flip-in)
  ================================================================ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('visible'); }, i * 80);
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ================================================================
     STAT COUNTERS
  ================================================================ */
  var statNums  = document.querySelectorAll('.stat__num');
  var statsEl   = document.querySelector('.stats');
  var statsDone = false;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function runCounter(el, target, dur) {
    var plus     = el.querySelector('.stat__plus');
    var plusHTML = plus ? plus.outerHTML : '';
    var start    = performance.now();
    (function frame(now) {
      var t = Math.min((now - start) / dur, 1);
      el.innerHTML = Math.floor(easeOut(t) * target) + plusHTML;
      if (t < 1) requestAnimationFrame(frame);
      else        el.innerHTML = target + plusHTML;
    }(performance.now()));
  }

  if (statsEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !statsDone) {
        statsDone = true;
        statNums.forEach(function (el) {
          var n = parseInt(el.textContent.replace(/\D/g, ''), 10);
          if (!isNaN(n)) runCounter(el, n, 1700);
        });
      }
    }, { threshold: 0.5 }).observe(statsEl);
  }

  /* ================================================================
     3D CARD TILT
  ================================================================ */
  function addTilt(selector, intensity, lift) {
    document.querySelectorAll(selector).forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.12s ease, box-shadow 0.3s ease';
      });
      card.addEventListener('mousemove', function (e) {
        var r    = card.getBoundingClientRect();
        var rotX = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -(intensity || 8);
        var rotY = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  (intensity || 8);
        card.style.transform =
          'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(' + (lift || 8) + 'px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.55s ease, box-shadow 0.55s ease';
        card.style.transform  = '';
      });
    });
  }

  addTilt('.svc-card', 7, 8);
  addTilt('.acard',    5, 6);
  addTilt('.step',     4, 5);

  /* ================================================================
     SERVICE CARD SPOTLIGHT GLOW
  ================================================================ */
  document.querySelectorAll('.svc-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--gy', (e.clientY - r.top)  + 'px');
    });
  });

  /* ================================================================
     INDUSTRY CARDS — stagger entrance + bg parallax
  ================================================================ */
  var indCards = document.querySelectorAll('.ind-card');
  indCards.forEach(function (card) {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(44px) scale(0.97)';
    card.style.transition = 'opacity .7s ease, transform .7s ease';

    var bg = card.querySelector('.ind-card__bg');
    if (bg) {
      card.addEventListener('mousemove', function (e) {
        var r  = card.getBoundingClientRect();
        var dx = ((e.clientX - r.left) / r.width  - 0.5) * 14;
        var dy = ((e.clientY - r.top)  / r.height - 0.5) * 14;
        bg.style.transform = 'scale(1.12) translate(' + dx + 'px,' + dy + 'px)';
      });
      card.addEventListener('mouseleave', function () {
        bg.style.transition = 'transform 0.7s ease';
        bg.style.transform  = '';
        setTimeout(function () { bg.style.transition = ''; }, 700);
      });
    }
  });

  if (indCards.length && 'IntersectionObserver' in window) {
    var indObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
          }, i * 130);
          indObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    indCards.forEach(function (c) { indObs.observe(c); });
  }

  /* ================================================================
     PROCESS STEPS — stagger + connecting line
  ================================================================ */
  var steps     = document.querySelectorAll('.step');
  var stepsWrap = document.querySelector('.steps');

  if (steps.length && stepsWrap && 'IntersectionObserver' in window) {
    steps.forEach(function (s) {
      s.style.opacity    = '0';
      s.style.transform  = 'translateY(32px)';
      s.style.transition = 'opacity .6s ease, transform .6s ease';
    });

    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        steps.forEach(function (s, i) {
          setTimeout(function () {
            s.style.opacity   = '1';
            s.style.transform = 'translateY(0)';
          }, i * 160);
        });
      }
    }, { threshold: 0.2 }).observe(stepsWrap);
  }

  /* ================================================================
     CERT ITEMS — subtle hover lift (handled in CSS; init stagger here)
  ================================================================ */
  document.querySelectorAll('.cert-item').forEach(function (item, i) {
    item.style.opacity    = '0';
    item.style.transform  = 'translateY(20px)';
    item.style.transition = 'opacity .5s ease, transform .5s ease';

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          setTimeout(function () {
            item.style.opacity   = '1';
            item.style.transform = 'translateY(0)';
          }, i * 80);
        }
      }, { threshold: 0.3 }).observe(item);
    } else {
      item.style.opacity = '1'; item.style.transform = '';
    }
  });

}());

/* ================================================================
   3D HERO CAROUSEL — fence → stairs → sliding doors (Three.js)
================================================================ */
function initFence3D() {
  const container = document.getElementById('heroCanvas3d');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, container.offsetWidth / container.offsetHeight, 0.1, 100);
  camera.position.set(0, 0.15, 6.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.outputEncoding    = THREE.sRGBEncoding;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.9;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x202030, 1.0));
  const key  = new THREE.DirectionalLight(0xffffff, 5.0); key.position.set(4, 8, 6);   scene.add(key);
  const fill = new THREE.DirectionalLight(0x9bbfff, 3.0); fill.position.set(-5, 2, 2); scene.add(fill);
  const rim  = new THREE.DirectionalLight(0xffffff, 3.5); rim.position.set(-1, -5, -4); scene.add(rim);
  const accent = new THREE.PointLight(0x0033e7, 6.0, 18); accent.position.set(3, 3, 3); scene.add(accent);
  const warm   = new THREE.PointLight(0xfff0e0, 2.0, 12); warm.position.set(-2, -2, 4); scene.add(warm);

  const steel = new THREE.MeshPhysicalMaterial({
    color: 0xdce8f0, metalness: 1.0, roughness: 0.06,
    clearcoat: 1.0, clearcoatRoughness: 0.04, reflectivity: 1.0,
  });

  /* ---- MODEL 1: FENCE (ograda) ---- */
  function buildFence() {
    const g = new THREE.Group();
    const FW = 3.2, FH = 2.1, RAILR = 0.040, POSTR = 0.068, BALR = 0.019, BALS = 9;

    function hBar(r, len, y) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 18), steel);
      m.rotation.z = Math.PI / 2; m.position.y = y; return m;
    }
    function vBar(r, h, x, y) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.12, h, 14), steel);
      m.position.set(x, y, 0); return m;
    }
    function sph(r, x, y) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), steel);
      m.position.set(x, y, 0); return m;
    }

    g.add(hBar(RAILR,       FW - POSTR * 1.6,  FH / 2));
    g.add(hBar(RAILR * 0.8, FW - POSTR * 1.6,  0));
    g.add(hBar(RAILR,       FW - POSTR * 1.6, -FH / 2));

    [-FW / 2, FW / 2].forEach(function (x) {
      g.add(vBar(POSTR, FH + 0.22, x, 0));
      g.add(sph(POSTR * 1.4, x, (FH + 0.22) / 2 + POSTR * 1.4));
      const fl = new THREE.Mesh(new THREE.CylinderGeometry(POSTR * 2.4, POSTR * 2.4, 0.035, 18), steel);
      fl.position.set(x, -(FH + 0.22) / 2 - 0.017, 0); g.add(fl);
    });

    const balH = FH - RAILR * 2;
    const balSpan = (FW - POSTR * 2) / (BALS + 1);
    for (let i = 1; i <= BALS; i++) {
      const bx = -FW / 2 + POSTR + balSpan * i;
      g.add(vBar(BALR, balH, bx, 0));
      g.add(sph(BALR * 1.6, bx, balH / 2 + BALR * 0.8));
    }
    return g;
  }

  /* ---- MODEL 2: STAIRS (stopnice) ---- */
  function buildStairs() {
    const g = new THREE.Group();
    const NSTEPS = 8;
    const SW     = 2.2;    // step width
    const SR     = 0.20;   // rise per step
    const SD     = 0.30;   // run per step
    const TH     = 0.055;  // tread thickness
    const STRR   = 0.030;  // stringer radius
    const BALR   = 0.018;  // baluster radius
    const RAILR  = 0.022;  // handrail radius
    const POST_H = 0.88;   // handrail post height

    const totalH = NSTEPS * SR;   // 1.6
    const totalD = NSTEPS * SD;   // 2.4
    const offY   = -totalH / 2;   // -0.8
    const offZ   = -totalD / 2;   // -1.2

    function cyl(r, h, x, y, z) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), steel);
      m.position.set(x, y, z); return m;
    }
    function box(w, h, d, x, y, z) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), steel);
      m.position.set(x, y, z); return m;
    }

    // Treads — bottom step at front (z positive), top step at back (z negative)
    for (let i = 0; i < NSTEPS; i++) {
      const tY = offY + i * SR + TH / 2;
      const tZ = offZ + (NSTEPS - 1 - i) * SD + SD / 2;
      g.add(box(SW, TH, SD + 0.012, 0, tY, tZ));
    }

    // Diagonal stringers (side beams)
    const diagLen    = Math.sqrt(totalH * totalH + totalD * totalD); // ≈ 2.88
    const stairAngle = -Math.atan2(totalD, totalH);  // tilt: top→back, bottom→front

    [-SW / 2, SW / 2].forEach(function (x) {
      const s = cyl(STRR, diagLen + 0.12, x, 0, 0);
      s.rotation.x = stairAngle;
      g.add(s);
    });

    // Handrail posts along right side (every 2 steps)
    for (let j = 0; j <= NSTEPS; j += 2) {
      const pY = offY + j * SR + TH;
      const pZ = offZ + (NSTEPS - j) * SD;
      g.add(cyl(BALR, POST_H, SW / 2, pY + POST_H / 2, pZ));
    }

    // Handrail (same angle, offset up by post height)
    const diagLen2 = diagLen * 0.96;
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(RAILR, RAILR, diagLen2, 12), steel);
    rail.position.set(SW / 2, TH + POST_H, 0);
    rail.rotation.x = stairAngle;
    g.add(rail);

    // Left rail (mirror)
    const railL = rail.clone();
    railL.position.x = -SW / 2;
    g.add(railL);

    return g;
  }

  /* ---- MODEL 3: SLIDING DOORS (drsna vrata) ---- */
  function buildDoors() {
    const g = new THREE.Group();
    const DW      = 1.1;    // single door panel width
    const DH      = 2.2;    // door height (taller = more door-like)
    const FT      = 0.040;  // frame bar half-size
    const TRACK_W = DW * 2 + 0.35;

    function tube(r, len, axis, x, y, z) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), steel);
      if (axis === 'x') m.rotation.z = Math.PI / 2;
      if (axis === 'z') m.rotation.x = Math.PI / 2;
      m.position.set(x, y, z); return m;
    }
    function box(w, h, d, x, y, z) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), steel);
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
      const p = new THREE.Group();

      // Outer frame (4 sturdy bars)
      p.add(tube(FT, DW, 'x', 0,      DH / 2, 0));   // top rail
      p.add(tube(FT, DW, 'x', 0,     -DH / 2, 0));   // bottom rail
      p.add(tube(FT, DH, 'y', -DW / 2, 0, 0));       // left stile
      p.add(tube(FT, DH, 'y',  DW / 2, 0, 0));       // right stile

      // ---- Roller hangers on top track (unmistakably "door on track") ----
      const RR = FT * 1.5;
      [-DW / 3.5, DW / 3.5].forEach(function (hx) {
        // Wheel body
        p.add(tube(RR, RR * 0.6, 'x', hx, DH / 2 + RR * 0.8 + FT * 1.1, 0));
        // Hanger arm connecting wheel to door top
        p.add(box(FT * 0.8, FT * 2.5, FT * 0.8, hx, DH / 2 + FT * 0.3, 0));
      });

      // ---- Horizontal lock rail (mid-height) — clearly door, not fence ----
      p.add(tube(FT * 0.75, DW - FT * 2.2, 'x', 0, DH * 0.08, 0));

      // ---- Inner fill: horizontal louvre slats ----
      // Slats are horizontal boxes → nothing like a fence's vertical bars
      const innerH  = DH - FT * 2.2;
      const innerW  = DW - FT * 2.5;
      const NSLATS  = 9;
      const slatH   = (innerH / NSLATS) * 0.58;   // slat thickness
      const slotStep = innerH / NSLATS;

      for (let s = 0; s < NSLATS; s++) {
        const sy = -innerH / 2 + slotStep * s + slotStep * 0.5;
        p.add(box(innerW, slatH, FT * 1.2, 0, sy, 0));
      }

      // ---- Handle: prominent vertical grip bar ----
      const handleH = 0.52;
      const handleX = DW / 2 - FT * 2.0;
      // Grip bar (extends outward in Z so it reads as 3D)
      p.add(box(FT * 1.6, handleH, FT * 1.6, handleX, 0, FT * 3.2));
      // Upper bracket
      p.add(box(FT * 0.7, FT * 0.7, FT * 3.8, handleX, handleH * 0.46, FT * 1.4));
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
  const models = [buildFence(), buildStairs(), buildDoors()];
  models.forEach(function (m, i) { m.visible = (i === 0); scene.add(m); });

  const mirror = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 0.8),
    new THREE.MeshPhysicalMaterial({ color: 0x8aaacc, metalness: 0.8, roughness: 0.3, opacity: 0.16, transparent: true })
  );
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = -1.25;
  scene.add(mirror);

  /* ---- Carousel state machine ---- */
  const SHOW_TIME    = 4.5;   // seconds each model is displayed
  const OUT_TIME     = 1.1;   // seconds for spin-out transition
  const IN_TIME      = 0.65;  // seconds for spin-in transition
  const NORMAL_SPEED = 0.35;  // rad/s while showing
  const MAX_SPEED    = 16.0;  // rad/s peak during spin-out

  const clock = new THREE.Clock();
  let elapsed  = 0;
  let modelIdx = 0;
  let phase    = 'show';
  let phaseT   = 0;

  function easeOut(t) { const u = 1 - t; return 1 - u * u * u; }

  (function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    elapsed += dt;
    phaseT  += dt;

    const cur  = models[modelIdx];
    const nIdx = (modelIdx + 1) % 3;
    const nxt  = models[nIdx];

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
      const t = Math.min(phaseT / OUT_TIME, 1);

      // Speed: quadratic ramp → rockets up fast from the start
      const speedE = t * t;
      const speed  = NORMAL_SPEED + speedE * (MAX_SPEED - NORMAL_SPEED);
      cur.rotation.y += speed * dt;

      // Scale: hold full size for first 35%, then collapse hard
      const shrinkT = Math.max(0, (t - 0.35) / 0.65);
      cur.scale.setScalar(1 - shrinkT * shrinkT);

      // Next: start appearing from 50% of the transition onward
      const growT = Math.max(0, (t - 0.5) / 0.5);
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
      const t = Math.min(phaseT / IN_TIME, 1);
      const e = easeOut(t);
      nxt.rotation.y += NORMAL_SPEED * dt;
      nxt.scale.setScalar(0.65 + e * 0.35);
      nxt.position.y  = Math.sin(elapsed * 0.55) * 0.07 * e;

      if (t >= 1) {
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
