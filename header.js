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
  });
})();


