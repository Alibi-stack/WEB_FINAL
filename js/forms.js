function getSubmitButton(form) {
  return form.querySelector('button[type="submit"], input[type="submit"]');
}
function setButtonLoading(btn, textHtml) {
  if (!btn) return;
  if (btn.tagName === "INPUT") {
    btn.dataset.__orig = btn.value;
    btn.value = textHtml;
  } else {
    btn.dataset.__orig = btn.innerHTML;
    btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>${textHtml}`;
  }
  btn.disabled = true;
  btn.classList.add("loading");
}
function restoreButton(btn) {
  if (!btn) return;
  if (btn.tagName === "INPUT") btn.value = btn.dataset.__orig || btn.value;
  else btn.innerHTML = btn.dataset.__orig || btn.innerHTML;
  btn.removeAttribute("data-__orig");
  btn.disabled = false;
  btn.classList.remove("loading");
}
function showToast(message, opts = {}) {
  const duration = opts.duration || 3500;
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast info";
  toast.textContent = message || "Done";
  const close = document.createElement("button");
  close.className = "close";
  close.type = "button";
  close.innerHTML = "×";
  close.addEventListener("click", () => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  });
  toast.appendChild(close);
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
document.addEventListener(
  "submit",
  function (e) {
    const form = e.target;
    if (!(form && form.nodeName === "FORM")) return;
    e.preventDefault();
    const submitter =
      e.submitter ||
      getSubmitButton(form) ||
      form.querySelector('button, input[type="submit"]');
    const btn = submitter instanceof Element ? submitter : null;
    if (!btn || btn.disabled) return;
    setButtonLoading(btn, " Please wait...");
    const delay = Number(form.dataset.delay || 1500);
    setTimeout(() => {
      restoreButton(btn);
      const notifyAttr = form.dataset.notify;
      if (notifyAttr !== undefined && notifyAttr !== "false") {
        const message =
          notifyAttr === "true" ? "Form submitted successfully" : notifyAttr;
        showToast(message);
      }
      if (form.dataset.realSubmit === "true") form.submit();
    }, delay);
  },
  true
);
