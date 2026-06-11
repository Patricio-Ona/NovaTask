const labChips = document.querySelectorAll("[data-screen-target]");
const screens = document.querySelectorAll("[data-screen]");

function setActiveScreen(targetId) {
  labChips.forEach((chip) => {
    const active = chip.dataset.screenTarget === targetId;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
  });

  screens.forEach((screen) => {
    screen.classList.toggle("is-visible", screen.dataset.screen === targetId);
  });
}

labChips.forEach((chip) => {
  chip.addEventListener("click", () => setActiveScreen(chip.dataset.screenTarget));
});

setActiveScreen("screen-login");
