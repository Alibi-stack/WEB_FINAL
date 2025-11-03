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

// --- Profile edit helpers (kept at top-level) ---
function restoreProfileView() {
  const card = document.getElementById('profileCard');
  if (!card) return;
  card.innerHTML = `
    <h3 id="profileName">—</h3>
    <p id="profileEmail">—</p>
    <div style="margin-top:12px;display:flex;gap:8px;">
      <a id="editProfile" class="cta" href="#">Edit</a>
      <button id="signOutBtn" class="cta secondary">Sign out</button>
    </div>`;

  // repopulate from storage
  try {
    const user = getCurrentUser();
    if (user) {
      const n = document.getElementById('profileName');
      const e = document.getElementById('profileEmail');
      if (n) n.textContent = user.name || '—';
      if (e) e.textContent = user.email || '—';
    }
  } catch (err) { /* ignore */ }

  // rebind buttons
  bindDirectEdit();
  const sign = document.getElementById('signOutBtn');
  if (sign) sign.addEventListener('click', function () { try { localStorage.removeItem('currentUser'); } catch (e) {} try { window.location.href = 'index.html'; } catch (e) {} });
}

function openProfileEditor() {
  const user = getCurrentUser();
  if (!user) { showToast('Not signed in'); return; }
  const card = document.getElementById('profileCard');
  if (!card) return;
  const originalEmail = (user.email || '').toLowerCase();
  card.innerHTML = `
    <h3>Edit profile</h3>
    <form id="profileEditForm" class="modal-form">
      <label>Name<input name="name" required value="${escapeHtml(user.name || '')}" /></label>
      <label>Email<input name="email" type="email" required value="${escapeHtml(user.email || '')}" /></label>
      <div style="margin-top:12px;display:flex;gap:8px;">
        <button type="submit" class="cta">Save</button>
        <button type="button" id="profileCancel" class="cta secondary">Cancel</button>
      </div>
    </form>`;

  const form = document.getElementById('profileEditForm');
  const cancel = document.getElementById('profileCancel');

  if (cancel) cancel.addEventListener('click', function () { restoreProfileView(); });

  if (form) form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    const name = (form.name && form.name.value || '').trim();
    const email = (form.email && form.email.value || '').trim();
    if (!name || !email) { showToast('Name and email are required'); return; }

    try {
      const raw = localStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      // check duplicate email (other user)
      const dup = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase() && u.email.toLowerCase() !== originalEmail);
      if (dup) { showToast('Email already in use'); return; }

      let updated = false;
      const newUsers = users.map(u => {
        if (u.email && u.email.toLowerCase() === originalEmail) {
          updated = true;
          return Object.assign({}, u, { name: name, email: email });
        }
        return u;
      });
      if (!updated) {
        newUsers.push({ name: name, email: email, created: new Date().toISOString() });
      }
      localStorage.setItem('users', JSON.stringify(newUsers));
      localStorage.setItem('currentUser', JSON.stringify({ name: name, email: email }));
      showToast('Profile updated');
      restoreProfileView();
      try { updateAuthUI(); } catch (e) {}
    } catch (err) {
      console.warn('profile update error', err);
      showToast('Failed to update profile');
    }
  });
}

// Delegated click handler for edit link (works for dynamic content)
document.addEventListener('click', function (e) {
  if (!e.target) return;
  if (e.target.id === 'editProfile') {
    // if the link has an href that navigates to another page, allow the navigation
    try {
      const href = e.target.getAttribute && e.target.getAttribute('href');
      if (href && href.trim() !== '' && href.trim() !== '#') {
        // allow default navigation
        return;
      }
    } catch (err) { /* ignore and fallthrough */ }
    e.preventDefault();
    openProfileEditor();
  }
});

// direct bind (for cases where element exists statically)
function bindDirectEdit() {
  const edit = document.getElementById('editProfile');
  if (edit && !edit._profileBound) {
    edit.addEventListener('click', function (ev) {
      try {
        const href = edit.getAttribute && edit.getAttribute('href');
        if (href && href.trim() !== '' && href.trim() !== '#') {
          // let link navigate
          return;
        }
      } catch (err) {}
      ev.preventDefault();
      openProfileEditor();
    });
    edit._profileBound = true;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindDirectEdit);
} else {
  bindDirectEdit();
}

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
    // open modal(s) via unified account button (Account -> choose Login/Register)
    document.querySelectorAll('#accountBtn, #registerBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const acct = document.getElementById('accountModal');
        if (acct) {
          acct.setAttribute('aria-hidden', 'false');
          acct.style.display = 'flex';
          // if triggered from a Register button, show register panel
          const regPanel = acct.querySelector('#registerPanel');
          const logPanel = acct.querySelector('#loginPanel');
          if (btn.id === 'registerBtn' && regPanel && logPanel) {
            regPanel.style.display = 'block';
            logPanel.style.display = 'none';
          } else if (regPanel && logPanel) {
            // default to login view
            regPanel.style.display = 'none';
            logPanel.style.display = 'block';
          }
          return;
        }
        // fallback: do nothing
      });
    });

    // login button handler
    document.querySelectorAll('#loginBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // prefer opening unified account modal when present
        const acct = document.getElementById('accountModal');
        if (acct) {
          acct.setAttribute('aria-hidden', 'false');
          acct.style.display = 'flex';
          // show login panel
          const regPanel = acct.querySelector('#registerPanel');
          const logPanel = acct.querySelector('#loginPanel');
          if (regPanel && logPanel) { regPanel.style.display = 'none'; logPanel.style.display = 'block'; }
          return;
        }
        return;
      });
    });

    // switch between login and register panels inside unified account modal
    function showAccountPanel(which) {
      const acct = document.getElementById('accountModal');
      if (!acct) return;
      const reg = acct.querySelector('#registerPanel');
      const log = acct.querySelector('#loginPanel');
      if (which === 'register') {
        if (reg && log) { reg.style.display = 'block'; log.style.display = 'none'; }
      } else {
        if (reg && log) { reg.style.display = 'none'; log.style.display = 'block'; }
      }
    }

    document.querySelectorAll('#switchToRegister, #showRegister').forEach(btn => {
      btn.addEventListener('click', () => {
        const acct = document.getElementById('accountModal');
        if (acct) {
          acct.setAttribute('aria-hidden', 'false');
          acct.style.display = 'flex';
          showAccountPanel('register');
          return;
        }
      });
    });

    document.querySelectorAll('#showLogin').forEach(btn => {
      btn.addEventListener('click', () => {
        const acct = document.getElementById('accountModal');
        if (acct) {
          acct.setAttribute('aria-hidden', 'false');
          acct.style.display = 'flex';
          showAccountPanel('login');
          return;
        }
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
      // ensure we have the form element (some browsers/handlers may give the submit button as target)
      let form = e.target;
      if (form && form.nodeName !== 'FORM' && form.closest) form = form.closest('form');
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
      // ensure we have the form element (target might be the button)
      let form = e.target;
      if (form && form.nodeName !== 'FORM' && form.closest) form = form.closest('form');
      if (!(form && form.id === 'loginForm')) return;
      e.preventDefault();
      e.stopImmediatePropagation();

      const email = (form.email && form.email.value || '').trim();
      const password = (form.password && form.password.value || '');

      console.debug('loginForm submit', { email, passwordPresent: !!password });

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
        container.innerHTML = `<button id="accountBtn" class="cta secondary">Account</button>`;
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

    // re-attach account open handlers to dynamically added button
    document.querySelectorAll('#accountBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const acct = document.getElementById('accountModal');
        if (acct) {
          acct.setAttribute('aria-hidden', 'false');
          acct.style.display = 'flex';
          // default to login view
          const regPanel = acct.querySelector('#registerPanel');
          const logPanel = acct.querySelector('#loginPanel');
          if (regPanel && logPanel) { regPanel.style.display = 'none'; logPanel.style.display = 'block'; }
          return;
        }
        // If account modal isn't present on this page (not index), redirect to index and request the login panel
        try {
          const target = 'index.html#account=login';
          window.location.href = target;
        } catch (e) { /* ignore */ }
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

  // If the URL contains #account=login or #account=register, open the unified modal (index-only)
  function processAccountHash() {
    try {
      const h = window.location.hash || '';
      const m = h.match(/account=(login|register)/);
      if (!m) return;
      const acct = document.getElementById('accountModal');
      if (!acct) return;
      acct.setAttribute('aria-hidden', 'false');
      acct.style.display = 'flex';
      const regPanel = acct.querySelector('#registerPanel');
      const logPanel = acct.querySelector('#loginPanel');
      if (m[1] === 'register') {
        if (regPanel && logPanel) { regPanel.style.display = 'block'; logPanel.style.display = 'none'; }
      } else {
        if (regPanel && logPanel) { regPanel.style.display = 'none'; logPanel.style.display = 'block'; }
      }
      // remove the hash without adding history entry
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (e) { /* ignore */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processAccountHash);
  } else {
    processAccountHash();
  }

  document.addEventListener(
    "submit",
    function (e) {
      const form = e.target;
      if (!(form && form.nodeName === "FORM")) return;
      // do not intercept the dedicated profile edit page form; let it handle submission
      if (form.id === 'profileEditPageForm') return;

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
