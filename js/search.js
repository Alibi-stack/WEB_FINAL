// Courses
const courses = [
  { name: "WEB Technologies", category: "Web" },
  { name: "Intro to Python", category: "Data" },
  { name: "English for Tech", category: "Languages" },
  { name: "Discrete Math Basics", category: "Math" },
  { name: "New subject", category: "spoiler" },
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeHighlights() {
  document.querySelectorAll("mark.highlight").forEach((m) => {
    m.replaceWith(document.createTextNode(m.textContent));
  });
}

function highlightMatches(searchTerm) {
  removeHighlights();
  if (!searchTerm) return;
  const esc = escapeRegExp(searchTerm);
  const reGlobal = new RegExp(esc, "gi");
  const reTest = new RegExp(esc, "i");
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  const skipSelector = "script, style, textarea, input, noscript, mark";
  let node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue.trim()) continue;
    if (
      node.parentNode &&
      node.parentNode.closest &&
      node.parentNode.closest(skipSelector)
    )
      continue;
    if (!reTest.test(node.nodeValue)) continue;
    const value = node.nodeValue;
    let last = 0,
      match,
      frag = document.createDocumentFragment();
    reGlobal.lastIndex = 0;
    while ((match = reGlobal.exec(value)) !== null) {
      const idx = match.index;
      if (idx > last)
        frag.appendChild(document.createTextNode(value.slice(last, idx)));
      const mark = document.createElement("mark");
      mark.className = "highlight";
      mark.textContent = match[0];
      frag.appendChild(mark);
      last = reGlobal.lastIndex;
      if (reGlobal.lastIndex === idx) reGlobal.lastIndex++;
    }
    if (last < value.length)
      frag.appendChild(document.createTextNode(value.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
}

function filterCourses(searchTerm) {
  const term = (searchTerm || "").trim().toLowerCase();
  document.querySelectorAll(".card").forEach((card) => {
    const h3 = card.querySelector("h3");
    const name = h3 ? h3.textContent.toLowerCase() : "";
    card.style.display = !term || name.includes(term) ? "" : "none";
  });
}

// init
document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".input");
  if (!input) return;
  input.addEventListener("keyup", function () {
    const v = this.value;
    filterCourses(v);
    if (!v.trim()) removeHighlights();
    else highlightMatches(v);
  });
});
