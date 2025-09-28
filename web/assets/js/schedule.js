document.addEventListener('DOMContentLoaded', () => {
  // ===== Keys / Config =====
  const STORAGE_KEY = 'owlhacks:schedule';
  const CITY = 'Philadelphia';

  // ===== Utilities =====
  const toDateOnly = (iso) => (typeof iso === 'string' && iso.length >= 10) ? iso.slice(0,10) : '';
  const fmtTime = (d) => d.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
  const fmtDateLabel = (isoDate) => new Date(isoDate + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});
  const dayNum = (isoDate) => Number(isoDate.slice(-2));
  const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());

  // Convert stored entry -> view model the page expects
  function normalize(entry){
    // entry: {id,title,location,start,end,notes}
    const start = new Date(entry.start);
    const end   = entry.end ? new Date(entry.end) : null;

    const validStart = isValidDate(start);
    const validEnd   = end && isValidDate(end);

    const date  = validStart ? toDateOnly(entry.start) : '';
    const time  = validStart
      ? (validEnd ? `${fmtTime(start)}–${fmtTime(end)}` : fmtTime(start))
      : '';

    return {
      id: String(entry.id ?? (crypto.randomUUID ? crypto.randomUUID() : ('id-'+Date.now()))),
      title: entry.title ?? 'Untitled Event',
      location: entry.location ?? CITY,
      date,
      time,
      startISO: validStart ? entry.start : '',
      endISO: validEnd ? entry.end : '',
      notes: entry.notes || ''
    };
  }

  function readSavedFromStorage(){
    try{
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw.map(normalize) : [];
    }catch{ return []; }
  }
  function writeSavedToStorage(list){
    const backToStored = list.map(e => ({
      id: e.id,
      title: e.title,
      location: e.location,
      start: e.startISO || (e.date ? (e.date + 'T00:00:00') : ''),
      end:   e.endISO || '',
      notes: e.notes || ''
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(backToStored));
  }

  // Load events from backend API (saved user events)
  async function loadEventsFromBackend(){
    try {
      const response = await fetch('/api/user-events');
      if (!response.ok) {
        console.warn('Failed to load events from backend:', response.statusText);
        return [];
      }
      const events = await response.json();
      return Array.isArray(events) ? events.map(normalize) : [];
    } catch (error) {
      console.error('Error loading events from backend:', error);
      return [];
    }
  }

  // ===== State =====
  let events = [];                 // (optional) all events (public/explore) if you add a source
  const saved = new Map();         // id -> normalized event
  let selectedId = null;

  // ===== Elements =====
  const els = {
    monthLabel: document.getElementById('monthLabel'),
    weekdayRow: document.getElementById('weekdayRow'),
    calendarGrid: document.getElementById('calendarGrid'),
    savedList: document.getElementById('savedEvents'),
    allEvents: document.getElementById('allEvents'),
    toggleViewBtn: document.getElementById('toggleViewBtn'),
    backToCalendarBtn: document.getElementById('backToCalendarBtn'),
    detailsView: document.getElementById('detailsView'),
    calendarView: document.getElementById('calendarView'),
    detailsContent: document.getElementById('detailsContent'),
    savedItemTpl: document.getElementById('savedItemTpl'),
    allEventTpl: document.getElementById('allEventTpl'),
    refreshBtn: document.getElementById('refreshBtn')
  };

  // ===== Month helpers =====
  function monthInfo(){
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1);
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const ymKey = `${y}-${String(m+1).padStart(2,'0')}`; // e.g., "2025-09"
    const label = first.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    return { first, daysInMonth, label, ymKey };
  }

  // ===== Rendering =====
  function renderWeekdays(){
    const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    els.weekdayRow.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (const n of names){
      const div = document.createElement('div');
      div.textContent = n;
      frag.appendChild(div);
    }
    els.weekdayRow.appendChild(frag);
  }

  function indexSavedByDay(){
    const idx = new Map();
    const { ymKey } = monthInfo();
    for (const ev of saved.values()){
      // only index events for the current month
      if (!ev.date || ev.date.slice(0,7) !== ymKey) continue;
      const d = dayNum(ev.date);
      if (!idx.has(d)) idx.set(d, []);
      idx.get(d).push(ev);
    }
    return idx;
  }

  function renderCalendar(){
    const { first, daysInMonth, label } = monthInfo();
    els.monthLabel.textContent = label;
    const grid = els.calendarGrid;
    grid.innerHTML = '';

    // weekday offset
    const lead = first.getDay();
    for (let i=0;i<lead;i++){
      const blank = document.createElement('div');
      blank.className='day bg-white';
      blank.setAttribute('aria-hidden','true');
      grid.appendChild(blank);
    }

    const byDay = indexSavedByDay();

    for (let d=1; d<=daysInMonth; d++){
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'day bg-white text-start';
      cell.dataset.day = String(d);

      const num = document.createElement('span');
      num.className = 'day-number';
      num.textContent = d;
      cell.appendChild(num);

      const list = document.createElement('div');
      list.className = 'small';
      cell.appendChild(list);

      const todays = byDay.get(d) || [];
      if (todays.length){
        cell.classList.add('has-event');
        for (const ev of todays){
          const pill = document.createElement('div');
          pill.className = 'badge text-bg-primary text-truncate w-100 mb-1';
          pill.textContent = ev.title ?? '';
          pill.title = ev.title ?? '';
          list.appendChild(pill);
        }
      }

      cell.addEventListener('click', () => {
        document.querySelectorAll('.day.selected').forEach(el=>el.classList.remove('selected'));
        cell.classList.add('selected');
        if (todays[0]) { selectEvent(todays[0].id); showDetails(); }
      });

      grid.appendChild(cell);
    }
  }

  function renderSaved(){
    const wrap = els.savedList;
    wrap.innerHTML = '';
    if (!saved.size){
      const empty = document.createElement('div');
      empty.className = 'list-group-item text-secondary';
      empty.textContent = 'No saved events yet. Use "Add to saved" below.';
      wrap.appendChild(empty);
      if (els.toggleViewBtn) els.toggleViewBtn.disabled = true;
      return;
    }

    const frag = document.createDocumentFragment();
    const tpl = els.savedItemTpl.content.firstElementChild;
    [...saved.values()]
      .sort((a,b)=> a.date.localeCompare(b.date) || (a.time||'').localeCompare(b.time||''))
      .forEach(ev=>{
        const item = tpl.cloneNode(true);
        item.dataset.id = ev.id;
        item.querySelector('.title').textContent = ev.title ?? '';
        item.querySelector('.meta').textContent =
          `${ev.date ? fmtDateLabel(ev.date) : ''} • ${ev.time || ''} • ${ev.location || ''}`;
        frag.appendChild(item);
      });
    wrap.appendChild(frag);
    if (els.toggleViewBtn) els.toggleViewBtn.disabled = (saved.size === 0 || selectedId == null);
  }

  function renderAllEvents(list){
    const wrap = els.allEvents; wrap.innerHTML = '';
    if (!Array.isArray(list) || !list.length){
      const empty = document.createElement('div');
      empty.className = 'list-group-item text-secondary';
      empty.textContent = 'No public events to show.';
      wrap.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    const tpl = els.allEventTpl.content.firstElementChild;

    list.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(ev=>{
      const row = tpl.cloneNode(true);
      row.dataset.id = ev.id;

      const titleEl = row.querySelector('.title');
      titleEl.textContent = ev.title ?? '';
      const cityBadge = document.createElement('span');
      cityBadge.className = 'badge text-bg-light location-pill ms-2';
      cityBadge.textContent = CITY;
      titleEl.append(' ', cityBadge);

      row.querySelector('.meta').textContent =
        `${ev.date ? fmtDateLabel(ev.date) : ''} • ${(ev.time ?? '')} • ${(ev.location ?? '')}`;

      const btn = row.querySelector('.btn-save');
      btn.textContent = saved.has(ev.id) ? 'Saved' : 'Add to saved';
      btn.disabled = saved.has(ev.id);

      frag.appendChild(row);
    });
    wrap.appendChild(frag);
  }

  function selectEvent(id){
    selectedId = id;
    const ev = saved.get(id) || events.find(e=>e.id===id);
    if (!ev) return;
    const d = els.detailsContent; d.innerHTML = '';

    const h = document.createElement('h3');
    h.className='h5';
    h.textContent = ev.title ?? '';

    const meta = document.createElement('div');
    meta.className='text-secondary mb-2';
    meta.textContent =
      `${ev.date ? fmtDateLabel(ev.date) : ''} • ${ev.time || ''} • ${ev.location || ''}`;

    const notes = document.createElement('p');
    notes.className='mb-0';
    notes.textContent = ev.notes ? `Notes: ${ev.notes}` : ' ';

    const actions = document.createElement('div');
    actions.className='mt-3 d-flex gap-2';

    const removeBtn = document.createElement('button');
    removeBtn.className='btn btn-outline-danger';
    removeBtn.textContent='Remove from saved';
    removeBtn.addEventListener('click', async ()=>{
      const event = saved.get(id);
      if (event) {
        // Delete from backend (by title; switch to id when available)
        try {
          const response = await fetch('/api/delete-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: event.title })
          });
          if (!response.ok) console.warn('Failed to delete event from backend:', response.statusText);
        } catch (error) {
          console.error('Error deleting event from backend:', error);
        }
      }
      saved.delete(id);
      writeSavedToStorage([...saved.values()]);
      selectedId=null;
      renderSaved(); renderCalendar(); showCalendar();
    });

    const jumpBtn = document.createElement('button');
    jumpBtn.className='btn btn-outline-secondary';
    jumpBtn.textContent='Jump to day';
    jumpBtn.addEventListener('click',()=>{
      if (ev.date) highlightDay(ev.date);
      showCalendar();
    });

    actions.append(removeBtn, jumpBtn);
    d.append(h, meta, notes, actions);
    if (els.toggleViewBtn) els.toggleViewBtn.disabled = false;
  }

  function highlightDay(isoDate){
    const d = Number(isoDate.slice(-2));
    document.querySelectorAll('.day.selected').forEach(el=>el.classList.remove('selected'));
    const cell = document.querySelector(`.day[data-day="${d}"]`);
    if (cell){
      cell.classList.add('selected');
      cell.scrollIntoView({behavior:'smooth', block:'nearest', inline:'nearest'});
    }
    showDetails();
  }

  function showDetails(){
    els.calendarView.hidden = true;
    els.detailsView.hidden  = false;
    els.toggleViewBtn.querySelector('span').textContent = 'Back to calendar';
  }
  function showCalendar(){
    els.calendarView.hidden = false;
    els.detailsView.hidden  = true;
    els.toggleViewBtn.querySelector('span').textContent = 'Show details';
  }

  // ===== Wiring =====
  els.toggleViewBtn.addEventListener('click',()=>{
    const showing = !els.detailsView.hidden;
    showing ? showCalendar() : showDetails();
  });
  els.backToCalendarBtn.addEventListener('click', showCalendar);

  // Refresh: reload saved events from backend, and re-render
  els.refreshBtn.addEventListener('click', async ()=>{
    await loadSavedFromBackend();
    renderAllEvents(events); // keep this, in case you later set `events` from a public feed
  });

  // Saved list: delegate clicks (row select vs ✕ remove)
  els.savedList.addEventListener('click', (e)=>{
    const item = e.target.closest('[data-id]');
    if (!item) return;
    const id = item.dataset.id;

    // Remove (small ✕ badge)
    if (e.target.closest('.btn-remove')){
      const event = saved.get(id);
      if (event) {
        (async () => {
          try {
            const response = await fetch('/api/delete-event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: event.title })
            });
            if (!response.ok) console.warn('Failed to delete event from backend:', response.statusText);
          } catch (error) {
            console.error('Error deleting event from backend:', error);
          }
        })();
      }
      saved.delete(id);
      writeSavedToStorage([...saved.values()]);
      if (selectedId===id) selectedId=null;
      renderSaved(); renderCalendar();
      return;
    }

    // Select row
    selectEvent(id);
    const ev = saved.get(id);
    if (ev && ev.date) highlightDay(ev.date);
  });

  // All events: delegate “Add to saved” (works if you later populate `events`)
  els.allEvents.addEventListener('click', (e)=>{
    const btn = e.target.closest('.btn-save');
    if (!btn) return;
    const row = btn.closest('[data-id]');
    if (!row) return;
    const id = row.dataset.id;
    const ev = events.find(x=>x.id===id);
    if (!ev) return;
    saved.set(id, ev);
    writeSavedToStorage([...saved.values()]);
    renderSaved(); renderCalendar();
    btn.textContent = 'Saved';
    btn.disabled = true;
  });

  // Keep page in sync if another tab updates localStorage
  window.addEventListener('storage', (e)=>{
    if (e.key === STORAGE_KEY) loadSavedFromStorage();
  });

  // ===== Load saved from storage =====
  function loadSavedFromStorage(){
    saved.clear();
    for (const ev of readSavedFromStorage()){
      saved.set(ev.id, ev);
    }
    renderSaved(); renderCalendar();
  }

  // ===== Load saved from backend =====
  async function loadSavedFromBackend(){
    saved.clear();
    const backendEvents = await loadEventsFromBackend();
    for (const ev of backendEvents){
      saved.set(ev.id, ev);
    }
    // sync local cache so other tabs see updates
    writeSavedToStorage([...saved.values()]);
    renderSaved(); renderCalendar();
  }

  // ===== Init =====
  (async function init(){
    renderWeekdays();
    renderAllEvents(events);     // no external public data yet; shows empty message
    await loadSavedFromBackend(); // pulls from backend and renders
  })();
});
