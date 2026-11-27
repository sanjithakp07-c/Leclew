const app = document.getElementById("app");
const page = document.body.dataset.page;

const navItems = [
  ["HOME","index.html"],
  ["DRIVERS","drivers.html"],
  ["TEAMS","teams.html"],
  ["CALENDAR","calendar.html"],
  ["STANDINGS","standings.html"]
];

document.getElementById("navbar").innerHTML = `
  <div class="nav-inner">
    <a class="logo" href="index.html">LECLEW<span>.</span></a>
    <nav>
      ${navItems.map(([name,url]) =>
        `<a href="${url}" class="${url === location.pathname.split("/").pop() ? "active" : ""}">${name}</a>`
      ).join("")}
      <a href="drivers.html#favourites">♥ FAVOURITES</a>
    </nav>
  </div>
`;

document.getElementById("footer").innerHTML = `
  <a class="logo" href="index.html">LECLEW<span>.</span></a>
  <p>MADE FOR THE LOVE OF RACING.</p>
  <p class="muted">© 2026 LECLEW · INDEPENDENT FAN PROJECT</p>
`;

const favourites = () =>
  JSON.parse(localStorage.getItem("leclew-favourites") || "[]");

function toggleFavourite(id) {
  let saved = favourites();

  saved = saved.includes(id)
    ? saved.filter(item => item !== id)
    : [...saved, id];

  localStorage.setItem("leclew-favourites", JSON.stringify(saved));
  renderDrivers();
}

function driverCard(driver) {
  const saved = favourites().includes(driver.id);

  return `
    <article class="driver-card">
      <div class="card-top">
        <span class="driver-number">#${driver.number}</span>
        <button class="heart ${saved ? "selected" : ""}"
          data-favourite="${driver.id}" aria-label="Toggle favourite">
          ${saved ? "♥" : "♡"}
        </button>
      </div>

      <p class="muted">${driver.team}</p>
      <h3>${driver.name}</h3>
      <p class="muted">${driver.flag} ${driver.country}</p>

      <a class="card-link" href="driver.html?id=${driver.id}">
        VIEW PROFILE ↗
      </a>
    </article>
  `;
}

function renderDrivers() {
  const search = document.getElementById("search");
  const filter = document.getElementById("teamFilter");
  const favOnly = document.getElementById("favOnly");
  const grid = document.getElementById("driverGrid");
  const count = document.getElementById("count");

  if (!grid) return;

  const query = search.value.toLowerCase();
  const team = filter.value;
  const onlyFavourites = favOnly.checked;

  const result = drivers.filter(driver => {
    const matchesText =
      driver.name.toLowerCase().includes(query) ||
      driver.team.toLowerCase().includes(query) ||
      driver.country.toLowerCase().includes(query);

    const matchesTeam =
      team === "all" || driver.team === team;

    const matchesFavourite =
      !onlyFavourites || favourites().includes(driver.id);

    return matchesText && matchesTeam && matchesFavourite;
  });

  grid.innerHTML = result.length
    ? result.map(driverCard).join("")
    : `<p class="muted">No drivers found. Try another search.</p>`;

  count.textContent = `${result.length} DRIVERS FOUND`;

  grid.querySelectorAll("[data-favourite]").forEach(button => {
    button.addEventListener("click", () =>
      toggleFavourite(button.dataset.favourite)
    );
  });
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">THE ULTIMATE MOTORSPORT EXPERIENCE</p>
        <h1>BUILT FOR<br><span>THE FAST.</span></h1>
        <p>Speed. Precision. Passion. Explore the world of Formula 1.</p>
        <a class="primary-btn" href="drivers.html">EXPLORE THE GRID ↗</a>
      </div>
        <div class="hero-mark">LEC</div>
    </section>

    <section class="section">
      <p class="eyebrow">THE PEOPLE BEHIND THE SPEED</p>
      <h2>FEATURED <span>DRIVERS.</span></h2>
      <div class="grid">
        ${["charles-leclerc","lewis-hamilton","lando-norris","max-verstappen"]
          .map(id => driverCard(drivers.find(d => d.id === id))).join("")}
      </div>
      <a href="drivers.html" class="text-link">EXPLORE ALL DRIVERS →</a>
    </section>

    <section class="home-banner">
      <p class="eyebrow">11 TEAMS. ONE GRID.</p>
      <h2>CHOOSE YOUR <span>TEAM.</span></h2>
      <a href="teams.html" class="primary-btn">EXPLORE CONSTRUCTORS ↗</a>
    </section>
  `;

  app.querySelectorAll("[data-favourite]").forEach(button => {
    button.addEventListener("click", () =>
      toggleFavourite(button.dataset.favourite)
    );
  });
}

function renderDriverPage() {
  const id = new URLSearchParams(location.search).get("id");
  const driver = drivers.find(d => d.id === id);

  if (!driver) {
    app.innerHTML = `<section class="section">
      <h2>DRIVER NOT FOUND</h2>
      <a href="drivers.html">Back to drivers</a>
    </section>`;
    return;
  }

  const team = teams.find(t => t.name === driver.team);
  const saved = favourites().includes(driver.id);

  app.innerHTML = `
    <section class="profile" style="--team-color:${team.color}">
      <p class="eyebrow">2026 DRIVER PROFILE</p>
      <p class="profile-number">#${driver.number}</p>
      <h1>${driver.name}</h1>
      <p>${driver.flag} ${driver.country}</p>
      <p class="profile-team">${driver.team}</p>
      <button class="primary-btn" id="profileFav">
        ${saved ? "♥ REMOVE FAVOURITE" : "♡ ADD TO FAVOURITES"}
      </button>
      <br><br>
      <a class="text-link" href="teams.html">EXPLORE TEAMS →</a>
    </section>
  `;

  document.getElementById("profileFav").onclick = () =>
    toggleFavourite(driver.id) &&
    renderDriverPage();
}

function renderTeams() {
  app.innerHTML = `
    <section class="section">
      <p class="eyebrow">THE MACHINES AND THE PEOPLE</p>
      <h1>THE <span>CONSTRUCTORS.</span></h1>
      <p class="muted">SELECT A TEAM TO EXPLORE ITS DRIVERS.</p>

      <div class="grid team-grid">
        ${teams.map(team => `
          <a class="team-card"
             style="--team-color:${team.color}"
             href="drivers.html?team=${encodeURIComponent(team.name)}">
            <span class="team-line"></span>
            <p>2026 CONSTRUCTOR</p>
            <h2>${team.name}</h2>
            <p>${drivers.filter(d => d.team === team.name)
              .map(d => d.name).join(" · ")}</p>
            <span class="text-link">EXPLORE TEAM ↗</span>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCalendar() {
  app.innerHTML = `
    <section class="section">
      <p class="eyebrow">THE ROAD TO GLORY</p>
      <h1>RACE <span>CALENDAR.</span></h1>
      <p class="muted">
        Explore the official 2026 Grand Prix calendar.
        For verified dates, schedule changes and race results,
        use the official Formula 1 calendar.
      </p>
      <a class="primary-btn"
         href="https://www.formula1.com/en/racing/2026"
         target="_blank" rel="noopener">
         VIEW OFFICIAL RACE CALENDAR ↗
      </a>
    </section>
  `;
}

function renderStandings() {
  app.innerHTML = `
    <section class="section">
      <p class="eyebrow">THE FIGHT FOR THE TITLE</p>
      <h1>CHAMPIONSHIP <span>STANDINGS.</span></h1>

      <div class="standing-card">
        <h2>DRIVER CHAMPIONSHIP</h2>
        <p class="muted">Official, updated championship results.</p>
        <a class="primary-btn"
           href="https://www.formula1.com/en/results/2026/drivers"
           target="_blank" rel="noopener">
          VIEW DRIVER STANDINGS ↗
        </a>
      </div>

      <div class="standing-card">
        <h2>CONSTRUCTOR CHAMPIONSHIP</h2>
        <p class="muted">Official team championship results.</p>
        <a class="primary-btn"
           href="https://www.formula1.com/en/results/2026/team"
           target="_blank" rel="noopener">
          VIEW TEAM STANDINGS ↗
        </a>
      </div>
    </section>
  `;
}

if (page === "home") renderHome();

if (page === "drivers") {
  app.innerHTML = `
    <section class="section">
      <p class="eyebrow">MEET THE GRID</p>
      <h1>ALL THE <span>DRIVERS.</span></h1>
      <p class="muted">SEARCH. FILTER. SELECT YOUR FAVOURITES.</p>

      <div class="controls">
        <input id="search" placeholder="Search driver or country...">

        <select id="teamFilter">
          <option value="all">ALL TEAMS</option>
          ${teams.map(t => `<option value="${t.name}">${t.name}</option>`).join("")}
        </select>

        <label class="favourite-filter">
          <input type="checkbox" id="favOnly"> FAVOURITES ONLY ♥
        </label>
      </div>

      <p id="count" class="muted"></p>
      <div class="grid" id="driverGrid"></div>
    </section>
  `;

  const params = new URLSearchParams(location.search);
  document.getElementById("teamFilter").value =
    teams.some(t => t.name === params.get("team"))
      ? params.get("team") : "all";

  if (location.hash === "#favourites") {
    document.getElementById("favOnly").checked = true;
  }

  document.getElementById("search").addEventListener("input", renderDrivers);
  document.getElementById("teamFilter").addEventListener("change", renderDrivers);
  document.getElementById("favOnly").addEventListener("change", renderDrivers);

  renderDrivers();
}

if (page === "driver") renderDriverPage();
if (page === "teams") renderTeams();
if (page === "calendar") renderCalendar();
if (page === "standings") renderStandings();
