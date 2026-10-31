/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { CIF, getCifFieldType } from '../../mol-io/reader/cif';
import { CifWriter } from '../../mol-io/writer/cif';
import * as util from 'util';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { Progress, Task } from '../../mol-task';
import { classifyFloatArray, classifyIntArray } from '../../mol-io/common/binary-cif';
import { Category } from '../../mol-io/writer/cif/encoder';
function showProgress(p) {
    process.stdout.write(`\r${new Array(80).join(' ')}`);
    process.stdout.write(`\r${Progress.format(p)}`);
}
const readFileAsync = util.promisify(fs.readFile);
const unzipAsync = util.promisify(zlib.unzip);
async function readFile(ctx, filename) {
    const isGz = /\.gz$/i.test(filename);
    if (filename.match(/\.bcif/)) {
        let input = await readFileAsync(filename);
        if (isGz)
            input = await unzipAsync(input);
        return await CIF.parseBinary(new Uint8Array(input)).runInContext(ctx);
    }
    else {
        let str;
        if (isGz) {
            const data = await unzipAsync(await readFileAsync(filename));
            str = data.toString('utf8');
        }
        else {
            str = await readFileAsync(filename, 'utf8');
        }
        return await CIF.parseText(str).runInContext(ctx);
    }
}
async function getCIF(ctx, filename) {
    const parsed = await readFile(ctx, filename);
    if (parsed.isError) {
        throw new Error(parsed.toString());
    }
    return parsed.result;
}
function getCategoryInstanceProvider(cat, fields) {
    return {
        name: cat.name,
        instance: () => CifWriter.categoryInstance(fields, { data: cat, rowCount: cat.rowCount })
    };
}
function classify(name, field) {
    const type = getCifFieldType(field);
    if (type['@type'] === 'str') {
        return { name, type: 0 /* CifWriter.Field.Type.Str */, value: field.str, valueKind: field.valueKind };
    }
    else if (type['@type'] === 'float') {
        const encoder = classifyFloatArray(field.toFloatArray({ array: Float64Array }));
        return CifWriter.Field.float(name, field.float, { valueKind: field.valueKind, encoder, typedArray: Float64Array });
    }
    else {
        const encoder = classifyIntArray(field.toIntArray({ array: Int32Array }));
        return CifWriter.Field.int(name, field.int, { valueKind: field.valueKind, encoder, typedArray: Int32Array });
    }
}
export function convert(path, asText = false, hints, filter) {
    return Task.create('Convert CIF', async (ctx) => {
        const encodingProvider = hints
            ? CifWriter.createEncodingProviderFromJsonConfig(hints)
            : { get: (c, f) => void 0 };
        const cif = await getCIF(ctx, path);
        const encoder = CifWriter.createEncoder({
            binary: !asText,
            encoderName: 'mol*/ciftools cif2bcif',
            binaryAutoClassifyEncoding: true,
            binaryEncodingPovider: encodingProvider
        });
        if (filter) {
            encoder.setFilter(Category.filterOf(filter));
        }
        let maxProgress = 0;
        for (const b of cif.blocks) {
            maxProgress += b.categoryNames.length;
            for (const c of b.categoryNames)
                maxProgress += b.categories[c].fieldNames.length;
        }
        let current = 0;
        for (const b of cif.blocks) {
            encoder.startDataBlock(b.header);
            for (const c of b.categoryNames) {
                const cat = b.categories[c];
                const fields = [];
                for (const f of cat.fieldNames) {
                    fields.push(classify(f, cat.getField(f)));
                    current++;
                    if (ctx.shouldUpdate)
                        await ctx.update({ message: 'Encoding...', current, max: maxProgress });
                }
                encoder.writeCategory(getCategoryInstanceProvider(b.categories[c], fields));
                current++;
                if (ctx.shouldUpdate)
                    await ctx.update({ message: 'Encoding...', current, max: maxProgress });
            }
        }
        await ctx.update('Exporting...');
        const ret = encoder.getData();
        await ctx.update('Done.\n');
        return ret;
    }).run(showProgress, 250);
}
