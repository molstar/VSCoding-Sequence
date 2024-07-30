"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssemblySymmetryControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const base_1 = require("../../mol-plugin-ui/base");
const apply_action_1 = require("../../mol-plugin-ui/state/apply-action");
const behavior_1 = require("./behavior");
const prop_1 = require("./prop");
const parameters_1 = require("../../mol-plugin-ui/controls/parameters");
const param_definition_1 = require("../../mol-util/param-definition");
const hierarchy_1 = require("../../mol-plugin-state/manager/structure/hierarchy");
const mol_state_1 = require("../../mol-state");
const objects_1 = require("../../mol-plugin-state/objects");
const mol_task_1 = require("../../mol-task");
const icons_1 = require("../../mol-plugin-ui/controls/icons");
class AssemblySymmetryControls extends base_1.CollapsableControls {
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
            brand: { accent: 'cyan', svg: icons_1.ExtensionSvg }
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, () => {
            this.setState({
                isHidden: !this.canEnable(),
                description: hierarchy_1.StructureHierarchyManager.getSelectedStructuresDescription(this.plugin)
            });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (e.cell.transform.transformer === behavior_1.AssemblySymmetry3D)
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
        return !!((_b = (_a = behavior_1.InitAssemblySymmetry3D.definition).isApplicable) === null || _b === void 0 ? void 0 : _b.call(_a, pivot.obj, pivot.transform, this.plugin));
    }
    renderEnable() {
        const pivot = this.pivot;
        if (!pivot.cell.parent)
            return null;
        return (0, jsx_runtime_1.jsx)(apply_action_1.ApplyActionControl, { state: pivot.cell.parent, action: EnableAssemblySymmetry3D, initiallyCollapsed: true, nodeRef: pivot.cell.transform.ref, simpleApply: { header: 'Enable', icon: icons_1.CheckSvg } });
    }
    renderNoSymmetries() {
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-row-text', children: (0, jsx_runtime_1.jsx)("div", { children: "No Symmetries for Assembly" }) });
    }
    get params() {
        var _a;
        const structure = (_a = this.pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
        const params = param_definition_1.ParamDefinition.clone(structure ? prop_1.AssemblySymmetryProvider.getParams(structure) : prop_1.AssemblySymmetryProvider.defaultParams);
        params.serverType.isHidden = true;
        params.serverUrl.isHidden = true;
        return params;
    }
    get values() {
        var _a;
        const structure = (_a = this.pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (structure) {
            return prop_1.AssemblySymmetryProvider.props(structure);
        }
        else {
            return { ...param_definition_1.ParamDefinition.getDefaultValues(prop_1.AssemblySymmetryProvider.defaultParams), symmetryIndex: -1 };
        }
    }
    async updateAssemblySymmetry(values) {
        var _a, _b, _c, _d;
        const s = this.pivot;
        const currValues = prop_1.AssemblySymmetryProvider.props(s.cell.obj.data);
        if (param_definition_1.ParamDefinition.areEqual(prop_1.AssemblySymmetryProvider.defaultParams, currValues, values))
            return;
        if (s.properties) {
            const b = this.plugin.state.data.build();
            b.to(s.properties.cell).update(old => {
                old.properties[prop_1.AssemblySymmetryProvider.descriptor.name] = values;
            });
            await b.commit();
        }
        else {
            const pd = this.plugin.customStructureProperties.getParams((_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data);
            const params = param_definition_1.ParamDefinition.getDefaultValues(pd);
            params.properties[prop_1.AssemblySymmetryProvider.descriptor.name] = values;
            await this.plugin.builders.structure.insertStructureProperties(s.cell, params);
        }
        for (const components of this.plugin.managers.structure.hierarchy.currentComponentGroups) {
            if (values.symmetryIndex === -1) {
                const name = (_d = (_c = (_b = components[0]) === null || _b === void 0 ? void 0 : _b.representations[0]) === null || _c === void 0 ? void 0 : _c.cell.transform.params) === null || _d === void 0 ? void 0 : _d.colorTheme.name;
                if (name === prop_1.AssemblySymmetryData.Tag.Cluster) {
                    await this.plugin.managers.structure.component.updateRepresentationsTheme(components, { color: 'default' });
                }
            }
            else {
                (0, behavior_1.tryCreateAssemblySymmetry)(this.plugin, s.cell);
                if ((0, behavior_1.getAssemblySymmetryConfig)(this.plugin).ApplyColors) {
                    await this.plugin.managers.structure.component.updateRepresentationsTheme(components, { color: prop_1.AssemblySymmetryData.Tag.Cluster });
                }
            }
        }
    }
    get hasAssemblySymmetry3D() {
        return !this.pivot.cell.parent || !!mol_state_1.StateSelection.findTagInSubtree(this.pivot.cell.parent.tree, this.pivot.cell.transform.ref, prop_1.AssemblySymmetryData.Tag.Representation);
    }
    get enable() {
        return !this.hasAssemblySymmetry3D && this.values.symmetryIndex !== -1;
    }
    get noSymmetries() {
        var _a;
        const structure = (_a = this.pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
        const data = structure && prop_1.AssemblySymmetryDataProvider.get(structure).value;
        return data && data.filter(sym => sym.symbol !== 'C1').length === 0;
    }
    renderParams() {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: this.params, values: this.values, onChangeValues: this.paramsOnChange }) });
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
exports.AssemblySymmetryControls = AssemblySymmetryControls;
const EnableAssemblySymmetry3D = mol_state_1.StateAction.build({
    from: objects_1.PluginStateObject.Molecule.Structure,
})(({ a, ref, state }, plugin) => mol_task_1.Task.create('Enable Assembly Symmetry', async (ctx) => {
    var _a;
    const presetParams = (_a = behavior_1.AssemblySymmetryPreset.params) === null || _a === void 0 ? void 0 : _a.call(behavior_1.AssemblySymmetryPreset, a, plugin);
    const presetProps = presetParams ? param_definition_1.ParamDefinition.getDefaultValues(presetParams) : Object.create(null);
    await behavior_1.AssemblySymmetryPreset.apply(ref, presetProps, plugin);
}));
