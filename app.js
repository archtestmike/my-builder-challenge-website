/* ===== Year ===== */
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
      ctx.strokeStyle = trail;
      ctx.lineWidth = 2;
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

/* ===== Star-Guestbook overlay (AppSync GraphQL) =====
   - Draws twinkling "name" stars on #guestbook-layer.
   - On contact form submit, adds a new star (optimistic), and writes to GraphQL.
   - On load, fetches latest stars from GraphQL and renders them.
*/
(() => {
  // === Fill these with your Amplify output ===
  const GRAPHQL_ENDPOINT = "https://4htygrrwwvfpfimomf2uhci6z4.appsync-api.us-east-1.amazonaws.com/graphql";
  const API_KEY = "da2-jmb6sizilbghli5wh4qcjvhopu";

  const canvas = document.getElementById('guestbook-layer');
  const tip = document.getElementById('gb-tooltip');
  if (!canvas || !tip) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  let W=0, H=0, rafId=0, paused=false;
  function resize(){
    W = canvas.width  = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  const stars = []; // {x,y,r,t,name,country}

  const readCookie = (k) => {
    const m = document.cookie.match(new RegExp('(?:^|; )' + k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  };
  const getCountry = () =>
    readCookie('gb_ctry') || readCookie('CloudFront-Viewer-Country') || 'Somewhere';

  function addStar(name, country){
    const x = Math.random()*W, y = Math.random()*H*0.75 + H*0.05;
    stars.push({
      x, y,
      r: (1.4 + Math.random()*0.6) * DPR,
      t: Math.random()*Math.PI*2,
      name, country
    });
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    for(const s of stars){
      s.t += 0.03;
      const a = 0.5 + Math.sin(s.t)*0.45;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#e9fbff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  }

  const startLoop = () => {
    if (paused) return;
    cancelAnimationFrame(rafId);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) rafId = requestAnimationFrame(draw);
  };

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (paused) cancelAnimationFrame(rafId);
    else startLoop();
  });
  startLoop();

  // Tooltip follow & hit test
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * DPR;
    const my = (e.clientY - rect.top) * DPR;

    let hit = null;
    for (const s of stars){
      const dx = mx - s.x, dy = my - s.y;
      if (dx*dx + dy*dy < (8*DPR)*(8*DPR)) { hit = s; break; }
    }
    if (hit){
      tip.textContent = `👋 ${hit.name} from ${hit.country}`;
      tip.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 12}px)`;
      tip.classList.add('show');
    } else {
      tip.classList.remove('show');
      tip.style.transform = `translate(-9999px, -9999px)`;
    }
  });

  // ===== GraphQL helpers =====
  const LIST = `
    query ListStars($limit: Int) {
      listStars(limit: $limit) { items { id name message createdAt } }
    }
  `;
  const CREATE = `
    mutation CreateStar($input: CreateStarInput!) {
      createStar(input: $input) { id name message createdAt }
    }
  `;
  async function gql(query, variables){
    if (!GRAPHQL_ENDPOINT || !API_KEY) throw new Error("Guestbook not configured");
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "x-api-key": API_KEY, "content-type":"application/json" },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors.map(e => e.message).join("; "));
    return json.data;
  }

  // Load existing stars (names only) and sprinkle them
  async function load(){
    try{
      const data = await gql(LIST, { limit: 24 });
      const items = data?.listStars?.items || [];
      // newest first if createdAt exists
      items.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
      for (const it of items){
        const n = (it?.name || 'Friend').toString().split(/\s+/)[0];
        addStar(n, 'Somewhere'); // country is not in schema; default for loaded items
      }
      startLoop();
    }catch(err){
      console.warn("Guestbook load failed:", err);
    }
  }

  // Hook into your Contact form submission:
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const rawName = (fd.get('name') || '').toString().trim();
      const message  = (fd.get('message') || '').toString().trim();
      const firstName = rawName.split(/\s+/)[0] || 'Friend';
      const country = getCountry();

      // Optimistic star now (so you see it immediately)
      addStar(firstName, country);
      startLoop();

      // Save to GraphQL (name + message)
      try{
        await gql(CREATE, { input: { name: rawName || 'Friend', message } });
        if (status){ status.textContent = 'Thanks! You’re on the sky ✨'; }
      }catch(err){
        console.warn('Guestbook GraphQL save failed:', err);
        if (status){ status.textContent = 'Sent locally (backend busy).'; }
      }

      form.reset();
    });
  }

  load();
})();
