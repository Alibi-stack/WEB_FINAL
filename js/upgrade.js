(function () {
  const q = (sel, el = document) => el.querySelector(sel);
  const qa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  function ensureFooter() {
    let ft = q("footer.site-footer");
    if (!ft) {
      ft = document.createElement("footer");
      ft.className = "site-footer";
      ft.innerHTML = `<div class="footer-inner">
        <div class="note" id="teamNote">Team: </div>
        <div class="footer-actions">
          <button class="btn primary" id="btnSubscribe">Subscribe</button>
          <button class="btn" id="btnChangeBg">Change Background</button>
        </div>
      </div>`;
      document.body.appendChild(ft);
    } else {
      const inner =
        q(".footer-inner", ft) ||
        ft.appendChild(
          Object.assign(document.createElement("div"), {
            className: "footer-inner",
          })
        );
      if (!q("#btnSubscribe", inner)) {
        const actions =
          q(".footer-actions", inner) ||
          inner.appendChild(
            Object.assign(document.createElement("div"), {
              className: "footer-actions",
            })
          );
        const b1 = Object.assign(document.createElement("button"), {
          className: "btn primary",
          id: "btnSubscribe",
          textContent: "Subscribe",
        });
        const b2 = Object.assign(document.createElement("button"), {
          className: "btn",
          id: "btnChangeBg",
          textContent: "Change Background",
        });
        actions.appendChild(b1);
        actions.appendChild(b2);
      }
      if (!q("#teamNote", inner)) {
        const note = Object.assign(document.createElement("div"), {
          className: "note",
          id: "teamNote",
        });
        inner.prepend(note);
      }
    }
  }

  function ensureHeaderClock() {
    const header =
      q(".site-header .header-inner, header.site-header .header-inner") ||
      q(".site-header") ||
      q("header");
    if (!header) return;
    if (!q(".live-clock", header)) {
      const clock = document.createElement("div");
      clock.className = "live-clock";
      header.appendChild(clock);
      setInterval(() => {
        const d = new Date();
        clock.textContent = d.toLocaleString();
      }, 1000);
    }
  }

  function ensureFooterNames() {
    const el = q("#teamNote");
    if (!el) return;
    el.textContent = "Team: SE-2404 —  Alibi • Sultan";
  }

  function injectModal() {
    if (q("#modalBackdrop")) return;
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "modalBackdrop";
    backdrop.innerHTML = `<div class="modal">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <h3>Subscribe</h3>
        <button class="btn ghost" id="modalClose">×</button>
      </div>
      <form id="subscribeForm" novalidate>
        <div class="field"><label>Name</label><input type="text" name="name" required></div>
        <div class="field"><label>Email</label><input type="email" name="email" required></div>
        <div class="field"><label>Password (min 6)</label><input type="password" name="password" required></div>
        <div class="field"><label>Confirm Password</label><input type="password" name="confirm" required></div>
        <div class="error" id="formErrors" style="display:none"></div>
        <div class="success" id="formSuccess" style="display:none"></div>
        <div style="margin-top:12px;display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn" id="modalCancel">Cancel</button>
          <button type="submit" class="btn primary">Submit</button>
        </div>
      </form>
    </div>`;
    document.body.appendChild(backdrop);

    const show = () => (backdrop.style.display = "flex");
    const hide = () => (backdrop.style.display = "none");

    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "btnSubscribe") {
        show();
      }
      if (
        e.target &&
        (e.target.id === "modalCancel" ||
          e.target.id === "modalClose" ||
          e.target === backdrop)
      ) {
        hide();
      }
    });

    const form = q("#subscribeForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const errs = [];
      if (!data.name) errs.push("Name is required.");
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        errs.push("Valid email is required.");
      if (!data.password || data.password.length < 6)
        errs.push("Password must be at least 6 characters.");
      if (data.password !== data.confirm) errs.push("Passwords do not match.");

      const ebox = q("#formErrors"),
        sbox = q("#formSuccess");
      if (errs.length) {
        ebox.style.display = "block";
        ebox.textContent = "Please fix: " + errs.join(" ");
        sbox.style.display = "none";
      } else {
        ebox.style.display = "none";
        sbox.style.display = "block";
        sbox.textContent = "Thanks! You are subscribed.";
        setTimeout(() => hide(), 1000);
      }
    });
  }

  function bindBackgroundChanger() {
    const palettes = [
      ["#f8fafc", "#ffffff"],
      ["#fff7ed", "#fffbeb"],
      ["#f0f9ff", "#ecfeff"],
      ["#fdf2f8", "#fce7f3"],
    ];
    let i = 0;
    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "btnChangeBg") {
        i = (i + 1) % palettes.length;
        const [a, b] = palettes[i];
        document.body.style.background = `linear-gradient(180deg, ${a}, ${b})`;
        toast("Background updated");
      }
    });
  }

  function ensureFAQ() {
    if (!/about\.html(\?|#|$)/i.test(location.pathname)) return;
    if (q(".faq")) return;
    const main = q("main") || q(".main") || document.body;
    const wrap = document.createElement("section");
    wrap.className = "faq container";
    wrap.innerHTML = `
      <h2>Frequently Asked Questions</h2>
      <div class="faq-item">
        <div class="faq-q">How do online lessons work? <span>▾</span></div>
        <div class="faq-a">Lessons are delivered via a virtual classroom with recordings, chat, and interactive tasks.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">Can I download materials?</div>
        <div class="faq-a">Yes, slides, tasks, and project files are available after each lesson.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">Is there a support chat?</div>
        <div class="faq-a">Our mentors reply 7 days a week within 24 hours.</div>
      </div>
    `;
    main.appendChild(wrap);
    qa(".faq-q", wrap).forEach((qel) => {
      qel.addEventListener("click", () => {
        qel.parentElement.classList.toggle("open");
      });
    });
  }

  function toast(msg) {
    let t = q(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(t._h);
    t._h = setTimeout(() => (t.style.display = "none"), 1600);
  }

  function boot() {
    removeOldFooters();
    ensureFooter();
    ensureHeaderClock();
    ensureFooterNames();
    injectModal();
    bindBackgroundChanger();
    ensureFAQ();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

function removeOldFooters() {
  document.querySelectorAll("footer").forEach((f) => {
    if (!f.classList.contains("site-footer")) {
      f.remove();
    }
  });
}

document.querySelectorAll(".rating .star").forEach((star, index, stars) => {
  star.addEventListener("click", () => {
    stars.forEach((otherStar, otherIndex) => {
      if (otherIndex <= index) {
        otherStar.classList.add("selected");
      } else {
        otherStar.classList.remove("selected");
      }
    });
  });
});
// Guarded handlers: only attach when elements exist to avoid runtime errors on pages
const updateProgressBtn = document.getElementById("updateProgressBtn");
const courseProgress = document.getElementById("courseProgress");
if (updateProgressBtn && courseProgress) {
  updateProgressBtn.addEventListener("click", () => {
    courseProgress.textContent = "Great job! You completed this module.";
  });
}

const readMoreBtn = document.getElementById("readMoreBtn");
const extraContent = document.getElementById("extraContent");
if (readMoreBtn && extraContent) {
  readMoreBtn.addEventListener("click", () => {
    if (extraContent.style.display === "none") {
      extraContent.style.display = "block";
      readMoreBtn.textContent = "Read Less";
    } else {
      extraContent.style.display = "none";
      readMoreBtn.textContent = "Read More";
    }
  });
}

const course = {
  name: "Web Development",
  description: "Learn HTML, CSS, and JavaScript",
  rating: 4.5,

  updateRating(newRating) {
    this.rating = newRating;
    const el = document.getElementById("courseRating");
    if (el) el.textContent = `Rating: ${this.rating}`;
  },
};

const courseNameEl = document.getElementById("courseName");
if (courseNameEl) courseNameEl.textContent = course.name;
const courseDescriptionEl = document.getElementById("courseDescription");
if (courseDescriptionEl) courseDescriptionEl.textContent = course.description;
const courseRatingEl = document.getElementById("courseRating");
if (courseRatingEl) courseRatingEl.textContent = `Rating: ${course.rating}`;

const updateRatingBtn = document.getElementById("updateRatingBtn");
if (updateRatingBtn) {
  updateRatingBtn.addEventListener("click", () => {
    course.updateRating(5);
  });
}

const courses = [
  { name: "Web Development", description: "Learn HTML, CSS, and JavaScript" },
  {
    name: "Data Science",
    description: "Learn Python, Data Analysis, and Machine Learning",
  },
  { name: "UI/UX Design", description: "Learn design principles and tools" },
];

const coursesList = document.getElementById("coursesList");
if (coursesList) {
  courses.forEach((course) => {
    const courseItem = document.createElement("li");
    courseItem.textContent = `${course.name}: ${course.description}`;
    coursesList.appendChild(courseItem);
  });
}

const courseNames = courses.map((course) => course.name);
console.log(courseNames);

const courseNamesList = document.getElementById("courseNamesList");
if (courseNamesList) {
  courseNames.forEach((name) => {
    const listItem = document.createElement("li");
    listItem.textContent = name;
    courseNamesList.appendChild(listItem);
  });
}

const notificationSound = new Audio("notification.mp3");
const playSoundBtn = document.getElementById("playSoundBtn");
if (playSoundBtn) {
  playSoundBtn.addEventListener("click", () => {
    try { notificationSound.play(); } catch (e) { console.warn('sound play failed', e); }
  });
}
