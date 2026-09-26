(function (root) {
  'use strict';
  const eras = [
    { id: 'showa', name: '昭和', start: 1926, end: 1989, first: '12月25日', last: '1月7日' },
    { id: 'heisei', name: '平成', start: 1989, end: 2019, first: '1月8日', last: '4月30日' },
    { id: 'reiwa', name: '令和', start: 2019, end: 9999, first: '5月1日', last: null }
  ];
  function parseYear(value) {
    const text = String(value).normalize('NFKC').trim();
    if (text === '元') return 1;
    return /^\d{1,4}$/.test(text) ? Number(text) : NaN;
  }
  function fromWestern(year) {
    if (!Number.isInteger(year) || year < 1926 || year > 9999) return [];
    return eras.filter(era => year >= era.start && year <= era.end).map(era => ({
      id: era.id,
      label: era.name + (year === era.start ? '元' : year - era.start + 1) + '年',
      period: year === era.start ? era.first + '〜12月31日' : year === era.end && era.last ? '1月1日〜' + era.last : ''
    }));
  }
  function toWestern(id, year) {
    const era = eras.find(item => item.id === id);
    if (!era || !Number.isInteger(year) || year < 1 || year > era.end - era.start + 1) return null;
    return era.start + year - 1;
  }
  function japanDate(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const get = type => Number(parts.find(part => part.type === type).value);
    return { year: get('year'), month: get('month'), day: get('day') };
  }
  const api = { eras, parseYear, fromWestern, toWestern, japanDate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.YearCalendar = api;
})(globalThis);
