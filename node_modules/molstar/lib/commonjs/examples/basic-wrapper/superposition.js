"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticSuperpositionTestData = void 0;
exports.buildStaticSuperposition = buildStaticSuperposition;
exports.dynamicSuperpositionTest = dynamicSuperpositionTest;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const structure_1 = require("../../mol-model/structure");
const superposition_1 = require("../../mol-model/structure/structure/util/superposition");
const builder_1 = require("../../mol-script/language/builder");
const compiler_1 = require("../../mol-script/runtime/query/compiler");
const transforms_1 = require("../../mol-plugin-state/transforms");
const assets_1 = require("../../mol-util/assets");
function buildStaticSuperposition(plugin, src) {
    return plugin.dataTransaction(async () => {
        for (const s of src) {
            const { structure } = await loadStructure(plugin, `https://www.ebi.ac.uk/pdbe/static/entry/${s.pdbId}_updated.cif`, 'mmcif');
            await transform(plugin, structure, s.matrix);
            const chain = await plugin.builders.structure.tryCreateComponentFromExpression(structure, chainSelection(s.auth_asym_id), `Chain ${s.auth_asym_id}`);
            if (chain)
                await plugin.builders.structure.representation.addRepresentation(chain, { type: 'cartoon' });
        }
    });
}
exports.StaticSuperpositionTestData = [
    {
        pdbId: '1aj5', auth_asym_id: 'A', matrix: linear_algebra_1.Mat4.identity()
    },
    {
        pdbId: '1df0', auth_asym_id: 'B', matrix: linear_algebra_1.Mat4.ofRows([
            [0.406, 0.879, 0.248, -200.633],
            [0.693, -0.473, 0.544, 73.403],
            [0.596, -0.049, -0.802, -14.209],
            [0, 0, 0, 1]
        ])
    },
    {
        pdbId: '1dvi', auth_asym_id: 'A', matrix: linear_algebra_1.Mat4.ofRows([
            [-0.053, -0.077, 0.996, -45.633],
            [-0.312, 0.949, 0.057, -12.255],
            [-0.949, -0.307, -0.074, 53.562],
            [0, 0, 0, 1]
        ])
    }
];
function dynamicSuperpositionTest(plugin, src, comp_id) {
    return plugin.dataTransaction(async () => {
        for (const s of src) {
            await loadStructure(plugin, `https://www.ebi.ac.uk/pdbe/static/entry/${s}_updated.cif`, 'mmcif');
        }
        const pivot = builder_1.MolScriptBuilder.struct.filter.first([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'residue-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.struct.atomProperty.macromolecular.label_comp_id(), comp_id]),
                'group-by': builder_1.MolScriptBuilder.struct.atomProperty.macromolecular.residueKey()
            })
        ]);
        const rest = builder_1.MolScriptBuilder.struct.modifier.exceptBy({
            0: builder_1.MolScriptBuilder.struct.modifier.includeSurroundings({
                0: pivot,
                radius: 5
            }),
            by: pivot
        });
        const query = (0, compiler_1.compile)(pivot);
        const xs = plugin.managers.structure.hierarchy.current.structures;
        const selections = xs.map(s => structure_1.StructureSelection.toLociWithCurrentUnits(query(new structure_1.QueryContext(s.cell.obj.data))));
        const transforms = (0, superposition_1.superpose)(selections);
        await siteVisual(plugin, xs[0].cell, pivot, rest);
        for (let i = 1; i < selections.length; i++) {
            await transform(plugin, xs[i].cell, transforms[i - 1].bTransform);
            await siteVisual(plugin, xs[i].cell, pivot, rest);
        }
    });
}
async function siteVisual(plugin, s, pivot, rest) {
    const center = await plugin.builders.structure.tryCreateComponentFromExpression(s, pivot, 'pivot');
    if (center)
        await plugin.builders.structure.representation.addRepresentation(center, { type: 'ball-and-stick', color: 'residue-name' });
    const surr = await plugin.builders.structure.tryCreateComponentFromExpression(s, rest, 'rest');
    if (surr)
        await plugin.builders.structure.representation.addRepresentation(surr, { type: 'ball-and-stick', color: 'uniform', size: 'uniform', sizeParams: { value: 0.33 } });
}
async function loadStructure(plugin, url, format, assemblyId) {
    const data = await plugin.builders.data.download({ url: assets_1.Asset.Url(url) });
    const trajectory = await plugin.builders.structure.parseTrajectory(data, format);
    const model = await plugin.builders.structure.createModel(trajectory);
    const structure = await plugin.builders.structure.createStructure(model, assemblyId ? { name: 'assembly', params: { id: assemblyId } } : void 0);
    return { data, trajectory, model, structure };
}
function chainSelection(auth_asym_id) {
    return builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id])
    });
}
function transform(plugin, s, matrix) {
    const b = plugin.state.data.build().to(s)
        .insert(transforms_1.StateTransforms.Model.TransformStructureConformation, { transform: { name: 'matrix', params: { data: matrix, transpose: false } } });
    return plugin.runTask(plugin.state.data.updateTree(b));
}
