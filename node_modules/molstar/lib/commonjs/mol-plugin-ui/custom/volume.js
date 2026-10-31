"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeStreamingCustomControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Adam Midlik <midlik@gmail.com>
 */
const base_1 = require("../base");
const behavior_1 = require("../../mol-plugin/behavior/dynamic/volume-streaming/behavior");
const common_1 = require("../controls/common");
const param_definition_1 = require("../../mol-util/param-definition");
const parameters_1 = require("../controls/parameters");
const slider_1 = require("../controls/slider");
const volume_1 = require("../../mol-model/volume");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const names_1 = require("../../mol-util/color/names");
const number_1 = require("../../mol-util/number");
const mol_state_1 = require("../../mol-state");
const state_1 = require("../../mol-plugin/behavior/static/state");
const icons_1 = require("../controls/icons");
const ChannelParams = {
    color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.black, { description: 'Display color of the volume.' }),
    wireframe: param_definition_1.ParamDefinition.Boolean(false, { description: 'Control display of the volume as a wireframe.' }),
    opacity: param_definition_1.ParamDefinition.Numeric(0.3, { min: 0, max: 1, step: 0.01 }, { description: 'Opacity of the volume.' })
};
const Bounds = new Map([
    ['em', [-5, 5]],
    ['2fo-fc', [0, 3]],
    ['fo-fc(+ve)', [1, 5]],
    ['fo-fc(-ve)', [-5, -1]],
]);
class Channel extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.ref = mol_state_1.StateSelection.findTagInSubtree(this.plugin.state.data.tree, this.props.bCell.transform.ref, this.props.name);
        this.getVisible = () => {
            const state = this.plugin.state.data;
            const ref = this.ref;
            if (!ref)
                return false;
            return !state.cells.get(ref).state.isHidden;
        };
        this.toggleVisible = () => {
            const state = this.plugin.state.data;
            const ref = this.ref;
            if (!ref)
                return;
            (0, state_1.setSubtreeVisibility)(state, ref, !state.cells.get(ref).state.isHidden);
        };
    }
    componentDidUpdate() {
        this.ref = mol_state_1.StateSelection.findTagInSubtree(this.plugin.state.data.tree, this.props.bCell.transform.ref, this.props.name);
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.data.events.cell.stateUpdated, e => {
            if (this.ref === e.ref)
                this.forceUpdate();
        });
    }
    render() {
        const props = this.props;
        const { isRelative, stats } = props;
        const channel = props.channels[props.name];
        const { min, max, mean, sigma } = stats;
        const value = Math.round(100 * (channel.isoValue.kind === 'relative' ? channel.isoValue.relativeValue : channel.isoValue.absoluteValue)) / 100;
        let relMin = (min - mean) / sigma;
        let relMax = (max - mean) / sigma;
        if (!this.props.isUnbounded) {
            const bounds = Bounds.get(this.props.name);
            if (this.props.name === 'em') {
                relMin = Math.max(bounds[0], relMin);
                relMax = Math.min(bounds[1], relMax);
            }
            else {
                relMin = bounds[0];
                relMax = bounds[1];
            }
        }
        const vMin = mean + sigma * relMin, vMax = mean + sigma * relMax;
        const step = (0, number_1.toPrecision)(isRelative ? Math.round(((vMax - vMin) / sigma)) / 100 : sigma / 100, 2);
        const ctrlMin = isRelative ? relMin : vMin;
        const ctrlMax = isRelative ? relMax : vMax;
        return (0, jsx_runtime_1.jsx)(common_1.ExpandableControlRow, { label: props.label + (props.isRelative ? ' \u03C3' : ''), colorStripe: channel.color, pivot: (0, jsx_runtime_1.jsxs)("div", { className: 'msp-volume-channel-inline-controls', children: [(0, jsx_runtime_1.jsx)(slider_1.Slider, { value: value, min: ctrlMin, max: ctrlMax, step: step, onChange: v => props.changeIso(props.name, v, isRelative), onChangeImmediate: v => props.changeIso(props.name, v, isRelative), disabled: props.params.isDisabled, onEnter: props.params.events.onEnter }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: this.getVisible() ? icons_1.VisibilityOutlinedSvg : icons_1.VisibilityOffOutlinedSvg, onClick: this.toggleVisible, toggleState: false, disabled: props.params.isDisabled })] }), controls: (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { onChange: ({ name, value }) => props.changeParams(props.name, name, value), params: ChannelParams, values: channel, onEnter: props.params.events.onEnter, isDisabled: props.params.isDisabled }) });
    }
}
class VolumeStreamingCustomControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.changeIso = (name, value, isRelative) => {
            const old = this.props.params;
            this.newParams({
                ...old,
                entry: {
                    name: old.entry.name,
                    params: {
                        ...old.entry.params,
                        channels: {
                            ...old.entry.params.channels,
                            [name]: {
                                ...old.entry.params.channels[name],
                                isoValue: isRelative ? volume_1.Volume.IsoValue.relative(value) : volume_1.Volume.IsoValue.absolute(value)
                            }
                        }
                    }
                }
            });
        };
        this.changeParams = (name, param, value) => {
            const old = this.props.params;
            this.newParams({
                ...old,
                entry: {
                    name: old.entry.name,
                    params: {
                        ...old.entry.params,
                        channels: {
                            ...old.entry.params.channels,
                            [name]: {
                                ...old.entry.params.channels[name],
                                [param]: value
                            }
                        }
                    }
                }
            });
        };
        this.changeOption = ({ name, value }) => {
            const old = this.props.params;
            if (name === 'entry') {
                this.newParams({
                    ...old,
                    entry: {
                        name: value,
                        params: old.entry.params,
                    }
                });
            }
            else {
                const b = this.props.b.data;
                const isEM = b.info.kind === 'em';
                const isRelative = value.params.isRelative;
                const sampling = b.info.header.sampling[0];
                const oldChannels = old.entry.params.channels;
                const oldView = old.entry.params.view.name === value.name
                    ? old.entry.params.view.params
                    : this.props.info.params
                        .entry.map(old.entry.name)
                        .params
                        .view.map(value.name).defaultValue;
                const viewParams = { ...oldView };
                if (value.name === 'selection-box') {
                    viewParams.radius = value.params.radius;
                }
                else if (value.name === 'camera-target') {
                    viewParams.radius = value.params.radius;
                    viewParams.dynamicDetailLevel = value.params.dynamicDetailLevel;
                }
                else if (value.name === 'box') {
                    viewParams.bottomLeft = value.params.bottomLeft;
                    viewParams.topRight = value.params.topRight;
                }
                else if (value.name === 'auto') {
                    viewParams.radius = value.params.radius;
                    viewParams.selectionDetailLevel = value.params.selectionDetailLevel;
                }
                viewParams.isUnbounded = !!value.params.isUnbounded;
                this.newParams({
                    ...old,
                    entry: {
                        name: old.entry.name,
                        params: {
                            ...old.entry.params,
                            view: {
                                name: value.name,
                                params: viewParams
                            },
                            detailLevel: value.params.detailLevel,
                            channels: isEM
                                ? { em: this.convert(oldChannels.em, sampling.valuesInfo[0], isRelative) }
                                : {
                                    '2fo-fc': this.convert(oldChannels['2fo-fc'], sampling.valuesInfo[0], isRelative),
                                    'fo-fc(+ve)': this.convert(oldChannels['fo-fc(+ve)'], sampling.valuesInfo[1], isRelative),
                                    'fo-fc(-ve)': this.convert(oldChannels['fo-fc(-ve)'], sampling.valuesInfo[1], isRelative)
                                }
                        }
                    }
                });
            }
        };
    }
    areInitial(params) {
        return param_definition_1.ParamDefinition.areEqual(this.props.info.params, params, this.props.info.initialValues);
    }
    newParams(params) {
        this.props.events.onChange(params, this.areInitial(params));
    }
    convert(channel, stats, isRelative) {
        return {
            ...channel, isoValue: isRelative
                ? volume_1.Volume.IsoValue.toRelative(channel.isoValue, stats)
                : volume_1.Volume.IsoValue.toAbsolute(channel.isoValue, stats)
        };
    }
    render() {
        if (!this.props.b)
            return null;
        const b = this.props.b.data;
        const isEM = b.info.kind === 'em';
        const pivot = isEM ? 'em' : '2fo-fc';
        const params = this.props.params;
        const entry = this.props.info.params
            .entry.map(params.entry.name);
        const detailLevel = entry.params.detailLevel;
        const dynamicDetailLevel = {
            ...detailLevel,
            label: 'Dynamic Detail',
            defaultValue: entry.params.view.map('camera-target').params.dynamicDetailLevel.defaultValue,
        };
        const selectionDetailLevel = {
            ...detailLevel,
            label: 'Selection Detail',
            defaultValue: entry.params.view.map('auto').params.selectionDetailLevel.defaultValue,
        };
        const sampling = b.info.header.sampling[0];
        const isRelative = params.entry.params.channels[pivot].isoValue.kind === 'relative';
        const isRelativeParam = param_definition_1.ParamDefinition.Boolean(isRelative, { description: 'Use normalized or absolute isocontour scale.', label: 'Normalized' });
        const isUnbounded = !!params.entry.params.view.params.isUnbounded;
        const isUnboundedParam = param_definition_1.ParamDefinition.Boolean(isUnbounded, { description: 'Show full/limited range of iso-values for more fine-grained control.', label: 'Unbounded' });
        const isOff = params.entry.params.view.name === 'off';
        // TODO: factor common things out, cache
        const OptionsParams = {
            entry: param_definition_1.ParamDefinition.Select(params.entry.name, b.data.entries.map(info => [info.dataId, info.dataId]), { isHidden: isOff, description: 'Which entry with volume data to display.' }),
            view: param_definition_1.ParamDefinition.MappedStatic(params.entry.params.view.name, {
                'off': param_definition_1.ParamDefinition.Group({
                    isRelative: param_definition_1.ParamDefinition.Boolean(isRelative, { isHidden: true }),
                    isUnbounded: param_definition_1.ParamDefinition.Boolean(isUnbounded, { isHidden: true }),
                }, { description: 'Display off.' }),
                'box': param_definition_1.ParamDefinition.Group({
                    bottomLeft: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.zero()),
                    topRight: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.zero()),
                    detailLevel,
                    isRelative: isRelativeParam,
                    isUnbounded: isUnboundedParam,
                }, { description: 'Static box defined by cartesian coords.' }),
                'selection-box': param_definition_1.ParamDefinition.Group({
                    radius: param_definition_1.ParamDefinition.Numeric(5, { min: 0, max: 50, step: 0.5 }, { description: 'Radius in \u212B within which the volume is shown.' }),
                    detailLevel,
                    isRelative: isRelativeParam,
                    isUnbounded: isUnboundedParam,
                }, { description: 'Box around focused element.' }),
                'camera-target': param_definition_1.ParamDefinition.Group({
                    radius: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.05 }, { description: 'Radius within which the volume is shown (relative to the field of view).' }),
                    detailLevel: { ...detailLevel, isHidden: true },
                    dynamicDetailLevel: dynamicDetailLevel,
                    isRelative: isRelativeParam,
                    isUnbounded: isUnboundedParam,
                }, { description: 'Box around camera target.' }),
                'cell': param_definition_1.ParamDefinition.Group({
                    detailLevel,
                    isRelative: isRelativeParam,
                    isUnbounded: isUnboundedParam,
                }, { description: 'Box around the structure\'s bounding box.' }),
                'auto': param_definition_1.ParamDefinition.Group({
                    radius: param_definition_1.ParamDefinition.Numeric(5, { min: 0, max: 50, step: 0.5 }, { description: 'Radius in \u212B within which the volume is shown.' }),
                    detailLevel,
                    selectionDetailLevel: selectionDetailLevel,
                    isRelative: isRelativeParam,
                    isUnbounded: isUnboundedParam,
                }, { description: 'Box around focused element.' }),
            }, { options: behavior_1.VolumeStreaming.ViewTypeOptions, description: 'Controls what of the volume is displayed. "Off" hides the volume alltogether. "Bounded box" shows the volume inside the given box. "Around Focus" shows the volume around the element/atom last interacted with. "Around Camera" shows the volume around the point the camera is targeting. "Whole Structure" shows the volume for the whole structure.' })
        };
        const options = {
            entry: params.entry.name,
            view: {
                name: params.entry.params.view.name,
                params: {
                    detailLevel: params.entry.params.detailLevel,
                    radius: params.entry.params.view.params.radius,
                    bottomLeft: params.entry.params.view.params.bottomLeft,
                    topRight: params.entry.params.view.params.topRight,
                    selectionDetailLevel: params.entry.params.view.params.selectionDetailLevel,
                    dynamicDetailLevel: params.entry.params.view.params.dynamicDetailLevel,
                    isRelative,
                    isUnbounded
                }
            }
        };
        if (isOff) {
            return (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { onChange: this.changeOption, params: OptionsParams, values: options, onEnter: this.props.events.onEnter, isDisabled: this.props.isDisabled });
        }
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [!isEM && (0, jsx_runtime_1.jsx)(Channel, { label: '2Fo-Fc', name: '2fo-fc', bCell: this.props.bCell, channels: params.entry.params.channels, changeIso: this.changeIso, changeParams: this.changeParams, isRelative: isRelative, params: this.props, stats: sampling.valuesInfo[0], isUnbounded: isUnbounded }), !isEM && (0, jsx_runtime_1.jsx)(Channel, { label: 'Fo-Fc(+ve)', name: 'fo-fc(+ve)', bCell: this.props.bCell, channels: params.entry.params.channels, changeIso: this.changeIso, changeParams: this.changeParams, isRelative: isRelative, params: this.props, stats: sampling.valuesInfo[1], isUnbounded: isUnbounded }), !isEM && (0, jsx_runtime_1.jsx)(Channel, { label: 'Fo-Fc(-ve)', name: 'fo-fc(-ve)', bCell: this.props.bCell, channels: params.entry.params.channels, changeIso: this.changeIso, changeParams: this.changeParams, isRelative: isRelative, params: this.props, stats: sampling.valuesInfo[1], isUnbounded: isUnbounded }), isEM && (0, jsx_runtime_1.jsx)(Channel, { label: 'EM', name: 'em', bCell: this.props.bCell, channels: params.entry.params.channels, changeIso: this.changeIso, changeParams: this.changeParams, isRelative: isRelative, params: this.props, stats: sampling.valuesInfo[0], isUnbounded: isUnbounded }), (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { onChange: this.changeOption, params: OptionsParams, values: options, onEnter: this.props.events.onEnter, isDisabled: this.props.isDisabled })] });
    }
}
exports.VolumeStreamingCustomControls = VolumeStreamingCustomControls;
