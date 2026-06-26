/* ============================================================
   animations.js — All animations & interactive visual effects
============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var hero        = document.querySelector('.hero');
  var heroOverlay = document.querySelector('.hero__overlay');
  var heroBg      = document.querySelector('.hero__bg');

  /* ================================================================
     SCROLL PROGRESS BAR
  ================================================================ */
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  /* ================================================================
     CUSTOM CURSOR  (desktop / pointer: fine only)
  ================================================================ */
  (function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var dot  = document.createElement('div');
    var ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = -200, my = -200, rx = -200, ry = -200;

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
      var r  = btn.getBoundingClientRect();
      var dx = (e.clientX - r.left - r.width  / 2) * 0.3;
      var dy = (e.clientY - r.top  - r.height / 2) * 0.3;
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

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;';
    hero.insertBefore(canvas, hero.querySelector('.hero__container'));

    var ctx = canvas.getContext('2d');
    var W, H;

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var N   = 60;
    var pts = Array.from({ length: N }, function () {
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

    /* progress bar */
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
     SERVICE CARD SPOTLIGHT GLOW  (--gx, --gy CSS variables)
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
     CERT ITEMS — init stagger
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

});
