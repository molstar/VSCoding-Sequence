"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelExportUI = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const react_1 = require("react");
const base_1 = require("../../mol-plugin-ui/base");
const common_1 = require("../../mol-plugin-ui/controls/common");
const icons_1 = require("../../mol-plugin-ui/controls/icons");
const parameters_1 = require("../../mol-plugin-ui/controls/parameters");
const use_behavior_1 = require("../../mol-plugin-ui/hooks/use-behavior");
const param_definition_1 = require("../../mol-util/param-definition");
const export_1 = require("./export");
class ModelExportUI extends base_1.CollapsableControls {
    defaultState() {
        return {
            header: 'Export Models',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: icons_1.GetAppSvg }
        };
    }
    renderControls() {
        return (0, jsx_runtime_1.jsx)(ExportControls, { plugin: this.plugin });
    }
}
exports.ModelExportUI = ModelExportUI;
const Params = {
    format: param_definition_1.ParamDefinition.Select('cif', [['cif', 'mmCIF'], ['bcif', 'Binary mmCIF']])
};
const DefaultParams = param_definition_1.ParamDefinition.getDefaultValues(Params);
function ExportControls({ plugin }) {
    const [params, setParams] = (0, react_1.useState)(DefaultParams);
    const [exporting, setExporting] = (0, react_1.useState)(false);
    (0, use_behavior_1.useBehavior)(plugin.managers.structure.hierarchy.behaviors.selection); // triggers UI update
    const isBusy = (0, use_behavior_1.useBehavior)(plugin.behaviors.state.isBusy);
    const hierarchy = plugin.managers.structure.hierarchy.current;
    let label = 'Nothing to Export';
    if (hierarchy.structures.length === 1) {
        label = 'Export';
    }
    if (hierarchy.structures.length > 1) {
        label = 'Export (as ZIP)';
    }
    const onExport = async () => {
        setExporting(true);
        try {
            await (0, export_1.exportHierarchy)(plugin, { format: params.format });
        }
        finally {
            setExporting(false);
        }
    };
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: Params, values: params, onChangeValues: setParams, isDisabled: isBusy || exporting }), (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: onExport, style: { marginTop: 1 }, disabled: isBusy || hierarchy.structures.length === 0 || exporting, commit: hierarchy.structures.length ? 'on' : 'off', children: label })] });
}
