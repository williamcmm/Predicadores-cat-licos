export const scrollIntoView = (elemId) => {
  const el = document.getElementById(elemId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // optionally focus the input inside the idea
    const input = el.querySelector("input, textarea, [tabindex]");
    if (input) input.focus({ preventScroll: true });
  }
};
