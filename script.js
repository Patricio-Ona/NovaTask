const panelTitle = document.getElementById("panel-title");
const panelButtons = document.querySelectorAll("[data-panel-target]");
const panels = document.querySelectorAll("[data-panel]");
const revealables = document.querySelectorAll(".reveal");
const footerYear = document.getElementById("footer-year");

const panelTitles = {
  overview: "Dashboard academico",
  kanban: "Tablero Kanban",
  calendar: "Calendario inteligente",
  analytics: "Estadisticas de impacto",
  templates: "Plantillas academicas PUCE",
};

function activatePanel(target) {
  panelButtons.forEach((button) => {
    const active = button.dataset.panelTarget === target;
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-pressed", String(active));
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.panel === target);
  });

  panelTitle.textContent = panelTitles[target] ?? "Vista del sistema";
}

panelButtons.forEach((button) => {
  button.addEventListener("click", () => activatePanel(button.dataset.panelTarget));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealables.forEach((element) => revealObserver.observe(element));

activatePanel("overview");

if (footerYear) {
  footerYear.textContent = `Construido como base visual del MVP · ${new Date().getFullYear()}`;
}
