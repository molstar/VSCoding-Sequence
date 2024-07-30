"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 *
 * Adapted from MolQL project
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.docs = void 0;
const properties_1 = require("./properties");
const operators_1 = require("./operators");
const keywords_1 = require("./keywords");
const _docs = [
    'Jmol',
    '============',
    '--------------------------------',
    ''
];
_docs.push(`## Properties\n\n`);
_docs.push('--------------------------------\n');
for (const name in properties_1.properties) {
    if (properties_1.properties[name].isUnsupported)
        continue;
    const names = [name];
    if (properties_1.properties[name].abbr)
        names.push(...properties_1.properties[name].abbr);
    _docs.push(`\`\`\`\n${names.join(', ')}\n\`\`\`\n`);
    if (properties_1.properties[name]['@desc']) {
        _docs.push(`*${properties_1.properties[name]['@desc']}*\n`);
    }
}
_docs.push(`## Operators\n\n`);
_docs.push('--------------------------------\n');
operators_1.operators.forEach(o => {
    if (o.isUnsupported)
        return;
    const names = [o.name];
    if (o.abbr)
        names.push(...o.abbr);
    _docs.push(`\`\`\`\n${names.join(', ')}\n\`\`\`\n`);
    if (o['@desc']) {
        _docs.push(`*${o['@desc']}*\n`);
    }
});
_docs.push(`## Keywords\n\n`);
_docs.push('--------------------------------\n');
for (const name in keywords_1.keywords) {
    if (!keywords_1.keywords[name].map)
        continue;
    const names = [name];
    if (keywords_1.keywords[name].abbr)
        names.push(...keywords_1.keywords[name].abbr);
    _docs.push(`\`\`\`\n${names.join(', ')}\n\`\`\`\n`);
    if (keywords_1.keywords[name]['@desc']) {
        _docs.push(`*${keywords_1.keywords[name]['@desc']}*\n`);
    }
}
exports.docs = _docs.join('\n');
