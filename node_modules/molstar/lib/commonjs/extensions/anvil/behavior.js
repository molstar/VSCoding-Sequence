"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembraneOrientationPreset = exports.MembraneOrientation3D = exports.isTransmembrane = exports.ANVILMembraneOrientation = void 0;
exports.tryCreateMembraneOrientation = tryCreateMembraneOrientation;
const param_definition_1 = require("../../mol-util/param-definition");
const representation_preset_1 = require("../../mol-plugin-state/builder/structure/representation-preset");
const prop_1 = require("./prop");
const mol_state_1 = require("../../mol-state");
const mol_task_1 = require("../../mol-task");
const behavior_1 = require("../../mol-plugin/behavior");
const representation_1 = require("./representation");
const hydrophobicity_1 = require("../../mol-theme/color/hydrophobicity");
const objects_1 = require("../../mol-plugin-state/objects");
const compiler_1 = require("../../mol-script/runtime/query/compiler");
const structure_selection_query_1 = require("../../mol-plugin-state/helpers/structure-selection-query");
const builder_1 = require("../../mol-script/language/builder");
const Tag = prop_1.MembraneOrientation.Tag;
exports.ANVILMembraneOrientation = behavior_1.PluginBehavior.create({
    name: 'anvil-membrane-orientation-prop',
    category: 'custom-props',
    display: {
        name: 'Membrane Orientation',
        description: 'Data calculated with ANVIL algorithm.'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = prop_1.MembraneOrientationProvider;
        }
        register() {
            compiler_1.DefaultQueryRuntimeTable.addCustomProp(this.provider.descriptor);
            this.ctx.customStructureProperties.register(this.provider, this.params.autoAttach);
            this.ctx.representation.structure.registry.add(representation_1.MembraneOrientationRepresentationProvider);
            this.ctx.query.structure.registry.add(exports.isTransmembrane);
            this.ctx.genericRepresentationControls.set(Tag.Representation, selection => {
                const refs = [];
                selection.structures.forEach(structure => {
                    var _a;
                    const memRepr = (_a = structure.genericRepresentations) === null || _a === void 0 ? void 0 : _a.filter(r => r.cell.transform.transformer.id === MembraneOrientation3D.id)[0];
                    if (memRepr)
                        refs.push(memRepr);
                });
                return [refs, 'Membrane Orientation'];
            });
            this.ctx.builders.structure.representation.registerPreset(exports.MembraneOrientationPreset);
        }
        update(p) {
            const updated = this.params.autoAttach !== p.autoAttach;
            this.params.autoAttach = p.autoAttach;
            this.ctx.customStructureProperties.setDefaultAutoAttach(this.provider.descriptor.name, this.params.autoAttach);
            return updated;
        }
        unregister() {
            compiler_1.DefaultQueryRuntimeTable.removeCustomProp(this.provider.descriptor);
            this.ctx.customStructureProperties.unregister(this.provider.descriptor.name);
            this.ctx.representation.structure.registry.remove(representation_1.MembraneOrientationRepresentationProvider);
            this.ctx.query.structure.registry.remove(exports.isTransmembrane);
            this.ctx.genericRepresentationControls.delete(Tag.Representation);
            this.ctx.builders.structure.representation.unregisterPreset(exports.MembraneOrientationPreset);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(false)
    })
});
//
exports.isTransmembrane = (0, structure_selection_query_1.StructureSelectionQuery)('Residues Embedded in Membrane', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.wholeResidues([
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'atom-test': prop_1.MembraneOrientation.symbols.isTransmembrane.symbol(),
            })
        ])
    ])
]), {
    description: 'Select residues that are embedded between the membrane layers.',
    category: structure_selection_query_1.StructureSelectionCategory.Residue,
    ensureCustomProperties: (ctx, structure) => {
        return prop_1.MembraneOrientationProvider.attach(ctx, structure);
    }
});
const MembraneOrientation3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'membrane-orientation-3d',
    display: {
        name: 'Membrane Orientation',
        description: 'Membrane Orientation planes and rims. Data calculated with ANVIL algorithm.'
    },
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: (a) => {
        return {
            ...representation_1.MembraneOrientationParams,
        };
    }
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Membrane Orientation', async (ctx) => {
            var _a;
            await prop_1.MembraneOrientationProvider.attach({ runtime: ctx, assetManager: plugin.managers.asset, errorContext: plugin.errorContext }, a.data);
            const repr = (0, representation_1.MembraneOrientationRepresentation)({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => representation_1.MembraneOrientationParams);
            await repr.createOrUpdate(params, a.data).runInContext(ctx);
            return new objects_1.PluginStateObject.Shape.Representation3D({ repr, sourceData: a.data }, { label: 'Membrane Orientation' });
        });
    },
    update({ a, b, newParams }, plugin) {
        return mol_task_1.Task.create('Membrane Orientation', async (ctx) => {
            await prop_1.MembraneOrientationProvider.attach({ runtime: ctx, assetManager: plugin.managers.asset, errorContext: plugin.errorContext }, a.data);
            const props = { ...b.data.repr.props, ...newParams };
            await b.data.repr.createOrUpdate(props, a.data).runInContext(ctx);
            b.data.sourceData = a.data;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    },
    isApplicable(a) {
        return prop_1.MembraneOrientationProvider.isApplicable(a.data);
    }
});
exports.MembraneOrientation3D = MembraneOrientation3D;
exports.MembraneOrientationPreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-membrane-orientation',
    display: {
        name: 'Membrane Orientation', group: 'Annotation',
        description: 'Shows orientation of membrane layers. Data calculated with ANVIL algorithm.' // TODO add ' or obtained via RCSB PDB'
    },
    isApplicable(a) {
        return prop_1.MembraneOrientationProvider.isApplicable(a.data);
    },
    params: () => representation_preset_1.StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        if (!prop_1.MembraneOrientationProvider.get(structure).value) {
            await plugin.runTask(mol_task_1.Task.create('Membrane Orientation', async (runtime) => {
                await prop_1.MembraneOrientationProvider.attach({ runtime, assetManager: plugin.managers.asset, errorContext: plugin.errorContext }, structure);
            }));
        }
        const membraneOrientation = await tryCreateMembraneOrientation(plugin, structureCell);
        const colorTheme = hydrophobicity_1.HydrophobicityColorThemeProvider.name;
        const preset = await representation_preset_1.PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme } } }, plugin);
        return { components: preset.components, representations: { ...preset.representations, membraneOrientation } };
    }
});
function tryCreateMembraneOrientation(plugin, structure, params, initialState) {
    const state = plugin.state.data;
    const membraneOrientation = state.build().to(structure)
        .applyOrUpdateTagged('membrane-orientation-3d', MembraneOrientation3D, params, { state: initialState });
    return membraneOrientation.commit({ revertOnError: true });
}
