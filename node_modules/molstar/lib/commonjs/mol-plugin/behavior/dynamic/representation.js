"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Jason Pattle <jpattle.exscientia.co.uk>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusLoci = exports.DefaultFocusLociBindings = exports.DefaultLociLabelProvider = exports.SelectLoci = exports.DefaultSelectLociBindings = exports.HighlightLoci = void 0;
const marker_action_1 = require("../../../mol-util/marker-action");
const objects_1 = require("../../../mol-plugin-state/objects");
const label_1 = require("../../../mol-theme/label");
const behavior_1 = require("../behavior");
const spine_1 = require("../../../mol-state/tree/spine");
const mol_state_1 = require("../../../mol-state");
const input_observer_1 = require("../../../mol-util/input/input-observer");
const binding_1 = require("../../../mol-util/binding");
const param_definition_1 = require("../../../mol-util/param-definition");
const loci_1 = require("../../../mol-model/loci");
const structure_1 = require("../../../mol-model/structure");
const array_1 = require("../../../mol-util/array");
const B = input_observer_1.ButtonsType;
const M = input_observer_1.ModifiersKeys;
const Trigger = binding_1.Binding.Trigger;
//
const DefaultHighlightLociBindings = {
    hoverHighlightOnly: (0, binding_1.Binding)([Trigger(B.Flag.None)], 'Highlight', 'Hover element using ${triggers}'),
    hoverHighlightOnlyExtend: (0, binding_1.Binding)([Trigger(B.Flag.None, M.create({ shift: true }))], 'Extend highlight', 'From selected to hovered element along polymer using ${triggers}'),
};
const HighlightLociParams = {
    bindings: param_definition_1.ParamDefinition.Value(DefaultHighlightLociBindings, { isHidden: true }),
    ignore: param_definition_1.ParamDefinition.Value([], { isHidden: true }),
    preferAtoms: param_definition_1.ParamDefinition.Boolean(false, { description: 'Always prefer atoms over bonds' }),
    mark: param_definition_1.ParamDefinition.Boolean(true)
};
exports.HighlightLoci = behavior_1.PluginBehavior.create({
    name: 'representation-highlight-loci',
    category: 'interaction',
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.lociMarkProvider = (interactionLoci, action) => {
                if (!this.ctx.canvas3d || !this.params.mark)
                    return;
                this.ctx.canvas3d.mark(interactionLoci, action);
            };
        }
        getLoci(loci) {
            return this.params.preferAtoms && structure_1.Bond.isLoci(loci) && loci.bonds.length === 2
                ? structure_1.Bond.toFirstStructureElementLoci(loci)
                : loci;
        }
        register() {
            this.subscribeObservable(this.ctx.behaviors.interaction.hover, ({ current, buttons, modifiers }) => {
                if (!this.ctx.canvas3d || this.ctx.isBusy)
                    return;
                const loci = this.getLoci(current.loci);
                if (this.params.ignore.includes(loci.kind)) {
                    this.ctx.managers.interactivity.lociHighlights.highlightOnly({ repr: current.repr, loci: loci_1.EmptyLoci });
                    return;
                }
                let matched = false;
                if (binding_1.Binding.match(this.params.bindings.hoverHighlightOnly, buttons, modifiers)) {
                    // remove repr to highlight loci everywhere on hover
                    this.ctx.managers.interactivity.lociHighlights.highlightOnly({ loci });
                    matched = true;
                }
                if (binding_1.Binding.match(this.params.bindings.hoverHighlightOnlyExtend, buttons, modifiers)) {
                    // remove repr to highlight loci everywhere on hover
                    this.ctx.managers.interactivity.lociHighlights.highlightOnlyExtend({ loci });
                    matched = true;
                }
                if (!matched) {
                    this.ctx.managers.interactivity.lociHighlights.highlightOnly({ repr: current.repr, loci: loci_1.EmptyLoci });
                }
            });
            this.ctx.managers.interactivity.lociHighlights.addProvider(this.lociMarkProvider);
        }
        unregister() {
            this.ctx.managers.interactivity.lociHighlights.removeProvider(this.lociMarkProvider);
        }
    },
    params: () => HighlightLociParams,
    display: { name: 'Highlight Loci on Canvas' }
});
//
exports.DefaultSelectLociBindings = {
    clickSelect: binding_1.Binding.Empty,
    clickToggleExtend: (0, binding_1.Binding)([Trigger(B.Flag.Primary, M.create({ shift: true }))], 'Toggle extended selection', 'Click on element using ${triggers} to extend selection along polymer'),
    clickSelectOnly: binding_1.Binding.Empty,
    clickToggle: (0, binding_1.Binding)([Trigger(B.Flag.Primary, M.create())], 'Toggle selection', 'Click on element using ${triggers}'),
    clickDeselect: binding_1.Binding.Empty,
    clickDeselectAllOnEmpty: (0, binding_1.Binding)([Trigger(B.Flag.Primary, M.create())], 'Deselect all', 'Click on nothing using ${triggers}'),
};
const SelectLociParams = {
    bindings: param_definition_1.ParamDefinition.Value(exports.DefaultSelectLociBindings, { isHidden: true }),
    ignore: param_definition_1.ParamDefinition.Value([], { isHidden: true }),
    preferAtoms: param_definition_1.ParamDefinition.Boolean(false, { description: 'Always prefer atoms over bonds' }),
    mark: param_definition_1.ParamDefinition.Boolean(true)
};
exports.SelectLoci = behavior_1.PluginBehavior.create({
    name: 'representation-select-loci',
    category: 'interaction',
    ctor: class extends behavior_1.PluginBehavior.Handler {
        getLoci(loci) {
            return this.params.preferAtoms && structure_1.Bond.isLoci(loci) && loci.bonds.length === 2
                ? structure_1.Bond.toFirstStructureElementLoci(loci)
                : loci;
        }
        applySelectMark(ref, clear) {
            const cell = this.ctx.state.data.cells.get(ref);
            if (cell && objects_1.PluginStateObject.isRepresentation3D(cell.obj)) {
                this.spine.current = cell;
                const so = this.spine.getRootOfType(objects_1.PluginStateObject.Molecule.Structure);
                if (so) {
                    if (clear) {
                        this.lociMarkProvider({ loci: structure_1.Structure.Loci(so.data) }, marker_action_1.MarkerAction.Deselect);
                    }
                    const loci = this.ctx.managers.structure.selection.getLoci(so.data);
                    this.lociMarkProvider({ loci }, marker_action_1.MarkerAction.Select);
                }
            }
        }
        register() {
            const lociIsEmpty = (loci) => loci_1.Loci.isEmpty(loci);
            const lociIsNotEmpty = (loci) => !loci_1.Loci.isEmpty(loci);
            const actions = [
                ['clickSelect', current => this.ctx.managers.interactivity.lociSelects.select(current), lociIsNotEmpty],
                ['clickToggle', current => this.ctx.managers.interactivity.lociSelects.toggle(current), lociIsNotEmpty],
                ['clickToggleExtend', current => this.ctx.managers.interactivity.lociSelects.toggleExtend(current), lociIsNotEmpty],
                ['clickSelectOnly', current => this.ctx.managers.interactivity.lociSelects.selectOnly(current), lociIsNotEmpty],
                ['clickDeselect', current => this.ctx.managers.interactivity.lociSelects.deselect(current), lociIsNotEmpty],
                ['clickDeselectAllOnEmpty', () => this.ctx.managers.interactivity.lociSelects.deselectAll(), lociIsEmpty],
            ];
            // sort the action so that the ones with more modifiers trigger sooner.
            actions.sort((a, b) => {
                const x = this.params.bindings[a[0]], y = this.params.bindings[b[0]];
                const k = x.triggers.length === 0 ? 0 : (0, array_1.arrayMax)(x.triggers.map(t => M.size(t.modifiers)));
                const l = y.triggers.length === 0 ? 0 : (0, array_1.arrayMax)(y.triggers.map(t => M.size(t.modifiers)));
                return l - k;
            });
            this.subscribeObservable(this.ctx.behaviors.interaction.click, ({ current, button, modifiers }) => {
                if (!this.ctx.canvas3d || this.ctx.isBusy || !this.ctx.selectionMode)
                    return;
                const loci = this.getLoci(current.loci);
                if (this.params.ignore.includes(loci.kind))
                    return;
                // only trigger the 1st action that matches
                for (const [binding, action, condition] of actions) {
                    if (binding_1.Binding.match(this.params.bindings[binding], button, modifiers) && (!condition || condition(loci))) {
                        action({ repr: current.repr, loci });
                        break;
                    }
                }
            });
            this.ctx.managers.interactivity.lociSelects.addProvider(this.lociMarkProvider);
            this.subscribeObservable(this.ctx.state.events.object.created, ({ ref }) => this.applySelectMark(ref));
            // re-apply select-mark to all representation of an updated structure
            this.subscribeObservable(this.ctx.state.events.object.updated, ({ ref, obj, oldObj, oldData, action }) => {
                const cell = this.ctx.state.data.cells.get(ref);
                if (cell && objects_1.PluginStateObject.Molecule.Structure.is(cell.obj)) {
                    const structure = obj.data;
                    const oldStructure = action === 'recreate' ? oldObj === null || oldObj === void 0 ? void 0 : oldObj.data :
                        action === 'in-place' ? oldData : undefined;
                    if (oldStructure &&
                        structure_1.Structure.areEquivalent(structure, oldStructure) &&
                        structure_1.Structure.areHierarchiesEqual(structure, oldStructure))
                        return;
                    const reprs = this.ctx.state.data.select(mol_state_1.StateSelection.children(ref).ofType(objects_1.PluginStateObject.Molecule.Structure.Representation3D));
                    for (const repr of reprs)
                        this.applySelectMark(repr.transform.ref, true);
                }
            });
        }
        unregister() {
            this.ctx.managers.interactivity.lociSelects.removeProvider(this.lociMarkProvider);
        }
        constructor(ctx, params) {
            super(ctx, params);
            this.lociMarkProvider = (reprLoci, action) => {
                if (!this.ctx.canvas3d || !this.params.mark)
                    return;
                this.ctx.canvas3d.mark({ loci: reprLoci.loci }, action);
            };
            this.spine = new spine_1.StateTreeSpine.Impl(ctx.state.data.cells);
        }
    },
    params: () => SelectLociParams,
    display: { name: 'Select Loci on Canvas' }
});
//
exports.DefaultLociLabelProvider = behavior_1.PluginBehavior.create({
    name: 'default-loci-label-provider',
    category: 'interaction',
    ctor: class {
        register() { this.ctx.managers.lociLabels.addProvider(this.f); }
        unregister() { this.ctx.managers.lociLabels.removeProvider(this.f); }
        constructor(ctx) {
            this.ctx = ctx;
            this.f = {
                label: (loci) => {
                    const label = [];
                    if (structure_1.StructureElement.Loci.is(loci)) {
                        const entityNames = new Set();
                        for (const { unit: u } of loci.elements) {
                            const l = structure_1.StructureElement.Location.create(loci.structure, u, u.elements[0]);
                            const name = structure_1.StructureProperties.entity.pdbx_description(l).join(', ');
                            entityNames.add(name);
                        }
                        if (entityNames.size === 1)
                            entityNames.forEach(name => label.push(name));
                    }
                    label.push((0, label_1.lociLabel)(loci));
                    return label.filter(l => !!l).join('</br>');
                },
                group: (label) => label.toString().replace(/Model [0-9]+/g, 'Models'),
                priority: 100
            };
        }
    },
    display: { name: 'Provide Default Loci Label' }
});
//
exports.DefaultFocusLociBindings = {
    clickFocus: (0, binding_1.Binding)([
        Trigger(B.Flag.Primary, M.create()),
    ], 'Representation Focus', 'Click element using ${triggers}'),
    clickFocusAdd: (0, binding_1.Binding)([
        Trigger(B.Flag.Primary, M.create({ shift: true })),
    ], 'Representation Focus Add', 'Click element using ${triggers}'),
    clickFocusSelectMode: (0, binding_1.Binding)([
    // default is empty
    ], 'Representation Focus', 'Click element using ${triggers}'),
    clickFocusAddSelectMode: (0, binding_1.Binding)([
    // default is empty
    ], 'Representation Focus Add', 'Click element using ${triggers}'),
};
const FocusLociParams = {
    bindings: param_definition_1.ParamDefinition.Value(exports.DefaultFocusLociBindings, { isHidden: true }),
};
exports.FocusLoci = behavior_1.PluginBehavior.create({
    name: 'representation-focus-loci',
    category: 'interaction',
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.subscribeObservable(this.ctx.behaviors.interaction.click, ({ current, button, modifiers }) => {
                var _a, _b, _c, _d, _e;
                const { clickFocus, clickFocusAdd, clickFocusSelectMode, clickFocusAddSelectMode } = this.params.bindings;
                const binding = this.ctx.selectionMode ? clickFocusSelectMode : clickFocus;
                const matched = binding_1.Binding.match(binding, button, modifiers);
                // Support snapshot key property, in which case ignore the focus functionality
                const snapshotKey = (_d = (_c = (_b = (_a = current.repr) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.snapshotKey) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '';
                if (!this.ctx.selectionMode && matched && snapshotKey) {
                    this.ctx.managers.snapshot.applyKey(snapshotKey);
                    return;
                }
                // only apply structure focus for appropriate granularity
                const { granularity } = this.ctx.managers.interactivity.props;
                if (granularity !== 'residue' && granularity !== 'element')
                    return;
                const bindingAdd = this.ctx.selectionMode ? clickFocusAddSelectMode : clickFocusAdd;
                const matchedAdd = binding_1.Binding.match(bindingAdd, button, modifiers);
                if (!matched && !matchedAdd)
                    return;
                const loci = loci_1.Loci.normalize(current.loci, 'residue');
                const entry = this.ctx.managers.structure.focus.current;
                if (entry && loci_1.Loci.areEqual(entry.loci, loci)) {
                    this.ctx.managers.structure.focus.clear();
                }
                else {
                    if (matched) {
                        this.ctx.managers.structure.focus.setFromLoci(loci);
                    }
                    else {
                        this.ctx.managers.structure.focus.addFromLoci(loci);
                        // focus-add is not handled in camera behavior, doing it here
                        const current = (_e = this.ctx.managers.structure.focus.current) === null || _e === void 0 ? void 0 : _e.loci;
                        if (current)
                            this.ctx.managers.camera.focusLoci(current);
                    }
                }
            });
        }
    },
    params: () => FocusLociParams,
    display: { name: 'Representation Focus Loci on Canvas' }
});
