// Shared header for every page of the buyer site: one source, so the landing page and the install guide always match.
(function () {
  // Cloudflare may serve the guide as /huong-dan or /huong-dan.html: accept both.
  var onGuide = function () { return window.__tnGuide === true || /^\/huong-dan(\.html)?\/?$/.test(location.pathname); };
  var links = [
    ['/', 'Giới thiệu'],
    ['/#tinh-nang', 'Tính năng'],
    ['/#bang-gia', 'Mua key'],
    ['/huong-dan.html', 'Hướng dẫn cài đặt']
  ];
  var css = document.createElement('style');
  css.textContent =
    '#tn-site-header{position:sticky;top:0;z-index:50;background:rgba(17,17,27,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid #313244;font:15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '#tn-site-header .in{max-width:1080px;margin:0 auto;padding:8px 16px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}' +
    '#tn-site-header .brand{font-weight:800;font-size:17px;color:#cdd6f4;text-decoration:none;margin-right:auto;padding:8px 4px;display:flex;align-items:center;gap:8px}' +
    '#tn-site-header .brand i{font-style:normal;background:linear-gradient(135deg,#cba6f7,#89b4fa);-webkit-background-clip:text;background-clip:text;color:transparent}' +
    '#tn-site-header nav{display:flex;gap:2px;flex-wrap:wrap}' +
    '#tn-site-header nav a{color:#bac2de;text-decoration:none;padding:10px 12px;border-radius:8px;min-height:40px;display:inline-flex;align-items:center}' +
    '#tn-site-header nav a:hover,#tn-site-header nav a:focus{background:#27273a;color:#fff}' +
    '#tn-site-header nav a.on{color:#cba6f7;font-weight:700}' +
    '@media(max-width:560px){#tn-site-header .in{padding:6px 10px}#tn-site-header nav{width:100%;overflow-x:auto;flex-wrap:nowrap}#tn-site-header nav a{white-space:nowrap;padding:9px 10px}}';
  document.head.appendChild(css);
  var h = document.createElement('header'); h.id = 'tn-site-header';
  var inner = document.createElement('div'); inner.className = 'in';
  var brand = document.createElement('a'); brand.className = 'brand'; brand.href = '/';
  var ic = document.createElement('span'); ic.textContent = '⚡';
  var nm = document.createElement('i'); nm.textContent = 'Auto Tiên Nghịch';
  brand.append(ic, nm);
  var nav = document.createElement('nav'); nav.setAttribute('aria-label', 'Menu');
  links.forEach(function (l) {
    var a = document.createElement('a'); a.href = l[0]; a.textContent = l[1]; nav.appendChild(a);
  });
  inner.append(brand, nav); h.appendChild(inner);
  document.body.insertBefore(h, document.body.firstChild);
  // Highlight: the guide page, or on the landing page the section that is currently at the top (scroll spy).
  var anchors = nav.querySelectorAll('a');
  function sync() {
    var idx = 0;
    if (onGuide()) idx = 3;
    else {
      var f = document.getElementById('tinh-nang'), b = document.getElementById('bang-gia');
      var y = window.pageYOffset + 140;
      if (b && y >= b.getBoundingClientRect().top + window.pageYOffset) idx = 2;
      else if (f && y >= f.getBoundingClientRect().top + window.pageYOffset) idx = 1;
    }
    for (var i = 0; i < anchors.length; i++) anchors[i].className = i === idx ? 'on' : '';
  }
  window.tnNavSync = sync;
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('hashchange', sync);
  window.addEventListener('load', sync);
  sync();
})();
