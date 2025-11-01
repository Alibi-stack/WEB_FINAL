//  array of courses
const courses = [
  { name: "WEB Technologies", category: "Web" },
  { name: "Intro to Python", category: "Data" },
  { name: "English for Tech", category: "Languages" },
  { name: "Discrete Math Basics", category: "Math" },
  { name: "New subject", category: "spoiler" },
];

// user input for use in RegExp
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// remove any existing mark highlights
function removeHighlights() {
  const marks = document.querySelectorAll("mark.highlight");
  marks.forEach((m) => {
    const txt = document.createTextNode(m.textContent);
    m.parentNode.replaceChild(txt, m);
  });
}

// Highlight matches by walking text nodes
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
    if (!node.nodeValue || !node.nodeValue.trim()) continue;
    if (
      node.parentNode &&
      node.parentNode.closest &&
      node.parentNode.closest(skipSelector)
    )
      continue;
    if (!reTest.test(node.nodeValue)) continue;

    // build fragment with highlighted pieces
    reGlobal.lastIndex = 0;
    const value = node.nodeValue;
    let lastIndex = 0;
    let match;
    const frag = document.createDocumentFragment();

    while ((match = reGlobal.exec(value)) !== null) {
      const idx = match.index;
      if (idx > lastIndex) {
        frag.appendChild(document.createTextNode(value.slice(lastIndex, idx)));
      }
      const mark = document.createElement("mark");
      mark.className = "highlight";
      mark.textContent = match[0];
      frag.appendChild(mark);
      lastIndex = reGlobal.lastIndex;
      // prevent infinite loop on empty matches
      if (reGlobal.lastIndex === idx) reGlobal.lastIndex++;
    }
    if (lastIndex < value.length) {
      frag.appendChild(document.createTextNode(value.slice(lastIndex)));
    }
    node.parentNode.replaceChild(frag, node);
  }
}

// Function to display courses based on search input
function filterCourses(searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  const courseCards = document.querySelectorAll(".card");
  courseCards.forEach((card) => {
    const courseName = card.querySelector("h3").textContent.toLowerCase();
    if (!term || courseName.includes(term)) {
      card.style.display = "block"; // Show
    } else {
      card.style.display = "none"; // Hide
    }
  });
}

// Function to create and show suggestions
function showSuggestions(searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  if (!term) {
    document.querySelector('.search-suggestions').style.display = 'none';
    return;
  }

  // Find matching courses (limit to 5 suggestions)
  const matches = courses
      .filter(course => course.name.toLowerCase().includes(term))
      .slice(0, 5);

  const suggestions = document.querySelector('.search-suggestions');
  
  if (matches.length) {
      const html = matches
          .map(course => `
              <div class="suggestion" data-name="${course.name}">
                  <strong>${highlightSuggestion(course.name, term)}</strong>
                  <small>${course.category}</small>
              </div>
          `)
          .join('');
      
      suggestions.innerHTML = html;
      suggestions.style.display = 'block';

      // Add click handlers to suggestions
      suggestions.querySelectorAll('.suggestion').forEach(div => {
          div.addEventListener('click', () => {
              const name = div.dataset.name;
              const input = document.querySelector('.input');
              input.value = name;
              filterCourses(name);
              highlightMatches(name);
              suggestions.style.display = 'none';
          });
      });
  } else {
      suggestions.innerHTML = '<div class="suggestion">No matches found</div>';
      suggestions.style.display = 'block';
  }
}

// Helper to highlight matching text in suggestions
function highlightSuggestion(text, term) {
  const esc = escapeRegExp(term);
  const regex = new RegExp(`(${esc})`, 'gi');
  return text.replace(regex, '<mark class="highlight">$1</mark>');
}

// Update the existing event listener to include suggestions
const searchInput = document.querySelector('.input');
if (searchInput) {
    searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value;
        filterCourses(searchTerm);
        if (!searchTerm.trim()) {
            removeHighlights();
        } else {
            highlightMatches(searchTerm);
        }
        showSuggestions(searchTerm);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search')) {
            document.querySelector('.search-suggestions').style.display = 'none';
        }
    });
}

// progress bar
(function ($) {
  if (!$) {
    console.warn('jQuery not found — skipping jQuery-powered features (progress bar, some animations).');
    return;
  }

  function updateProgress() {
    const doc = document.documentElement;
    const body = document.body;
    const scrollTop =
      (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    const scrollHeight = Math.max(
      body.scrollHeight,
      doc.scrollHeight,
      body.offsetHeight,
      doc.offsetHeight,
      body.clientHeight,
      doc.clientHeight
    );
    const winHeight = window.innerHeight || doc.clientHeight;
    const max = scrollHeight - winHeight;
    const pct =
      max > 0 ? Math.min(100, Math.round((scrollTop / max) * 100)) : 0;

    $("#progressBar").css("width", pct + "%");

    if (pct >= 90) {
      $("#progressBar").addClass("glow");
    } else {
      $("#progressBar").removeClass("glow");
    }
  }

  $(window).on("scroll resize load", updateProgress);
  $(function () {
    updateProgress();
  });
})(window.jQuery);

// Animated number counters
(function () {
  const counters = document.querySelectorAll(".num[data-target]");
  if (!counters.length) return;

  const fmt = new Intl.NumberFormat("en-US");

  function animateCounter(el, duration = 1400) {
    const target = Number(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || "";
    const startVal = Number(el.textContent.replace(/[^\d.-]/g, "")) || 0;
    const startTime = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(startVal + (target - startVal) * eased);
      el.textContent = fmt.format(value) + suffix;
      if (t < 1) {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((c) => {
    // initialize display to 0 (or keep existing) and observe
    if (!c.textContent.trim()) c.textContent = "0";
    observer.observe(c);
  });
})();

// ------------------------
// Current time display and theme toggle
// ------------------------
(function () {
  let clockInterval = null;

  function formatTime(d) {
    return d.toLocaleTimeString();
  }

  function startClock(displayEl) {
    if (!displayEl) return;
    stopClock();
    function tick() {
      displayEl.textContent = formatTime(new Date());
    }
    tick();
    clockInterval = setInterval(tick, 1000);
  }

  function stopClock() {
    if (clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }
  }

  // Theme helpers
  function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    // update aria-pressed if button present
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      updateThemeButton(btn, theme);
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    const theme = isDark ? 'dark' : 'light';
    try {
      localStorage.setItem('site-theme', theme);
    } catch (e) {}
    applyTheme(theme);
  }

  function initTheme() {
    try {
      const saved = localStorage.getItem('site-theme');
      if (saved) {
        applyTheme(saved);
        return;
      }
    } catch (e) {}
    // if no saved preference, use system prefers-color-scheme
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  function updateThemeButton(btn, theme) {
    if (!btn) return;
    // show an icon and label reflecting current theme
    if (theme === 'dark') {
      btn.innerHTML = '☾ Dark';
      btn.title = 'Dark mode active — click to toggle';
    } else {
      btn.innerHTML = '☼ Light';
      btn.title = 'Light mode active — click to toggle';
    }
  }

  function initTimeTheme() {
    // init theme
    initTheme();
    const timeBtn = document.getElementById('timeButton');
    const timeDisplay = document.getElementById('timeDisplay');
    const themeBtn = document.getElementById('themeToggle');

    if (timeBtn && timeDisplay) {
      let shown = false;
      // If user enabled autostartClock in localStorage, start it automatically
      try {
        const auto = localStorage.getItem('autostartClock');
        if (auto === 'true') {
          startClock(timeDisplay);
          timeBtn.textContent = 'Hide Current Time';
          shown = true;
        }
      } catch (e) {}

      // toggle on click
      timeBtn.addEventListener('click', function () {
        if (!shown) {
          startClock(timeDisplay);
          timeBtn.textContent = 'Hide Current Time';
          shown = true;
        } else {
          stopClock();
          timeDisplay.textContent = '';
          timeBtn.textContent = 'Show Current Time';
          shown = false;
        }
      });
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }
  }

  // If DOM already loaded, initialize immediately; otherwise wait for event
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimeTheme);
  } else {
    initTimeTheme();
  }
})();

(function () {
  function getSubmitButton(form) {
    return form.querySelector('button[type="submit"], input[type="submit"]');
  }

  function setButtonLoading(btn, textHtml) {
    if (!btn) return;
    // save original content
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
    if (btn.tagName === "INPUT") {
      btn.value = btn.dataset.__orig || btn.value;
    } else {
      btn.innerHTML = btn.dataset.__orig || btn.innerHTML;
    }
    btn.removeAttribute("data-__orig");
    btn.disabled = false;
    btn.classList.remove("loading");
  }

  // Simple toast notification helper
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

    // auto remove
    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // --- Registration modal, autostart and back-to-top handlers ---
  (function () {
    // open modal(s)
    document.querySelectorAll('#registerBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById('registerModal');
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
      });
    });

    // close handlers
    function closeModal(modal) {
      if (!modal) return;
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = '';
    }

    document.addEventListener('click', function (e) {
      const modal = e.target.closest('.modal');
      if (!modal) return;
      // click on backdrop
      if (e.target === modal) closeModal(modal);
      if (e.target.closest('.modal-close') || e.target.closest('.modal-cancel')) closeModal(modal);
    });

    // submit registration forms (capture to run before global handler)
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!(form && form.id === 'registerForm')) return;
      e.preventDefault();
      e.stopImmediatePropagation();

      const btn = form.querySelector('button[type="submit"], .cta');
      // basic validation
      const name = (form.name && form.name.value || '').trim();
      const email = (form.email && form.email.value || '').trim();
      const password = (form.password && form.password.value || '');

      if (!name || !email || password.length < 6) {
        showToast('Please fill all fields and use password ≥ 6 chars');
        return;
      }

      setButtonLoading(btn, ' Registering...');

      setTimeout(() => {
        // store user in localStorage, but first check duplicate email
        try {
          const raw = localStorage.getItem('users');
          const users = raw ? JSON.parse(raw) : [];
          const exists = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
          if (exists) {
            restoreButton(btn);
            showToast('Account already exists with this email.');
            return;
          }

          const newUser = { name, email, password: password, created: new Date().toISOString() };
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          // set current user
          try { localStorage.setItem('currentUser', JSON.stringify({ name: newUser.name, email: newUser.email })); } catch (e) {}

          // autostart checkbox
          if (form.autostartClock && form.autostartClock.checked) {
            localStorage.setItem('autostartClock', 'true');
          } else {
            localStorage.removeItem('autostartClock');
          }
        } catch (err) {
          console.warn('storage error', err);
        }

        restoreButton(btn);
        showToast('Registration successful — welcome!');
        // close modal (closest)
        const modal = form.closest('.modal');
        closeModal(modal);
        // update header UI to show logged-in user
        try { updateAuthUI(); } catch (e) {}
        // redirect to profile page
        try { window.location.href = 'profile.html'; } catch (e) {}
      }, 900);
    }, true);

    // login form handler (if present on a page)
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!(form && form.id === 'loginForm')) return;
      e.preventDefault();
      e.stopImmediatePropagation();

      const email = (form.email && form.email.value || '').trim();
      const password = (form.password && form.password.value || '');

      if (!email || !password) { showToast('Please enter email and password'); return; }

      setButtonLoading(form.querySelector('button[type="submit"]'), 'Signing in...');
      setTimeout(() => {
        try {
          const raw = localStorage.getItem('users');
          const users = raw ? JSON.parse(raw) : [];
          const found = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase() && u.password === password);
          if (!found) {
            restoreButton(form.querySelector('button[type="submit"]'));
            showToast('Invalid credentials');
            return;
          }
          localStorage.setItem('currentUser', JSON.stringify({ name: found.name, email: found.email }));
          restoreButton(form.querySelector('button[type="submit"]'));
          showToast('Signed in');
          try { updateAuthUI(); } catch (e) {}
          try { window.location.href = 'profile.html'; } catch (e) {}
        } catch (err) { console.warn('login error', err); restoreButton(form.querySelector('button[type="submit"]')); showToast('Sign-in failed'); }
      }, 700);
    }, true);

    // back-to-top behavior
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) backBtn.classList.add('show');
        else backBtn.classList.remove('show');
      });
      backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  })();

  // --- Authentication UI helpers (show username / logout) ---
  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (e) {
      return null;
    }
  }

  function updateAuthUI() {
    const navActions = document.querySelectorAll('.nav-actions');
    navActions.forEach(container => {
      const user = getCurrentUser();
      if (user && user.name) {
        container.innerHTML = `
          <div class="user-badge">
            <a href="profile.html" class="user-name-link">${escapeHtml(user.name)}</a>
            <button id="logoutBtn" class="cta secondary">Logout</button>
          </div>`;
      } else {
        container.innerHTML = `<button id="registerBtn" class="cta secondary">Register</button>`;
      }
    });

    // attach logout handler
    document.querySelectorAll('#logoutBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        try { localStorage.removeItem('currentUser'); } catch (e) {}
        showToast('Logged out');
        updateAuthUI();
      });
    });

    // re-attach register open handlers to dynamically added button
    document.querySelectorAll('#registerBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById('registerModal');
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
      });
    });
  }

  // small helper: escape html for insertion
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (s) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s];
    });
  }

  // initialize auth UI on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthUI);
  } else {
    updateAuthUI();
  }

  document.addEventListener(
    "submit",
    function (e) {
      const form = e.target;
      if (!(form && form.nodeName === "FORM")) return;

      // debug
      console.log("form submit intercepted", form);
      e.preventDefault();

      const submitter =
        e.submitter ||
        getSubmitButton(form) ||
        form.querySelector('button, input[type="submit"]');
      const btn = submitter instanceof Element ? submitter : null;

      if (!btn) {
        console.warn("No submit button found for form", form);
        return;
      }
      if (btn.disabled) {
        console.warn("Submit button already disabled");
        return;
      }

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

        if (form.dataset.realSubmit === "true") {
          form.submit();
        }
      }, delay);
    },
    true
  );
})();

// Preloader: hide overlay after full load with small fade
(function () {
  function removeElementImmediately(el) {
    try {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    } catch (err) { /* ignore */ }
  }

  function hidePreloader() {
    try {
      const pre = document.getElementById('preloader');
      if (!pre) {
        console.debug('preloader: element not found');
        return;
      }
      console.debug('preloader: hiding');
      // add hidden class to trigger CSS transition
      pre.classList.add('hidden');

      // ensure removal even if transitionend does not fire
      const CLEANUP_MS = 900;
      const cleanup = setTimeout(() => removeElementImmediately(pre), CLEANUP_MS);

      pre.addEventListener('transitionend', function (ev) {
        // only remove after opacity transition
        if (ev.propertyName && ev.propertyName.indexOf('opacity') === -1) return;
        clearTimeout(cleanup);
        removeElementImmediately(pre);
      }, { once: true });
    } catch (e) { console.warn('preloader hide error', e); }
  }

  // Fallback: hide after timeout even if load doesn't fire
  const FALLBACK_MS = 2500;

  // If document is already complete, remove shortly after script runs
  if (document.readyState === 'complete') {
    console.debug('preloader: document already complete — scheduling hide');
    setTimeout(hidePreloader, 120);
  } else {
    // Hide on load
    window.addEventListener('load', function () { console.debug('preloader: window.load fired'); setTimeout(hidePreloader, 120); });
    // Also hide on DOM ready as a faster fallback
    document.addEventListener('DOMContentLoaded', function () { console.debug('preloader: DOMContentLoaded — scheduling hide'); setTimeout(hidePreloader, 220); });
    // safety timeout
    setTimeout(function () { console.debug('preloader: fallback timeout reached — hiding'); hidePreloader(); }, FALLBACK_MS);
  }
})();
