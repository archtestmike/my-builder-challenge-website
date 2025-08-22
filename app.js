// Fetch guestbook stars
async function fetchStars() {
  const query = `
    query ListStars {
      listStars {
        items {
          id
          name
          message
        }
      }
    }
  `;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const { data } = await res.json();
  const container = document.getElementById("stars-container");
  container.innerHTML = "";

  data.listStars.items.forEach(star => {
    const div = document.createElement("div");
    div.className = "star";
    div.textContent = `${star.name}: ${star.message}`;
    container.appendChild(div);
  });
}

// Handle new star
document.getElementById("guestbook-form").addEventListener("submit", async e => {
  e.preventDefault();
  const name = e.target.name.value;
  const message = e.target.message.value;

  const mutation = `
    mutation CreateStar {
      createStar(input: {name: "${name}", message: "${message}"}) {
        id
        name
        message
      }
    }
  `;

  await fetch(API_URL, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation })
  });

  e.target.reset();
  fetchStars();
});

// Load stars when page loads
fetchStars();

// Existing code (progress bar, animations, etc.)
document.getElementById('year').textContent = new Date().getFullYear();


/***** Star Guestbook (AppSync GraphQL via fetch) *****/
(() => {
  // ↓↓↓ fill these from your Amplify output ↓↓↓
  const GRAPHQL_ENDPOINT = "https://4htygrrwwvfpfimomf2uhci6z4.appsync-api.us-east-1.amazonaws.com/graphql";
  const API_KEY = "da2-jmb6sizilbghli5wh4qcjvhopu";

  const container = document.getElementById("stars-container");
  const form = document.getElementById("guestbook-form");
  const statusEl = document.getElementById("guestbook-status");
  if (!container || !form) return; // section not present

  // GraphQL documents with variables (safer than string interpolation)
  const LIST = `
    query ListStars($limit: Int) {
      listStars(limit: $limit) {
        items { id name message createdAt }
      }
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

  function escapeHtml(str){
    return String(str ?? "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }

  function renderStars(items){
    container.innerHTML = "";
    if (!items || items.length === 0){
      container.innerHTML = `<div class="star-chip">Be the first to leave a message ✨</div>`;
      return;
    }
    // newest first if createdAt exists
    items.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
    for (const s of items){
      const el = document.createElement("div");
      el.className = "star-chip";
      el.innerHTML = `<b>${escapeHtml(s.name)}</b><br>${escapeHtml(s.message)}`;
      container.appendChild(el);
    }
  }

  async function load(){
    try{
      const data = await gql(LIST, { limit: 24 });
      renderStars(data?.listStars?.items || []);
    }catch(err){
      console.warn("Guestbook load failed:", err);
      if (statusEl) statusEl.textContent = "Guestbook temporarily unavailable.";
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim().slice(0, 40);
    const message = String(fd.get("message") || "").trim().slice(0, 240);
    if (!name || !message) return;

    try{
      if (statusEl) statusEl.textContent = "Saving…";
      await gql(CREATE, { input: { name, message }});
      form.reset();
      if (statusEl) statusEl.textContent = "Star saved ✨";
      await load();
    }catch(err){
      console.error(err);
      if (statusEl) statusEl.textContent = "Couldn’t save right now.";
    }
  });

  load();
})();
