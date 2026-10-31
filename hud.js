/* ============================================================
   PEARWAY HUD — self-contained 장비 프레임 로직 (flormonde·peartype 공용)
   옵션: window.HUD_OPTS = { frame, scan, reticle, boot, standby } (기본 전부 true)
   ============================================================ */
(function () {
  var O = window.HUD_OPTS || {};
  function on(k){ return O[k] !== false; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var hoverable = window.matchMedia && window.matchMedia('(hover:hover)').matches;
  function two(n){ return String(n).padStart(2, '0'); }
  function run(){

    /* 프레임 + 파형 + 클럭 + 커서좌표 */
    if (on('frame') && !document.querySelector('.hud')) {
      var hud = document.createElement('div'); hud.className = 'hud'; hud.setAttribute('aria-hidden', 'true');
      hud.innerHTML = '<span class="tick tl"></span><span class="tick tr"></span><span class="tick bl"></span><span class="tick br"></span>'
        + '<span class="rd r-bl"><span id="__hudClock">SEOUL ··:··:··</span></span>'
        + (on('pos') ? '<span class="rd r-br" id="__hudPos">X000 Y000</span>' : '');
      document.body.appendChild(hud);
      var ck = document.getElementById('__hudClock');
      function tick(){ var d = new Date(); ck.textContent = 'SEOUL ' + two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()); }
      tick(); setInterval(tick, 1000);
      if (on('pos') && !reduce && hoverable) {
        var pos = document.getElementById('__hudPos');
        window.addEventListener('mousemove', function (e) {
          pos.textContent = 'X' + String(Math.round(e.clientX)).padStart(3, '0') + ' Y' + String(Math.round(e.clientY)).padStart(3, '0');
        }, { passive: true });
      }
      if (!reduce && hoverable) {
        /* 신호 파형 */
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg'); svg.setAttribute('class', 'wave'); svg.setAttribute('viewBox', '0 0 86 14'); svg.setAttribute('preserveAspectRatio', 'none');
        var path = document.createElementNS(ns, 'path'); svg.appendChild(path); hud.appendChild(svg);
        var t = 0;
        (function draw(){ t += 0.08; var d = 'M0 7'; for (var x = 0; x <= 86; x += 3) {
          var y = 7 + Math.sin(x * 0.35 + t) * 2.4 * Math.sin(t * 0.7) + (Math.random() - 0.5) * 1.1; d += ' L' + x + ' ' + y.toFixed(1); }
          path.setAttribute('d', d); requestAnimationFrame(draw); })();
      }
    }

    /* 스캔라인 */
    if (on('scan') && !reduce && !document.querySelector('.hud-scan')) {
      var sc = document.createElement('div'); sc.className = 'hud-scan'; sc.setAttribute('aria-hidden', 'true'); document.body.appendChild(sc);
    }

    /* 리티클 + 크로스헤어 */
    if (on('reticle') && hoverable && !reduce && !document.querySelector('.hud-ret')) {
      var xx = document.createElement('div'); xx.className = 'hud-xh hud-xh-x';
      var xy = document.createElement('div'); xy.className = 'hud-xh hud-xh-y';
      var ret = document.createElement('div'); ret.className = 'hud-ret';
      ret.innerHTML = '<i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i>';
      document.body.appendChild(xx); document.body.appendChild(xy); document.body.appendChild(ret);
      document.body.classList.add('hud-reticle');
      window.addEventListener('mousemove', function (e) {
        xx.style.top = e.clientY + 'px'; xy.style.left = e.clientX + 'px';
        ret.style.left = e.clientX + 'px'; ret.style.top = e.clientY + 'px';
        if (!ret.classList.contains('live')) { ret.classList.add('live'); xx.classList.add('live'); xy.classList.add('live'); }
        var hot = e.target && e.target.closest && e.target.closest('a[href],button,input,textarea,select,.card,.nav-burger,.btn');
        ret.classList.toggle('hot', !!hot);
      }, { passive: true });
      window.addEventListener('mouseleave', function () { ret.classList.remove('live'); xx.classList.remove('live'); xy.classList.remove('live'); });
    }

    /* 부팅 (세션당 1회) */
    if (on('boot') && !reduce && !document.querySelector('.hud-boot')) {
      var seen = false; try { seen = !!sessionStorage.getItem('pw_booted'); } catch (e) {}
      if (!seen) {
        try { sessionStorage.setItem('pw_booted', '1'); } catch (e) {}
        var boot = document.createElement('div'); boot.className = 'hud-boot'; boot.setAttribute('aria-hidden', 'true');
        boot.innerHTML = '<pre id="__hudBootLog"></pre>'; document.body.appendChild(boot);
        document.body.classList.add('hud-booting');
        var blog = document.getElementById('__hudBootLog');
        var lines = (O.bootLines) || ['PEARWAY // DESIGN SYSTEM', 'SEOUL · EST 2026', '',
          '> BOOT CORE ................. <ok>OK</ok>', '> MOUNT MODULES [04] ........ <ok>OK</ok>',
          '    01 GRAPHIC   · <ok>ONLINE</ok>', '    02 SIGNAGE   · <ok>ONLINE</ok>',
          '    03 TYPE      · <ok>LINKED</ok>', '    04 OBJET     · <ok>LINKED</ok>',
          '> INTERFACE ................. <ok>READY</ok>', '', '> ENTER<ok>▌</ok>'];
        var i = 0, html = '';
        function esc(s){ return s.replace(/<ok>/g, '<span class="ok">').replace(/<\/ok>/g, '</span>'); }
        (function next(){ if (i < lines.length) { html += (i ? '\n' : '') + esc(lines[i]); blog.innerHTML = html; i++;
          setTimeout(next, i <= 2 ? 120 : (lines[i-1] && lines[i-1].indexOf('·') > -1 ? 65 : 140)); }
          else setTimeout(function(){ boot.classList.add('done'); document.body.classList.remove('hud-booting');
            setTimeout(function(){ boot.style.display = 'none'; }, 650); }, 480); })();
      }
    }

    /* 아이들 STANDBY */
    if (on('standby') && !reduce && !document.querySelector('.hud-standby')) {
      var sb = document.createElement('div'); sb.className = 'hud-standby'; sb.setAttribute('aria-hidden', 'true');
      sb.innerHTML = '<span class="sb"><span class="pls"></span><b>STANDBY</b>SIGNAL HOLD · MOVE TO RESUME</span>';
      document.body.appendChild(sb);
      var idT;
      function wake(){ sb.classList.remove('on'); clearTimeout(idT); idT = setTimeout(function(){ sb.classList.add('on'); }, 24000); }
      ['mousemove', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(function (ev) { window.addEventListener(ev, wake, { passive: true }); });
      wake();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
