import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hsvToHex, hexToHsv, isHex } from './color.js';

test('hsv to hex for primaries and greys', () => {
  assert.equal(hsvToHex(0, 1, 1), '#ff0000');
  assert.equal(hsvToHex(120, 1, 1), '#00ff00');
  assert.equal(hsvToHex(240, 1, 1), '#0000ff');
  assert.equal(hsvToHex(0, 0, 0.5), '#808080');
});

test('hex round-trips through hsv', () => {
  for (const hex of ['#1f5f6b', '#c0562d', '#2b2b2b', '#ffffff', '#6d4bc2']) {
    const { h, s, v } = hexToHsv(hex);
    assert.equal(hsvToHex(h, s, v), hex);
  }
});

test('isHex accepts only #rrggbb', () => {
  assert.ok(isHex('#A1b2C3'));
  assert.ok(!isHex('a1b2c3'));
  assert.ok(!isHex('#abc'));
});
