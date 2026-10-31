"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureFocusRepresentation = exports.StructureFocusRepresentationTags = void 0;
const interactions_1 = require("../../../../mol-model-props/computed/representations/interactions");
const interaction_type_1 = require("../../../../mol-model-props/computed/themes/interaction-type");
const structure_1 = require("../../../../mol-model/structure");
const structure_representation_params_1 = require("../../../../mol-plugin-state/helpers/structure-representation-params");
const transforms_1 = require("../../../../mol-plugin-state/transforms");
const behavior_1 = require("../../../behavior");
const builder_1 = require("../../../../mol-script/language/builder");
const mol_state_1 = require("../../../../mol-state");
const size_1 = require("../../../../mol-theme/size");
const param_definition_1 = require("../../../../mol-util/param-definition");
const commands_1 = require("../../../commands");
const material_1 = require("../../../../mol-util/material");
const clip_1 = require("../../../../mol-util/clip");
const StructureFocusRepresentationParams = (plugin) => {
    const reprParams = transforms_1.StateTransforms.Representation.StructureRepresentation3D.definition.params(void 0, plugin);
    return {
        expandRadius: param_definition_1.ParamDefinition.Numeric(5, { min: 1, max: 10, step: 1 }),
        targetParams: param_definition_1.ParamDefinition.Group(reprParams, {
            label: 'Target',
            customDefault: (0, structure_representation_params_1.createStructureRepresentationParams)(plugin, void 0, {
                type: 'ball-and-stick',
                size: 'physical',
                typeParams: { sizeFactor: 0.22, sizeAspectRatio: 0.73, adjustCylinderLength: true, xrayShaded: true, aromaticBonds: false, multipleBonds: 'off', excludeTypes: ['hydrogen-bond', 'metal-coordination'] },
            })
        }),
        surroundingsParams: param_definition_1.ParamDefinition.Group(reprParams, {
            label: 'Surroundings',
            customDefault: (0, structure_representation_params_1.createStructureRepresentationParams)(plugin, void 0, {
                type: 'ball-and-stick',
                size: 'physical',
                typeParams: { sizeFactor: 0.16, excludeTypes: ['hydrogen-bond', 'metal-coordination'] }
            })
        }),
        nciParams: param_definition_1.ParamDefinition.Group(reprParams, {
            label: 'Non-covalent Int.',
            customDefault: (0, structure_representation_params_1.createStructureRepresentationParams)(plugin, void 0, {
                type: interactions_1.InteractionsRepresentationProvider,
                color: interaction_type_1.InteractionTypeColorThemeProvider,
                size: size_1.SizeTheme.BuiltIn.uniform
            })
        }),
        components: param_definition_1.ParamDefinition.MultiSelect(FocusComponents, param_definition_1.ParamDefinition.arrayToOptions(FocusComponents)),
        excludeTargetFromSurroundings: param_definition_1.ParamDefinition.Boolean(false, { label: 'Exclude Target', description: 'Exclude the focus "target" from the surroudings component.' }),
        ignoreHydrogens: param_definition_1.ParamDefinition.Boolean(false),
        ignoreHydrogensVariant: param_definition_1.ParamDefinition.Select('all', param_definition_1.ParamDefinition.arrayToOptions(['all', 'non-polar'])),
        ignoreLight: param_definition_1.ParamDefinition.Boolean(false),
        material: material_1.Material.getParam(),
        clip: param_definition_1.ParamDefinition.Group(clip_1.Clip.Params),
    };
};
const FocusComponents = ['target', 'surroundings', 'interactions'];
var StructureFocusRepresentationTags;
(function (StructureFocusRepresentationTags) {
    StructureFocusRepresentationTags["TargetSel"] = "structure-focus-target-sel";
    StructureFocusRepresentationTags["TargetRepr"] = "structure-focus-target-repr";
    StructureFocusRepresentationTags["SurrSel"] = "structure-focus-surr-sel";
    StructureFocusRepresentationTags["SurrRepr"] = "structure-focus-surr-repr";
    StructureFocusRepresentationTags["SurrNciRepr"] = "structure-focus-surr-nci-repr";
})(StructureFocusRepresentationTags || (exports.StructureFocusRepresentationTags = StructureFocusRepresentationTags = {}));
const TagSet = new Set([StructureFocusRepresentationTags.TargetSel, StructureFocusRepresentationTags.TargetRepr, StructureFocusRepresentationTags.SurrSel, StructureFocusRepresentationTags.SurrRepr, StructureFocusRepresentationTags.SurrNciRepr]);
class StructureFocusRepresentationBehavior extends behavior_1.PluginBehavior.WithSubscribers {
    constructor() {
        super(...arguments);
        this.currentSource = void 0;
    }
    get surrLabel() { return `[Focus] Surroundings (${this.params.expandRadius} Å)`; }
    getReprParams(reprParams) {
        return {
            ...reprParams,
            type: {
                name: reprParams.type.name,
                params: { ...reprParams.type.params, ignoreHydrogens: this.params.ignoreHydrogens, ignoreHydrogensVariant: this.params.ignoreHydrogensVariant, ignoreLight: this.params.ignoreLight, material: this.params.material, clip: this.params.clip }
            }
        };
    }
    ensureShape(cell) {
        var _a;
        const state = this.plugin.state.data, tree = state.tree;
        const builder = state.build();
        const refs = mol_state_1.StateSelection.findUniqueTagsInSubtree(tree, cell.transform.ref, TagSet);
        // Selections
        if (!refs[StructureFocusRepresentationTags.TargetSel]) {
            refs[StructureFocusRepresentationTags.TargetSel] = builder
                .to(cell)
                .apply(transforms_1.StateTransforms.Model.StructureSelectionFromBundle, { bundle: structure_1.StructureElement.Bundle.Empty, label: '[Focus] Target' }, { tags: StructureFocusRepresentationTags.TargetSel }).ref;
        }
        if (!refs[StructureFocusRepresentationTags.SurrSel]) {
            refs[StructureFocusRepresentationTags.SurrSel] = builder
                .to(cell)
                .apply(transforms_1.StateTransforms.Model.StructureSelectionFromExpression, { expression: builder_1.MolScriptBuilder.struct.generator.empty(), label: this.surrLabel }, { tags: StructureFocusRepresentationTags.SurrSel }).ref;
        }
        const components = this.params.components;
        // Representations
        if (components.indexOf('target') >= 0 && !refs[StructureFocusRepresentationTags.TargetRepr]) {
            refs[StructureFocusRepresentationTags.TargetRepr] = builder
                .to(refs[StructureFocusRepresentationTags.TargetSel])
                .apply(transforms_1.StateTransforms.Representation.StructureRepresentation3D, this.getReprParams(this.params.targetParams), { tags: StructureFocusRepresentationTags.TargetRepr }).ref;
        }
        if (components.indexOf('surroundings') >= 0 && !refs[StructureFocusRepresentationTags.SurrRepr]) {
            refs[StructureFocusRepresentationTags.SurrRepr] = builder
                .to(refs[StructureFocusRepresentationTags.SurrSel])
                .apply(transforms_1.StateTransforms.Representation.StructureRepresentation3D, this.getReprParams(this.params.surroundingsParams), { tags: StructureFocusRepresentationTags.SurrRepr }).ref;
        }
        if (components.indexOf('interactions') >= 0 && !refs[StructureFocusRepresentationTags.SurrNciRepr] && cell.obj && interactions_1.InteractionsRepresentationProvider.isApplicable((_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data)) {
            refs[StructureFocusRepresentationTags.SurrNciRepr] = builder
                .to(refs[StructureFocusRepresentationTags.SurrSel])
                .apply(transforms_1.StateTransforms.Representation.StructureRepresentation3D, this.getReprParams(this.params.nciParams), { tags: StructureFocusRepresentationTags.SurrNciRepr }).ref;
        }
        return { state, builder, refs };
    }
    clear(root) {
        const state = this.plugin.state.data;
        this.currentSource = void 0;
        const foci = state.select(mol_state_1.StateSelection.Generators.byRef(root).subtree().withTag(StructureFocusRepresentationTags.TargetSel));
        const surrs = state.select(mol_state_1.StateSelection.Generators.byRef(root).subtree().withTag(StructureFocusRepresentationTags.SurrSel));
        if (foci.length === 0 && surrs.length === 0)
            return;
        const update = state.build();
        const bundle = structure_1.StructureElement.Bundle.Empty;
        for (const f of foci) {
            update.to(f).update(transforms_1.StateTransforms.Model.StructureSelectionFromBundle, old => ({ ...old, bundle }));
        }
        const expression = builder_1.MolScriptBuilder.struct.generator.empty();
        for (const s of surrs) {
            update.to(s).update(transforms_1.StateTransforms.Model.StructureSelectionFromExpression, old => ({ ...old, expression }));
        }
        return commands_1.PluginCommands.State.Update(this.plugin, { state, tree: update, options: { doNotLogTiming: true, doNotUpdateCurrent: true } });
    }
    async focus(sourceLoci) {
        const parent = this.plugin.helpers.substructureParent.get(sourceLoci.structure);
        if (!parent || !parent.obj)
            return;
        this.currentSource = sourceLoci;
        const loci = structure_1.StructureElement.Loci.remap(sourceLoci, parent.obj.data);
        const residueLoci = structure_1.StructureElement.Loci.extendToWholeResidues(loci);
        const residueBundle = structure_1.StructureElement.Bundle.fromLoci(residueLoci);
        const target = structure_1.StructureElement.Bundle.toExpression(residueBundle);
        let surroundings = builder_1.MolScriptBuilder.struct.modifier.includeSurroundings({
            0: target,
            radius: this.params.expandRadius,
            'as-whole-residues': true
        });
        if (this.params.excludeTargetFromSurroundings) {
            surroundings = builder_1.MolScriptBuilder.struct.modifier.exceptBy({
                0: surroundings,
                by: target
            });
        }
        const { state, builder, refs } = this.ensureShape(parent);
        builder.to(refs[StructureFocusRepresentationTags.TargetSel]).update(transforms_1.StateTransforms.Model.StructureSelectionFromBundle, old => ({ ...old, bundle: residueBundle }));
        builder.to(refs[StructureFocusRepresentationTags.SurrSel]).update(transforms_1.StateTransforms.Model.StructureSelectionFromExpression, old => ({ ...old, expression: surroundings, label: this.surrLabel }));
        await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: builder, options: { doNotLogTiming: true, doNotUpdateCurrent: true } });
    }
    register(ref) {
        this.subscribeObservable(this.plugin.managers.structure.focus.behaviors.current, (entry) => {
            if (entry)
                this.focus(entry.loci);
            else
                this.clear(mol_state_1.StateTransform.RootRef);
        });
    }
    async update(params) {
        const old = this.params;
        this.params = params;
        if (old.excludeTargetFromSurroundings !== params.excludeTargetFromSurroundings) {
            if (this.currentSource) {
                this.focus(this.currentSource);
            }
            return true;
        }
        const state = this.plugin.state.data;
        const builder = state.build();
        const all = mol_state_1.StateSelection.Generators.root.subtree();
        const components = this.params.components;
        // TODO: create component if previously didnt exist
        let hasComponent = components.indexOf('target') >= 0;
        for (const repr of state.select(all.withTag(StructureFocusRepresentationTags.TargetRepr))) {
            if (!hasComponent)
                builder.delete(repr.transform.ref);
            else
                builder.to(repr).update(this.getReprParams(this.params.targetParams));
        }
        hasComponent = components.indexOf('surroundings') >= 0;
        for (const repr of state.select(all.withTag(StructureFocusRepresentationTags.SurrRepr))) {
            if (!hasComponent)
                builder.delete(repr.transform.ref);
            else
                builder.to(repr).update(this.getReprParams(this.params.surroundingsParams));
        }
        hasComponent = components.indexOf('interactions') >= 0;
        for (const repr of state.select(all.withTag(StructureFocusRepresentationTags.SurrNciRepr))) {
            if (!hasComponent)
                builder.delete(repr.transform.ref);
            else
                builder.to(repr).update(this.getReprParams(this.params.nciParams));
        }
        await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: builder, options: { doNotLogTiming: true, doNotUpdateCurrent: true } });
        if (params.expandRadius !== old.expandRadius) {
            if (this.currentSource) {
                this.focus(this.currentSource);
            }
            return true;
        }
        return true;
    }
}
exports.StructureFocusRepresentation = behavior_1.PluginBehavior.create({
    name: 'create-structure-focus-representation',
    display: { name: 'Structure Focus Representation' },
    category: 'interaction',
    ctor: StructureFocusRepresentationBehavior,
    params: (_, plugin) => StructureFocusRepresentationParams(plugin)
});
