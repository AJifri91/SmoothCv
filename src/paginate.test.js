import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from './paginate.js';

const b = (key, height, kind = 'entry') => ({ key, height, kind });

test('fills a page then breaks', () => {
  const pages = paginate({ main: [b('a', 60), b('b', 30), b('c', 20)] }, { main: 100 });
  assert.deepEqual(pages, [{ main: ['a', 'b'] }, { main: ['c'] }]);
});

test('keeps a heading with its first entry', () => {
  const pages = paginate({ main: [b('a', 80), b('h', 10, 'heading'), b('e', 30)] }, { main: 100 });
  assert.deepEqual(pages, [{ main: ['a'] }, { main: ['h', 'e'] }]);
});

test('oversized block still gets its own page', () => {
  const pages = paginate({ main: [b('big', 500), b('x', 10)] }, { main: 100 });
  assert.deepEqual(pages, [{ main: ['big'] }, { main: ['x'] }]);
});

test('columns paginate independently', () => {
  const pages = paginate(
    { side: [b('s1', 50)], main: [b('m1', 90), b('m2', 90)] },
    { side: 100, main: 100 },
  );
  assert.deepEqual(pages, [{ side: ['s1'], main: ['m1'] }, { main: ['m2'] }]);
});

test('first-page offset only shrinks page 1', () => {
  const pages = paginate({ main: [b('a', 50), b('b', 50), b('c', 90), b('d', 10)] }, { main: 100 }, 40);
  assert.deepEqual(pages, [{ main: ['a'] }, { main: ['b'] }, { main: ['c', 'd'] }]);
});

test('page break forces a new page, but not on an empty one', () => {
  const pages = paginate({ main: [b('pb0', 0, 'pagebreak'), b('a', 10), b('pb1', 0, 'pagebreak'), b('c', 10)] }, { main: 100 });
  assert.deepEqual(pages, [{ main: ['a'] }, { main: ['c'] }]);
});

test('empty input yields one blank page', () => {
  assert.deepEqual(paginate({ main: [] }, { main: 100 }), [{}]);
});
