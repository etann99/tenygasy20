(function(){
  document.addEventListener('DOMContentLoaded', function(){
    var header = document.querySelector('header');
    if(!header) return;

    function closeMobileNav(){
      header.classList.remove('nav-open');
      var burger = header.querySelector('.navburger');
      if(burger) burger.setAttribute('aria-expanded', 'false');
    }

    /* ---- repli/dépli du header ---- */
    var toggle = header.querySelector('.header-toggle');
    if(toggle){
      var KEY = 'tg20-header-collapsed';

      function apply(collapsed){
        header.classList.toggle('is-collapsed', collapsed);
        toggle.setAttribute('aria-expanded', String(!collapsed));
      }

      // Par défaut : lohapejy misokatra (déroulé). On ne replie que si
      // l'utilisateur l'a explicitement demandé lors d'une visite précédente.
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch(e){}
      apply(saved === '1');

      toggle.addEventListener('click', function(){
        var collapsed = !header.classList.contains('is-collapsed');
        apply(collapsed);
        try { localStorage.setItem(KEY, collapsed ? '1' : '0'); } catch(e){}
        closeMobileNav();
      });
    }

    /* ---- menu mobile (burger) ---- */
    var burger = header.querySelector('.navburger');
    var desktopNav = header.querySelector('.header-inner > nav');
    var mobileNav = header.querySelector('.mobile-nav');

    if(burger && desktopNav && mobileNav){
      mobileNav.innerHTML = desktopNav.innerHTML;

      burger.addEventListener('click', function(){
        if(header.classList.contains('nav-open')){
          closeMobileNav();
        } else {
          header.classList.add('nav-open');
          burger.setAttribute('aria-expanded', 'true');
        }
      });

      mobileNav.addEventListener('click', function(e){
        if(e.target.tagName === 'A') closeMobileNav();
      });

      window.addEventListener('resize', function(){
        if(window.innerWidth > 860) closeMobileNav();
      });
    }

    /* ---- apparition séquentielle au défilement ---- */
    var revealEls = document.querySelectorAll('.reveal');
    if(revealEls.length && 'IntersectionObserver' in window){
      document.body.classList.add('reveal-ready');

      // délai en cascade entre éléments voisins qui apparaissent ensemble
      revealEls.forEach(function(el){
        var siblings = Array.prototype.filter.call(el.parentElement.children, function(c){
          return c.classList.contains('reveal');
        });
        var i = siblings.indexOf(el);
        el.style.transitionDelay = (Math.min(i, 6) * 90) + 'ms';
      });

      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

      revealEls.forEach(function(el){ io.observe(el); });
    }
  });
})();

  (function(){
    document.querySelectorAll('[data-carousel]').forEach(function(carousel){
      var viewport = carousel.querySelector('.carousel-viewport');
      var track = carousel.querySelector('.carousel-track');
      var slides = Array.prototype.slice.call(track.children);
      var dotsWrap = carousel.querySelector('.carousel-dots');
      var prevBtn = carousel.querySelector('.carousel-arrow.prev');
      var nextBtn = carousel.querySelector('.carousel-arrow.next');

      slides.forEach(function(_, i){
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Sary faha-' + (i + 1));
        dot.addEventListener('click', function(){ goTo(i); });
        dotsWrap.appendChild(dot);
      });
      var dots = Array.prototype.slice.call(dotsWrap.children);

      var index = 0;
      var dragOffset = 0;
      var isDragging = false;

      function step(){
        // distance between two consecutive slides, incl. the flex gap
        return slides[0].getBoundingClientRect().width + 16;
      }

      // ideal (unclamped) offset to bring a given index to a centered "peek" position
      function idealOffset(i){
        var slideW = slides[0].getBoundingClientRect().width;
        return (viewport.clientWidth - slideW) / 2 - i * step();
      }

      function clamp(px){
        var trackW = track.scrollWidth;
        var min = Math.min(0, viewport.clientWidth - trackW);
        return Math.max(min, Math.min(0, px));
      }

      function render(withTransition, extra){
        track.style.transition = withTransition ? '' : 'none';
        var px = clamp(idealOffset(index) + (extra || 0));
        track.style.transform = 'translateX(' + px + 'px)';
      }

      function setActiveUI(){
        slides.forEach(function(s, i){ s.classList.toggle('is-active', i === index); });
        dots.forEach(function(d, i){ d.classList.toggle('is-active', i === index); });
      }

      function goTo(i){
        index = Math.max(0, Math.min(slides.length - 1, i));
        setActiveUI();
        render(true, 0);
      }

      if(prevBtn) prevBtn.addEventListener('click', function(){ goTo(index - 1); });
      if(nextBtn) nextBtn.addEventListener('click', function(){ goTo(index + 1); });

      // mouse wheel: a normal vertical wheel gesture moves the carousel
      // one slide at a time (without this, hovering it just scrolls the page)
      var wheelLocked = false;
      viewport.addEventListener('wheel', function(e){
        if(Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
        e.preventDefault();
        if(wheelLocked) return;
        wheelLocked = true;
        goTo(index + (e.deltaY > 0 ? 1 : -1));
        setTimeout(function(){ wheelLocked = false; }, 350);
      }, { passive: false });

      // drag / swipe via Pointer Events (covers mouse, touch and pen alike)
      var startX = 0;

      track.addEventListener('pointerdown', function(e){
        isDragging = true;
        dragOffset = 0;
        startX = e.clientX;
        track.classList.add('is-dragging');
        track.setPointerCapture(e.pointerId);
      });

      track.addEventListener('pointermove', function(e){
        if(!isDragging) return;
        dragOffset = e.clientX - startX;
        render(false, dragOffset);
      });

      function endDrag(e){
        if(!isDragging) return;
        isDragging = false;
        track.classList.remove('is-dragging');

        var threshold = step() * 0.22;
        if(dragOffset <= -threshold) index = Math.min(slides.length - 1, index + 1);
        else if(dragOffset >= threshold) index = Math.max(0, index - 1);

        dragOffset = 0;
        setActiveUI();
        render(true, 0);
      }

      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointercancel', endDrag);

      // avoid the native image drag/click accidentally firing after a swipe
      track.addEventListener('click', function(e){
        if(Math.abs(dragOffset) > 3){ e.preventDefault(); e.stopPropagation(); }
      }, true);

      window.addEventListener('resize', function(){ render(false, 0); });

      setActiveUI();
      render(false, 0);
    });
  })();

  (function(){
    var user = "serasera", domain = "tenygasy20.mg";
    var el = document.getElementById("emailValue");
    if(el){
      el.textContent = user + "@" + domain;
      el.href = "mailto:" + user + "@" + domain;
    }
  })();
