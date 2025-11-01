(function () {
  const counters = document.querySelectorAll('.num[data-target]');
  if (!counters.length) return;
  const fmt = new Intl.NumberFormat('en-US');
  function animateCounter(el, duration = 1400) {
    const target = Number(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || '';
    const start = Number(el.textContent.replace(/[^\d.-]/g, '')) || 0;
    const t0 = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(start + (target - start) * eased);
      el.textContent = fmt.format(value) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); o.unobserve(e.target); } });
  }, { threshold: 0.4 });
  counters.forEach(c => { if (!c.textContent.trim()) c.textContent = '0'; obs.observe(c); });
})();