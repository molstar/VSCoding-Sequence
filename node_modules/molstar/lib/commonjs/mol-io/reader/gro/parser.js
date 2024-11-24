"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGRO = parseGRO;
const db_1 = require("../../../mol-data/db");
const tokenizer_1 = require("../common/text/tokenizer");
const fixed_1 = require("../common/text/column/fixed");
const result_1 = require("../result");
const mol_task_1 = require("../../../mol-task");
function createEmptyHeader() {
    return {
        title: '',
        timeInPs: 0,
        hasVelocities: false,
        precision: { position: 0, velocity: 0 },
        box: [0, 0, 0]
    };
}
function State(tokenizer, runtimeCtx) {
    return {
        tokenizer,
        header: createEmptyHeader(),
        numberOfAtoms: 0,
        runtimeCtx
    };
}
/**
 * title string (free format string, optional time in ps after 't=')
 */
function handleTitleString(state) {
    const { tokenizer, header } = state;
    let line = tokenizer_1.Tokenizer.readLine(tokenizer);
    // skip potential empty lines...
    if (line.trim().length === 0) {
        line = tokenizer_1.Tokenizer.readLine(tokenizer);
    }
    const timeOffset = line.lastIndexOf('t=');
    if (timeOffset >= 0) {
        header.timeInPs = parseFloat(line.substring(timeOffset + 2));
        header.title = line.substring(0, timeOffset).trim();
        if (header.title && header.title[header.title.length - 1] === ',') {
            header.title = header.title.substring(0, header.title.length - 1);
        }
    }
    else {
        header.title = line;
    }
}
/**
 * number of atoms (free format integer)
 */
function handleNumberOfAtoms(state) {
    const { tokenizer } = state;
    tokenizer_1.Tokenizer.markLine(tokenizer);
    const line = tokenizer_1.Tokenizer.getTokenString(tokenizer);
    state.numberOfAtoms = parseInt(line);
}
/**
 * This format is fixed, ie. all columns are in a fixed position.
 * Optionally (for now only yet with trjconv) you can write gro files
 * with any number of decimal places, the format will then be n+5
 * positions with n decimal places (n+1 for velocities) in stead
 * of 8 with 3 (with 4 for velocities). Upon reading, the precision
 * will be inferred from the distance between the decimal points
 * (which will be n+5). Columns contain the following information
 * (from left to right):
 *     residue number (5 positions, integer)
 *     residue name (5 characters)
 *     atom name (5 characters)
 *     atom number (5 positions, integer)
 *     position (in nm, x y z in 3 columns, each 8 positions with 3 decimal places)
 *     velocity (in nm/ps (or km/s), x y z in 3 columns, each 8 positions with 4 decimal places)
 */
async function handleAtoms(state) {
    const { tokenizer, numberOfAtoms } = state;
    const lines = await tokenizer_1.Tokenizer.readLinesAsync(tokenizer, numberOfAtoms, state.runtimeCtx, 100000);
    const positionSample = tokenizer.data.substring(lines.indices[0], lines.indices[1]).substring(20);
    const precisions = positionSample.match(/\.\d+/g);
    const hasVelocities = precisions.length === 6;
    state.header.hasVelocities = hasVelocities;
    state.header.precision.position = precisions[0].length - 1;
    state.header.precision.velocity = hasVelocities ? precisions[3].length - 1 : 0;
    const pO = 20;
    const pW = state.header.precision.position + 5;
    const vO = pO + 3 * pW;
    const vW = state.header.precision.velocity + 4;
    const col = (0, fixed_1.FixedColumnProvider)(lines);
    const undef = db_1.Column.Undefined(state.numberOfAtoms, db_1.Column.Schema.float);
    const ret = {
        count: state.numberOfAtoms,
        residueNumber: col(0, 5, db_1.Column.Schema.int),
        residueName: col(5, 5, db_1.Column.Schema.str),
        atomName: col(10, 5, db_1.Column.Schema.str),
        atomNumber: col(15, 5, db_1.Column.Schema.int),
        x: col(pO, pW, db_1.Column.Schema.float),
        y: col(pO + pW, pW, db_1.Column.Schema.float),
        z: col(pO + 2 * pW, pW, db_1.Column.Schema.float),
        vx: hasVelocities ? col(vO, vW, db_1.Column.Schema.float) : undef,
        vy: hasVelocities ? col(vO + vW, vW, db_1.Column.Schema.float) : undef,
        vz: hasVelocities ? col(vO + 2 * vW, vW, db_1.Column.Schema.float) : undef,
    };
    return ret;
}
/**
 * box vectors (free format, space separated reals), values:
 * v1(x) v2(y) v3(z) v1(y) v1(z) v2(x) v2(z) v3(x) v3(y),
 * the last 6 values may be omitted (they will be set to zero).
 * Gromacs only supports boxes with v1(y)=v1(z)=v2(z)=0.
 */
function handleBoxVectors(state) {
    const { tokenizer } = state;
    const values = tokenizer_1.Tokenizer.readLine(tokenizer).trim().split(/\s+/g);
    state.header.box = [+values[0], +values[1], +values[2]];
}
async function parseInternal(data, ctx) {
    const tokenizer = (0, tokenizer_1.Tokenizer)(data);
    await ctx.update({ message: 'Parsing...', current: 0, max: data.length });
    const structures = [];
    while (tokenizer.position < data.length) {
        const state = State(tokenizer, ctx);
        handleTitleString(state);
        handleNumberOfAtoms(state);
        const atoms = await handleAtoms(state);
        handleBoxVectors(state);
        structures.push({ header: state.header, atoms });
    }
    const result = { structures };
    return result_1.ReaderResult.success(result);
}
function parseGRO(data) {
    return mol_task_1.Task.create('Parse GRO', async (ctx) => {
        return await parseInternal(data, ctx);
    });
}
