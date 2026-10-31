/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { EveryLoci, isEmptyLoci, Loci } from '../../mol-model/loci';
import { Structure, StructureElement } from '../../mol-model/structure';
import { Representation } from '../../mol-repr/representation';
import { MarkerAction } from '../../mol-util/marker-action';
import { shallowEqual } from '../../mol-util/object';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { StatefulPluginComponent } from '../component';
export { InteractivityManager };
// TODO: make this customizable somewhere?
const DefaultInteractivityFocusOptions = {
    minRadius: 6,
    extraRadius: 6,
    durationMs: 250,
};
class InteractivityManager extends StatefulPluginComponent {
    get props() { return { ...this.state.props }; }
    setProps(props) {
        const old = this.props;
        const _new = { ...this.state.props, ...props };
        if (shallowEqual(old, _new))
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
        super({ props: { ...PD.getDefaultValues(InteractivityManager.Params), ...props } });
        this.plugin = plugin;
        this._props = PD.getDefaultValues(InteractivityManager.Params);
        this.events = {
            propsUpdated: this.ev()
        };
        this.lociSelects = new InteractivityManager.LociSelectManager(plugin, this._props);
        this.lociHighlights = new InteractivityManager.LociHighlightManager(plugin, this._props);
    }
}
(function (InteractivityManager) {
    InteractivityManager.Params = {
        granularity: PD.Select('residue', Loci.GranularityOptions, { label: 'Picking Level', description: 'Controls if selections are expanded upon picking to whole residues, chains, structures, instances, or left as atoms and coarse elements' }),
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
            return { loci: Loci.normalize(loci, granularity, alwaysConvertBonds), repr };
        }
        mark(current, action, noRender = false) {
            if (!Loci.isEmpty(current.loci)) {
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
            this.props = PD.getDefaultValues(InteractivityManager.Params);
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
                    this.mark(p, MarkerAction.RemoveHighlight, noRender);
                }
                this.prev.length = 0;
            };
        }
        isHighlighted(loci) {
            for (const p of this.prev) {
                if (Representation.Loci.areEqual(p, loci))
                    return true;
            }
            return false;
        }
        addHighlight(loci) {
            this.mark(loci, MarkerAction.Highlight);
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
                if (Loci.isEmpty(normalized.loci)) {
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
            if (StructureElement.Loci.is(normalized.loci)) {
                const extended = {
                    loci: this.sel.tryGetRange(normalized.loci) || normalized.loci,
                    repr: normalized.repr
                };
                if (!this.isHighlighted(extended)) {
                    if (Loci.isEmpty(extended.loci)) {
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
            if (Loci.isEmpty(current.loci))
                return;
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (StructureElement.Loci.is(normalized.loci)) {
                this.toggleSel(normalized);
            }
            else {
                super.mark(normalized, MarkerAction.Toggle);
            }
        }
        toggleExtend(current, applyGranularity = true) {
            if (Loci.isEmpty(current.loci))
                return;
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (StructureElement.Loci.is(normalized.loci)) {
                const loci = this.sel.tryGetRange(normalized.loci) || normalized.loci;
                this.toggleSel({ loci, repr: normalized.repr });
            }
        }
        select(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (StructureElement.Loci.is(normalized.loci)) {
                this.sel.modify('add', normalized.loci);
            }
            this.mark(normalized, MarkerAction.Select);
        }
        selectJoin(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (StructureElement.Loci.is(normalized.loci)) {
                this.sel.modify('intersect', normalized.loci);
            }
            this.mark(normalized, MarkerAction.Select);
        }
        selectOnly(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (StructureElement.Loci.is(normalized.loci)) {
                // only deselect for the structure of the given loci
                this.mark({ loci: Structure.Loci(normalized.loci.structure), repr: normalized.repr }, MarkerAction.Deselect);
                this.sel.modify('set', normalized.loci);
            }
            this.mark(normalized, MarkerAction.Select);
        }
        deselect(current, applyGranularity = true) {
            const normalized = this.normalizedLoci(current, applyGranularity, true);
            if (StructureElement.Loci.is(normalized.loci)) {
                this.sel.modify('remove', normalized.loci);
            }
            this.mark(normalized, MarkerAction.Deselect);
        }
        deselectAll() {
            this.sel.clear();
            this.mark({ loci: EveryLoci }, MarkerAction.Deselect);
        }
        deselectAllOnEmpty(current) {
            if (isEmptyLoci(current.loci))
                this.deselectAll();
        }
        mark(current, action) {
            const { loci } = current;
            if (!Loci.isEmpty(loci)) {
                if (StructureElement.Loci.is(loci)) {
                    // do a full deselect/select for the current structure so visuals that are
                    // marked with granularity unequal to 'element' and join/intersect operations
                    // are handled properly
                    const selLoci = this.sel.getLoci(loci.structure);
                    super.mark({ loci: Structure.Loci(loci.structure) }, MarkerAction.Deselect, !Loci.isEmpty(selLoci));
                    super.mark({ loci: selLoci }, MarkerAction.Select);
                }
                else {
                    super.mark(current, action);
                }
            }
        }
        toggleSel(current) {
            if (this.sel.has(current.loci)) {
                this.sel.modify('remove', current.loci);
                this.mark(current, MarkerAction.Deselect);
            }
            else {
                this.sel.modify('add', current.loci);
                this.mark(current, MarkerAction.Select);
            }
        }
    }
    InteractivityManager.LociSelectManager = LociSelectManager;
})(InteractivityManager || (InteractivityManager = {}));
