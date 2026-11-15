// Picks today's tab, marks past/next departures and shows a live countdown, using İzmir time.
// Departures between 00:00 and 03:59 belong to the previous service day.
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
function clock(at = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
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
  return { minutes, seconds: +parts.second, weekday, ymd, hhmm: `${parts.hour}:${parts.minute}` };
}
let { minutes, weekday, ymd } = clock();
// Panels currently showing today's timetable; the countdown and the minute refresh use these.
const liveScopes = new Set<Element>();

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const v = h * 60 + m;
  return v < 240 ? v + 1440 : v;
};

function markTimes(scope: Element, collapse = true) {
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
    if (collapse && list.hasAttribute('data-collapse-past')) collapsePast(list);
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
    // On phones the day tabs scroll sideways; keep the selected one in view.
    const active = buttons.find((b) => b.dataset.tab === id);
    const centre = () => {
      if (!active || group.scrollWidth <= group.clientWidth) return;
      const g = group.getBoundingClientRect(), a = active.getBoundingClientRect();
      group.scrollLeft += a.left + a.width / 2 - (g.left + g.width / 2);
    };
    centre();
    document.fonts?.ready.then(centre);
    panels.forEach((p) => {
      p.hidden = p.dataset.panel !== id;
      if (!p.hidden && isToday) liveScopes.add(p); else liveScopes.delete(p);
      p.querySelectorAll('.past, .next').forEach((el) => el.classList.remove('past', 'next'));
      p.querySelectorAll<HTMLElement>('.tt-dep[hidden]').forEach((el) => (el.hidden = false));
      p.querySelectorAll('.tt-show-past').forEach((el) => el.remove());
      if (!p.hidden && isToday) markTimes(p);
    });
  };
  const today = buttons.find((b) => (b.dataset.days ?? '').split(',').includes(String(weekday)));
  buttons.forEach((b) => b.addEventListener('click', () => {
    show(b.dataset.tab!, b === today);
    renderCountdown();
  }));
  show((today ?? buttons[0]).dataset.tab!, !!today);
});

document.querySelectorAll<HTMLElement>('[data-live-date]').forEach((el) => {
  if (el.dataset.liveDate === ymd) {
    markTimes(el);
    liveScopes.add(el);
  }
});

// ── "Sıradaki sefer X dk sonra" countdown ───────────────────────────────────
const anchor = document.querySelector('.tt-legend');
const box = document.createElement('div');
box.className = 'tt-cd';
box.hidden = true;
box.setAttribute('aria-live', 'polite');
anchor?.before(box);

const fmtLeft = (sec: number) => {
  if (sec < 60) return { big: 'Şimdi', unit: '' };
  const m = Math.floor(sec / 60);
  if (m < 60) return { big: String(m), unit: 'dk' };
  return { big: `${Math.floor(m / 60)} sa ${m % 60}`, unit: 'dk' };
};

function renderCountdown() {
  if (!anchor) return;
  const c = clock();
  const items: { label: string; time: string; left: number }[] = [];
  let lists = 0;
  liveScopes.forEach((scope) => {
    scope.querySelectorAll<HTMLElement>('[data-times]').forEach((list) => {
      lists++;
      const next = list.querySelector<HTMLElement>('.tt-time.next');
      if (!next) return;
      const leftOf = (t: string) => Math.max(0, (toMin(t) - c.minutes) * 60 - c.seconds);
      const rows = [...list.querySelectorAll<HTMLElement>('.tt-dep')];
      if (rows.length) {
        // Ferry piers: one countdown per destination (e.g. Karşıyaka and Bostanlı), up to three.
        const seen = new Set<string>();
        for (const row of rows.slice(rows.indexOf(next.closest('.tt-dep')!))) {
          if (row.classList.contains('cancelled')) continue;
          const t = row.querySelector<HTMLElement>('[data-t]')!.dataset.t!;
          const dest = row.querySelector('.tt-dep-to')?.firstChild?.textContent?.trim() || 'Sıradaki sefer';
          if (seen.has(dest)) continue;
          // Far-off departures add noise; keep later destinations only if within two hours.
          if (seen.size > 0 && leftOf(t) > 7200) break;
          seen.add(dest);
          items.push({ label: `${dest} seferi`, time: t, left: leftOf(t) });
          if (seen.size === 3) break;
        }
        return;
      }
      const label = list.closest('.tt-card')?.querySelector('.tt-label')?.textContent?.trim() || 'Sıradaki sefer';
      items.push({ label, time: next.dataset.t!, left: leftOf(next.dataset.t!) });
    });
  });
  box.hidden = lists === 0;
  if (!lists) return;
  box.innerHTML = `
    <div class="tt-cd-head"><span class="tt-cd-dot"></span>Canlı · şu an ${c.hhmm}</div>
    ${items.length ? `<div class="tt-cd-grid">${items.map((it) => {
      const l = fmtLeft(it.left);
      return `<div class="tt-cd-item">
        <p class="tt-cd-label">${it.label}</p>
        <p class="tt-cd-big">${l.big}${l.unit ? `<span>${l.unit} sonra</span>` : '<span>kalkıyor</span>'}</p>
        <p class="tt-cd-time">Kalkış ${it.time}</p>
      </div>`;
    }).join('')}</div>` : '<p class="tt-cd-done">Bugünkü seferler tamamlandı. Yarının saatleri için gün sekmelerine bakabilirsin.</p>'}`;
}

let lastMinute = minutes;
renderCountdown();
setInterval(() => {
  const c = clock();
  if (c.minutes !== lastMinute) {
    lastMinute = c.minutes;
    minutes = c.minutes;
    liveScopes.forEach((scope) => markTimes(scope, false));
  }
  renderCountdown();
}, 10_000);

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
