/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
import { Tokenizer, TokenBuilder } from '../common/text/tokenizer';
import { ReaderResult as Result } from '../result';
import { TokenColumnProvider as TokenColumn } from '../common/text/column/token';
import { Column } from '../../../mol-data/db';
// http://ambermd.org/prmtop.pdf
// https://ambermd.org/FileFormats.php#topology
const Pointers = {
    'NATOM': '', 'NTYPES': '', 'NBONH': '', 'MBONA': '', 'NTHETH': '', 'MTHETA': '',
    'NPHIH': '', 'MPHIA': '', 'NHPARM': '', 'NPARM': '', 'NNB': '', 'NRES': '',
    'NBONA': '', 'NTHETA': '', 'NPHIA': '', 'NUMBND': '', 'NUMANG': '', 'NPTRA': '',
    'NATYP': '', 'NPHB': '', 'IFPERT': '', 'NBPER': '', 'NGPER': '', 'NDPER': '',
    'MBPER': '', 'MGPER': '', 'MDPER': '', 'IFBOX': '', 'NMXRS': '', 'IFCAP': '',
    'NUMEXTRA': '', 'NCOPY': '',
};
const PointersNames = Object.keys(Pointers);
const { readLine, markLine, trim } = Tokenizer;
function State(tokenizer, runtimeCtx) {
    return {
        tokenizer,
        runtimeCtx,
    };
}
function handleTitle(state) {
    const { tokenizer } = state;
    const title = [];
    while (tokenizer.tokenEnd < tokenizer.length) {
        if (tokenizer.data[tokenizer.position] === '%')
            break;
        const line = readLine(tokenizer).trim();
        if (line)
            title.push(line);
    }
    return title;
}
function handlePointers(state) {
    const { tokenizer } = state;
    const pointers = Object.create(null);
    PointersNames.forEach(name => { pointers[name] = 0; });
    let curIdx = 0;
    while (tokenizer.tokenEnd < tokenizer.length) {
        if (tokenizer.data[tokenizer.position] === '%')
            break;
        const line = readLine(tokenizer);
        const n = Math.min(curIdx + 10, 32);
        for (let i = 0; curIdx < n; ++i, ++curIdx) {
            pointers[PointersNames[curIdx]] = parseInt(line.substring(i * 8, i * 8 + 8).trim());
        }
    }
    return pointers;
}
function handleTokens(state, count, countPerLine, itemSize) {
    const { tokenizer } = state;
    const tokens = TokenBuilder.create(tokenizer.data, count * 2);
    let curIdx = 0;
    while (tokenizer.tokenEnd < tokenizer.length) {
        if (tokenizer.data[tokenizer.position] === '%')
            break;
        tokenizer.tokenStart = tokenizer.position;
        const n = Math.min(curIdx + countPerLine, count);
        for (let i = 0; curIdx < n; ++i, ++curIdx) {
            const p = tokenizer.position;
            trim(tokenizer, tokenizer.position, tokenizer.position + itemSize);
            TokenBuilder.addUnchecked(tokens, tokenizer.tokenStart, tokenizer.tokenEnd);
            tokenizer.position = p + itemSize;
        }
        markLine(tokenizer);
    }
    return tokens;
}
async function parseInternal(data, ctx) {
    const t = Tokenizer(data);
    const state = State(t, ctx);
    const result = Object.create(null);
    let prevPosition = 0;
    while (t.tokenEnd < t.length) {
        if (t.position - prevPosition > 100000 && ctx.shouldUpdate) {
            prevPosition = t.position;
            await ctx.update({ current: t.position, max: t.length });
        }
        const line = readLine(state.tokenizer).trim();
        if (line.startsWith('%VERSION')) {
            result.version = line.substring(8).trim();
        }
        else if (line.startsWith('%FLAG')) {
            const flag = line.substring(5).trim();
            const formatLine = readLine(state.tokenizer).trim();
            if (!formatLine.startsWith('%FORMAT'))
                throw new Error('expected %FORMAT');
            if (flag === 'TITLE') {
                result.title = handleTitle(state);
            }
            else if (flag === 'POINTERS') {
                result.pointers = handlePointers(state);
            }
            else if (flag === 'ATOM_NAME') {
                const tokens = handleTokens(state, result.pointers['NATOM'], 20, 4);
                result.atomName = TokenColumn(tokens)(Column.Schema.str);
            }
            else if (flag === 'CHARGE') {
                const tokens = handleTokens(state, result.pointers['NATOM'], 5, 16);
                result.charge = TokenColumn(tokens)(Column.Schema.float);
            }
            else if (flag === 'MASS') {
                const tokens = handleTokens(state, result.pointers['NATOM'], 5, 16);
                result.mass = TokenColumn(tokens)(Column.Schema.float);
            }
            else if (flag === 'RESIDUE_LABEL') {
                const tokens = handleTokens(state, result.pointers['NRES'], 20, 4);
                result.residueLabel = TokenColumn(tokens)(Column.Schema.str);
            }
            else if (flag === 'RESIDUE_POINTER') {
                const tokens = handleTokens(state, result.pointers['NRES'], 10, 8);
                result.residuePointer = TokenColumn(tokens)(Column.Schema.int);
            }
            else if (flag === 'BONDS_INC_HYDROGEN') {
                const tokens = handleTokens(state, result.pointers['NBONH'] * 3, 10, 8);
                result.bondsIncHydrogen = TokenColumn(tokens)(Column.Schema.int);
            }
            else if (flag === 'BONDS_WITHOUT_HYDROGEN') {
                const tokens = handleTokens(state, result.pointers['NBONA'] * 3, 10, 8);
                result.bondsWithoutHydrogen = TokenColumn(tokens)(Column.Schema.int);
            }
            else if (flag === 'RADII') {
                const tokens = handleTokens(state, result.pointers['NATOM'], 5, 16);
                result.radii = TokenColumn(tokens)(Column.Schema.float);
            }
            else {
                while (t.tokenEnd < t.length) {
                    if (t.data[t.position] === '%')
                        break;
                    markLine(t);
                }
            }
        }
    }
    return Result.success(result);
}
export function parsePrmtop(data) {
    return Task.create('Parse PRMTOP', async (ctx) => {
        return await parseInternal(data, ctx);
    });
}
