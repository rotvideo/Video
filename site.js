/* rotvideo.ch — gemeinsames Skript für alle Seiten (sprachneutral) */
(function(){
  /* ---- Kopfzeile: Hintergrund nach dem Scrollen ---- */
  var topBar=document.getElementById('topBar');
  if(topBar){
    var onScroll=function(){ topBar.classList.toggle('scrolled',window.scrollY>40); };
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }

  /* ---- Einblenden beim Scrollen ---- */
  var reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{threshold:.08,rootMargin:'0px 0px -6% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  }else{
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---- YouTube-Vorschaubilder: fehlt die grosse Fassung, die kleinere laden ---- */
  document.querySelectorAll('img[data-fallback]').forEach(function(img){
    var swap=function(){
      var fb=img.getAttribute('data-fallback');
      if(fb){ img.removeAttribute('data-fallback'); img.src=fb; }
    };
    var check=function(){ if(img.naturalWidth && img.naturalWidth<=120) swap(); };
    img.addEventListener('load',check);
    img.addEventListener('error',swap);
    if(img.complete) check();
  });

  /* ---- Video-Popup ---- */
  var vmodal=document.getElementById('vmodal');
  if(vmodal){
    var vframe=document.getElementById('vmodalIframe');
    var vtitle=document.getElementById('vmodalTitle');
    var vmsg=document.getElementById('vmodalMsg');
    var vtabs=document.getElementById('vmodalTabs');
    var vLastFocus=null;

    var setVideo=function(url){
      if(url){
        vframe.src=url+(url.indexOf('?')>-1?'&':'?')+'autoplay=1';
        vframe.style.display='';
        vmsg.style.display='none';
      }else{
        vframe.removeAttribute('src');
        vframe.style.display='none';
        vmsg.style.display='';
      }
    };
    var openVideo=function(url,title,url2,label1,label2){
      vLastFocus=document.activeElement;
      vtitle.textContent=title||'';
      vtabs.innerHTML='';
      if(url2){
        vtabs.classList.add('show');
        var b1=document.createElement('button'); b1.className='vmodal-tab active'; b1.type='button'; b1.textContent=label1||'Video 1';
        var b2=document.createElement('button'); b2.className='vmodal-tab'; b2.type='button'; b2.textContent=label2||'Video 2';
        b1.addEventListener('click',function(){ setVideo(url); b1.classList.add('active'); b2.classList.remove('active'); });
        b2.addEventListener('click',function(){ setVideo(url2); b2.classList.add('active'); b1.classList.remove('active'); });
        vtabs.appendChild(b1); vtabs.appendChild(b2);
      }else{
        vtabs.classList.remove('show');
      }
      setVideo(url||'');
      vmodal.classList.add('open');
      vmodal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
      vmodal.querySelector('.vmodal-close').focus();
    };
    var closeVideo=function(){
      vmodal.classList.remove('open');
      vmodal.setAttribute('aria-hidden','true');
      vframe.removeAttribute('src');
      document.body.style.overflow='';
      if(vLastFocus) vLastFocus.focus();
    };
    document.querySelectorAll('.film').forEach(function(c){
      c.addEventListener('click',function(e){
        if(e.metaKey||e.ctrlKey||e.shiftKey) return; /* neuer Tab bleibt möglich */
        e.preventDefault();
        var d=c.dataset;
        openVideo(d.video||'',d.title||'',d.video2||'',d.label1||'',d.label2||'');
      });
    });
    vmodal.querySelectorAll('[data-close]').forEach(function(el){ el.addEventListener('click',closeVideo); });
    window.addEventListener('keydown',function(e){ if(e.key==='Escape'&&vmodal.classList.contains('open')) closeVideo(); });
  }

  /* ---- Hero-Video sicher starten ---- */
  var heroVid=document.querySelector('.hero video');
  if(heroVid){
    heroVid.muted=true;
    heroVid.setAttribute('muted','');
    heroVid.playsInline=true;
    var tryPlay=function(){ var p=heroVid.play(); if(p&&p.catch) p.catch(function(){}); };
    tryPlay();
    heroVid.addEventListener('canplay',tryPlay,{once:true});
    ['click','touchstart','scroll','keydown'].forEach(function(ev){
      window.addEventListener(ev,tryPlay,{once:true,passive:true});
    });
  }

  /* ---- Cookie-Zustimmung: Google-Tag lädt erst nach «Akzeptieren» ---- */
  var banner=document.getElementById('cookieBanner');
  if(banner){
    var CONSENT_KEY='rotvideo-consent', GADS_ID='AW-17185410340';
    var loadGtag=function(){
      if(window.__gtagLoaded) return;
      window.__gtagLoaded=true;
      window.dataLayer=window.dataLayer||[];
      window.gtag=function(){ window.dataLayer.push(arguments); };
      window.gtag('js',new Date());
      window.gtag('config',GADS_ID);
      var s=document.createElement('script');
      s.async=true;
      s.src='https://www.googletagmanager.com/gtag/js?id='+GADS_ID;
      document.head.appendChild(s);
    };
    var showBanner=function(){ banner.classList.add('show'); };
    var hideBanner=function(){ banner.classList.remove('show'); };
    var setConsent=function(value){
      try{ localStorage.setItem(CONSENT_KEY,value); }catch(e){}
      hideBanner();
      if(value==='granted') loadGtag();
    };
    var stored;
    try{ stored=localStorage.getItem(CONSENT_KEY); }catch(e){ stored=null; }
    if(stored==='granted'){ loadGtag(); }
    else if(stored!=='denied'){ setTimeout(showBanner,600); }

    document.getElementById('cookieAccept').addEventListener('click',function(){ setConsent('granted'); });
    document.getElementById('cookieDecline').addEventListener('click',function(){ setConsent('denied'); });
    var settings=document.getElementById('cookieSettingsLink');
    if(settings) settings.addEventListener('click',function(e){ e.preventDefault(); showBanner(); });
  }
})();
