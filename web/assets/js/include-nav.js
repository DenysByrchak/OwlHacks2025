export function loadNav(activePathname) {
  return fetch('/partials/nav.html')
    .then(r => r.text())
    .then(html => {
      // Mount the nav partial
      const root = document.getElementById('nav-root');
      if (!root) {
        console.warn('[include-nav] #nav-root not found');
        return;
      }
      root.innerHTML = html;

      // Determine current path
      const current = normalizePath(activePathname ?? location.pathname);

      // Mark active link
      const links = root.querySelectorAll('.navbar .nav-link');
      links.forEach(a => {
        const href = normalizePath(a.getAttribute('href') || '');
        // Treat / and /index.html as home; also allow landing.html as home
        const isHomeCurrent =
          (current === '/' || current === '/index.html') &&
          (href === '/index.html' || href === '/pages/landing.html');

        if (href === current || isHomeCurrent) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }
      });
    });
}

function normalizePath(p) {
  try {
    // If p is absolute (starts with /pages/...), return as-is minus trailing slash
    if (p.startsWith('/')) return stripSlash(p);
    // If p is relative (like ./events.html), resolve against current location
    const url = new URL(p, location.origin + location.pathname);
    return stripSlash(url.pathname);
  } catch {
    return stripSlash(p || '/');
  }
}

function stripSlash(x) {
  return x.replace(/\/+$/, '') || '/';
}
