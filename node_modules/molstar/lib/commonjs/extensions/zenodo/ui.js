"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZenodoImportUI = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const file_1 = require("../../mol-plugin-state/actions/file");
const structure_1 = require("../../mol-plugin-state/actions/structure");
const volume_1 = require("../../mol-plugin-state/actions/volume");
const coordinates_1 = require("../../mol-plugin-state/formats/coordinates");
const topology_1 = require("../../mol-plugin-state/formats/topology");
const trajectory_1 = require("../../mol-plugin-state/formats/trajectory");
const volume_2 = require("../../mol-plugin-state/formats/volume");
const base_1 = require("../../mol-plugin-ui/base");
const common_1 = require("../../mol-plugin-ui/controls/common");
const icons_1 = require("../../mol-plugin-ui/controls/icons");
const parameters_1 = require("../../mol-plugin-ui/controls/parameters");
const mol_util_1 = require("../../mol-util");
const param_definition_1 = require("../../mol-util/param-definition");
const ZenodoImportParams = {
    record: param_definition_1.ParamDefinition.Text('', { description: 'Zenodo ID.' })
};
function createImportParams(files, plugin) {
    const modelOpts = [];
    const topologyOpts = [];
    const coordinatesOpts = [];
    const volumeOpts = [];
    const compressedOpts = [];
    const structureExts = new Map();
    const coordinatesExts = new Map();
    const topologyExts = new Map();
    const volumeExts = new Map();
    for (const { provider: { category, binaryExtensions, stringExtensions }, name } of plugin.dataFormats.list) {
        if (category === trajectory_1.TrajectoryFormatCategory) {
            if (binaryExtensions)
                for (const e of binaryExtensions)
                    structureExts.set(e, { format: name, isBinary: true });
            if (stringExtensions)
                for (const e of stringExtensions)
                    structureExts.set(e, { format: name, isBinary: false });
        }
        else if (category === volume_2.VolumeFormatCategory) {
            if (binaryExtensions)
                for (const e of binaryExtensions)
                    volumeExts.set(e, { format: name, isBinary: true });
            if (stringExtensions)
                for (const e of stringExtensions)
                    volumeExts.set(e, { format: name, isBinary: false });
        }
        else if (category === coordinates_1.CoordinatesFormatCategory) {
            if (binaryExtensions)
                for (const e of binaryExtensions)
                    coordinatesExts.set(e, { format: name, isBinary: true });
            if (stringExtensions)
                for (const e of stringExtensions)
                    coordinatesExts.set(e, { format: name, isBinary: false });
        }
        else if (category === topology_1.TopologyFormatCategory) {
            if (binaryExtensions)
                for (const e of binaryExtensions)
                    topologyExts.set(e, { format: name, isBinary: true });
            if (stringExtensions)
                for (const e of stringExtensions)
                    topologyExts.set(e, { format: name, isBinary: false });
        }
    }
    for (const file of files) {
        const label = `${file.key} (${(0, mol_util_1.formatBytes)(file.size)})`;
        if (structureExts.has(file.type)) {
            const { format, isBinary } = structureExts.get(file.type);
            modelOpts.push([`${file.links.self}|${format}|${isBinary}`, label]);
            topologyOpts.push([`${file.links.self}|${format}|${isBinary}`, label]);
        }
        else if (volumeExts.has(file.type)) {
            const { format, isBinary } = volumeExts.get(file.type);
            volumeOpts.push([`${file.links.self}|${format}|${isBinary}`, label]);
        }
        else if (topologyExts.has(file.type)) {
            const { format, isBinary } = topologyExts.get(file.type);
            topologyOpts.push([`${file.links.self}|${format}|${isBinary}`, label]);
        }
        else if (coordinatesExts.has(file.type)) {
            const { format, isBinary } = coordinatesExts.get(file.type);
            coordinatesOpts.push([`${file.links.self}|${format}|${isBinary}`, label]);
        }
        else if (file.type === 'zip') {
            compressedOpts.push([`${file.links.self}|${file.type}|true`, label]);
        }
    }
    const params = {};
    let defaultType = '';
    if (modelOpts.length) {
        defaultType = 'structure';
        params.structure = param_definition_1.ParamDefinition.Select(modelOpts[0][0], modelOpts);
    }
    if (topologyOpts.length && coordinatesOpts.length) {
        if (!defaultType)
            defaultType = 'trajectory';
        params.trajectory = param_definition_1.ParamDefinition.Group({
            topology: param_definition_1.ParamDefinition.Select(topologyOpts[0][0], topologyOpts),
            coordinates: param_definition_1.ParamDefinition.Select(coordinatesOpts[0][0], coordinatesOpts),
        }, { isFlat: true });
    }
    if (volumeOpts.length) {
        if (!defaultType)
            defaultType = 'volume';
        params.volume = param_definition_1.ParamDefinition.Select(volumeOpts[0][0], volumeOpts);
    }
    if (compressedOpts.length) {
        if (!defaultType)
            defaultType = 'compressed';
        params.compressed = param_definition_1.ParamDefinition.Select(compressedOpts[0][0], compressedOpts);
    }
    return {
        type: param_definition_1.ParamDefinition.MappedStatic(defaultType, Object.keys(params).length ? params : { '': param_definition_1.ParamDefinition.EmptyGroup() })
    };
}
class ZenodoImportUI extends base_1.CollapsableControls {
    constructor() {
        super(...arguments);
        this.recordParamsOnChange = (values) => {
            this.setState({ recordValues: values });
        };
        this.importParamsOnChange = (values) => {
            this.setState({ importValues: values });
        };
        this.loadRecord = async () => {
            try {
                this.setState({ busy: true });
                const record = await this.plugin.runTask(this.plugin.fetch({ url: `https://zenodo.org/api/records/${this.state.recordValues.record}`, type: 'json' }));
                const importParams = createImportParams(record.files, this.plugin);
                this.setState({
                    record,
                    files: record.files,
                    busy: false,
                    importValues: param_definition_1.ParamDefinition.getDefaultValues(importParams),
                    importParams
                });
            }
            catch (e) {
                console.error(e);
                this.plugin.log.error(`Failed to load Zenodo record '${this.state.recordValues.record}'`);
                this.setState({ busy: false });
            }
        };
        this.loadFile = async (values) => {
            try {
                this.setState({ busy: true });
                const t = values.type;
                if (t.name === 'structure') {
                    const defaultParams = structure_1.DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
                    const [url, format, isBinary] = t.params.split('|');
                    await this.plugin.runTask(this.plugin.state.data.applyAction(structure_1.DownloadStructure, {
                        source: {
                            name: 'url',
                            params: {
                                url,
                                format: format,
                                isBinary: isBinary === 'true',
                                options: defaultParams.source.params.options,
                            }
                        }
                    }));
                }
                else if (t.name === 'trajectory') {
                    const [topologyUrl, topologyFormat, topologyIsBinary] = t.params.topology.split('|');
                    const [coordinatesUrl, coordinatesFormat] = t.params.coordinates.split('|');
                    await this.plugin.runTask(this.plugin.state.data.applyAction(structure_1.LoadTrajectory, {
                        source: {
                            name: 'url',
                            params: {
                                model: {
                                    url: topologyUrl,
                                    format: topologyFormat,
                                    isBinary: topologyIsBinary === 'true',
                                },
                                coordinates: {
                                    url: coordinatesUrl,
                                    format: coordinatesFormat,
                                },
                            }
                        }
                    }));
                }
                else if (t.name === 'volume') {
                    const [url, format, isBinary] = t.params.split('|');
                    await this.plugin.runTask(this.plugin.state.data.applyAction(volume_1.DownloadDensity, {
                        source: {
                            name: 'url',
                            params: {
                                url,
                                format: format,
                                isBinary: isBinary === 'true',
                            }
                        }
                    }));
                }
                else if (t.name === 'compressed') {
                    const [url, format, isBinary] = t.params.split('|');
                    await this.plugin.runTask(this.plugin.state.data.applyAction(file_1.DownloadFile, {
                        url,
                        format: format,
                        isBinary: isBinary === 'true',
                        visuals: true
                    }));
                }
            }
            catch (e) {
                console.error(e);
                this.plugin.log.error(`Failed to load Zenodo file`);
            }
            finally {
                this.setState({ busy: false });
            }
        };
        this.clearRecord = () => {
            this.setState({
                importValues: undefined,
                importParams: undefined,
                record: undefined,
                files: undefined
            });
        };
    }
    defaultState() {
        return {
            header: 'Zenodo Import',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: icons_1.OpenInBrowserSvg },
            recordValues: param_definition_1.ParamDefinition.getDefaultValues(ZenodoImportParams),
            importValues: undefined,
            importParams: undefined,
            record: undefined,
            files: undefined,
        };
    }
    renderLoadRecord() {
        return (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 10 }, children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: ZenodoImportParams, values: this.state.recordValues, onChangeValues: this.recordParamsOnChange, isDisabled: this.state.busy }), (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.loadRecord, style: { marginTop: 1 }, disabled: this.state.busy || !this.state.recordValues.record, children: "Load Record" })] });
    }
    renderRecordInfo(record) {
        return (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 10 }, children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-help-text', children: (0, jsx_runtime_1.jsxs)("div", { children: ["Record ", `${record.id}`, ": ", (0, jsx_runtime_1.jsx)("i", { children: `${record.metadata.title}` })] }) }), (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.clearRecord, style: { marginTop: 1 }, disabled: this.state.busy, children: "Clear" })] });
    }
    renderImportFile(params, values) {
        return values.type.name ? (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 10 }, children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: params, values: this.state.importValues, onChangeValues: this.importParamsOnChange, isDisabled: this.state.busy }), (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: () => this.loadFile(values), style: { marginTop: 1 }, disabled: this.state.busy, children: "Import File" })] }) : (0, jsx_runtime_1.jsx)("div", { className: 'msp-help-text', style: { marginBottom: 10 }, children: (0, jsx_runtime_1.jsx)("div", { children: "No supported files" }) });
    }
    renderControls() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [!this.state.record ? this.renderLoadRecord() : null, this.state.record ? this.renderRecordInfo(this.state.record) : null, this.state.importParams && this.state.importValues ? this.renderImportFile(this.state.importParams, this.state.importValues) : null] });
    }
}
exports.ZenodoImportUI = ZenodoImportUI;
