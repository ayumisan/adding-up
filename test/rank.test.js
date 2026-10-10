'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { rankFromLines, formatRanking, resolveCsvPath } = require('../app');

const root = path.join(__dirname, '..');
const fixtureLines = fs.readFileSync(
    path.join(root, 'fixtures', 'sample-pref.csv'),
    'utf8'
).trim().split('\n');

test('ignores header and non-target years, then ranks by change', () => {
    const ranking = rankFromLines(fixtureLines);
    assert.deepEqual(
        ranking.map((pair) => [pair[0], pair[1].popu10, pair[1].popu15, pair[1].change]),
        [
            ['青森県', 200, 180, 0.9],
            ['北海道', 200, 400, 2],
            ['東京都', 100, 300, 3]
        ]
    );
});

test('formats ranking strings the same way as the CLI', () => {
    const ranking = rankFromLines(fixtureLines);
    assert.deepEqual(formatRanking(ranking), [
        '1位 青森県: 200=> 180 変化率:0.9',
        '2位 北海道: 200=> 400 変化率:2',
        '3位 東京都: 100=> 300 変化率:3'
    ]);
});

test('CLI default path stays the full census file', () => {
    assert.equal(
        resolveCsvPath(['node', 'app.js']),
        path.resolve('./popu-pref.csv')
    );
});

test('CLI prints fixture ranking without reading the full census file', () => {
    const result = spawnSync(
        process.execPath,
        ['app.js', 'fixtures/sample-pref.csv'],
        { encoding: 'utf8', cwd: root }
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /1位 青森県: 200=> 180 変化率:0\.9/);
    assert.match(result.stdout, /3位 東京都: 100=> 300 変化率:3/);
});

test('full census CLI still emits 47 prefecture rows', () => {
    const result = spawnSync(process.execPath, ['app.js'], {
        encoding: 'utf8',
        cwd: root
    });
    assert.equal(result.status, 0, result.stderr);
    const ranked = result.stdout.match(/\d+位 /g) || [];
    assert.equal(ranked.length, 47);
    assert.match(result.stdout, /1位 岩手県:/);
});
