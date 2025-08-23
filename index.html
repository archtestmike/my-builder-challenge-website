/* ===== Footer Year ===== */
document.getElementById('year').textContent = new Date().getFullYear();

/* ===== Scroll progress ===== */
(() => {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  const onScroll = () => {
    const st = document.documentElement.scrollTop || document.body.scrollTop;
    const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (st / sh) * 100 + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ===== Digital Rain ===== */
(() => {
  const canvas = document.getElementById('digital-rain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, drops = [], columns;
  const fontSize = 16;
  const chars = '01 ☁ ✦ ✧ ✩ ✫ ✬ ✭ ✮'.split('');
  function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; columns = Math.floor(w / fontSize); drops = Array(columns).fill(1); }
  addEventListener('resize', resize); resize();
  function draw(){
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#00ffff'; ctx.font = fontSize + 'px monospace';
    for (let i=0;i<drops.length;i++){
      const t = chars[(Math.random()*chars.length)|0];
      ctx.fillText(t, i*fontSize, drops[i]*fontSize);
      if (drops[i]*fontSize > h && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.74;
    }
    requestAnimationFrame(draw);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
})();

/* ===== Starfield ===== */
(() => {
  const canvas = document.getElementById('starfield'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars = [], shooting = null, last = 0;
  const STAR_COUNT = 220; const SHOOT_MS = 5200 + Math.random() * 3800;
  function resize(){
    w = canvas.width = innerWidth; h = canvas.height = innerHeight;
    stars = Array.from({length: STAR_COUNT}, () => ({
      x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.2 + 0.25,
      a: Math.random()*0.6 + 0.2, t: Math.random()*Math.PI*2
    }));
  }
  addEventListener('resize', resize); resize();
  function spawn(){ shooting = { x: Math.random()*w, y: Math.random()*(h*0.35), vx: -(6+Math.random()*3), vy: (2+Math.random()*2), life: 0.95 }; }
  function draw(t){
    const dt = t - last; last = t;
    if (!shooting && Math.random() < dt / SHOOT_MS) spawn();
    ctx.fillStyle = '#000013'; ctx.fillRect(0,0,w,h);
    ctx.save();
    for (const s of stars){
      s.t += 0.016; const a = s.a + Math.sin(s.t) * 0.22;
      ctx.globalAlpha = Math.max(0.06, Math.min(0.85, a));
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill();
    }
    ctx.restore();
    if (shooting){
      shooting.x += shooting.vx; shooting.y += shooting.vy; shooting.life -= 0.02;
      ctx.save();
      const g = ctx.createLinearGradient(shooting.x, shooting.y, shooting.x - shooting.vx*8, shooting.y - shooting.vy*8);
      g.addColorStop(0,'rgba(255,255,255,0.95)'); g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(shooting.x, shooting.y); ctx.lineTo(shooting.x - shooting.vx*8, shooting.y - shooting.vy*8); ctx.stroke();
      ctx.restore();
      if (shooting.life <= 0 || shooting.x < -60 || shooting.y > h + 60) shooting = null;
    }
    requestAnimationFrame(draw);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(draw);
})();

/* ===== Contact form → Lambda (SNS) ===== */
(() => {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  const LAMBDA_URL = (form.dataset.lambda || '').trim(); // exact Function URL
  const btn = form.querySelector('button[type="submit"]');
  const say = (m) => { status.textContent = m; status.style.opacity = '0.95'; };

  // POST with text/plain to avoid preflight; Lambda reads JSON from event.body
  const postPlain = (url, bodyStr, signal) => fetch(url, {
    method : 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body   : bodyStr,
    mode   : 'cors',
    cache  : 'no-store',
    signal
  });

  // Fallback with application/json (in case text/plain gets rejected by a proxy)
  const postJSON = (url, obj, signal) => fetch(url, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(obj),
    mode   : 'cors',
    cache  : 'no-store',
    signal
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      name   : (fd.get('name')||'').toString().trim(),
      email  : (fd.get('email')||'').toString().trim(),
      message: (fd.get('message')||'').toString().trim(),
    };
    if (!payload.name || !payload.email || !payload.message){
      say('Please fill out all fields.'); return;
    }
    const bodyStr = JSON.stringify(payload);

    say('Sending…');
    if (btn){ btn.disabled = true; btn.style.opacity = '0.8'; }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000); // 15s safety

    try {
      let ok = false;
      // Try text/plain (simple request, no preflight)
      try {
        const r1 = await postPlain(LAMBDA_URL, bodyStr, ctrl.signal);
        ok = r1 && r1.ok;
        if (!ok) console.warn('Lambda returned non-OK to text/plain:', r1 && r1.status);
      } catch (err) {
        console.warn('text/plain fetch failed:', err);
      }
      // Fallback: application/json
      if (!ok) {
        try {
          const r2 = await postJSON(LAMBDA_URL, payload, ctrl.signal);
          ok = r2 && r2.ok;
          if (!ok) console.warn('Lambda returned non-OK to JSON:', r2 && r2.status);
        } catch (err) {
          console.warn('JSON fetch failed:', err);
        }
      }

      if (ok){
        say('Thanks! I’ll get back to you soon.');
        form.reset();
      } else {
        say('Network error. Please try again.');
      }
    } finally {
      clearTimeout(timer);
      if (btn){ btn.disabled = false; btn.style.opacity = ''; }
    }
  });
})();

/* ===== Geo Hello (unchanged) ===== */
(() => {
  const chip = document.getElementById('geo-hello'); if (!chip) return;
  const readCookie = (k) => {
    const m = document.cookie.match(new RegExp('(?:^|; )'+k.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g,'\\$&')+'=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  };
  const cfCC = readCookie('CloudFront-Viewer-Country');
  async function resolve(){
    if (cfCC && cfCC.length === 2) return cfCC;
    try {
      const r = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
      const j = await r.json();
      return (j && j.country) || '';
    } catch { return ''; }
  }
  const flag = (cc) => {
    if (!cc || cc.length !== 2) return '';
    const A = 0x1F1E6, base = 'A'.charCodeAt(0), up = cc.toUpperCase();
    return String.fromCodePoint(A + (up.charCodeAt(0)-base), A + (up.charCodeAt(1)-base));
  };
  (async () => {
    const cc = await resolve();
    if (!cc) return;
    chip.textContent = `Hello from ${flag(cc)} ${cc}`;
    chip.hidden = false;
  })();
})();

/* ===== Mini Gallery Lightbox (unchanged) ===== */
(() => {
  const root = document.getElementById('build-gallery');
  const lb   = document.getElementById('lightbox');
  if (!root || !lb) return;

  const stage    = lb.querySelector('.lb-stage');
  const btnClose = lb.querySelector('.lb-close');
  const btnPrev  = lb.querySelector('.lb-prev');
  const btnNext  = lb.querySelector('.lb-next');

  const items = Array.from(root.querySelectorAll('.gallery-item'));
  let idx = -1, token = 0;

  function cleanup(){
    const vid = stage.querySelector('video');
    if (vid) { try { vid.pause(); } catch {} vid.removeAttribute('src'); vid.load(); }
    stage.textContent = '';
  }
  function preload(i){
    const next = items[(i+1)%items.length];
    if (next && next.dataset.type === 'img'){ const img = new Image(); img.src = next.dataset.src; }
  }
  function render(i){
    const t = ++token, it = items[i]; if (!it) return;
    cleanup();
    if (it.dataset.type === 'video'){
      const v = document.createElement('video');
      v.controls = true; v.preload = 'metadata'; v.muted = true; v.playsInline = true;
      if (it.dataset.poster) v.poster = it.dataset.poster;
      v.src = it.dataset.src; stage.appendChild(v);
      const play = () => { if (t === token) v.play().catch(()=>{}); };
      v.addEventListener('canplay', play, { once: true });
    } else {
      const img = new Image(); img.alt = 'Gallery image'; img.decoding = 'async'; img.loading = 'eager';
      img.src = it.dataset.src; stage.appendChild(img);
    }
    preload(i);
  }
  function open(i){ idx = i; render(idx); lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; setTimeout(()=>btnClose.focus(),0); }
  function close(){ cleanup(); lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; idx = -1; }
  function next(){ idx = (idx + 1) % items.length; render(idx); }
  function prev(){ idx = (idx - 1 + items.length) % items.length; render(idx); }

  items.forEach((el,i)=>el.addEventListener('click',()=>open(i)));
  btnClose.addEventListener('click', close);
  btnNext .addEventListener('click', next);
  btnPrev .addEventListener('click', prev);

  lb.addEventListener('keydown', e=>{
    if (e.key!=='Tab') return;
    const focusables=[btnClose,btnPrev,btnNext], first=focusables[0], last=focusables.at(-1);
    if (e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key==='Escape') close();
    if (e.key==='ArrowRight'){ e.preventDefault(); next(); }
    if (e.key==='ArrowLeft') { e.preventDefault(); prev(); }
  });
})();
