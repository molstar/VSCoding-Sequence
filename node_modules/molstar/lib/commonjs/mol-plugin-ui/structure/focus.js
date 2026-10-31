"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureFocusControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const int_1 = require("../../mol-data/int");
const structure_1 = require("../../mol-model/structure");
const representation_1 = require("../../mol-plugin/behavior/dynamic/representation");
const label_1 = require("../../mol-theme/label");
const binding_1 = require("../../mol-util/binding");
const memoize_1 = require("../../mol-util/memoize");
const base_1 = require("../base");
const action_menu_1 = require("../controls/action-menu");
const common_1 = require("../controls/common");
const icons_1 = require("../controls/icons");
function addSymmetryGroupEntries(entries, location, unitSymmetryGroup, granularity) {
    const idx = int_1.SortedArray.indexOf(location.unit.elements, location.element);
    const base = structure_1.StructureElement.Loci(location.structure, [
        { unit: location.unit, indices: int_1.OrderedSet.ofSingleton(idx) }
    ]);
    const extended = granularity === 'residue'
        ? structure_1.StructureElement.Loci.extendToWholeResidues(base)
        : structure_1.StructureElement.Loci.extendToWholeChains(base);
    const name = structure_1.StructureProperties.entity.pdbx_description(location).join(', ');
    for (const u of unitSymmetryGroup.units) {
        const loci = structure_1.StructureElement.Loci(extended.structure, [
            { unit: u, indices: extended.elements[0].indices }
        ]);
        let label = (0, label_1.lociLabel)(loci, { reverse: true, hidePrefix: true, htmlStyling: false, granularity });
        if (!label)
            label = (0, label_1.lociLabel)(loci, { hidePrefix: false, htmlStyling: false });
        if (unitSymmetryGroup.units.length > 1) {
            label += ` | ${loci.elements[0].unit.conformation.operator.name}`;
        }
        const item = { label, category: name, loci };
        if (entries.has(name))
            entries.get(name).push(item);
        else
            entries.set(name, [item]);
    }
}
function getFocusEntries(structure) {
    const entityEntries = new Map();
    const l = structure_1.StructureElement.Location.create(structure);
    for (const ug of structure.unitSymmetryGroups) {
        if (!structure_1.Unit.isAtomic(ug.units[0]))
            continue;
        l.unit = ug.units[0];
        l.element = ug.elements[0];
        const isMultiChain = structure_1.Unit.Traits.is(l.unit.traits, structure_1.Unit.Trait.MultiChain);
        const entityType = structure_1.StructureProperties.entity.type(l);
        const isNonPolymer = entityType === 'non-polymer';
        const isBranched = entityType === 'branched';
        const isBirdMolecule = !!structure_1.StructureProperties.entity.prd_id(l);
        if (isBirdMolecule) {
            addSymmetryGroupEntries(entityEntries, l, ug, 'chain');
        }
        else if (isNonPolymer && !isMultiChain) {
            addSymmetryGroupEntries(entityEntries, l, ug, 'residue');
        }
        else if (isBranched || (isNonPolymer && isMultiChain)) {
            const u = l.unit;
            const { index: residueIndex } = u.model.atomicHierarchy.residueAtomSegments;
            let prev = -1;
            for (let i = 0, il = u.elements.length; i < il; ++i) {
                const eI = u.elements[i];
                const rI = residueIndex[eI];
                if (rI !== prev) {
                    l.element = eI;
                    addSymmetryGroupEntries(entityEntries, l, ug, 'residue');
                    prev = rI;
                }
            }
        }
    }
    const entries = [];
    entityEntries.forEach((e, name) => {
        if (e.length === 1) {
            entries.push({ label: `${name}: ${e[0].label}`, loci: e[0].loci });
        }
        else if (e.length < 2000) {
            entries.push(...e);
        }
    });
    return entries;
}
class StructureFocusControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { isBusy: false, showAction: false };
        this.getSelectionItems = (0, memoize_1.memoizeLatest)((structures) => {
            var _a;
            const presetItems = [];
            for (const s of structures) {
                const d = (_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
                if (d) {
                    const entries = getFocusEntries(d);
                    if (entries.length > 0) {
                        presetItems.push([
                            action_menu_1.ActionMenu.Header(d.label, { description: d.label }),
                            ...action_menu_1.ActionMenu.createItems(entries, {
                                label: f => f.label,
                                category: f => f.category,
                                description: f => f.label
                            })
                        ]);
                    }
                }
            }
            return presetItems;
        });
        this.selectAction = (item, e) => {
            if (!item || !this.state.showAction) {
                this.setState({ showAction: false });
                return;
            }
            const f = item.value;
            if (e === null || e === void 0 ? void 0 : e.shiftKey) {
                this.plugin.managers.structure.focus.addFromLoci(f.loci);
            }
            else {
                this.plugin.managers.structure.focus.set(f);
            }
            this.focusCamera();
        };
        this.toggleAction = () => this.setState({ showAction: !this.state.showAction });
        this.focusCamera = () => {
            const { current } = this.plugin.managers.structure.focus;
            if (current)
                this.plugin.managers.camera.focusLoci(current.loci);
        };
        this.clear = () => {
            this.plugin.managers.structure.focus.clear();
            this.plugin.managers.camera.reset();
        };
        this.highlightCurrent = () => {
            const { current } = this.plugin.managers.structure.focus;
            if (current)
                this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: current.loci }, false);
        };
        this.clearHighlights = () => {
            this.plugin.managers.interactivity.lociHighlights.clearHighlights();
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.focus.behaviors.current, c => {
            // clear the memo cache
            this.getSelectionItems([]);
            this.forceUpdate();
        });
        this.subscribe(this.plugin.managers.structure.focus.events.historyUpdated, c => {
            this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, v => {
            this.setState({ isBusy: v, showAction: false });
        });
    }
    get isDisabled() {
        return this.state.isBusy || this.plugin.managers.structure.hierarchy.selection.structures.length === 0;
    }
    get actionItems() {
        const historyItems = [];
        const { history } = this.plugin.managers.structure.focus;
        if (history.length > 0) {
            historyItems.push([
                action_menu_1.ActionMenu.Header('History', { description: 'Previously focused on items.' }),
                ...action_menu_1.ActionMenu.createItems(history, {
                    label: f => f.label,
                    description: f => {
                        return f.category && f.label !== f.category
                            ? `${f.category} | ${f.label}`
                            : f.label;
                    }
                })
            ]);
        }
        const presetItems = this.getSelectionItems(this.plugin.managers.structure.hierarchy.selection.structures);
        if (presetItems.length === 1) {
            const item = presetItems[0];
            const header = item[0];
            header.initiallyExpanded = true;
        }
        const items = [];
        if (presetItems.length > 0)
            items.push(...presetItems);
        if (historyItems.length > 0)
            items.push(...historyItems);
        return items;
    }
    getToggleBindingLabel() {
        var _a;
        const t = this.plugin.state.behaviors.transforms.get(representation_1.FocusLoci.id);
        if (!t)
            return '';
        const binding = (_a = t.params) === null || _a === void 0 ? void 0 : _a.bindings.clickFocus;
        if (!binding || binding_1.Binding.isEmpty(binding))
            return '';
        return binding_1.Binding.formatTriggers(binding);
    }
    render() {
        const { current } = this.plugin.managers.structure.focus;
        const label = (current === null || current === void 0 ? void 0 : current.label) || 'Nothing Focused';
        let title = 'Click to Center Camera';
        if (!current) {
            title = 'Select focus using the menu';
            const binding = this.getToggleBindingLabel();
            if (binding) {
                title += `\nor use '${binding}' on element`;
            }
        }
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, onClick: this.focusCamera, title: title, onMouseEnter: this.highlightCurrent, onMouseLeave: this.clearHighlights, disabled: this.isDisabled || !current, style: { textAlignLast: current ? 'left' : void 0 }, children: label }), current && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.CancelOutlinedSvg, onClick: this.clear, title: 'Clear', className: 'msp-form-control', flex: true, disabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.CenterFocusStrongSvg, title: 'Select a focus target to center on an show its surroundings. Hold shift to focus on multiple targets.', toggle: this.toggleAction, isSelected: this.state.showAction, disabled: this.isDisabled, style: { flex: '0 0 40px', padding: 0 } })] }), this.state.showAction && (0, jsx_runtime_1.jsx)(action_menu_1.ActionMenu, { items: this.actionItems, onSelect: this.selectAction })] });
    }
}
exports.StructureFocusControls = StructureFocusControls;
