import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Model } from '../../mol-model/structure';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { StateSelection } from '../../mol-state';
import { CollapsableControls } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ExpandGroup, IconButton } from '../controls/common';
import { BookmarksOutlinedSvg, MoleculeSvg } from '../controls/icons';
import { ParameterControls } from '../controls/parameters';
import { UpdateTransformControl } from '../state/update-transform';
import { StructureFocusControls } from './focus';
import { StructureSelectionStatsControls } from './selection';
export class StructureSourceControls extends CollapsableControls {
    constructor() {
        super(...arguments);
        this.item = (ref) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const selected = this.plugin.managers.structure.hierarchy.seletionSet;
            let label;
            switch (ref.kind) {
                case 'model': {
                    const model = (_a = ref.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
                    if (model && Model.TrajectoryInfo.get(model).size > 1) {
                        label = `${(_b = ref.cell.obj) === null || _b === void 0 ? void 0 : _b.data.entryId} | Model ${Model.TrajectoryInfo.get(model).index + 1} of ${Model.TrajectoryInfo.get(model).size}`;
                    }
                    label = `${(_c = ref.cell.obj) === null || _c === void 0 ? void 0 : _c.data.entryId} | ${(_d = ref.cell.obj) === null || _d === void 0 ? void 0 : _d.label}`;
                    break;
                }
                case 'structure': {
                    const model = (_e = ref.cell.obj) === null || _e === void 0 ? void 0 : _e.data.models[0];
                    if (model && Model.TrajectoryInfo.get(model).size > 1) {
                        label = `${model.entryId} | ${(_f = ref.cell.obj) === null || _f === void 0 ? void 0 : _f.label} (Model ${Model.TrajectoryInfo.get(model).index + 1} of ${Model.TrajectoryInfo.get(model).size})`;
                        break;
                    }
                    else if (model) {
                        label = `${model.entryId} | ${(_g = ref.cell.obj) === null || _g === void 0 ? void 0 : _g.label}`;
                        break;
                    }
                    else {
                        label = `${(_h = ref.cell.obj) === null || _h === void 0 ? void 0 : _h.label}`;
                        break;
                    }
                }
                default:
                    label = (_j = ref.cell.obj) === null || _j === void 0 ? void 0 : _j.label;
                    break;
            }
            const item = { kind: 'item', label: label || ref.kind, selected: selected.has(ref.cell.transform.ref), value: [ref] };
            return item;
        };
        this.getTrajectoryItems = (t) => {
            var _a;
            if (t.models.length === 0)
                return this.item(t);
            return [ActionMenu.Header((_a = t.cell.obj) === null || _a === void 0 ? void 0 : _a.label), ...t.models.map(this.getModelItems)];
        };
        this.getModelItems = (m) => {
            var _a, _b, _c;
            if (m.structures.length === 0)
                return this.item(m);
            if (m.structures.length === 1) {
                const selected = this.plugin.managers.structure.hierarchy.seletionSet;
                const ref = m.structures[0];
                return { label: `${(_a = m.cell.obj) === null || _a === void 0 ? void 0 : _a.label} | ${(_b = ref.cell.obj) === null || _b === void 0 ? void 0 : _b.label}`, selected: selected.has(ref.cell.transform.ref), value: [m, ref] };
            }
            return [ActionMenu.Header((_c = m.cell.obj) === null || _c === void 0 ? void 0 : _c.label), ...m.structures.map(this.item)];
        };
        this.selectHierarchy = (items) => {
            if (!items || items.length === 0)
                return;
            const refs = [];
            for (const i of items) {
                for (const r of i.value)
                    refs.push(r);
            }
            this.plugin.managers.structure.hierarchy.updateCurrent(refs, items[0].selected ? 'remove' : 'add');
        };
        this.toggleHierarchy = () => this.setState({ show: this.state.show !== 'hierarchy' ? 'hierarchy' : void 0 });
        this.togglePreset = () => this.setState({ show: this.state.show !== 'presets' ? 'presets' : void 0 });
        this.applyPreset = item => {
            this.setState({ show: void 0 });
            if (!item)
                return;
            const mng = this.plugin.managers.structure;
            const { trajectories } = mng.hierarchy.selection;
            mng.hierarchy.applyPreset(trajectories, item.value);
        };
        this.updateModelQueueParams = void 0;
        this.isUpdatingModel = false;
        this.updateStructureModel = (params) => {
            this.updateModelQueueParams = params;
            this._updateStructureModel();
        };
        this.updateStructure = (params) => {
            const { selection } = this.plugin.managers.structure.hierarchy;
            const s = selection.structures[0];
            return this.plugin.managers.structure.hierarchy.updateStructure(s, params);
        };
    }
    defaultState() {
        return {
            header: 'Structure',
            isCollapsed: false,
            isBusy: false,
            brand: { accent: 'purple', svg: MoleculeSvg }
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, () => this.forceUpdate());
        this.subscribe(this.plugin.behaviors.state.isBusy, v => {
            this.setState({ isBusy: v });
        });
    }
    get hierarchyItems() {
        const mng = this.plugin.managers.structure.hierarchy;
        const { current } = mng;
        const ret = [];
        if (current.trajectories.length > 1) {
            ret.push([
                ActionMenu.Header('Trajectories'),
                ...current.trajectories.map(this.item)
            ]);
        }
        if (current.models.length > 1 || current.trajectories.length > 1) {
            ret.push([
                ActionMenu.Header('Models'),
                ...current.models.map(this.item)
            ]);
        }
        if (current.trajectories.length === 1 && current.models.length === 1) {
            ret.push(...current.structures.map(this.item));
        }
        else if (current.structures.length > 0) {
            ret.push([
                ActionMenu.Header('Structures'),
                ...current.structures.map(this.item)
            ]);
        }
        return ret;
    }
    get isEmpty() {
        const { structures, models, trajectories } = this.plugin.managers.structure.hierarchy.current;
        return trajectories.length === 0 && models.length === 0 && structures.length === 0;
    }
    get label() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const { structures, models, trajectories } = this.plugin.managers.structure.hierarchy.selection;
        if (structures.length === 1) {
            const s = structures[0];
            if (((_b = (_a = s.model) === null || _a === void 0 ? void 0 : _a.trajectory) === null || _b === void 0 ? void 0 : _b.models) && s.model.trajectory.models.length === 1)
                return (_c = s.cell.obj) === null || _c === void 0 ? void 0 : _c.data.label;
            if (s.model)
                return `${(_d = s.model.cell.obj) === null || _d === void 0 ? void 0 : _d.label} | ${(_e = s.cell.obj) === null || _e === void 0 ? void 0 : _e.data.label}`;
            return (_f = s.cell.obj) === null || _f === void 0 ? void 0 : _f.data.label;
        }
        if (structures.length > 1) {
            const p = structures[0];
            const t = (_g = p === null || p === void 0 ? void 0 : p.model) === null || _g === void 0 ? void 0 : _g.trajectory;
            let sameTraj = true;
            for (const s of structures) {
                if (((_h = s === null || s === void 0 ? void 0 : s.model) === null || _h === void 0 ? void 0 : _h.trajectory) !== t) {
                    sameTraj = false;
                    break;
                }
            }
            return sameTraj && t ? `${(_j = t.cell.obj) === null || _j === void 0 ? void 0 : _j.label} | ${structures.length} structures` : `${structures.length} structures`;
        }
        if (models.length > 0) {
            const t = models[0].trajectory;
            if (models.length === 1) {
                const model = (_k = models[0].cell.obj) === null || _k === void 0 ? void 0 : _k.data;
                if (model && Model.TrajectoryInfo.get(model).size > 1) {
                    return `${(_l = t === null || t === void 0 ? void 0 : t.cell.obj) === null || _l === void 0 ? void 0 : _l.label} | Model ${Model.TrajectoryInfo.get(model).index + 1} of ${Model.TrajectoryInfo.get(model).size}`;
                }
                else {
                    return `${(_m = t === null || t === void 0 ? void 0 : t.cell.obj) === null || _m === void 0 ? void 0 : _m.label} | Model`;
                }
            }
            let sameTraj = true;
            for (const m of models) {
                if (m.trajectory !== t) {
                    sameTraj = false;
                    break;
                }
            }
            return sameTraj ? `${(_o = t === null || t === void 0 ? void 0 : t.cell.obj) === null || _o === void 0 ? void 0 : _o.label} | ${models.length} models` : `${models.length} models`;
        }
        if (trajectories.length > 0) {
            return trajectories.length === 1 ? `${(_p = trajectories[0].cell.obj) === null || _p === void 0 ? void 0 : _p.label} trajectory` : `${trajectories.length} trajectories`;
        }
        if (trajectories.length === 0 && models.length === 0 && structures.length === 0) {
            return 'Nothing Loaded';
        }
        return 'Nothing Selected';
    }
    get presetActions() {
        const actions = [];
        const { trajectories } = this.plugin.managers.structure.hierarchy.selection;
        if (trajectories.length === 0)
            return actions;
        let providers = this.plugin.builders.structure.hierarchy.getPresets(trajectories[0].cell.obj);
        if (trajectories.length > 1) {
            const providerSet = new Set(providers);
            for (let i = 1; i < trajectories.length; i++) {
                const providers = this.plugin.builders.structure.hierarchy.getPresets(trajectories[i].cell.obj);
                const current = new Set(providers);
                for (const p of providers) {
                    if (!current.has(p))
                        providerSet.delete(p);
                }
            }
            providers = providers.filter(p => providerSet.has(p));
        }
        for (const p of providers) {
            actions.push(ActionMenu.Item(p.display.name, p, { description: p.display.description }));
        }
        return actions;
    }
    async _updateStructureModel() {
        if (!this.updateModelQueueParams || this.isUpdatingModel)
            return;
        const params = this.updateModelQueueParams;
        this.updateModelQueueParams = void 0;
        try {
            this.isUpdatingModel = true;
            const { selection } = this.plugin.managers.structure.hierarchy;
            const m = selection.structures[0].model;
            await this.plugin.state.updateTransform(this.plugin.state.data, m.cell.transform.ref, params, 'Model Index');
        }
        finally {
            this.isUpdatingModel = false;
            this._updateStructureModel();
        }
    }
    get modelIndex() {
        var _a, _b;
        const { selection } = this.plugin.managers.structure.hierarchy;
        if (selection.structures.length !== 1)
            return null;
        const m = selection.structures[0].model;
        if (!m || m.cell.transform.transformer !== StateTransforms.Model.ModelFromTrajectory)
            return null;
        if (!m.cell.obj || Model.TrajectoryInfo.get(m.cell.obj.data).size <= 1)
            return null;
        const params = (_a = m.cell.params) === null || _a === void 0 ? void 0 : _a.definition;
        if (!params)
            return null;
        return _jsx(ParameterControls, { params: params, values: (_b = m.cell.params) === null || _b === void 0 ? void 0 : _b.values, onChangeValues: this.updateStructureModel, isDisabled: this.state.isBusy });
    }
    get structureType() {
        var _a;
        const { selection } = this.plugin.managers.structure.hierarchy;
        if (selection.structures.length !== 1)
            return null;
        const s = selection.structures[0];
        const params = (_a = s.cell.params) === null || _a === void 0 ? void 0 : _a.definition;
        if (!params || !s.cell.parent)
            return null;
        return _jsx(UpdateTransformControl, { state: s.cell.parent, transform: s.cell.transform, customHeader: 'none', customUpdate: this.updateStructure, noMargin: true, autoHideApply: true });
    }
    get transform() {
        const { selection } = this.plugin.managers.structure.hierarchy;
        if (selection.structures.length !== 1)
            return null;
        const pivot = selection.structures[0];
        if (!pivot.cell.parent)
            return null;
        const t = StateSelection.tryFindDecorator(this.plugin.state.data, pivot.cell.transform.ref, StateTransforms.Model.TransformStructureConformation);
        if (!t)
            return;
        return _jsx(ExpandGroup, { header: `Conformation Transform`, children: _jsx(UpdateTransformControl, { state: t.parent, transform: t.transform, customHeader: 'none', noMargin: true, autoHideApply: true }) });
    }
    renderControls() {
        const disabled = this.state.isBusy || this.isEmpty;
        const presets = this.presetActions;
        const label = this.label;
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', style: { marginTop: '1px' }, children: [_jsx(Button, { noOverflow: true, flex: true, onClick: this.toggleHierarchy, disabled: disabled, title: label, children: label }), presets.length > 0 && _jsx(IconButton, { svg: BookmarksOutlinedSvg, className: 'msp-form-control', flex: '40px', onClick: this.togglePreset, title: 'Apply a structure presets to the current hierarchy.', toggleState: this.state.show === 'presets', disabled: disabled })] }), this.state.show === 'hierarchy' && _jsx(ActionMenu, { items: this.hierarchyItems, onSelect: this.selectHierarchy, multiselect: true }), this.state.show === 'presets' && _jsx(ActionMenu, { items: presets, onSelect: this.applyPreset }), this.modelIndex, this.structureType, this.transform, _jsxs("div", { style: { marginTop: '6px' }, children: [_jsx(StructureFocusControls, {}), _jsx(StructureSelectionStatsControls, { hideOnEmpty: true })] })] });
    }
}
