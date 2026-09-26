'use strict';
const cal = window.YearCalendar;
const $ = id => document.getElementById(id);
const input = $('year');
let direction = 'western';
let eraId = 'reiwa';
let today;
function refreshToday() {
  today = cal.japanDate();
  $('today-date').textContent = `${today.year}年${today.month}月${today.day}日`;
  $('today-date').dateTime = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
  $('current-western').textContent = today.year;
  const date = new Date(Date.UTC(today.year, today.month - 1, today.day));
  $('current-japanese').textContent = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { timeZone: 'UTC', era: 'long', year: 'numeric' }).format(date);
}
function configure() {
  const era = cal.eras.find(item => item.id === eraId);
  $('era-field').hidden = direction === 'western';
  $('year-label').textContent = direction === 'western' ? '西暦' : era.name;
  $('input-hint').textContent = direction === 'western' ? '1926〜9999年を入力' : `1〜${era.end - era.start + 1}年を入力（元年は「1」または「元」）`;
}
function render() {
  const raw = input.value.normalize('NFKC').trim();
  const value = cal.parseYear(raw);
  const era = cal.eras.find(item => item.id === eraId);
  const western = direction === 'western' ? (raw === '元' ? NaN : value) : cal.toWestern(eraId, value);
  const valid = western !== null && cal.fromWestern(western).length > 0;
  $('result-value').replaceChildren();
  $('result-note').textContent = '';
  $('input-error').textContent = '';
  input.removeAttribute('aria-invalid');
  if (!raw || !valid) {
    $('result-value').textContent = '—';
    if (!raw) $('result-note').textContent = '年を入力すると、ここに表示されます。';
    else {
      input.setAttribute('aria-invalid', 'true');
      $('input-error').textContent = direction === 'western' ? '西暦は1926〜9999の整数で入力してください。' : `${era.name}は1〜${era.end - era.start + 1}の整数で入力してください。`;
    }
    return;
  }
  const results = cal.fromWestern(western);
  for (const result of direction === 'western' ? results : results.filter(item => item.id === eraId)) {
    const item = document.createElement('div');
    item.className = 'result-item';
    item.textContent = direction === 'western' ? result.label : `${western}年`;
    if (result.period) {
      const period = document.createElement('span');
      period.className = 'period';
      period.textContent = result.period;
      item.append(period);
    }
    $('result-value').append(item);
  }
  const notes = [];
  if (results.length > 1) notes.push('改元の年です。日付によって元号が異なります。');
  if (western === 1926) notes.push('昭和は12月25日からです。それ以前の大正は対応していません。');
  if (western > today.year) notes.push('未来の年は、令和が続くと仮定した換算です。');
  $('result-note').textContent = notes.join(' ');
}
document.querySelectorAll('input[name="direction"]').forEach(radio => radio.addEventListener('change', () => {
  const value = cal.parseYear(input.value);
  const western = direction === 'western' ? value : cal.toWestern(eraId, value);
  direction = radio.value;
  if (western !== null && cal.fromWestern(western).length) {
    if (direction === 'japanese') {
      eraId = cal.fromWestern(western).at(-1).id;
      document.querySelector(`input[name="era"][value="${eraId}"]`).checked = true;
      input.value = western - cal.eras.find(item => item.id === eraId).start + 1;
    } else input.value = western;
  } else input.value = '';
  configure(); render();
}));
document.querySelectorAll('input[name="era"]').forEach(radio => radio.addEventListener('change', () => { eraId = radio.value; configure(); render(); }));
input.addEventListener('input', render);
$('reset').addEventListener('click', () => {
  refreshToday();
  direction = 'western';
  document.querySelector('input[name="direction"][value="western"]').checked = true;
  input.value = today.year;
  configure(); render();
});
refreshToday(); input.value = today.year; configure(); render();
setInterval(() => { refreshToday(); render(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { refreshToday(); render(); } });
