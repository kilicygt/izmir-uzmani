// Picks today's tab and marks past/next departures, using İzmir time.
// Departures between 00:00 and 03:59 belong to the previous service day.
const parts = Object.fromEntries(
  new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date())
    .map((p) => [p.type, p.value]),
);
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let minutes = +parts.hour * 60 + +parts.minute;
let weekday = WD.indexOf(parts.weekday) + 1;
let ymd = `${parts.year}-${parts.month}-${parts.day}`;
if (minutes < 240) {
  minutes += 1440;
  weekday = weekday === 1 ? 7 : weekday - 1;
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  ymd = d.toISOString().slice(0, 10);
}

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const v = h * 60 + m;
  return v < 240 ? v + 1440 : v;
};

function markTimes(scope: Element) {
  scope.querySelectorAll<HTMLElement>('[data-times]').forEach((list) => {
    let nextFound = false;
    list.querySelectorAll<HTMLElement>('[data-t]').forEach((el) => {
      el.classList.remove('past', 'next');
      if (toMin(el.dataset.t!) < minutes) el.classList.add('past');
      else if (!nextFound) {
        el.classList.add('next');
        nextFound = true;
      }
    });
    if (list.hasAttribute('data-collapse-past')) collapsePast(list);
  });
}

function collapsePast(list: HTMLElement) {
  const rows = [...list.querySelectorAll<HTMLElement>('.tt-dep')].filter((r) => r.querySelector('.past'));
  if (rows.length < 3) return;
  rows.forEach((r) => (r.hidden = true));
  const btn = document.createElement('button');
  btn.className = 'tt-show-past';
  btn.textContent = `Bugün kalkmış ${rows.length} seferi göster`;
  btn.addEventListener('click', () => {
    rows.forEach((r) => (r.hidden = false));
    btn.remove();
  });
  list.prepend(btn);
}

document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((group) => {
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('[data-tab]')];
  const panels = [...document.querySelectorAll<HTMLElement>(`[data-panel-of="${group.dataset.tabs}"]`)];
  const show = (id: string, isToday: boolean) => {
    buttons.forEach((b) => b.classList.toggle('active', b.dataset.tab === id));
    panels.forEach((p) => {
      p.hidden = p.dataset.panel !== id;
      p.querySelectorAll('.past, .next').forEach((el) => el.classList.remove('past', 'next'));
      p.querySelectorAll<HTMLElement>('.tt-dep[hidden]').forEach((el) => (el.hidden = false));
      p.querySelectorAll('.tt-show-past').forEach((el) => el.remove());
      if (!p.hidden && isToday) markTimes(p);
    });
  };
  const today = buttons.find((b) => (b.dataset.days ?? '').split(',').includes(String(weekday)));
  buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.tab!, b === today)));
  show((today ?? buttons[0]).dataset.tab!, !!today);
});

document.querySelectorAll<HTMLElement>('[data-live-date]').forEach((el) => {
  if (el.dataset.liveDate === ymd) markTimes(el);
});

const search = document.querySelector<HTMLInputElement>('[data-search]');
if (search) {
  const items = [...document.querySelectorAll<HTMLElement>('[data-search-text]')];
  const norm = (s: string) => s.toLocaleLowerCase('tr-TR');
  search.addEventListener('input', () => {
    const q = norm(search.value.trim());
    let shown = 0;
    items.forEach((el) => {
      const match = !q || norm(el.dataset.searchText!).includes(q);
      el.hidden = !match;
      if (match) shown++;
    });
    const empty = document.querySelector<HTMLElement>('[data-search-empty]');
    if (empty) empty.hidden = shown > 0;
  });
}
