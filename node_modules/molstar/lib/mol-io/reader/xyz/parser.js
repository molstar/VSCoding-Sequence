/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column } from '../../../mol-data/db';
import { Task } from '../../../mol-task';
import { Tokenizer } from '../common/text/tokenizer';
import { ReaderResult as Result } from '../result';
function handleMolecule(tokenizer) {
    let count = tokenizer.position >= tokenizer.data.length - 1 ? 0 : +Tokenizer.readLine(tokenizer);
    if (isNaN(count))
        count = 0;
    const comment = Tokenizer.readLine(tokenizer);
    const x = new Float64Array(count);
    const y = new Float64Array(count);
    const z = new Float64Array(count);
    const type_symbol = new Array(count);
    for (let i = 0; i < count; ++i) {
        const line = Tokenizer.readLineTrim(tokenizer);
        const fields = line.split(/\s+/g);
        type_symbol[i] = fields[0];
        x[i] = +fields[1];
        y[i] = +fields[2];
        z[i] = +fields[3];
    }
    return {
        count,
        comment,
        x: Column.ofFloatArray(x),
        y: Column.ofFloatArray(y),
        z: Column.ofFloatArray(z),
        type_symbol: Column.ofStringArray(type_symbol)
    };
}
function parseInternal(data) {
    const tokenizer = Tokenizer(data);
    const molecules = [];
    while (true) {
        const mol = handleMolecule(tokenizer);
        if (mol.count === 0)
            break;
        molecules.push(mol);
    }
    const result = { molecules };
    return Result.success(result);
}
export function parseXyz(data) {
    return Task.create('Parse Mol', async () => {
        return parseInternal(data);
    });
}
