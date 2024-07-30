import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CollapsableControls } from '../../mol-plugin-ui/base';
import { ApplyActionControl } from '../../mol-plugin-ui/state/apply-action';
import { InitAssemblySymmetry3D, AssemblySymmetry3D, AssemblySymmetryPreset, tryCreateAssemblySymmetry, getAssemblySymmetryConfig } from './behavior';
import { AssemblySymmetryProvider, AssemblySymmetryDataProvider, AssemblySymmetryData } from './prop';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { StructureHierarchyManager } from '../../mol-plugin-state/manager/structure/hierarchy';
import { StateAction, StateSelection } from '../../mol-state';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { Task } from '../../mol-task';
import { ExtensionSvg, CheckSvg } from '../../mol-plugin-ui/controls/icons';
export class AssemblySymmetryControls extends CollapsableControls {
    constructor() {
        super(...arguments);
        this.paramsOnChange = (options) => {
            this.updateAssemblySymmetry(options);
        };
    }
    defaultState() {
        return {
            header: 'Assembly Symmetry',
            isCollapsed: false,
            isBusy: false,
            isHidden: true,
            brand: { accent: 'cyan', svg: ExtensionSvg }
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, () => {
            this.setState({
                isHidden: !this.canEnable(),
                description: StructureHierarchyManager.getSelectedStructuresDescription(this.plugin)
            });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (e.cell.transform.transformer === AssemblySymmetry3D)
                this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, v => this.setState({ isBusy: v }));
    }
    get pivot() {
        return this.plugin.managers.structure.hierarchy.selection.structures[0];
    }
    canEnable() {
        var _a, _b;
        const { selection } = this.plugin.managers.structure.hierarchy;
        if (selection.structures.length !== 1)
            return false;
        const pivot = this.pivot.cell;
        if (!pivot.obj)
            return false;
        return !!((_b = (_a = InitAssemblySymmetry3D.definition).isApplicable) === null || _b === void 0 ? void 0 : _b.call(_a, pivot.obj, pivot.transform, this.plugin));
    }
    renderEnable() {
        const pivot = this.pivot;
        if (!pivot.cell.parent)
            return null;
        return _jsx(ApplyActionControl, { state: pivot.cell.parent, action: EnableAssemblySymmetry3D, initiallyCollapsed: true, nodeRef: pivot.cell.transform.ref, simpleApply: { header: 'Enable', icon: CheckSvg } });
    }
    renderNoSymmetries() {
        return _jsx("div", { className: 'msp-row-text', children: _jsx("div", { children: "No Symmetries for Assembly" }) });
    }
    get params() {
        var _a;
        const structure = (_a = this.pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
        const params = PD.clone(structure ? AssemblySymmetryProvider.getParams(structure) : AssemblySymmetryProvider.defaultParams);
        params.serverType.isHidden = true;
        params.serverUrl.isHidden = true;
        return params;
    }
    get values() {
        var _a;
        const structure = (_a = this.pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (structure) {
            return AssemblySymmetryProvider.props(structure);
        }
        else {
            return { ...PD.getDefaultValues(AssemblySymmetryProvider.defaultParams), symmetryIndex: -1 };
        }
    }
    async updateAssemblySymmetry(values) {
        var _a, _b, _c, _d;
        const s = this.pivot;
        const currValues = AssemblySymmetryProvider.props(s.cell.obj.data);
        if (PD.areEqual(AssemblySymmetryProvider.defaultParams, currValues, values))
            return;
        if (s.properties) {
            const b = this.plugin.state.data.build();
            b.to(s.properties.cell).update(old => {
                old.properties[AssemblySymmetryProvider.descriptor.name] = values;
            });
            await b.commit();
        }
        else {
            const pd = this.plugin.customStructureProperties.getParams((_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data);
            const params = PD.getDefaultValues(pd);
            params.properties[AssemblySymmetryProvider.descriptor.name] = values;
            await this.plugin.builders.structure.insertStructureProperties(s.cell, params);
        }
        for (const components of this.plugin.managers.structure.hierarchy.currentComponentGroups) {
            if (values.symmetryIndex === -1) {
                const name = (_d = (_c = (_b = components[0]) === null || _b === void 0 ? void 0 : _b.representations[0]) === null || _c === void 0 ? void 0 : _c.cell.transform.params) === null || _d === void 0 ? void 0 : _d.colorTheme.name;
                if (name === AssemblySymmetryData.Tag.Cluster) {
                    await this.plugin.managers.structure.component.updateRepresentationsTheme(components, { color: 'default' });
                }
            }
            else {
                tryCreateAssemblySymmetry(this.plugin, s.cell);
                if (getAssemblySymmetryConfig(this.plugin).ApplyColors) {
                    await this.plugin.managers.structure.component.updateRepresentationsTheme(components, { color: AssemblySymmetryData.Tag.Cluster });
                }
            }
        }
    }
    get hasAssemblySymmetry3D() {
        return !this.pivot.cell.parent || !!StateSelection.findTagInSubtree(this.pivot.cell.parent.tree, this.pivot.cell.transform.ref, AssemblySymmetryData.Tag.Representation);
    }
    get enable() {
        return !this.hasAssemblySymmetry3D && this.values.symmetryIndex !== -1;
    }
    get noSymmetries() {
        var _a;
        const structure = (_a = this.pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
        const data = structure && AssemblySymmetryDataProvider.get(structure).value;
        return data && data.filter(sym => sym.symbol !== 'C1').length === 0;
    }
    renderParams() {
        return _jsx(_Fragment, { children: _jsx(ParameterControls, { params: this.params, values: this.values, onChangeValues: this.paramsOnChange }) });
    }
    renderControls() {
        if (!this.pivot)
            return null;
        if (this.noSymmetries)
            return this.renderNoSymmetries();
        if (this.enable)
            return this.renderEnable();
        return this.renderParams();
    }
}
const EnableAssemblySymmetry3D = StateAction.build({
    from: PluginStateObject.Molecule.Structure,
})(({ a, ref, state }, plugin) => Task.create('Enable Assembly Symmetry', async (ctx) => {
    var _a;
    const presetParams = (_a = AssemblySymmetryPreset.params) === null || _a === void 0 ? void 0 : _a.call(AssemblySymmetryPreset, a, plugin);
    const presetProps = presetParams ? PD.getDefaultValues(presetParams) : Object.create(null);
    await AssemblySymmetryPreset.apply(ref, presetProps, plugin);
}));
