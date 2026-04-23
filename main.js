/* ═══════════════════════════════════════════
   LUXE CARS — Main JavaScript
   GSAP + ScrollTrigger + Lenis + Swiper
   ═══════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Check all libs loaded ──
  var hasGSAP = typeof gsap !== 'undefined';
  var hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
  var hasLenis = typeof Lenis !== 'undefined';
  var hasSwiper = typeof Swiper !== 'undefined';

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ── Lenis Smooth Scroll (only if available) ──
  var lenis = null;
  if (hasLenis) {
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });
      if (hasScrollTrigger) {
        lenis.on('scroll', ScrollTrigger.update);
      }
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      console.warn('Lenis init failed:', e);
      lenis = null;
    }
  }

  // ── Page Loader ──
  var loaderText = document.getElementById('loaderText');
  var loaderLine = document.getElementById('loaderLine');
  var loader = document.getElementById('loader');

  if (hasGSAP && loader) {
    gsap.to(loaderText, { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 });
    gsap.to(loaderLine, { width: 80, duration: 0.4, ease: 'power2.out', delay: 0.6 });
    setTimeout(function () {
      loader.classList.add('hide');
      setTimeout(function () {
        loader.style.display = 'none';
        runHeroAnimation();
        if (hasScrollTrigger) {
          ScrollTrigger.refresh(true);
        }
      }, 550);
    }, 1400);
  } else if (loader) {
    loader.style.display = 'none';
  }

  // ── Hero Animation ──
  function runHeroAnimation() {
    if (!hasGSAP) return;
    var tl = gsap.timeline({ delay: 0.1 });
    tl.to('#heroEyebrow', { opacity: 1, duration: 0.6, ease: 'power2.out' })
      .to('#heroHeadline', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3')
      .to('#heroSub', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
      .to('#heroButtons', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
  }

  // ── Scroll Reveal Animations (Using gsap.from for failsafe visibility) ──
  // Elements are visible by default in CSS. We animate FROM an invisible state.
  document.querySelectorAll('.reveal:not(.why-card)').forEach(function (el) {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        end: 'bottom 20%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power2.out',
    });
  });

  // Why cards — stagger reveal
  gsap.from('.why-card', {
    scrollTrigger: {
      trigger: '.why-grid',
      start: 'top 90%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: 'power2.out',
    stagger: 0.12,
  });

  // ── Trust Numbers CountUp ──
  document.querySelectorAll('.trust-number').forEach(function (numEl) {
    var target = parseFloat(numEl.getAttribute('data-target'));
    var isDecimal = numEl.getAttribute('data-decimal') === 'true';

    // Pre-set to 0 immediately so it doesn't jump when scrolled into view
    if (hasGSAP) {
      numEl.textContent = '0';
    }

    ScrollTrigger.create({
      trigger: numEl,
      start: 'top 90%',
      once: true,
      onEnter: function () {
        if (hasGSAP) {
          var obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2.5,
            ease: 'power3.out',
            onUpdate: function () {
              numEl.textContent = isDecimal ? obj.val.toFixed(1) : Math.floor(obj.val);
            },
          });
        }
      },
    });
  });

  // ── Custom Cursor (desktop only) ──
  if (window.innerWidth > 768 && hasGSAP) {
    var cursor = document.querySelector('.cursor');
    var xTo = gsap.quickTo(cursor, 'x', { duration: 0.08, ease: 'power3' });
    var yTo = gsap.quickTo(cursor, 'y', { duration: 0.08, ease: 'power3' });

    window.addEventListener('mousemove', function (e) {
      xTo(e.clientX);
      yTo(e.clientY);
    });

    document.querySelectorAll('a, button, .filter-pill, input, textarea, select').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function () {
        cursor.classList.remove('cursor-hover');
        cursor.classList.remove('cursor-view');
      });
    });

    document.querySelectorAll('[data-cursor="view"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('cursor-view'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('cursor-view'); });
    });
  }

  // ── Swiper Carousel ──
  if (hasSwiper) {
    var carSwiper = new Swiper('#carSwiper', {
      slidesPerView: 1.2,
      spaceBetween: 20,
      grabCursor: false,
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 24 },
      },
      on: { init: updateProgress, slideChange: updateProgress, progress: updateProgress },
    });

    document.getElementById('swiperPrev').addEventListener('click', function () { carSwiper.slidePrev(); });
    document.getElementById('swiperNext').addEventListener('click', function () { carSwiper.slideNext(); });

    function updateProgress() {
      var progress = carSwiper.progress || 0;
      var fill = Math.max(10, Math.min(100, progress * 100 + 10));
      var bar = document.getElementById('swiperProgress');
      if (bar) bar.style.width = fill + '%';
    }

    // ── Filter Pills ──
    document.querySelectorAll('.filter-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        document.querySelectorAll('.filter-pill').forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var filter = pill.getAttribute('data-filter');
        document.querySelectorAll('.swiper-slide').forEach(function (slide) {
          slide.style.display = (filter === 'all' || slide.getAttribute('data-category') === filter) ? '' : 'none';
        });
        carSwiper.update();
        carSwiper.slideTo(0);
      });
    });
  }

  // ── Navbar scroll behavior ──
  var navbar = document.getElementById('navbar');
  var isScrolled = false;
  
  function handleNavbarScroll(scrollY) {
    if (scrollY > 80 && !isScrolled) {
      navbar.classList.add('scrolled');
      isScrolled = true;
    } else if (scrollY <= 80 && isScrolled) {
      navbar.classList.remove('scrolled');
      isScrolled = false;
    }
  }

  window.addEventListener('scroll', function () {
    handleNavbarScroll(window.scrollY || window.pageYOffset);
  });

  if (lenis) {
    lenis.on('scroll', function (e) {
      handleNavbarScroll(e.animatedScroll || window.scrollY);
    });
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -80 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ── Enquire Now buttons → scroll to form ──
  document.querySelectorAll('.car-card-cta').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var carName = this.closest('.car-card').querySelector('.car-card-name').textContent;
      var msgEl = document.getElementById('message');
      if (msgEl) msgEl.value = 'Hi, I am interested in the ' + carName + '. Please share more details.';
      if (lenis) {
        lenis.scrollTo('#enquiry', { offset: -80 });
      } else {
        document.getElementById('enquiry').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
