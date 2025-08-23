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
  window.addEventListener('scroll', onScroll, {passive:true});
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

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    columns = Math.floor(w / fontSize);
    drops = Array(columns).fill(1);
  }
  window.addEventListener('resize', resize);
  resize();

  function draw(){
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#00ffff';
    ctx.font = fontSize + 'px monospace';
    for (let i=0;i<drops.length;i++){
      const text = chars[(Math.random() * chars.length)|0];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.9;
    }
    requestAnimationFrame(draw);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
})();

/* ===== Starfield (shooting stars) ===== */
(() => {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, stars = [], shooting = null, last = 0;
  const STAR_COUNT = 220;
  const SHOOT_MS = 4200 + Math.random() * 2800;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = Array.from({length: STAR_COUNT}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.25,
      a: Math.random() * 0.6 + 0.2,
      t: Math.random() * Math.PI * 2
    }));
  }
  window.addEventListener('resize', resize);
  resize();

  function spawnShooting(){
    shooting = {
      x: Math.random() * w,
      y: Math.random() * (h * 0.35),
      vx: - (6 + Math.random() * 3),
      vy: (2 + Math.random() * 2),
      life: 0.95
    };
  }

  function draw(t){
    const dt = t - last; last = t;
    if (!shooting && Math.random() < dt / SHOOT_MS) spawnShooting();

    ctx.fillStyle = '#000013';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    for (const s of stars){
      s.t += 0.02;
      const alpha = s.a + Math.sin(s.t) * 0.22;
      ctx.globalAlpha = Math.max(0.06, Math.min(0.85, alpha));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    }
    ctx.restore();

    if (shooting){
      shooting.x += shooting.vx;
      shooting.y += shooting.vy;
      shooting.life -= 0.02;

      ctx.save();
      const trail = ctx.createLinearGradient(
        shooting.x, shooting.y,
        shooting.x - shooting.vx * 8, shooting.y - shooting.vy * 8
      );
      trail.addColorStop(0, 'rgba(255,255,255,0.95)');
      trail.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = trail; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(shooting.x, shooting.y);
      ctx.lineTo(shooting.x - shooting.vx * 8, shooting.y - shooting.vy * 8);
      ctx.stroke();
      ctx.restore();

      if (shooting.life <= 0 || shooting.x < -60 || shooting.y > h + 60) shooting = null;
    }

    requestAnimationFrame(draw);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
})();

/* ===== Contact form (Lambda submit with graceful fallback) ===== */
(() => {
  // Use your working Function URL for the contact form here:
  const LAMBDA_URL = "https://fj33big7rmvvfcuuwqhq3urz2e0mucnh.lambda-url.us-east-1.on.aws/"; // replace if your contact function differs

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      name: (fd.get('name') || '').toString(),
      email: (fd.get('email') || '').toString(),
      message: (fd.get('message') || '').toString()
    };

    status.textContent = 'Sending…';
    status.style.opacity = '0.9';

    try{
      if (LAMBDA_URL){
        const res = await fetch(LAMBDA_URL, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload),
          mode: 'cors',
        });
        if (!res.ok) throw new Error('Bad response');
      }else{
        await new Promise(r => setTimeout(r, 700));
      }
      status.textContent = 'Thanks! I’ll get back to you soon.';
      form.reset();
    }catch(err){
      status.textContent = 'Hmm, something went wrong. Please try again.';
    }
  });
})();

/* ===== Visitor Geo Hello (uses ipapi.co for global accuracy) ===== */
(() => {
  const chip = document.getElementById('geo-hello');
  if (!chip) return;

  // Try CloudFront cookie first for free/instant
  const readCookie = (k) => {
    const m = document.cookie.match(new RegExp('(?:^|; )' + k.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g,'\\$&') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  };
  const cfCC = readCookie('CloudFront-Viewer-Country');

  async function resolve(){
    if (cfCC && cfCC.length === 2) return cfCC;
    try{
      const r = await fetch('https://ipapi.co/json/', {cache:'no-store'});
      const j = await r.json();
      return (j && j.country) || '';
    }catch{
      return '';
    }
  }

  const flag = (cc) => {
    if (!cc || cc.length !== 2) return '';
    const A = 0x1F1E6, base = 'A'.charCodeAt(0);
    const up = cc.toUpperCase();
    return String.fromCodePoint(A + (up.charCodeAt(0)-base), A + (up.charCodeAt(1)-base));
  };

  (async () => {
    const cc = await resolve();
    if (!cc) return;
    chip.textContent = `Hello from ${flag(cc)} ${cc}`;
    chip.hidden = false;
  })();
})();

/* ===== Mini Gallery Lightbox ===== */
(() => {
  const root = document.getElementById('build-gallery');
  const lb = document.getElementById('lightbox');
  if (!root || !lb) return;

  const stage = lb.querySelector('.lb-stage');
  const btnClose = lb.querySelector('.lb-close');
  const btnPrev = lb.querySelector('.lb-prev');
  const btnNext = lb.querySelector('.lb-next');

  // Collect all items (even hidden) for navigation
  const items = Array.from(root.querySelectorAll('.gallery-item'));
  let idx = -1;

  function render(i){
    const it = items[i];
    if (!it) return;
    stage.innerHTML = '';
    const type = it.dataset.type;
    const src  = it.dataset.src;
    const poster = it.dataset.poster || '';

    if (type === 'video'){
      const v = document.createElement('video');
      v.controls = true;
      v.src = src;
      if (poster) v.poster = poster;
      v.playsInline = true;
      stage.appendChild(v);
      // Autoplay when opened, but don’t force sound
      setTimeout(()=>{ try{ v.play().catch(()=>{}); }catch{} }, 50);
    } else {
      const img = new Image();
      img.src = src;
      img.alt = 'Gallery image';
      stage.appendChild(img);
    }
  }

  function open(i){ idx = i; render(idx); lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); }
  function close(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); stage.innerHTML=''; idx=-1; }
  function next(){ if (idx < items.length-1) { idx++; render(idx); } else { idx=0; render(idx);} }
  function prev(){ if (idx > 0) { idx--; render(idx); } else { idx=items.length-1; render(idx);} }

  items.forEach((el,i)=> el.addEventListener('click', ()=> open(i)));
  btnClose.addEventListener('click', close);
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  lb.addEventListener('click', (e)=>{ if (e.target === lb) close(); });
  window.addEventListener('keydown', (e)=>{
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
})();
