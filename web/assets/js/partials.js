// Finds elements like <div data-include="/pages/partials/add-to-schedule.html"></div>
document.addEventListener('DOMContentLoaded', () => {
  const includes = document.querySelectorAll('[data-include]');
  includes.forEach(el => {
    const url = el.getAttribute('data-include');
    if (!url) return;
    fetch(url).then(r => r.text()).then(html => { el.innerHTML = html; });
  });
});
