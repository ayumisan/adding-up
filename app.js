'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TARGET_YEARS = new Set([2010, 2015]);

function emptyValue() {
    return {
        popu10: 0,
        popu15: 0,
        change: null
    };
}

function accumulateLine(map, lineString) {
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    if (!TARGET_YEARS.has(year)) {
        return;
    }

    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
    let value = map.get(prefecture);
    if (!value) {
        value = emptyValue();
        map.set(prefecture, value);
    }
    if (year === 2010) {
        value.popu10 += popu;
    }
    if (year === 2015) {
        value.popu15 += popu;
    }
}

function finalizeRanking(map) {
    for (const value of map.values()) {
        value.change = value.popu15 / value.popu10;
    }
    return Array.from(map).sort((pair1, pair2) => {
        return pair1[1].change - pair2[1].change;
    });
}

function formatRanking(rankingArray) {
    return rankingArray.map((pair, i) => {
        return (i + 1) + '位 ' + pair[0] + ': ' + pair[1].popu10 + '=> ' + pair[1].popu15 + ' 変化率:' + pair[1].change;
    });
}

function rankFromLines(lines) {
    const map = new Map();
    for (const line of lines) {
        accumulateLine(map, line);
    }
    return finalizeRanking(map);
}

function runFromStream(input, onDone) {
    const rl = readline.createInterface({ input, output: {} });
    const map = new Map();
    rl.on('line', (lineString) => {
        accumulateLine(map, lineString);
    });
    rl.on('close', () => {
        onDone(formatRanking(finalizeRanking(map)));
    });
    rl.resume();
}

function resolveCsvPath(argv) {
    return path.resolve(argv[2] || './popu-pref.csv');
}

function main(argv, log) {
    const csvPath = resolveCsvPath(argv);
    runFromStream(fs.createReadStream(csvPath), (rankingStrings) => {
        log(rankingStrings);
    });
}

if (require.main === module) {
    main(process.argv, console.log);
}

module.exports = {
    accumulateLine,
    finalizeRanking,
    formatRanking,
    rankFromLines,
    resolveCsvPath,
    runFromStream,
    main
};
