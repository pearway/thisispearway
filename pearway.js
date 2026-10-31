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
  document.querySelectorAll('.reveal, .rline').forEach(function (el, i) {
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

/* ============================================================
   PEARWAY shell — 전 페이지 공통 디테일/모션 (그레인·진행바·네비 거동·마그네틱)
   하나의 웹으로 읽히게 하는 스파인. pearway.css 와 짝.
   ============================================================ */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var root = document.documentElement;

  /* ---- 필름 그레인 (은은한 질감) ---- */
  if (!document.querySelector('.grain')) {
    var g = document.createElement('div');
    g.className = 'grain'; g.setAttribute('aria-hidden', 'true');
    document.body.appendChild(g);
  }

  /* ---- 스크롤 진행바 (상단 실버 라인) ---- */
  var prog = document.createElement('div');
  prog.className = 'scroll-prog'; prog.setAttribute('aria-hidden', 'true');
  document.body.appendChild(prog);
  function setProg(y) {
    var h = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    prog.style.transform = 'scaleX(' + Math.max(0, Math.min(1, y / h)) + ')';
  }

  /* ---- 네비 거동: 스크롤 시 유리막, 내릴 땐 숨고 올릴 땐 등장 ---- */
  var nav = document.querySelector('nav');
  var lastY = window.scrollY || 0, navHidden = false;
  function onScroll(y) {
    y = (typeof y === 'number') ? y : (window.scrollY || 0);
    setProg(y);
    if (!nav) return;
    if (y > 8) nav.classList.add('nav-solid'); else nav.classList.remove('nav-solid');
    var dy = y - lastY;
    if (y > 160 && dy > 4 && !navHidden) { nav.classList.add('nav-up'); navHidden = true; }
    else if ((dy < -4 || y < 120) && navHidden) { nav.classList.remove('nav-up'); navHidden = false; }
    lastY = y;
  }
  if (window.__lenis && window.__lenis.on) window.__lenis.on('scroll', function (e) { onScroll(e.scroll); });
  else window.addEventListener('scroll', function () { onScroll(); }, { passive: true });
  onScroll(0);

  /* ---- 마그네틱: [data-mag] 요소가 커서를 살짝 따라옴 ---- */
  if (!reduce && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('[data-mag]').forEach(function (el) {
      var s = parseFloat(el.getAttribute('data-mag')) || 0.3;
      el.style.willChange = 'transform';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x * s) + 'px,' + (y * s) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
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

/* ---- HUD 프레임 주입 (hub 제외 전 페이지 공유 장비 프레임) ---- */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (document.querySelector('.hud')) return; // hub은 자체 인라인 HUD
  var label = document.body.getAttribute('data-hud') || 'PEARWAY ⁄ SYSTEM';
  var hud = document.createElement('div'); hud.className = 'hud'; hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML = '<span class="tick tl"></span><span class="tick tr"></span><span class="tick bl"></span><span class="tick br"></span>'
    + '<span class="rd r-bl"><span id="__hudClock">SEOUL ··:··:··</span></span>'
    + '<span class="rd r-br" id="__hudPos">X000 Y000</span>';
  document.body.appendChild(hud);
  var scan = document.createElement('div'); scan.className = 'scan'; scan.setAttribute('aria-hidden', 'true');
  document.body.appendChild(scan);
  var ck = document.getElementById('__hudClock');
  function two(n){ return String(n).padStart(2, '0'); }
  function tick(){ var d = new Date(); ck.textContent = 'SEOUL ' + two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()); }
  tick(); setInterval(tick, 1000);
  if (!reduce && window.matchMedia('(hover:hover)').matches) {
    var p = document.getElementById('__hudPos');
    window.addEventListener('mousemove', function (e) {
      p.textContent = 'X' + String(Math.round(e.clientX)).padStart(3, '0') + ' Y' + String(Math.round(e.clientY)).padStart(3, '0');
    }, { passive: true });
  }
})();

/* ---- HUD INTERACTIVE (공유) — 리티클·크로스헤어·부팅·STANDBY·파형·메뉴내비 ---- */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var hoverable = window.matchMedia && window.matchMedia('(hover:hover)').matches;

  /* 리티클 + 크로스헤어 (hub은 자체 보유 → 없을 때만 주입) */
  if (hoverable && !reduce && !document.getElementById('reticle')) {
    var xx = document.createElement('div'); xx.className = 'xh xh-x'; xx.id = 'xhX';
    var xy = document.createElement('div'); xy.className = 'xh xh-y'; xy.id = 'xhY';
    var ret = document.createElement('div'); ret.className = 'reticle'; ret.id = 'reticle';
    ret.innerHTML = '<i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i><span class="cd"></span>';
    document.body.appendChild(xx); document.body.appendChild(xy); document.body.appendChild(ret);
    document.body.classList.add('reticle-on');
    window.addEventListener('mousemove', function (e) {
      xx.style.top = e.clientY + 'px'; xy.style.left = e.clientX + 'px';
      ret.style.left = e.clientX + 'px'; ret.style.top = e.clientY + 'px';
      if (!ret.classList.contains('live')) { ret.classList.add('live'); xx.classList.add('live'); xy.classList.add('live'); }
      var hot = e.target && e.target.closest && e.target.closest('a[href],button,input,textarea,select,.work,.div,.card,.mod');
      ret.classList.toggle('hot', !!hot);
    }, { passive: true });
    window.addEventListener('mouseleave', function () { ret.classList.remove('live'); xx.classList.remove('live'); xy.classList.remove('live'); });
  }

  /* 부팅 시퀀스 (hub은 자체 보유 → 없을 때만, 세션당 1회) */
  (function () {
    if (reduce || document.getElementById('boot')) return;
    var seen = false; try { seen = !!sessionStorage.getItem('pw_booted'); } catch (e) {}
    if (seen) return;
    try { sessionStorage.setItem('pw_booted', '1'); } catch (e) {}
    var boot = document.createElement('div'); boot.className = 'boot'; boot.id = 'boot'; boot.setAttribute('aria-hidden', 'true');
    boot.innerHTML = '<pre id="__bootLog"></pre>'; document.body.appendChild(boot);
    document.body.classList.add('booting'); if (window.__lenis) window.__lenis.stop();
    var log = document.getElementById('__bootLog');
    var lines = ['PEARWAY // DESIGN SYSTEM', 'SEOUL · EST 2026', '',
      '> BOOT CORE ................. <ok>OK</ok>', '> MOUNT MODULES [04] ........ <ok>OK</ok>',
      '    01 GRAPHIC   · <ok>ONLINE</ok>', '    02 SIGNAGE   · <ok>ONLINE</ok>',
      '    03 TYPE      · <ok>LINKED</ok>', '    04 OBJET     · <ok>LINKED</ok>',
      '> INTERFACE ................. <ok>READY</ok>', '', '> ENTER<ok>▌</ok>'];
    var i = 0, html = '';
    function esc(s){ return s.replace(/<ok>/g,'<span class="ok">').replace(/<\/ok>/g,'</span>'); }
    function next(){ if (i < lines.length) { html += (i?'\n':'') + esc(lines[i]); log.innerHTML = html; i++;
      setTimeout(next, i <= 2 ? 120 : (lines[i-1] && lines[i-1].indexOf('·') > -1 ? 65 : 140)); }
      else setTimeout(end, 480); }
    function end(){ boot.classList.add('done'); document.body.classList.remove('booting'); if (window.__lenis) window.__lenis.start();
      setTimeout(function(){ boot.style.display = 'none'; }, 650); }
    next();
  })();

  /* 아이들 STANDBY (전 페이지) */
  if (!reduce) {
    var sb = document.createElement('div'); sb.className = 'standby'; sb.setAttribute('aria-hidden', 'true');
    sb.innerHTML = '<span class="sb"><span class="pls"></span><b>STANDBY</b>SIGNAL HOLD · MOVE TO RESUME</span>';
    document.body.appendChild(sb);
    var idT;
    function wake(){ sb.classList.remove('on'); clearTimeout(idT); idT = setTimeout(function(){ sb.classList.add('on'); }, 24000); }
    ['mousemove','keydown','scroll','touchstart','wheel'].forEach(function(ev){ window.addEventListener(ev, wake, { passive: true }); });
    wake();
  }

  /* 신호 파형 (.hud 하단 중앙) */
  var hudEl = document.querySelector('.hud');
  if (hudEl && !reduce && !hudEl.querySelector('.wave')) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg'); svg.setAttribute('class', 'wave'); svg.setAttribute('viewBox', '0 0 86 14'); svg.setAttribute('preserveAspectRatio', 'none');
    var path = document.createElementNS(ns, 'path'); svg.appendChild(path); hudEl.appendChild(svg);
    var t = 0, raf;
    function draw(){ t += 0.08; var d = 'M0 7'; for (var x = 0; x <= 86; x += 3) {
      var y = 7 + Math.sin(x * 0.35 + t) * 2.4 * Math.sin(t * 0.7) + (Math.random() - 0.5) * 1.1; d += ' L' + x + ' ' + y.toFixed(1); }
      path.setAttribute('d', d); raf = requestAnimationFrame(draw); }
    draw();
  }

  /* 메뉴 = 시스템 내비 (SELECT DESTINATION + 인덱스) */
  var ml = document.querySelector('#menu .menu-list');
  if (ml && !document.querySelector('#menu .menu-sel')) {
    var sel = document.createElement('div'); sel.className = 'menu-sel';
    sel.innerHTML = '<span>Select Destination</span><span>PEARWAY ⁄ SYSTEM</span>';
    ml.parentNode.insertBefore(sel, ml);
    var links = ml.querySelectorAll('a');
    links.forEach(function (a, i) {
      if (a.querySelector('.m-ix')) return;
      var ix = document.createElement('span'); ix.className = 'm-ix'; ix.textContent = String(i + 1).padStart(2, '0');
      a.insertBefore(ix, a.firstChild);
    });
  }
})();

/* ---- WORK CATALOG — 행 호버 → 프리뷰 모니터 + 텔레메트리 ---- */
(function () {
  var list = document.querySelector('.cat-list'); if (!list) return;
  var prev = document.querySelector('.cat-prev'); if (!prev) return;
  var rows = [].slice.call(list.querySelectorAll('.cat-row'));
  var img = prev.querySelector('.shot img'), shot = prev.querySelector('.shot'),
      cap = prev.querySelector('.cap'), idx = prev.querySelector('.idx'), spec = prev.querySelector('.spec');
  var n = rows.length, bars = ['▓▓▓▓', '▓▓▓░', '▓▓▓▓', '▓▓░░'];
  function show(r, i) {
    rows.forEach(function (x) { x.classList.remove('on'); }); r.classList.add('on');
    if (spec) { spec.innerHTML = 'CH ' + String(i + 1).padStart(2, '0') + ' <b>QUERYING</b> ▓░░░';
      clearTimeout(spec.__t); spec.__t = setTimeout(function () {
        spec.innerHTML = 'CH ' + String(i + 1).padStart(2, '0') + '<br><b>ONLINE</b><br>SIGNAL ' + bars[i % bars.length]; }, 240); }
    if (shot) shot.classList.remove('on');
    setTimeout(function () {
      if (img) img.src = r.getAttribute('data-shot');
      if (cap) cap.textContent = r.getAttribute('data-cap') || '';
      if (idx) idx.textContent = String(i + 1).padStart(2, '0') + ' ⁄ ' + String(n).padStart(2, '0');
      if (shot) shot.classList.add('on');
    }, 60);
  }
  rows.forEach(function (r, i) { r.addEventListener('mouseenter', function () { show(r, i); }); });
  if (rows[0]) show(rows[0], 0);
})();
