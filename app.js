const content = document.getElementById("content");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const refreshBtn = document.getElementById("refresh-btn");

let dashboardData = {};
let members = [];

console.log("app.js cargado correctamente");

const sectionInfo = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Resumen general de la peña"
  },
  members: {
    title: "Miembros",
    subtitle: "Listado de integrantes de la peña"
  },
  activities: {
    title: "Actividades",
    subtitle: "Planes, eventos y quedadas"
  },
  challenges: {
    title: "Retos",
    subtitle: "Retos absurdos, sanos y memorables"
  },
  ranking: {
    title: "Ranking",
    subtitle: "Clasificación de participación"
  },
  moments: {
    title: "Momentos",
    subtitle: "Recuerdos, fotos y anécdotas"
  },
  bets: {
    title: "Porras",
    subtitle: "Predicciones y juegos internos"
  },
  settings: {
    title: "Configuración",
    subtitle: "Ajustes básicos de la app"
  }
};

document.addEventListener("DOMContentLoaded", async () => {

  setupNavigation();

  await loadInitialData();

  renderSection("dashboard");

});

refreshBtn.addEventListener("click", async () => {
  await loadInitialData();

  const activeSection = document.querySelector(".nav-item.active").dataset.section;
  renderSection(activeSection);
});

function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(btn => btn.classList.remove("active"));
      item.classList.add("active");

      renderSection(item.dataset.section);
    });
  });
}

async function loadInitialData() {
  try {
    const dashboardResponse = await fetch(`${CONFIG.API_URL}?action=dashboard`);
    const dashboardJson = await dashboardResponse.json();

    dashboardData = dashboardJson.data || {};

    const membersResponse = await fetch(`${CONFIG.API_URL}?action=members`);
    const membersJson = await membersResponse.json();

    members = membersJson.data || [];

    console.log("dashboardData:", dashboardData);
    console.log("members:", members);

  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

async function apiRequest(action) {
  const url = `${CONFIG.API_URL}?action=${action}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return await response.json();
}

function renderSection(section) {
  const info = sectionInfo[section];

  pageTitle.textContent = info.title;
  pageSubtitle.textContent = info.subtitle;

  switch (section) {
    case "dashboard":
      renderDashboard();
      break;

    case "members":
      renderMembers();
      break;

    case "activities":
      renderPlaceholder("Actividades", "Aquí irán las quedadas, cenas, torneos y demás líos organizados.");
      break;

    case "challenges":
      renderPlaceholder("Retos", "Aquí aparecerán retos internos de la peña.");
      break;

    case "ranking":
      renderPlaceholder("Ranking", "Aquí veremos quién participa más, quién gana retos y quién va fuerte.");
      break;

    case "moments":
      renderPlaceholder("Momentos", "Aquí se guardarán recuerdos, fotos y anécdotas.");
      break;

    case "bets":
      renderPlaceholder("Porras", "Aquí estarán las porras de partidos, Eurovisión o cualquier drama social aceptable.");
      break;

    case "settings":
      renderPlaceholder("Configuración", "Aquí configuraremos datos básicos de la peña.");
      break;
  }
}

function renderDashboard() {
  const ranking = dashboardData.ranking || [];

  content.innerHTML = `
    <div class="cards-grid">

      <div class="card">
        <h3>Miembros</h3>
        <div class="big-number">${ranking.length}</div>
      </div>

      <div class="card">
        <h3>Próxima actividad</h3>
        <div class="big-number">${dashboardData.nextActivity ? "1" : "0"}</div>
      </div>

      <div class="card">
        <h3>Reto activo</h3>
        <div class="big-number">${dashboardData.activeChallenge ? "1" : "0"}</div>
      </div>

      <div class="card">
        <h3>Momentos</h3>
        <div class="big-number">${dashboardData.latestMoments?.length || 0}</div>
      </div>

    </div>

    <div class="panel">
      <h3>Ranking actual</h3>

      <div class="member-list">
        ${ranking.map(member => `
          <div class="member-item">
            <div>
              <div class="member-name">${member.alias || member.name}</div>
              <div class="member-role">${member.role || "Miembro"}</div>
            </div>
            <strong>${member.points || 0} pts</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderMiniMembers() {
  if (!members || members.length === 0) {
    return `<div class="empty-state">Todavía no hay miembros registrados.</div>`;
  }

  return `
    <div class="member-list">
      ${members.slice(0, 5).map(member => `
        <div class="member-item">
          <div>
            <div class="member-name">
              ${member.alias || member.name || "Sin nombre"}
            </div>
            <div class="member-role">
              ${member.phrase || member.role || "Miembro de la peña"}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderMembers() {
  if (!members.length) {
    content.innerHTML = `
      <div class="panel">
        <div class="empty-state">No hay miembros registrados todavía.</div>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="members-grid">
      ${members.map(member => `
        <div class="member-card">
          <div class="member-avatar">
            ${member.avatarUrl 
              ? `<img src="${member.avatarUrl}" alt="${member.alias || member.name}">`
              : `<span>${getInitials(member.alias || member.name)}</span>`
            }
          </div>

          <div class="member-info">
            <h3>${member.alias || member.name || "Sin nombre"}</h3>
            <p class="member-real-name">${member.name || ""}</p>
            <p class="member-phrase">“${member.phrase || "Sin frase todavía"}”</p>

            <div class="member-meta">
              <span>${member.role || "miembro"}</span>
              <span>${member.status || "activo"}</span>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function getInitials(text) {
  if (!text) return "?";

  return text
    .split(" ")
    .map(word => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function renderPlaceholder(title, text) {
  content.innerHTML = `
    <div class="panel">
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;
}
