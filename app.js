const API_URL = "https://4htygrrwwvfpfimomf2uhci6z4.appsync-api.us-east-1.amazonaws.com/graphql";
const API_KEY = "da2-jmb6sizilbghli5wh4qcjvhopu";

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
