export async function loadNav(activeKey) {
  const mount = document.getElementById('nav-root');
  if (!mount) return;

  const navUrl = new URL('../../partials/nav.html', import.meta.url);
  const html = await (await fetch(navUrl)).text();
  mount.innerHTML = html;

  if (activeKey) {
    const active = mount.querySelector(`[data-key="${activeKey}"]`);
    if (active) active.classList.add('active');
  }
}
