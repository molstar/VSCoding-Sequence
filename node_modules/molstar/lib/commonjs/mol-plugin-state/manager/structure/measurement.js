"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ryan DiRisio <rjdiris@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureMeasurementParams = exports.MeasurementOrderLabelTag = exports.MeasurementGroupTag = exports.StructureMeasurementManager = void 0;
const structure_1 = require("../../../mol-model/structure");
const mol_state_1 = require("../../../mol-state");
const transforms_1 = require("../../transforms");
const commands_1 = require("../../../mol-plugin/commands");
const array_1 = require("../../../mol-util/array");
const objects_1 = require("../../objects");
const component_1 = require("../../component");
const param_definition_1 = require("../../../mol-util/param-definition");
const common_1 = require("../../../mol-repr/shape/loci/common");
const color_1 = require("../../../mol-util/color");
exports.MeasurementGroupTag = 'measurement-group';
exports.MeasurementOrderLabelTag = 'measurement-order-label';
exports.StructureMeasurementParams = {
    distanceUnitLabel: param_definition_1.ParamDefinition.Text('\u212B', { isEssential: true }),
    textColor: common_1.MeasurementRepresentationCommonTextParams.textColor
};
const DefaultStructureMeasurementOptions = param_definition_1.ParamDefinition.getDefaultValues(exports.StructureMeasurementParams);
class StructureMeasurementManager extends component_1.StatefulPluginComponent {
    stateUpdated() {
        this.behaviors.state.next(this.state);
    }
    getGroup() {
        const state = this.plugin.state.data;
        const groupRef = mol_state_1.StateSelection.findTagInSubtree(state.tree, mol_state_1.StateTransform.RootRef, exports.MeasurementGroupTag);
        const builder = this.plugin.state.data.build();
        if (groupRef)
            return builder.to(groupRef);
        return builder.toRoot().group(transforms_1.StateTransforms.Misc.CreateGroup, { label: `Measurements` }, { tags: exports.MeasurementGroupTag });
    }
    async setOptions(options) {
        if (this.updateState({ options }))
            this.stateUpdated();
        const update = this.plugin.state.data.build();
        for (const cell of this.state.distances) {
            update.to(cell).update((old) => {
                old.unitLabel = options.distanceUnitLabel;
                old.textColor = options.textColor;
            });
        }
        for (const cell of this.state.labels) {
            update.to(cell).update((old) => { old.textColor = options.textColor; });
        }
        for (const cell of this.state.angles) {
            update.to(cell).update((old) => { old.textColor = options.textColor; });
        }
        for (const cell of this.state.dihedrals) {
            update.to(cell).update((old) => { old.textColor = options.textColor; });
        }
        if (update.editInfo.count === 0)
            return;
        await commands_1.PluginCommands.State.Update(this.plugin, { state: this.plugin.state.data, tree: update, options: { doNotLogTiming: true } });
    }
    async addDistance(a, b, options) {
        const cellA = this.plugin.helpers.substructureParent.get(a.structure);
        const cellB = this.plugin.helpers.substructureParent.get(b.structure);
        if (!cellA || !cellB)
            return;
        const dependsOn = [cellA.transform.ref];
        (0, array_1.arraySetAdd)(dependsOn, cellB.transform.ref);
        const update = this.getGroup();
        const selection = update
            .apply(transforms_1.StateTransforms.Model.MultiStructureSelectionFromExpression, {
            selections: [
                { key: 'a', groupId: 'a', ref: cellA.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(a) },
                { key: 'b', groupId: 'b', ref: cellB.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(b) }
            ],
            isTransitive: true,
            label: 'Distance'
        }, { dependsOn, tags: options === null || options === void 0 ? void 0 : options.selectionTags });
        const representation = selection
            .apply(transforms_1.StateTransforms.Representation.StructureSelectionsDistance3D, {
            customText: (options === null || options === void 0 ? void 0 : options.customText) || '',
            unitLabel: this.state.options.distanceUnitLabel,
            textColor: this.state.options.textColor,
            ...options === null || options === void 0 ? void 0 : options.lineParams,
            ...options === null || options === void 0 ? void 0 : options.labelParams,
            ...options === null || options === void 0 ? void 0 : options.visualParams
        }, { tags: options === null || options === void 0 ? void 0 : options.reprTags });
        const state = this.plugin.state.data;
        await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: representation, options: { doNotLogTiming: true } });
        return { selection: selection.selector, representation: representation.selector };
    }
    async addAngle(a, b, c, options) {
        const cellA = this.plugin.helpers.substructureParent.get(a.structure);
        const cellB = this.plugin.helpers.substructureParent.get(b.structure);
        const cellC = this.plugin.helpers.substructureParent.get(c.structure);
        if (!cellA || !cellB || !cellC)
            return;
        const dependsOn = [cellA.transform.ref];
        (0, array_1.arraySetAdd)(dependsOn, cellB.transform.ref);
        (0, array_1.arraySetAdd)(dependsOn, cellC.transform.ref);
        const update = this.getGroup();
        const selection = update
            .apply(transforms_1.StateTransforms.Model.MultiStructureSelectionFromExpression, {
            selections: [
                { key: 'a', ref: cellA.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(a) },
                { key: 'b', ref: cellB.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(b) },
                { key: 'c', ref: cellC.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(c) }
            ],
            isTransitive: true,
            label: 'Angle'
        }, { dependsOn, tags: options === null || options === void 0 ? void 0 : options.selectionTags });
        const representation = selection
            .apply(transforms_1.StateTransforms.Representation.StructureSelectionsAngle3D, {
            customText: (options === null || options === void 0 ? void 0 : options.customText) || '',
            textColor: this.state.options.textColor,
            ...options === null || options === void 0 ? void 0 : options.lineParams,
            ...options === null || options === void 0 ? void 0 : options.labelParams,
            ...options === null || options === void 0 ? void 0 : options.visualParams
        }, { tags: options === null || options === void 0 ? void 0 : options.reprTags });
        const state = this.plugin.state.data;
        await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: representation, options: { doNotLogTiming: true } });
        return { selection: selection.selector, representation: representation.selector };
    }
    async addDihedral(a, b, c, d, options) {
        const cellA = this.plugin.helpers.substructureParent.get(a.structure);
        const cellB = this.plugin.helpers.substructureParent.get(b.structure);
        const cellC = this.plugin.helpers.substructureParent.get(c.structure);
        const cellD = this.plugin.helpers.substructureParent.get(d.structure);
        if (!cellA || !cellB || !cellC || !cellD)
            return;
        const dependsOn = [cellA.transform.ref];
        (0, array_1.arraySetAdd)(dependsOn, cellB.transform.ref);
        (0, array_1.arraySetAdd)(dependsOn, cellC.transform.ref);
        (0, array_1.arraySetAdd)(dependsOn, cellD.transform.ref);
        const update = this.getGroup();
        const selection = update
            .apply(transforms_1.StateTransforms.Model.MultiStructureSelectionFromExpression, {
            selections: [
                { key: 'a', ref: cellA.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(a) },
                { key: 'b', ref: cellB.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(b) },
                { key: 'c', ref: cellC.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(c) },
                { key: 'd', ref: cellD.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(d) }
            ],
            isTransitive: true,
            label: 'Dihedral'
        }, { dependsOn, tags: options === null || options === void 0 ? void 0 : options.selectionTags });
        const representation = selection.apply(transforms_1.StateTransforms.Representation.StructureSelectionsDihedral3D, {
            customText: (options === null || options === void 0 ? void 0 : options.customText) || '',
            textColor: this.state.options.textColor,
            ...options === null || options === void 0 ? void 0 : options.lineParams,
            ...options === null || options === void 0 ? void 0 : options.labelParams,
            ...options === null || options === void 0 ? void 0 : options.visualParams
        }, { tags: options === null || options === void 0 ? void 0 : options.reprTags });
        const state = this.plugin.state.data;
        await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: representation, options: { doNotLogTiming: true } });
        return { selection: selection.selector, representation: representation.selector };
    }
    async addLabel(a, options) {
        const cellA = this.plugin.helpers.substructureParent.get(a.structure);
        if (!cellA)
            return;
        const dependsOn = [cellA.transform.ref];
        const update = this.getGroup();
        const selection = update
            .apply(transforms_1.StateTransforms.Model.MultiStructureSelectionFromExpression, {
            selections: [
                { key: 'a', ref: cellA.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(a) },
            ],
            isTransitive: true,
            label: 'Label'
        }, { dependsOn, tags: options === null || options === void 0 ? void 0 : options.selectionTags });
        const representation = selection
            .apply(transforms_1.StateTransforms.Representation.StructureSelectionsLabel3D, {
            textColor: this.state.options.textColor,
            ...options === null || options === void 0 ? void 0 : options.labelParams,
            ...options === null || options === void 0 ? void 0 : options.visualParams
        }, { tags: options === null || options === void 0 ? void 0 : options.reprTags });
        const state = this.plugin.state.data;
        await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: representation, options: { doNotLogTiming: true } });
        return { selection: selection.selector, representation: representation.selector };
    }
    async addOrientation(locis) {
        const selections = [];
        const dependsOn = [];
        for (let i = 0, il = locis.length; i < il; ++i) {
            const l = locis[i];
            const cell = this.plugin.helpers.substructureParent.get(l.structure);
            if (!cell)
                continue;
            (0, array_1.arraySetAdd)(dependsOn, cell.transform.ref);
            selections.push({ key: `l${i}`, ref: cell.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(l) });
        }
        if (selections.length === 0)
            return;
        const update = this.getGroup();
        const selection = update
            .apply(transforms_1.StateTransforms.Model.MultiStructureSelectionFromExpression, {
            selections,
            isTransitive: true,
            label: 'Orientation'
        }, { dependsOn });
        const representation = selection
            .apply(transforms_1.StateTransforms.Representation.StructureSelectionsOrientation3D);
        const state = this.plugin.state.data;
        await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: representation, options: { doNotLogTiming: true } });
        return { selection: selection.selector, representation: representation.selector };
    }
    async addPlane(locis) {
        const selections = [];
        const dependsOn = [];
        for (let i = 0, il = locis.length; i < il; ++i) {
            const l = locis[i];
            const cell = this.plugin.helpers.substructureParent.get(l.structure);
            if (!cell)
                continue;
            (0, array_1.arraySetAdd)(dependsOn, cell.transform.ref);
            selections.push({ key: `l${i}`, ref: cell.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(l) });
        }
        if (selections.length === 0)
            return;
        const update = this.getGroup();
        const selection = update
            .apply(transforms_1.StateTransforms.Model.MultiStructureSelectionFromExpression, {
            selections,
            isTransitive: true,
            label: 'Plane'
        }, { dependsOn });
        const representation = selection
            .apply(transforms_1.StateTransforms.Representation.StructureSelectionsPlane3D);
        const state = this.plugin.state.data;
        await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: update, options: { doNotLogTiming: true } });
        return { selection: selection.selector, representation: representation.selector };
    }
    async addOrderLabels(locis) {
        const update = this.getGroup();
        const current = this.plugin.state.data.select(mol_state_1.StateSelection.Generators.ofType(objects_1.PluginStateObject.Molecule.Structure.Selections).withTag(exports.MeasurementOrderLabelTag));
        for (const obj of current)
            update.delete(obj);
        let order = 1;
        for (const loci of locis) {
            const cell = this.plugin.helpers.substructureParent.get(loci.structure);
            if (!cell)
                continue;
            const dependsOn = [cell.transform.ref];
            update
                .apply(transforms_1.StateTransforms.Model.MultiStructureSelectionFromExpression, {
                selections: [
                    { key: 'a', ref: cell.transform.ref, expression: structure_1.StructureElement.Loci.toExpression(loci) },
                ],
                isTransitive: true,
                label: 'Order'
            }, { dependsOn, tags: exports.MeasurementOrderLabelTag })
                .apply(transforms_1.StateTransforms.Representation.StructureSelectionsLabel3D, {
                textColor: color_1.Color.fromRgb(255, 255, 255),
                borderColor: color_1.Color.fromRgb(0, 0, 0),
                textSize: 0.33,
                borderWidth: 0.3,
                offsetZ: 0.75,
                customText: `${order++}`
            }, { tags: exports.MeasurementOrderLabelTag });
        }
        const state = this.plugin.state.data;
        await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: update, options: { doNotLogTiming: true } });
        return { representation: update.selector };
    }
    getTransforms(transformer) {
        const state = this.plugin.state.data;
        const groupRef = mol_state_1.StateSelection.findTagInSubtree(state.tree, mol_state_1.StateTransform.RootRef, exports.MeasurementGroupTag);
        const ret = groupRef ? state.select(mol_state_1.StateSelection.Generators.ofTransformer(transformer, groupRef)) : this._empty;
        if (ret.length === 0)
            return this._empty;
        return ret;
    }
    sync() {
        const labels = [];
        for (const cell of this.getTransforms(transforms_1.StateTransforms.Representation.StructureSelectionsLabel3D)) {
            const tags = cell.obj['tags'];
            if (!tags || !tags.includes(exports.MeasurementOrderLabelTag))
                labels.push(cell);
        }
        const updated = this.updateState({
            labels,
            distances: this.getTransforms(transforms_1.StateTransforms.Representation.StructureSelectionsDistance3D),
            angles: this.getTransforms(transforms_1.StateTransforms.Representation.StructureSelectionsAngle3D),
            dihedrals: this.getTransforms(transforms_1.StateTransforms.Representation.StructureSelectionsDihedral3D),
            orientations: this.getTransforms(transforms_1.StateTransforms.Representation.StructureSelectionsOrientation3D),
            planes: this.getTransforms(transforms_1.StateTransforms.Representation.StructureSelectionsPlane3D),
        });
        if (updated)
            this.stateUpdated();
    }
    constructor(plugin) {
        super({ labels: [], distances: [], angles: [], dihedrals: [], orientations: [], planes: [], options: DefaultStructureMeasurementOptions });
        this.plugin = plugin;
        this.behaviors = {
            state: this.ev.behavior(this.state)
        };
        this._empty = [];
        plugin.state.data.events.changed.subscribe(e => {
            if (e.inTransaction || plugin.behaviors.state.isAnimating.value)
                return;
            this.sync();
        });
        plugin.behaviors.state.isAnimating.subscribe(isAnimating => {
            if (!isAnimating && !plugin.behaviors.state.isUpdating.value)
                this.sync();
        });
    }
}
exports.StructureMeasurementManager = StructureMeasurementManager;
