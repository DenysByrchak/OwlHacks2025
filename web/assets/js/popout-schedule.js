// Popout “Add to Schedule” used on events.html
// Expects the partial: /pages/partials/popout-schedule.html
// IDs used here: popoutScheduleModal, popoutScheduleForm, psTitle, psLocation, psStart, psEnd, psNotes, popoutToast
(function () {
  const KEY = 'owlhacks:schedule';

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

  let currentEvent = null;

  let modal, form, fTitle, fLoc, fStart, fEnd, fNotes, toast;

  // Initialize modal components when they become available
  function initializeModal() {
    const modalEl = document.getElementById('popoutScheduleModal');
    if (!modalEl || !window.bootstrap) return false;

    modal   = new bootstrap.Modal(modalEl);
    form    = document.getElementById('popoutScheduleForm');
    fTitle  = document.getElementById('psTitle');
    fLoc    = document.getElementById('psLocation');
    fStart  = document.getElementById('psStart');
    fEnd    = document.getElementById('psEnd');
    fNotes  = document.getElementById('psNotes');
    const toastEl = document.getElementById('popoutToast');
    toast   = toastEl ? new bootstrap.Toast(toastEl) : null;
    
    return true;
  }

  // Wait until partial (modal) is injected and Bootstrap is ready
  window.addEventListener('load', () => {
    // Try to initialize immediately
    if (initializeModal()) {
      setupEventHandlers();
    } else {
      // If modal not ready, wait for it to be injected
      const observer = new MutationObserver(() => {
        if (initializeModal()) {
          setupEventHandlers();
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });

  function setupEventHandlers() {

    // Helper: build event payload from a clicked button/card
    function eventFromTrigger(btn) {
      // Prefer explicit data-* from renderer
      let { id, title, location, startIso } = btn.dataset;

      // Fall back to DOM content if missing
      if (!title) {
        title = btn.closest('.event-card')?.querySelector('.event-title')?.textContent?.trim();
      }
      if (!location) {
        const meta = btn.closest('.event-card')?.querySelector('.event-meta')?.textContent || '';
        location = meta.split('•')[0].trim();
      }
      if (!startIso) {
        const guess = new Date(); guess.setHours(17, 30, 0, 0); // default 5:30 PM today
        startIso = guess.toISOString();
      }
      if (!id) {
        id = `ev-${(title || 'untitled').slice(0, 12).replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
      }

      return {
        id,
        title: title || 'Untitled Event',
        location: location || 'Philadelphia',
        start: new Date(startIso).toISOString()
      };
    }

    // Event delegation: works for any future .event-action or [data-add-to-schedule]
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add-to-schedule], .event-action');
      if (!btn) return;

      currentEvent = eventFromTrigger(btn);

      // Prefill
      fTitle.value = currentEvent.title;
      fLoc.value   = currentEvent.location;
      fStart.value = fmtForInput(currentEvent.start);

      const defaultEnd = plusHours(currentEvent.start, 1);
      fEnd.min   = fmtForInput(currentEvent.start);
      fEnd.value = fmtForInput(defaultEnd);
      fNotes.value = '';

      modal.show();
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentEvent) return;

      const endVal = fEnd.value;
      if (!endVal) { fEnd.focus(); return; }

      const startMs = new Date(currentEvent.start).getTime();
      const endMs   = new Date(endVal).getTime();
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

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem(KEY) || '[]');
      const idx = existing.findIndex(e => e.id === entry.id);
      if (idx >= 0) existing[idx] = entry; else existing.push(entry);
      localStorage.setItem(KEY, JSON.stringify(existing));

      // Save to backend via API
      try {
        const response = fetch('/api/schedule-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: entry.title,
            date: entry.start.split('T')[0], // Extract date part
            start_time: new Date(entry.start).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}),
            end_time: new Date(entry.end).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}),
            price: '', // No price info available
            url: '' // No URL info available
          })
        });

        if (!response.ok) {
          console.warn('Failed to save event to backend:', response.statusText);
        }
      } catch (error) {
        console.error('Error saving event to backend:', error);
      }

      modal.hide();
      toast?.show();
      window.dispatchEvent(new CustomEvent('schedule:updated', { detail: { entry } }));
    });
  }
})();
