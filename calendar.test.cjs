const { test } = require('node:test');
const assert = require('node:assert/strict');
const cal = require('./calendar.js');
test('改元年は両方の元号と期間を返す', () => {
  assert.deepEqual(cal.fromWestern(1989).map(x => [x.label, x.period]), [['昭和64年', '1月1日〜1月7日'], ['平成元年', '1月8日〜12月31日']]);
  assert.deepEqual(cal.fromWestern(2019).map(x => [x.label, x.period]), [['平成31年', '1月1日〜4月30日'], ['令和元年', '5月1日〜12月31日']]);
  assert.equal(cal.fromWestern(1926)[0].period, '12月25日〜12月31日');
});
test('全対応年で往復変換が一致する', () => {
  for (let year = 1926; year <= 9999; year++) {
    for (const match of cal.fromWestern(year)) {
      const era = cal.eras.find(x => x.id === match.id);
      assert.equal(cal.toWestern(era.id, year - era.start + 1), year);
    }
  }
});
test('範囲外・小数・不正な元号を拒否する', () => {
  for (const year of [0, 1925, 10000, NaN, 2026.5]) assert.deepEqual(cal.fromWestern(year), []);
  for (const [era, year] of [['showa', 65], ['heisei', 32], ['reiwa', 0], ['reiwa', 7982], ['reiwa', 1.5], ['unknown', 1]]) assert.equal(cal.toWestern(era, year), null);
});
test('全角数字と元年を受け入れ、不正な数値表記を拒否する', () => {
  assert.equal(cal.parseYear('２０２６'), 2026);
  assert.equal(cal.parseYear(' 元 '), 1);
  for (const text of ['', '2e3', '-1', '1.5', '2026年', '10000']) assert.ok(Number.isNaN(cal.parseYear(text)));
});
test('日本時間の年越しを正しく処理する', () => {
  assert.deepEqual(cal.japanDate(new Date('2026-12-31T14:59:59Z')), { year: 2026, month: 12, day: 31 });
  assert.deepEqual(cal.japanDate(new Date('2026-12-31T15:00:00Z')), { year: 2027, month: 1, day: 1 });
});
