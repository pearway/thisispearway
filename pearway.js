/* PEARWAY shared interactions — 부드러운 스크롤 · 등장 · 패럴럭스 · 메뉴 */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- Lenis smooth scroll ---- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    window.__lenis = lenis;
    // anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length > 1) { var t = document.querySelector(id); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -20 }); } }
      });
    });
  }

  /* ---- reveal on scroll ---- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    // 같은 줄 요소는 약간씩 늦게
    el.style.setProperty('--d', (Math.min(i, 6) * 0.04) + 's');
    io.observe(el);
  });

  /* ---- parallax: [data-par] 요소를 스크롤에 따라 살짝 이동 ---- */
  var pars = [].slice.call(document.querySelectorAll('[data-par]'));
  if (!reduce && pars.length) {
    var vh = window.innerHeight;
    window.addEventListener('resize', function () { vh = window.innerHeight; });
    function tick() {
      for (var i = 0; i < pars.length; i++) {
        var el = pars[i], r = el.getBoundingClientRect();
        var amt = parseFloat(el.getAttribute('data-par')) || 8; // vh %
        var prog = (r.top + r.height / 2 - vh / 2) / vh;        // -1 ~ 1
        el.style.transform = 'translate3d(0,' + (prog * -amt) + 'vh,0)';
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- fullscreen menu ---- */
  (function () {
    var m = document.getElementById('menu'), o = document.getElementById('menuOpen'), c = document.getElementById('menuClose');
    if (!m) return;
    function open() { m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock'); if (lenis) lenis.stop(); }
    function close() { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); if (lenis) lenis.start(); }
    if (o) o.addEventListener('click', open);
    if (c) c.addEventListener('click', close);
    m.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    /* ---- 메뉴 호버 프리뷰 (항목에 올리면 이미지가 뜸) ---- */
    (function () {
      var ml = m.querySelector('.menu-list');
      var links = ml ? ml.querySelectorAll('a') : [];
      if (!ml || !links.length) return;
      var pv = document.createElement('div'); pv.className = 'menu-pv'; pv.setAttribute('aria-hidden', 'true');
      var tiles = [];
      links.forEach(function (a) {
        var label = ((a.childNodes[0] && a.childNodes[0].textContent) || a.textContent).trim();
        var tile = document.createElement('span'); tile.className = 'pv';
        var ph = document.createElement('span'); ph.className = 'ph';
        var img = a.getAttribute('data-pv-img');
        if (img) { ph.style.backgroundImage = 'url(' + img + ')'; ph.style.backgroundSize = 'cover'; ph.style.backgroundPosition = 'center'; }
        else { ph.setAttribute('data-label', label); }
        tile.appendChild(ph); pv.appendChild(tile); tiles.push(tile);
        a.addEventListener('mouseenter', function () {
          ml.classList.add('pv-on');
          tiles.forEach(function (t, j) { t.classList.toggle('show', t === tile); });
        });
      });
      m.appendChild(pv);
      ml.addEventListener('mouseleave', function () {
        ml.classList.remove('pv-on');
        tiles.forEach(function (t) { t.classList.remove('show'); });
      });
    })();
  })();

  /* ---- 페이지 전환 (페이드) ---- */
  if (!reduce) {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href[0] === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      var isExt = /^https?:\/\//.test(href) && href.indexOf(location.host) === -1;
      if (isExt || a.target === '_blank') return;
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        document.documentElement.classList.add('leaving');
        setTimeout(function () { window.location.href = href; }, 330);
      });
    });
  }
})();

/* ---- 문의 폼 → Supabase inquiries (공용) ---- */
(function () {
  var form = document.getElementById('inq-form');
  if (!form) return;
  var SB_URL = 'https://afbdebwyddlgbphsbash.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYmRlYnd5ZGRsZ2JwaHNiYXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjE3MTcsImV4cCI6MjA5ODc5NzcxN30.JgBeIhDi8Z44VLZfCyaPa0K4lnI8ub0yg2kg2vEAmvU';
  var nameEl = document.getElementById('inq-name'), contactEl = document.getElementById('inq-contact'),
      msgEl = document.getElementById('inq-message'), submitEl = document.getElementById('inq-submit'),
      noteEl = document.getElementById('inq-msg');
  var source = form.getAttribute('data-source') || 'site';
  function setNote(t, k) { noteEl.textContent = t; noteEl.className = 'inq-msg' + (k ? ' ' + k : ''); }
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    [nameEl, contactEl].forEach(function (el) { el.classList.remove('err'); });
    var name = nameEl.value.trim(), contact = contactEl.value.trim(), message = msgEl.value.trim();
    if (!name) { nameEl.classList.add('err'); nameEl.focus(); setNote('성함 또는 업체명을 입력해 주세요.', 'bad'); return; }
    if (!contact) { contactEl.classList.add('err'); contactEl.focus(); setNote('연락받으실 연락처를 입력해 주세요.', 'bad'); return; }
    submitEl.disabled = true; setNote('보내는 중…', '');
    try {
      var res = await fetch(SB_URL + '/rest/v1/inquiries', {
        method: 'POST',
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ name: name, contact: contact, message: message, source: source, ua: navigator.userAgent.slice(0, 180) })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset(); setNote('문의가 접수되었습니다. 빠르게 연락드리겠습니다.', 'ok');
    } catch (err) { console.error(err); setNote('전송에 실패했습니다. 잠시 후 다시 시도하거나 ppearwayy@gmail.com 으로 보내 주세요.', 'bad'); }
    finally { submitEl.disabled = false; }
  });
})();
