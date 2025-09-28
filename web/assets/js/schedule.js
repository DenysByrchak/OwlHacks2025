(function () {
  const fmtForInput = (iso) => {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const plusHours = (iso, hours = 1) => {
    const d = new Date(iso);
    d.setHours(d.getHours() + hours);
    return d.toISOString();
  };

  const KEY = 'owlhacks:schedule';
  let currentEvent = null;

  // Wait until partials (modal) are injected
  window.addEventListener('load', () => {
    const modalEl = document.getElementById('addToScheduleModal');
    if (!modalEl || !window.bootstrap) return;
    const modal = new bootstrap.Modal(modalEl);
    const form = document.getElementById('scheduleForm');
    const fTitle = document.getElementById('fTitle');
    const fLocation = document.getElementById('fLocation');
    const fStart = document.getElementById('fStart');
    const fEnd = document.getElementById('fEnd');
    const fNotes = document.getElementById('fNotes');
    const toastEl = document.getElementById('addToast');
    const toast = toastEl ? new bootstrap.Toast(toastEl) : null;

    document.querySelectorAll('[data-add-to-schedule]').forEach(btn => {
      btn.addEventListener('click', () => {
        const { id, title, location, startIso } = btn.dataset;
        currentEvent = { id, title, location, start: new Date(startIso).toISOString() };

        fTitle.value    = currentEvent.title || '';
        fLocation.value = currentEvent.location || '';
        fStart.value    = fmtForInput(currentEvent.start);
        fEnd.min        = fmtForInput(currentEvent.start);
        fEnd.value      = fmtForInput(plusHours(currentEvent.start, 1));
        fNotes.value    = '';

        modal.show();
      });
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentEvent) return;

      const endVal = fEnd.value;
      if (!endVal) { fEnd.focus(); return; }

      const startMs = new Date(currentEvent.start).getTime();
      const endMs = new Date(endVal).getTime();
      if (endMs <= startMs) {
        fEnd.setCustomValidity('End time must be after start time');
        fEnd.reportValidity();
        return;
      }
      fEnd.setCustomValidity('');

      const entry = {
        id: currentEvent.id,
        title: currentEvent.title,
        location: currentEvent.location,
        start: currentEvent.start,
        end: new Date(endVal).toISOString(),
        notes: fNotes.value || ''
      };

      const existing = JSON.parse(localStorage.getItem(KEY) || '[]');
      const idx = existing.findIndex(e => e.id === entry.id);
      if (idx >= 0) existing[idx] = entry; else existing.push(entry);
      localStorage.setItem(KEY, JSON.stringify(existing));

      modal.hide();
      toast?.show();
      window.dispatchEvent(new CustomEvent('schedule:updated', { detail: { entry } }));
    });
  });
})();
