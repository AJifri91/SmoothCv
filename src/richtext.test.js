import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textToHtml, isBlank } from './richtext.js';

test('plain text bullets become a list, other lines paragraphs', () => {
  assert.equal(textToHtml('Intro\n- one\n- two\nOutro'), '<p>Intro</p><ul><li>one</li><li>two</li></ul><p>Outro</p>');
});

test('escapes HTML in legacy text', () => {
  assert.equal(textToHtml('<b>x</b>'), '<p>&lt;b&gt;x&lt;/b&gt;</p>');
});

test('isBlank ignores empty markup', () => {
  assert.ok(isBlank('<p><br></p>'));
  assert.ok(!isBlank('<p>hi</p>'));
});
