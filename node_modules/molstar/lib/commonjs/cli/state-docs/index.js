#!/usr/bin/env node
"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = tslib_1.__importStar(require("../../mol-plugin-state/transforms"));
const mol_state_1 = require("../../mol-state");
const mol_util_1 = require("../../mol-util");
const fs = tslib_1.__importStar(require("fs"));
const pd_to_md_1 = require("./pd-to-md");
const context_1 = require("../../mol-plugin/context");
const param_definition_1 = require("../../mol-util/param-definition");
// force the transform to be evaluated
_.StateTransforms.Data.Download.id;
// Empty plugin context
const ctx = new context_1.PluginContext({
    behaviors: []
});
const builder = mol_util_1.StringBuilder.create();
function typeToString(o) {
    if (o.length === 0)
        return '()';
    return o.map(o => o.name).join(' | ');
}
function writeTransformer(t) {
    mol_util_1.StringBuilder.write(builder, `## <a name="${t.id.replace('.', '-')}"></a>${t.id} :: ${typeToString(t.definition.from)} -> ${typeToString(t.definition.to)}`);
    mol_util_1.StringBuilder.newline(builder);
    if (t.definition.display.description) {
        mol_util_1.StringBuilder.write(builder, `*${t.definition.display.description}*`);
        mol_util_1.StringBuilder.newline(builder);
    }
    mol_util_1.StringBuilder.newline(builder);
    if (t.definition.params) {
        const params = t.definition.params(void 0, ctx);
        mol_util_1.StringBuilder.write(builder, `### Parameters`);
        mol_util_1.StringBuilder.newline(builder);
        mol_util_1.StringBuilder.write(builder, (0, pd_to_md_1.paramsToMd)(params));
        mol_util_1.StringBuilder.newline(builder);
        mol_util_1.StringBuilder.write(builder, `### Default Parameters`);
        mol_util_1.StringBuilder.newline(builder);
        mol_util_1.StringBuilder.write(builder, `\`\`\`js\n${JSON.stringify(param_definition_1.ParamDefinition.getDefaultValues(params), null, 2)}\n\`\`\``);
        mol_util_1.StringBuilder.newline(builder);
    }
    mol_util_1.StringBuilder.write(builder, '----------------------------');
    mol_util_1.StringBuilder.newline(builder);
}
const transformers = mol_state_1.StateTransformer.getAll();
mol_util_1.StringBuilder.write(builder, '# Mol* Plugin State Transformer Reference');
mol_util_1.StringBuilder.newline(builder);
mol_util_1.StringBuilder.newline(builder);
transformers.forEach(t => {
    mol_util_1.StringBuilder.write(builder, `* [${t.id}](#${t.id.replace('.', '-')})`);
    mol_util_1.StringBuilder.newline(builder);
});
mol_util_1.StringBuilder.newline(builder);
mol_util_1.StringBuilder.write(builder, '----------------------------');
mol_util_1.StringBuilder.newline(builder);
transformers.forEach(t => writeTransformer(t));
fs.writeFileSync(`docs/state/transforms.md`, mol_util_1.StringBuilder.getString(builder));
