document.addEventListener('DOMContentLoaded', () => {
  // ===== Keys / Config =====
  const STORAGE_KEY = 'owlhacks:schedule';
  const CITY = 'Philadelphia';

  // ===== Utilities =====
  const toDateOnly = (iso) => (typeof iso === 'string' && iso.length >= 10) ? iso.slice(0,10) : '';
  const fmtTime = (d) => d.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
  const fmtDateLabel = (isoDate) => new Date(isoDate + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});
  const dayNum = (isoDate) => Number(isoDate.slice(-2));

  // Convert stored entry -> view model the page expects
  function normalize(entry){
    // entry: {id,title,location,start,end,notes}
    const start = new Date(entry.start);
    const end   = entry.end ? new Date(entry.end) : null;
    const date  = toDateOnly(entry.start);
    const time  = end ? `${fmtTime(start)}–${fmtTime(end)}` : fmtTime(start);
    return {
      id: String(entry.id ?? crypto.randomUUID?.() ?? ('id-'+Date.now())),
      title: entry.title ?? 'Untitled Event',
      location: entry.location ?? CITY,
      date,
      time,
      startISO: entry.start,
      endISO: entry.end || '',
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
      id: e.id, title: e.title, location: e.location,
      start: e.startISO || (e.date ? (e.date + 'T00:00:00') : ''),
      end:   e.endISO || '', notes: e.notes || ''
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(backToStored));
  }

  // ===== State =====
  let events = [];                 // (optional) all events from API
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
    refreshBtn: document.getElementById('refreshBtn'),
    clearSavedBtn: document.getElementById('clearSavedBtn'),
  };

  // ===== Month helpers =====
  function monthInfo(){
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1);
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const label = first.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    return { first, daysInMonth, label };
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
    for (const ev of saved.values()){
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
      empty.textContent = 'No saved events yet. Add some from the Events page.';
      wrap.appendChild(empty);
      els.toggleViewBtn.disabled = true;
      return;
    }

    const frag = document.createDocumentFragment();
    const tpl = els.savedItemTpl.content.firstElementChild;
    [...saved.values()]
      .sort((a,b)=>a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .forEach(ev=>{
        const item = tpl.cloneNode(true);
        item.dataset.id = ev.id;
        item.querySelector('.title').textContent = ev.title ?? '';
        item.querySelector('.meta').textContent =
          `${fmtDateLabel(ev.date)} • ${ev.time || ''} • ${ev.location || ''}`;
        frag.appendChild(item);
      });
    wrap.appendChild(frag);
    els.toggleViewBtn.disabled = !selectedId;
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
        `${fmtDateLabel(ev.date)} • ${(ev.time ?? '')} • ${(ev.location ?? '')}`;

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
      `${fmtDateLabel(ev.date)} • ${ev.time || ''} • ${ev.location || ''}`;

    const notes = document.createElement('p');
    notes.className='mb-0';
    notes.textContent = ev.notes ? `Notes: ${ev.notes}` : ' ';

    const actions = document.createElement('div');
    actions.className='mt-3 d-flex gap-2';

    const removeBtn = document.createElement('button');
    removeBtn.className='btn btn-outline-danger';
    removeBtn.textContent='Remove from saved';
    removeBtn.addEventListener('click',()=>{
      saved.delete(id);
      writeSavedToStorage([...saved.values()]);
      selectedId=null;
      renderSaved(); renderCalendar(); showCalendar();
    });

    const jumpBtn = document.createElement('button');
    jumpBtn.className='btn btn-outline-secondary';
    jumpBtn.textContent='Jump to day';
    jumpBtn.addEventListener('click',()=>{
      highlightDay(ev.date);
      showCalendar();
    });

    actions.append(removeBtn, jumpBtn);
    d.append(h, meta, notes, actions);
    els.toggleViewBtn.disabled = false;
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

  els.clearSavedBtn.addEventListener('click',()=>{
    saved.clear();
    localStorage.setItem(STORAGE_KEY, '[]');
    selectedId=null;
    renderSaved(); renderCalendar();
  });

  els.refreshBtn.addEventListener('click', async ()=>{
    // If you later add a real /api/philly-events, load it here.
    renderAllEvents(events);
    // Also re-pull saved from storage in case it changed.
    loadSavedFromStorage();
  });

  // Saved list: delegate clicks (select vs remove)
  els.savedList.addEventListener('click', (e)=>{
    const item = e.target.closest('[data-id]');
    if (!item) return;
    const id = item.dataset.id;
    if (e.target.closest('.btn-remove')){
      saved.delete(id);
      writeSavedToStorage([...saved.values()]);
      if (selectedId===id) selectedId=null;
      renderSaved(); renderCalendar();
      return;
    }
    selectEvent(id);
    const ev = saved.get(id);
    if (ev) highlightDay(ev.date);
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

  // ===== Init =====
  (function init(){
    renderWeekdays();
    renderAllEvents(events);     // no external data yet; shows empty message
    loadSavedFromStorage();      // <-- pulls from localStorage and renders
  })();
});
