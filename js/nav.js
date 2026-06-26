/* ============================================================
   nav.js — Navigation behaviour (scroll class + mobile menu)
============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var nav        = document.getElementById('nav');
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobOverlay = document.getElementById('mobOverlay');
  var mobLinks   = document.querySelectorAll('.mob-link');

  /* ================================================================
     SCROLL — add/remove .scrolled on #nav
  ================================================================ */
  var scrollPending = false;

  function updateNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
    scrollPending = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollPending) {
      requestAnimationFrame(updateNav);
      scrollPending = true;
    }
  }, { passive: true });

  updateNav();

  /* ================================================================
     MOBILE MENU
  ================================================================ */
  function openMenu() {
    if (hamburger)  hamburger.classList.add('active');
    if (mobileMenu) mobileMenu.classList.add('active');
    if (mobOverlay) mobOverlay.classList.add('active');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    if (hamburger)  hamburger.classList.remove('active');
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (mobOverlay) mobOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      mobileMenu && mobileMenu.classList.contains('active') ? closeMenu() : openMenu();
    });
  }

  if (mobOverlay) {
    mobOverlay.addEventListener('click', closeMenu);
  }


  mobLinks.forEach(function (l) {
    l.addEventListener('click', closeMenu);
  });

  /* Mobile Storitve accordion */
  document.querySelectorAll('.mob-dropdown-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpen = this.classList.contains('open');
      this.classList.toggle('open', !isOpen);
      var sub = this.nextElementSibling;
      if (sub) sub.classList.toggle('open', !isOpen);
    });
  });

  /* ================================================================
     SMOOTH ANCHOR SCROLL (closes menu on nav links)
  ================================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var navH = nav ? nav.offsetHeight : 0;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH - 16,
        behavior: 'smooth',
      });
      closeMenu();
    });
  });
});
