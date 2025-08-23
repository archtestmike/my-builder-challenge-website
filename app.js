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

/* ===== Digital Rain (slightly slower) ===== */
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
      drops[i] += 0.74;
    }
    requestAnimationFrame(draw);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
})();

/* ===== Starfield ===== */
(() => {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, stars = [], shooting = null, last = 0;
  const STAR_COUNT = 220;
  const SHOOT_MS = 5200 + Math.random() * 3800;

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
      s.t += 0.016;
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
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(draw);
})();

/* ===== Contact form (text/plain to avoid preflight) ===== */
(() => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  const LAMBDA1 = (form.dataset.lambda1 || "").trim(); // ✅ uxgn2…
  const LAMBDA2 = (form.dataset.lambda2 || "").trim(); // optional
  const FALLBACK_EMAIL = (form.dataset.fallbackEmail || "").trim();
  const FORM_SUBMIT_ENDPOINT = FALLBACK_EMAIL
    ? `https://formsubmit.co/ajax/${encodeURIComponent(FALLBACK_EMAIL)}`
    : "";

  const btn = form.querySelector('button[type="submit"]');
  const setStatus = (msg) => { status.textContent = msg; status.style.opacity = '0.95'; };

  // no-preflight request
  function postPlain(url, body, signal){
    return fetch(url, {
      method:'POST',
      headers:{ 'Content-Type':'text/plain;charset=UTF-8' },
      body,
      mode:'cors',
      cache:'no-store',
      signal
    });
  }

  function openMailto(payload){
    if (!FALLBACK_EMAIL) return;
    const mailto = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent('Website contact from ' + payload.name)}&body=${encodeURIComponent(payload.message + '\n\n— ' + payload.name + ' <' + payload.email + '>')}`;
    window.location.href = mailto;
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      name: (fd.get('name') || '').toString().trim(),
      email: (fd.get('email') || '').toString().trim(),
      message: (fd.get('message') || '').toString().trim(),
      ts: new Date().toISOString()
    };
    const bodyStr = JSON.stringify(payload);

    setStatus('Sending…');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.8'; }

    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), 10000);

    try{
      if (LAMBDA1){
        const r1 = await postPlain(LAMBDA1, bodyStr, ctrl.signal);
        if (r1.ok){
          setStatus('Thanks! I’ll get back to you soon.');
          form.reset();
          return;
        }
      }
      if (LAMBDA2){
        const r2 = await postPlain(LAMBDA2, bodyStr, ctrl.signal);
        if (r2.ok){
          setStatus('Thanks! I’ll get back to you soon.');
          form.reset();
          return;
        }
      }
      if (FORM_SUBMIT_ENDPOINT){
        const r3 = await fetch(FORM_SUBMIT_ENDPOINT, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
          body: JSON.stringify({
            ...payload,
            _subject: 'New message from your website',
            _replyto: payload.email
          }),
          mode:'cors',
          cache:'no-store',
          signal: ctrl.signal
        });
        if (r3.ok){
          setStatus('Thanks! Your message was emailed.');
          form.reset();
          return;
        }
      }
      openMailto(payload);
      setStatus(FALLBACK_EMAIL ? 'Opening your email app so you can send this message…' : 'Couldn’t send. Add your email to data-fallback-email for a fallback.');
    }catch(err){
      try{
        if (FORM_SUBMIT_ENDPOINT){
          const r = await fetch(FORM_SUBMIT_ENDPOINT, {
            method:'POST',
            headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
            body: JSON.stringify({
              ...payload,
              _subject: 'New message from your website',
              _replyto: payload.email
            }),
            mode:'cors',
            cache:'no-store',
            signal: ctrl.signal
          });
          if (r.ok){
            setStatus('Thanks! Your message was emailed.');
            form.reset();
            return;
          }
        }
        openMailto(payload);
        setStatus(FALLBACK_EMAIL ? 'Opening your email app so you can send this message…' : 'Couldn’t send. Add your email to data-fallback-email for a fallback.');
      }catch{
        openMailto(payload);
        setStatus(FALLBACK_EMAIL ? 'Opening your email app so you can send this message…' : 'Couldn’t send. Add your email to data-fallback-email for a fallback.');
      }
    } finally{
      clearTimeout(timer);
      if (btn) { btn.disabled = false; btn.style.opacity = ''; }
    }
  });
})();
