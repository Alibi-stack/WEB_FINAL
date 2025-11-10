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

// --- Lightweight i18n: EN / RU / KZ ---
(function () {
  const LOCALE_KEY = 'site_locale';
  const available = ['en', 'ru', 'kz'];

  const T = {
    en: {
      nav_home: 'Home',
      nav_courses: 'Courses',
      nav_course: 'Course',
      nav_about: 'About',
      account: 'Account',
      register: 'Register',
      login: 'Login',
      show_time: 'Show Current Time',
      hide_time: 'Hide Current Time',
      light: 'Light',
      dark: 'Dark',
      read_more: 'Read More',
      read_less: 'Read Less',
      enroll_now: 'Enroll now',
      back_to_courses: 'Back to courses',
      your_progress_prefix: 'Your Progress:',
      update_progress: 'Update Progress',
      // additional keys
      hero_title: "It's easy to study with us",
      hero_subtitle: 'Video lessons at your own pace, weekly online sessions, and progress tracking. No distractions, just results.',
      cta_browse: 'Browse Courses',
      cta_how: 'How it works',
      kpi_videos: 'Video lessons',
      kpi_access: 'Access anywhere',
      popular_now: 'Popular right now',
      all_courses: 'All Courses',
      search_placeholder: 'Search courses…',
      course_brief: 'This is a brief description of the course.',
      course_extra: 'This is the extra content about the course. Here you can provide more detailed information like syllabus, learning objectives, or other relevant content.',
      what_you_learn: "What you'll learn",
      weekly_plan: 'Weekly plan',
      th_week: 'Week', th_topic: 'Topic', th_outcome: 'Outcome',
      enroll: 'Enroll', self_paced: 'Self‑paced • 8–10 hours total',
      requirements: 'Requirements',
      about_title: 'About Znanija Land', about_brief: 'We present a simple online learning system focused on: clear lessons, personal goals and progress.',
      our_method: 'Our method', m_videos: 'Short, focused videos (≤ 10 minutes)', m_practice: 'Practice after every lesson', m_weekly: 'Weekly live Q and A',
      contact: 'Contact', contact_email: 'Email: support@znanijalearn.example', contact_telegram: 'Telegram: @likaacher', contact_address: 'Address: AITU, Astana, KZ',
      your_profile: 'Your profile', edit: 'Edit', sign_out: 'Sign out',
      // courses page cards
      badge_web: 'Web', course_web_title: 'WEB Technologies', course_web_desc: 'Build your first 3 websites with semantic HTML & modern CSS.',
      badge_data: 'Data', course_py_title: 'Intro to Python', course_py_desc: 'Learn variables, loops, functions and read/write files.',
      badge_lang: 'Languages', course_eng_title: 'English for Tech', course_eng_desc: 'Level up your speaking and writing.',
      badge_math: 'Math', course_math_title: 'Discrete Math Basics', course_math_desc: 'Logic, sets, graphs, and counting techniques.',
      badge_spoiler: 'Spoiler', course_new_title: 'New subject', course_new_desc: 'Will be soon...', start_cta: 'Start',
    },
    ru: {
      nav_home: 'Главная',
      nav_courses: 'Курсы',
      nav_course: 'Курс',
      nav_about: 'О нас',
      account: 'Аккаунт',
      register: 'Регистрация',
      login: 'Войти',
      show_time: 'Показать текущее время',
      hide_time: 'Скрыть время',
      light: 'Светлая',
      dark: 'Тёмная',
      read_more: 'Подробнее',
      read_less: 'Свернуть',
      enroll_now: 'Записаться',
      back_to_courses: 'К списку курсов',
      your_progress_prefix: 'Ваш прогресс:',
      update_progress: 'Обновить прогресс',
      // additional
      hero_title: 'Учиться с нами просто',
      hero_subtitle: 'Видеоуроки в удобном темпе, еженедельные онлайн‑сессии и отслеживание прогресса. Ничто не отвлекает — только результат.',
      cta_browse: 'Просмотреть курсы',
      cta_how: 'Как это работает',
      kpi_videos: 'Видеоуроки',
      kpi_access: 'Доступ в любое время',
      popular_now: 'Популярные сейчас',
      all_courses: 'Все курсы',
      search_placeholder: 'Поиск курсов…',
      course_brief: 'Краткое описание курса.',
      course_extra: 'Это дополнительная информация о курсе. Здесь можно указать программу, цели обучения и другие полезные сведения.',
      what_you_learn: 'Что вы узнаете',
      weekly_plan: 'Еженедельный план',
      th_week: 'Неделя', th_topic: 'Тема', th_outcome: 'Результат',
      enroll: 'Записаться', self_paced: 'Самостоятельно • 8–10 часов',
      requirements: 'Требования',
      about_title: 'О Znanija Land', about_brief: 'Мы представляем простую систему онлайн‑обучения, ориентированную на: понятные уроки, личные цели и прогресс.',
      our_method: 'Наш метод', m_videos: 'Короткие фокусные видео (≤ 10 минут)', m_practice: 'Практика после каждого урока', m_weekly: 'Еженедельные живые вопросы и ответы',
      contact: 'Контакты', contact_email: 'Email: support@znanijalearn.example', contact_telegram: 'Telegram: @likaacher', contact_address: 'Адрес: AITU, Astana, KZ',
      your_profile: 'Ваш профиль', edit: 'Редактировать', sign_out: 'Выйти',
      // courses page cards
      badge_web: 'Web', course_web_title: 'WEB Технологии', course_web_desc: 'Постройте первые 3 сайта с семантическим HTML и современным CSS.',
      badge_data: 'Data', course_py_title: 'Введение в Python', course_py_desc: 'Изучите переменные, циклы, функции и работу с файлами.',
      badge_lang: 'Languages', course_eng_title: 'Английский для IT', course_eng_desc: 'Улучшите разговорные и письменные навыки.',
      badge_math: 'Math', course_math_title: 'Основы дискретной математики', course_math_desc: 'Логика, множества, графы и комбинирование.',
      badge_spoiler: 'Spoiler', course_new_title: 'Новый предмет', course_new_desc: 'Скоро появится...', start_cta: 'Начать',
    },
    kz: {
      nav_home: 'Басты бет',
      nav_courses: 'Курстар',
      nav_course: 'Курс',
      nav_about: 'Біз туралы',
      account: 'Есептік жазба',
      register: 'Тіркелу',
      login: 'Кіру',
      show_time: 'Ағымдағы уақытты көрсету',
      hide_time: 'Уақытты жасыру',
      light: 'Жарық',
      dark: 'Қараңғы',
      read_more: 'Толығырақ',
      read_less: 'Жабу',
      enroll_now: 'Тіркелу',
      back_to_courses: 'Курстарға оралу',
      your_progress_prefix: 'Сіздің прогресс:',
      update_progress: 'Прогресті жаңарту',
      // additional
      hero_title: 'Бізбен оқу оңай',
      hero_subtitle: 'Өз ырғағымен оқитын бейнесабақтар, апталық онлайн-сессиялар және прогресті бақылау. Назар аудармай, тек нәтиже.',
      cta_browse: 'Курстарды көру',
      cta_how: 'Қалай жұмыс істейді',
      kpi_videos: 'Бейнесабақтар',
      kpi_access: 'Кез келген жерде қол жетімді',
      popular_now: 'Қазір танымал',
      all_courses: 'Барлық курстар',
      search_placeholder: 'Курс іздеу…',
      course_brief: 'Курс туралы қысқаша сипаттама.',
      course_extra: 'Курс туралы қосымша ақпарат. Мұнда оқу жоспары, оқу мақсаттары және басқа да пайдалы мәліметтер беруге болады.',
      what_you_learn: 'Сіз не үйренесіз',
      weekly_plan: 'Апталық жоспар',
      th_week: 'Апта', th_topic: 'Тақырып', th_outcome: 'Нәтиже',
      enroll: 'Тіркелу', self_paced: 'Өзіндік оқу • 8–10 сағат',
      requirements: 'Талаптар',
      about_title: 'Znanija Land туралы', about_brief: 'Біз қарапайым онлайн оқу жүйесін ұсынамыз: түсінікті сабақтар, жеке мақсаттар және прогресс.',
      our_method: 'Біздің әдіс', m_videos: 'Қысқа, мақсатты бейнесабақтар (≤ 10 минут)', m_practice: 'Әр сабақтан кейін тәжірибе', m_weekly: 'Апталық тікелей Q&A',
      contact: 'Байланыс', contact_email: 'Email: support@znanijalearn.example', contact_telegram: 'Telegram: @likaacher', contact_address: 'Мекен-жайы: AITU, Astana, KZ',
      your_profile: 'Профиліңіз', edit: 'Өзгерту', sign_out: 'Шығу',
      // courses page cards
      badge_web: 'Web', course_web_title: 'WEB Технологиялары', course_web_desc: 'Семантикалық HTML және заманауи CSS көмегімен алғашқы 3 веб-сайтыңызды жасаңыз.',
      badge_data: 'Data', course_py_title: 'Python-ға кіріспе', course_py_desc: 'Айнымалыларды, циклдерді, функцияларды және файлдармен жұмыс жасауды үйреніңіз.',
      badge_lang: 'Languages', course_eng_title: 'Технологиялар үшін ағылшын', course_eng_desc: 'Сөйлеу мен жазу дағдыларын жетілдіріңіз.',
      badge_math: 'Math', course_math_title: 'Дискреттік математиканың негіздері', course_math_desc: 'Логика, жиындар, графтар және есептеу тәсілдері.',
      badge_spoiler: 'Spoiler', course_new_title: 'Жаңа пән', course_new_desc: 'Жақында пайда болады...', start_cta: 'Бастау',
    }
  };

  function getLocale() {
    try {
      const saved = localStorage.getItem(LOCALE_KEY);
      if (saved && available.includes(saved)) return saved;
    } catch (e) {}
    const nav = (navigator.language || navigator.userLanguage || 'en').slice(0,2);
    if (available.includes(nav)) return nav;
    return 'en';
  }

  function saveLocale(loc) {
    try { localStorage.setItem(LOCALE_KEY, loc); } catch (e) {}
  }

  function translatePage(loc) {
    const dict = T[loc] || T.en;

    // header menu: rely on order of links
    document.querySelectorAll('.container.nav').forEach(container => {
      const menu = container.querySelector('.menu');
      if (menu) {
        const links = Array.from(menu.querySelectorAll('a'));
        if (links[0]) links[0].textContent = dict.nav_home;
        if (links[1]) links[1].textContent = dict.nav_courses;
        if (links[2]) links[2].textContent = dict.nav_course;
        if (links[3]) links[3].textContent = dict.nav_about;
      }

      // nav-actions button text(s)
      const actions = container.querySelector('.nav-actions');
      if (actions) {
        const acctBtn = actions.querySelector('#accountBtn');
        if (acctBtn) acctBtn.textContent = dict.account;
        // register/login on index page
        const registerBtn = actions.querySelector('#registerBtn');
        const loginBtn = actions.querySelector('#loginBtn');
        if (registerBtn) registerBtn.textContent = dict.register;
        if (loginBtn) loginBtn.textContent = dict.login;
      }

      // weather widget and language selector remain unaffected
    });

    // global buttons
    const timeBtn = document.getElementById('timeButton');
    if (timeBtn) {
      // preserve state if it currently shows Hide
      const isShowing = timeBtn.textContent && timeBtn.textContent.toLowerCase().indexOf('hide') !== -1;
      timeBtn.textContent = isShowing ? dict.hide_time : dict.show_time;
    }
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      // detect current theme
      const isDark = document.documentElement.classList.contains('dark');
      themeBtn.textContent = isDark ? dict.dark : dict.light;
    }

    // course page specific
    const readBtn = document.getElementById('readMoreBtn');
    if (readBtn) {
      readBtn.textContent = (document.getElementById('extraContent') && document.getElementById('extraContent').style.display === 'block') ? dict.read_less : dict.read_more;
    }

    const enrollButtons = document.querySelectorAll('aside.card .enroll a.cta');
    if (enrollButtons && enrollButtons.length) {
      if (enrollButtons[0]) enrollButtons[0].textContent = dict.enroll_now;
      if (enrollButtons[1]) enrollButtons[1].textContent = dict.back_to_courses;
    }

    const progressEl = document.getElementById('courseProgress');
    if (progressEl) {
      // read numeric part if present
      const cur = (progressEl.textContent || '').match(/(\d+)%/);
      const pct = cur ? cur[1] : '';
      progressEl.textContent = dict.your_progress_prefix + (pct ? ' ' + pct + '%' : '');
    }
const updateBtn = document.getElementById('updateProgressBtn');
    if (updateBtn) updateBtn.textContent = dict.update_progress;

    // document title: if it contains known words, replace minimal
    try {
      document.title = document.title.replace(/Home|Courses|Course|About|Курсы|Курс|О нас|Главная/gi, function(m){
        // map to nav values if present
        const map = {
          'Home': dict.nav_home, 'Courses': dict.nav_courses, 'Course': dict.nav_course, 'About': dict.nav_about,
          'Главная': dict.nav_home, 'Курсы': dict.nav_courses, 'Курс': dict.nav_course, 'О нас': dict.nav_about
        };
        return map[m] || m;
      });
    } catch (e) {}

      // Generic: elements with data-i18n attribute
      try {
        document.querySelectorAll('[data-i18n]').forEach(function(el){
          const key = el.getAttribute('data-i18n');
          if (!key) return;
          if (dict[key] !== undefined) el.textContent = dict[key];
        });

        // placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
          const key = el.getAttribute('data-i18n-placeholder');
          if (!key) return;
          if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
        });
      } catch (e) { /* ignore */ }
  }

  function injectLangSelector() {
    document.querySelectorAll('.container.nav').forEach(container => {
      if (container.querySelector('.lang-select')) return; // already
      const actions = container.querySelector('.nav-actions');
      const wrap = document.createElement('div');
      wrap.className = 'lang-select';
      const sel = document.createElement('select');
      sel.setAttribute('aria-label', 'Language');
      const opts = [{v:'en', t:'EN'}, {v:'ru', t:'RU'}, {v:'kz', t:'KZ'}];
      opts.forEach(o => { const option = document.createElement('option'); option.value = o.v; option.textContent = o.t; sel.appendChild(option); });
      wrap.appendChild(sel);
      // insert before actions so it's visible and not overwritten
      if (actions) container.insertBefore(wrap, actions);

      const loc = getLocale();
      sel.value = loc;
      sel.addEventListener('change', function () {
        const val = sel.value;
        if (!available.includes(val)) return;
        saveLocale(val);
        translatePage(val);
      });
    });
  }

  // init
  const initial = getLocale();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { injectLangSelector(); translatePage(initial); });
  } else { injectLangSelector(); translatePage(initial); }

})();



// --- Course page helpers: Read More, Stars (rating), Update Progress ---
(function () {
  function courseIdKey() {
    // derive a course-specific key from pathname + title to avoid collisions
    try {
      const p = (window.location.pathname || '').replace(/\W+/g, '-');
      const t = (document.querySelector('h1') && document.querySelector('h1').textContent) || document.title || 'course';
      const name = (t || 'course').toString().trim().toLowerCase().replace(/\W+/g, '-');
      return 'zn_course_' + (p || '') + '::' + name;
    } catch (e) { return 'zn_course_unknown'; }
  }

  function initReadMore() {
    const btn = document.getElementById('readMoreBtn');
    const extra = document.getElementById('extraContent');
    if (!btn || !extra) return;
    btn.addEventListener('click', function () {
      const open = extra.style.display !== 'block';
      extra.style.display = open ? 'block' : 'none';
      btn.textContent = open ? 'Read Less' : 'Read More';
    });
  }

  function initStars() {
    const rating = document.querySelector('.rating');
    if (!rating) return;
    const stars = Array.from(rating.querySelectorAll('.star'));
    if (!stars.length) return;
    const key = courseIdKey() + '::rating';

    function render(value) {
      stars.forEach((s, idx) => {
        if (idx < value) s.classList.add('selected');
        else s.classList.remove('selected');
        // update visual glyph: filled star for selected
        s.textContent = (idx < value) ? '★' : '☆';
      });
    }

    // restore
    try {
      const stored = localStorage.getItem(key);
      const val = stored ? Number(stored) : 0;
      if (val && !Number.isNaN(val)) render(val);
    } catch (e) { /* ignore */ }

    stars.forEach((s, idx) => {
      s.style.cursor = 'pointer';
      s.addEventListener('click', function () {
        const value = idx + 1; // 1..5
        render(value);
        try { localStorage.setItem(key, String(value)); } catch (e) {}
      });
    });
  }

  function initProgress() {
    const btn = document.getElementById('updateProgressBtn');
    const output = document.getElementById('courseProgress');
    if (!btn || !output) return;
    const key = courseIdKey() + '::progress';

    function render(pct) {
      output.textContent = 'Your Progress: ' + pct + '%';
      output.setAttribute('aria-valuenow', String(pct));
    }

    // restore
    try {
      const stored = localStorage.getItem(key);
      const val = stored ? Number(stored) : 0;
      render((!Number.isNaN(val) && val >= 0) ? val : 0);
    } catch (e) { render(0); }

    btn.addEventListener('click', function () {
      try {
        const cur = Number(localStorage.getItem(key) || '0') || 0;
        const next = Math.min(100, cur + 10);
        localStorage.setItem(key, String(next));
        render(next);
      } catch (e) { console.warn('updateProgress error', e); }
    });
  }

  function initAll() {
    initReadMore();
    initStars();
    initProgress();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();


// --- Lightweight weather widget using Open-Meteo (no API key) ---
(function () {
  const DEFAULT_COORDS = { latitude: 51.5074, longitude: -0.1278 }; // London fallback

  function codeToEmoji(code) {
    // Open-Meteo weathercode mapping (simplified)
    if (code === 0) return '☀️';
    if (code === 1 || code === 2 || code === 3) return '⛅';
    if (code === 45 || code === 48) return '🌫️';
    if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67)) return '🌧️';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  }

  function render(widget, data) {
    if (!widget) return;
    if (!data) {
      widget.querySelector('.weather-icon').textContent = '';
      widget.querySelector('.weather-temp').textContent = '--°';
      widget.querySelector('.weather-city').textContent = '';
      return;
    }
    const emoji = codeToEmoji(data.weathercode);
    widget.querySelector('.weather-icon').textContent = emoji;
    const t = Math.round(data.temperature);
    widget.querySelector('.weather-temp').textContent = t + '°C';
    if (data.name) widget.querySelector('.weather-city').textContent = data.name;
  }

  function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh`;
    return fetch(url).then(r => {
      if (!r.ok) throw new Error('weather fetch failed');
      return r.json();
    }).then(json => {
      if (!json || !json.current_weather) throw new Error('no current weather');
      return {
        temperature: json.current_weather.temperature,
        weathercode: json.current_weather.weathercode,
        windspeed: json.current_weather.windspeed
      };
    });
  }

  function initWeatherFor(container) {
    try {
      const actions = container.querySelector('.nav-actions');
      if (!actions) return;
      // don't place widget inside .nav-actions (it gets overwritten by updateAuthUI)
      if (container.querySelector('#weatherWidget')) return; // already added

      const w = document.createElement('div');
      w.id = 'weatherWidget';
      w.className = 'weather-widget';
      w.innerHTML = `<button type="button" class="weather-refresh" title="Refresh weather">⟳</button><span class="weather-icon" aria-hidden="true"></span><span class="weather-temp">--°</span><span class="weather-city" style="margin-left:6px;color:var(--muted);font-weight:600;font-size:13px"></span>`;
      // insert as a sibling before the .nav-actions element so it's not removed by scripts
      container.insertBefore(w, actions);

      const refresh = w.querySelector('.weather-refresh');
      refresh.addEventListener('click', function () { runFetch(w); });

      // attempt geolocation first, then fallback to OPEN-METEO via default coords
      function runFetch(widgetEl) {
        render(widgetEl, null);
        if (navigator.geolocation) {
          let called = false;
          const timer = setTimeout(() => {
            if (!called) {
              called = true;
              fetchWeather(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude).then(d => render(widgetEl, d)).catch(() => render(widgetEl, null));
            }
          }, 4000);

          navigator.geolocation.getCurrentPosition(function (pos) {
            if (called) return;
            called = true;
            clearTimeout(timer);
            fetchWeather(pos.coords.latitude, pos.coords.longitude).then(d => render(widgetEl, d)).catch(() => {
              // fallback to default
              fetchWeather(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude).then(dd => render(widgetEl, dd)).catch(() => render(widgetEl, null));
            });
          }, function (err) {
            if (called) return;
            called = true;
            clearTimeout(timer);
            // permission denied or error -> fallback
            fetchWeather(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude).then(d => render(widgetEl, d)).catch(() => render(widgetEl, null));
          }, { timeout: 4000 });
        } else {
          // no geolocation available
          fetchWeather(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude).then(d => render(widgetEl, d)).catch(() => render(widgetEl, null));
        }
      }

      // initial load
      runFetch(w);
    } catch (e) {
      console.warn('initWeatherFor error', e);
    }
  }

  function initWeather() {
    document.querySelectorAll('.container.nav').forEach(initWeatherFor);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initWeather);
  else initWeather();
})();


// --- Responsive nav toggle: injects a hamburger button and toggles the .menu.open class ---
(function () {
  function initNavToggles() {
    document.querySelectorAll('.container.nav').forEach(function (container) {
      try {
        const menu = container.querySelector('.menu');
        if (!menu) return;

        // ensure menu has an id for aria-controls
        if (!menu.id) menu.id = 'nav-menu-' + Math.random().toString(36).slice(2, 8);

        // don't double-insert
        if (container.querySelector('.nav-toggle')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-toggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', menu.id);
        const ham = document.createElement('span');
        ham.className = 'hamburger';
        btn.appendChild(ham);

        // insert before the menu so it's visually near the brand/menu
        container.insertBefore(btn, menu);

        function setOpen(open) {
          if (open) {
            menu.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
          } else {
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
          }
        }

        btn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          setOpen(!menu.classList.contains('open'));
        });

        // close when clicking outside
        document.addEventListener('click', function (ev) {
          if (!menu.classList.contains('open')) return;
          if (!container.contains(ev.target)) setOpen(false);
        });

        // close when a navigation link is clicked
        menu.querySelectorAll('a').forEach(function (a) {
          a.addEventListener('click', function () { setOpen(false); });
        });
      } catch (err) {
        console.warn('nav toggle init error', err);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNavToggles);
  else initNavToggles();
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
  if (sign) sign.addEventListener('click', function () { try { localStorage.removeItem('currentUser'); } catch (e) { } try { window.location.href = 'index.html'; } catch (e) { } });
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
      try { updateAuthUI(); } catch (e) { }
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
      } catch (err) { }
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
    } catch (e) { }
    applyTheme(theme);
  }

  function initTheme() {
    try {
      const saved = localStorage.getItem('site-theme');
      if (saved) {
        applyTheme(saved);
        return;
      }
    } catch (e) { }
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
      } catch (e) { }

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
          try { localStorage.setItem('currentUser', JSON.stringify({ name: newUser.name, email: newUser.email })); } catch (e) { }

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
        try { updateAuthUI(); } catch (e) { }
        // redirect to profile page
        try { window.location.href = 'profile.html'; } catch (e) { }
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
          try { updateAuthUI(); } catch (e) { }
          try { window.location.href = 'profile.html'; } catch (e) { }
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
        try { localStorage.removeItem('currentUser'); } catch (e) { }
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
