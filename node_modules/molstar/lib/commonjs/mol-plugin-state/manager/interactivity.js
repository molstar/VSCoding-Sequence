"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractivityManager = void 0;
const loci_1 = require("../../mol-model/loci");
const structure_1 = require("../../mol-model/structure");
const representation_1 = require("../../mol-repr/representation");
const marker_action_1 = require("../../mol-util/marker-action");
const object_1 = require("../../mol-util/object");
const param_definition_1 = require("../../mol-util/param-definition");
const component_1 = require("../component");
// TODO: make this customizable somewhere?
const DefaultInteractivityFocusOptions = {
    minRadius: 6,
    extraRadius: 6,
    durationMs: 250,
};
class InteractivityManager extends component_1.StatefulPluginComponent {
    get props() { return { ...this.state.props }; }
    setProps(props) {
        const old = this.props;
        const _new = { ...this.state.props, ...props };
        if ((0, object_1.shallowEqual)(old, _new))
            return;
        this.updateState({ props: _new });
        this.lociSelects.setProps(_new);
        this.lociHighlights.setProps(_new);
        this.events.propsUpdated.next(void 0);
    }
    dispose() {
        super.dispose();
        this.lociSelects.dispose();
        this.lociHighlights.dispose();
    }
    constructor(plugin, props = {}) {
        super({ props: { ...param_definition_1.ParamDefinition.getDefaultValues(InteractivityManager.Params), ...props } });
        this.plugin = plugin;
        this._props = param_definition_1.ParamDefinition.getDefaultValues(InteractivityManager.Params);
        this.events = {
            propsUpdated: this.ev()
        };
        this.lociSelects = new InteractivityManager.LociSelectManager(plugin, this._props);
        this.lociHighlights = new InteractivityManager.LociHighlightManager(plugin, this._props);
    }
}
exports.InteractivityManager = InteractivityManager;
(function (InteractivityManager) {
    InteractivityManager.Params = {
        granularity: param_definition_1.ParamDefinition.Select('residue', loci_1.Loci.GranularityOptions, { label: 'Picking Level', description: 'Controls if selections are expanded upon picking to whole residues, chains, structures, instances, or left as atoms and coarse elements' }),
    };
    class LociMarkManager {
        setProps(props) {
            Object.assign(this.props, props);
        }
        addProvider(provider) {
            this.providers.push(provider);
        }
        removeProvider(provider) {
            this.providers = this.providers.filter(p => p !== provider);
            // TODO clear, then re-apply remaining providers
        }
        normalizedLoci(reprLoci, applyGranularity, alwaysConvertBonds = false) {
            const { loci, repr } = reprLoci;
            const granularity = applyGranularity ? this.props.granularity : undefined;
            return { loci: loci_1.Loci.normalize(loci, granularity, alwaysConvertBonds), repr };
        }
        mark(current, action, noRender = false) {
            if (!loci_1.Loci.isEmpty(current.loci)) {
                for (const p of this.providers)
                    p(current, action, noRender);
            }
        }
        dispose() {
            this.providers.length = 0;
            this.sel.dispose();
        }
        constructor(ctx, props = {}) {
            this.ctx = ctx;
            this.providers = [];
            this.props = param_definition_1.ParamDefinition.getDefaultValues(InteractivityManager.Params);
            this.sel = ctx.managers.structure.selection;
            this.setProps(props);
        }
    }
    InteractivityManager.LociMarkManager = LociMarkManager;
    //
    class LociHighlightManager extends LociMarkManager {
        constructor() {
            super(...arguments);
            this.prev = [];
            this.clearHighlights = (noRender = false) => {
                for (const p of this.prev) {
                    this.mark(p, marker_action_1.MarkerAction.RemoveHighlight, noRender);
                }
                this.prev.length = 0;
            };
        }
        isHighlighted(loci) {
            for (const p of this.prev) {
                if (representation_1.Representation.Loci.areEqual(p, loci))
                    return true;
            }
            return false;
        }
        addHighlight(loci) {
            this.mark(loci, marker_action_1.MarkerAction.Highlight);
            this.prev.push(loci);
        }
        highlight(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity);
            if (!this.isHighlighted(normalized)) {
                this.addHighlight(normalized);
            }
        }
        highlightOnly(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity);
            if (!this.isHighlighted(normalized)) {
                if (loci_1.Loci.isEmpty(normalized.loci)) {
                    this.clearHighlights();
                }
                else {
                    this.clearHighlights(true);
                    this.addHighlight(normalized);
                }
            }
        }
        highlightOnlyExtend(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity);
            if (structure_1.StructureElement.Loci.is(normalized.loci)) {
                const extended = {
                    loci: this.sel.tryGetRange(normalized.loci) || normalized.loci,
                    repr: normalized.repr
                };
                if (!this.isHighlighted(extended)) {
                    if (loci_1.Loci.isEmpty(extended.loci)) {
                        this.clearHighlights();
                    }
                    else {
                        this.clearHighlights(true);
                        this.addHighlight(extended);
                    }
                }
            }
        }
        dispose() {
            super.dispose();
            this.prev.length = 0;
        }
    }
    InteractivityManager.LociHighlightManager = LociHighlightManager;
    //
    class LociSelectManager extends LociMarkManager {
        toggle(current, applyGranularity = true) {
            if (loci_1.Loci.isEmpty(current.loci))
                return;
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (structure_1.StructureElement.Loci.is(normalized.loci)) {
                this.toggleSel(normalized);
            }
            else {
                super.mark(normalized, marker_action_1.MarkerAction.Toggle);
            }
        }
        toggleExtend(current, applyGranularity = true) {
            if (loci_1.Loci.isEmpty(current.loci))
                return;
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (structure_1.StructureElement.Loci.is(normalized.loci)) {
                const loci = this.sel.tryGetRange(normalized.loci) || normalized.loci;
                this.toggleSel({ loci, repr: normalized.repr });
            }
        }
        select(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (structure_1.StructureElement.Loci.is(normalized.loci)) {
                this.sel.modify('add', normalized.loci);
            }
            this.mark(normalized, marker_action_1.MarkerAction.Select);
        }
        selectJoin(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (structure_1.StructureElement.Loci.is(normalized.loci)) {
                this.sel.modify('intersect', normalized.loci);
            }
            this.mark(normalized, marker_action_1.MarkerAction.Select);
        }
        selectOnly(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (structure_1.StructureElement.Loci.is(normalized.loci)) {
                // only deselect for the structure of the given loci
                this.mark({ loci: structure_1.Structure.Loci(normalized.loci.structure), repr: normalized.repr }, marker_action_1.MarkerAction.Deselect);
                this.sel.modify('set', normalized.loci);
            }
            this.mark(normalized, marker_action_1.MarkerAction.Select);
        }
        deselect(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (structure_1.StructureElement.Loci.is(normalized.loci)) {
                this.sel.modify('remove', normalized.loci);
            }
            this.mark(normalized, marker_action_1.MarkerAction.Deselect);
        }
        deselectAll() {
            this.sel.clear();
            this.mark({ loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.Deselect);
        }
        deselectAllOnEmpty(current) {
            if ((0, loci_1.isEmptyLoci)(current.loci))
                this.deselectAll();
        }
        mark(current, action) {
            const { loci } = current;
            if (!loci_1.Loci.isEmpty(loci)) {
                if (structure_1.StructureElement.Loci.is(loci)) {
                    // do a full deselect/select for the current structure so visuals that are
                    // marked with granularity unequal to 'element' and join/intersect operations
                    // are handled properly
                    const selLoci = this.sel.getLoci(loci.structure);
                    super.mark({ loci: structure_1.Structure.Loci(loci.structure) }, marker_action_1.MarkerAction.Deselect, !loci_1.Loci.isEmpty(selLoci));
                    super.mark({ loci: selLoci }, marker_action_1.MarkerAction.Select);
                }
                else {
                    super.mark(current, action);
                }
            }
        }
        toggleSel(current) {
            if (this.sel.has(current.loci)) {
                this.sel.modify('remove', current.loci);
                this.mark(current, marker_action_1.MarkerAction.Deselect);
            }
            else {
                this.sel.modify('add', current.loci);
                this.mark(current, marker_action_1.MarkerAction.Select);
            }
        }
    }
    InteractivityManager.LociSelectManager = LociSelectManager;
})(InteractivityManager || (exports.InteractivityManager = InteractivityManager = {}));
