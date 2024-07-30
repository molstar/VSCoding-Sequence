import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { DownloadFile } from '../../mol-plugin-state/actions/file';
import { DownloadStructure, LoadTrajectory } from '../../mol-plugin-state/actions/structure';
import { DownloadDensity } from '../../mol-plugin-state/actions/volume';
import { CoordinatesFormatCategory } from '../../mol-plugin-state/formats/coordinates';
import { TopologyFormatCategory } from '../../mol-plugin-state/formats/topology';
import { TrajectoryFormatCategory } from '../../mol-plugin-state/formats/trajectory';
import { VolumeFormatCategory } from '../../mol-plugin-state/formats/volume';
import { CollapsableControls } from '../../mol-plugin-ui/base';
import { Button } from '../../mol-plugin-ui/controls/common';
import { OpenInBrowserSvg } from '../../mol-plugin-ui/controls/icons';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { formatBytes } from '../../mol-util';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
const ZenodoImportParams = {
    record: PD.Text('', { description: 'Zenodo ID.' })
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
        if (category === TrajectoryFormatCategory) {
            if (binaryExtensions)
                for (const e of binaryExtensions)
                    structureExts.set(e, { format: name, isBinary: true });
            if (stringExtensions)
                for (const e of stringExtensions)
                    structureExts.set(e, { format: name, isBinary: false });
        }
        else if (category === VolumeFormatCategory) {
            if (binaryExtensions)
                for (const e of binaryExtensions)
                    volumeExts.set(e, { format: name, isBinary: true });
            if (stringExtensions)
                for (const e of stringExtensions)
                    volumeExts.set(e, { format: name, isBinary: false });
        }
        else if (category === CoordinatesFormatCategory) {
            if (binaryExtensions)
                for (const e of binaryExtensions)
                    coordinatesExts.set(e, { format: name, isBinary: true });
            if (stringExtensions)
                for (const e of stringExtensions)
                    coordinatesExts.set(e, { format: name, isBinary: false });
        }
        else if (category === TopologyFormatCategory) {
            if (binaryExtensions)
                for (const e of binaryExtensions)
                    topologyExts.set(e, { format: name, isBinary: true });
            if (stringExtensions)
                for (const e of stringExtensions)
                    topologyExts.set(e, { format: name, isBinary: false });
        }
    }
    for (const file of files) {
        const label = `${file.key} (${formatBytes(file.size)})`;
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
        params.structure = PD.Select(modelOpts[0][0], modelOpts);
    }
    if (topologyOpts.length && coordinatesOpts.length) {
        if (!defaultType)
            defaultType = 'trajectory';
        params.trajectory = PD.Group({
            topology: PD.Select(topologyOpts[0][0], topologyOpts),
            coordinates: PD.Select(coordinatesOpts[0][0], coordinatesOpts),
        }, { isFlat: true });
    }
    if (volumeOpts.length) {
        if (!defaultType)
            defaultType = 'volume';
        params.volume = PD.Select(volumeOpts[0][0], volumeOpts);
    }
    if (compressedOpts.length) {
        if (!defaultType)
            defaultType = 'compressed';
        params.compressed = PD.Select(compressedOpts[0][0], compressedOpts);
    }
    return {
        type: PD.MappedStatic(defaultType, Object.keys(params).length ? params : { '': PD.EmptyGroup() })
    };
}
export class ZenodoImportUI extends CollapsableControls {
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
                    importValues: PD.getDefaultValues(importParams),
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
                    const defaultParams = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
                    const [url, format, isBinary] = t.params.split('|');
                    await this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
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
                    await this.plugin.runTask(this.plugin.state.data.applyAction(LoadTrajectory, {
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
                    await this.plugin.runTask(this.plugin.state.data.applyAction(DownloadDensity, {
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
                    await this.plugin.runTask(this.plugin.state.data.applyAction(DownloadFile, {
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
            brand: { accent: 'cyan', svg: OpenInBrowserSvg },
            recordValues: PD.getDefaultValues(ZenodoImportParams),
            importValues: undefined,
            importParams: undefined,
            record: undefined,
            files: undefined,
        };
    }
    renderLoadRecord() {
        return _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx(ParameterControls, { params: ZenodoImportParams, values: this.state.recordValues, onChangeValues: this.recordParamsOnChange, isDisabled: this.state.busy }), _jsx(Button, { onClick: this.loadRecord, style: { marginTop: 1 }, disabled: this.state.busy || !this.state.recordValues.record, children: "Load Record" })] });
    }
    renderRecordInfo(record) {
        return _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("div", { className: 'msp-help-text', children: _jsxs("div", { children: ["Record ", `${record.id}`, ": ", _jsx("i", { children: `${record.metadata.title}` })] }) }), _jsx(Button, { onClick: this.clearRecord, style: { marginTop: 1 }, disabled: this.state.busy, children: "Clear" })] });
    }
    renderImportFile(params, values) {
        return values.type.name ? _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx(ParameterControls, { params: params, values: this.state.importValues, onChangeValues: this.importParamsOnChange, isDisabled: this.state.busy }), _jsx(Button, { onClick: () => this.loadFile(values), style: { marginTop: 1 }, disabled: this.state.busy, children: "Import File" })] }) : _jsx("div", { className: 'msp-help-text', style: { marginBottom: 10 }, children: _jsx("div", { children: "No supported files" }) });
    }
    renderControls() {
        return _jsxs(_Fragment, { children: [!this.state.record ? this.renderLoadRecord() : null, this.state.record ? this.renderRecordInfo(this.state.record) : null, this.state.importParams && this.state.importValues ? this.renderImportFile(this.state.importParams, this.state.importValues) : null] });
    }
}
