import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { CollapsableControls } from '../../mol-plugin-ui/base';
import { Button, ControlRow, ExpandGroup, IconButton } from '../../mol-plugin-ui/controls/common';
import * as Icons from '../../mol-plugin-ui/controls/icons';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { Slider } from '../../mol-plugin-ui/controls/slider';
import { useBehavior } from '../../mol-plugin-ui/hooks/use-behavior';
import { UpdateTransformControl } from '../../mol-plugin-ui/state/update-transform';
import { shallowEqualArrays } from '../../mol-util';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { sleep } from '../../mol-util/sleep';
import { VolsegEntry } from './entry-root';
import { SimpleVolumeParams } from './entry-volume';
import { VolsegGlobalState, VolsegGlobalStateParams } from './global-state';
import { isDefined } from './helpers';
var VolsegUIData;
(function (VolsegUIData) {
    function changeAvailableNodes(data, newNodes) {
        var _a;
        const newActiveNode = newNodes.length > data.availableNodes.length ?
            newNodes[newNodes.length - 1]
            : (_a = newNodes.find(node => { var _a; return node.data.ref === ((_a = data.activeNode) === null || _a === void 0 ? void 0 : _a.data.ref); })) !== null && _a !== void 0 ? _a : newNodes[0];
        return { ...data, availableNodes: newNodes, activeNode: newActiveNode };
    }
    VolsegUIData.changeAvailableNodes = changeAvailableNodes;
    function changeActiveNode(data, newActiveRef) {
        var _a;
        const newActiveNode = (_a = data.availableNodes.find(node => node.data.ref === newActiveRef)) !== null && _a !== void 0 ? _a : data.availableNodes[0];
        return { ...data, availableNodes: data.availableNodes, activeNode: newActiveNode };
    }
    VolsegUIData.changeActiveNode = changeActiveNode;
    function equals(data1, data2) {
        return shallowEqualArrays(data1.availableNodes, data2.availableNodes) && data1.activeNode === data2.activeNode && data1.globalState === data2.globalState;
    }
    VolsegUIData.equals = equals;
})(VolsegUIData || (VolsegUIData = {}));
export class VolsegUI extends CollapsableControls {
    defaultState() {
        return {
            header: 'Volume & Segmentation',
            isCollapsed: true,
            brand: { accent: 'orange', svg: Icons.ExtensionSvg },
            data: {
                globalState: undefined,
                availableNodes: [],
                activeNode: undefined,
            }
        };
    }
    renderControls() {
        return _jsx(VolsegControls, { plugin: this.plugin, data: this.state.data, setData: d => this.setState({ data: d }) });
    }
    componentDidMount() {
        this.setState({ isHidden: true, isCollapsed: false });
        this.subscribe(this.plugin.state.data.events.changed, e => {
            var _a, _b, _c;
            const nodes = e.state.selectQ(q => q.ofType(VolsegEntry)).map(cell => cell === null || cell === void 0 ? void 0 : cell.obj).filter(isDefined);
            const isHidden = nodes.length === 0;
            const newData = VolsegUIData.changeAvailableNodes(this.state.data, nodes);
            if (!((_a = this.state.data.globalState) === null || _a === void 0 ? void 0 : _a.isRegistered())) {
                const globalState = (_c = (_b = e.state.selectQ(q => q.ofType(VolsegGlobalState))[0]) === null || _b === void 0 ? void 0 : _b.obj) === null || _c === void 0 ? void 0 : _c.data;
                if (globalState)
                    newData.globalState = globalState;
            }
            if (!VolsegUIData.equals(this.state.data, newData) || this.state.isHidden !== isHidden) {
                this.setState({ data: newData, isHidden: isHidden });
            }
        });
    }
}
function VolsegControls({ plugin, data, setData }) {
    var _a;
    const entryData = (_a = data.activeNode) === null || _a === void 0 ? void 0 : _a.data;
    if (!entryData) {
        return _jsx("p", { children: "No data!" });
    }
    if (!data.globalState) {
        return _jsx("p", { children: "No global state!" });
    }
    const params = {
        /** Reference to the active VolsegEntry node */
        entry: PD.Select(data.activeNode.data.ref, data.availableNodes.map(entry => [entry.data.ref, entry.data.entryId]))
    };
    const values = {
        entry: data.activeNode.data.ref,
    };
    const globalState = useBehavior(data.globalState.currentState);
    return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: params, values: values, onChangeValues: next => setData(VolsegUIData.changeActiveNode(data, next.entry)) }), _jsx(ExpandGroup, { header: 'Global options', children: _jsx(WaitingParameterControls, { params: VolsegGlobalStateParams, values: globalState, onChangeValues: async (next) => { var _a; return await ((_a = data.globalState) === null || _a === void 0 ? void 0 : _a.updateState(plugin, next)); } }) }), _jsx(VolsegEntryControls, { entryData: entryData }, entryData.ref)] });
}
function VolsegEntryControls({ entryData }) {
    var _a, _b, _c;
    const state = useBehavior(entryData.currentState);
    const allSegments = entryData.metadata.allSegments;
    const selectedSegment = entryData.metadata.getSegment(state.selectedSegment);
    const visibleSegments = state.visibleSegments.map(seg => seg.segmentId);
    const visibleModels = state.visibleModels.map(model => model.pdbId);
    const allPdbs = entryData.pdbs;
    return _jsxs(_Fragment, { children: [_jsx("div", { style: { fontWeight: 'bold', padding: 8, paddingTop: 6, paddingBottom: 4, overflow: 'hidden' }, children: (_b = (_a = entryData.metadata.raw.annotation) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Unnamed Annotation' }), allPdbs.length > 0 && _jsx(ExpandGroup, { header: 'Fitted models in PDB', initiallyExpanded: true, children: allPdbs.map(pdb => _jsx(WaitingButton, { onClick: () => entryData.actionShowFittedModel(visibleModels.includes(pdb) ? [] : [pdb]), style: { fontWeight: visibleModels.includes(pdb) ? 'bold' : undefined, textAlign: 'left', marginTop: 1 }, children: pdb }, pdb)) }), _jsx(VolumeControls, { entryData: entryData }), _jsxs(ExpandGroup, { header: 'Segmentation data', initiallyExpanded: true, children: [_jsx(ControlRow, { label: 'Opacity', control: _jsx(WaitingSlider, { min: 0, max: 1, value: state.segmentOpacity, step: 0.05, onChange: async (v) => await entryData.actionSetOpacity(v) }) }), allSegments.length > 0 && _jsxs(_Fragment, { children: [_jsx(WaitingButton, { onClick: async () => { await sleep(20); await entryData.actionToggleAllSegments(); }, style: { marginTop: 1 }, children: "Toggle All segments" }), _jsx("div", { style: { maxHeight: 200, overflow: 'hidden', overflowY: 'auto', marginBlock: 1 }, children: allSegments.map(segment => {
                                    var _a, _b;
                                    return _jsxs("div", { style: { display: 'flex', marginBottom: 1 }, onMouseEnter: () => entryData.actionHighlightSegment(segment), onMouseLeave: () => entryData.actionHighlightSegment(), children: [_jsx(Button, { onClick: () => entryData.actionSelectSegment(segment !== selectedSegment ? segment.id : undefined), style: { fontWeight: segment.id === (selectedSegment === null || selectedSegment === void 0 ? void 0 : selectedSegment.id) ? 'bold' : undefined, marginRight: 1, flexGrow: 1, textAlign: 'left' }, children: _jsxs("div", { title: (_a = segment.biological_annotation.name) !== null && _a !== void 0 ? _a : 'Unnamed segment', style: { maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: [(_b = segment.biological_annotation.name) !== null && _b !== void 0 ? _b : 'Unnamed segment', " (", segment.id, ")"] }) }), _jsx(IconButton, { svg: visibleSegments.includes(segment.id) ? Icons.VisibilityOutlinedSvg : Icons.VisibilityOffOutlinedSvg, onClick: () => entryData.actionToggleSegment(segment.id) })] }, segment.id);
                                }) })] })] }), _jsx(ExpandGroup, { header: 'Selected segment annotation', initiallyExpanded: true, children: _jsxs("div", { style: { paddingTop: 4, paddingRight: 8, maxHeight: 300, overflow: 'hidden', overflowY: 'auto' }, children: [!selectedSegment && 'No segment selected', selectedSegment && _jsxs("b", { children: ["Segment ", selectedSegment.id, ":", _jsx("br", {}), (_c = selectedSegment.biological_annotation.name) !== null && _c !== void 0 ? _c : 'Unnamed segment'] }), selectedSegment === null || selectedSegment === void 0 ? void 0 : selectedSegment.biological_annotation.external_references.map(ref => _jsxs("p", { style: { marginTop: 4 }, children: [_jsxs("small", { children: [ref.resource, ":", ref.accession] }), _jsx("br", {}), _jsx("b", { children: capitalize(ref.label) }), _jsx("br", {}), ref.description] }, ref.id))] }) })] });
}
function VolumeControls({ entryData }) {
    var _a, _b;
    const vol = useBehavior(entryData.currentVolume);
    if (!vol)
        return null;
    const volumeValues = {
        volumeType: vol.state.isHidden ? 'off' : (_a = vol.params) === null || _a === void 0 ? void 0 : _a.type.name,
        opacity: (_b = vol.params) === null || _b === void 0 ? void 0 : _b.type.params.alpha,
    };
    return _jsxs(ExpandGroup, { header: 'Volume data', initiallyExpanded: true, children: [_jsx(WaitingParameterControls, { params: SimpleVolumeParams, values: volumeValues, onChangeValues: async (next) => { await sleep(20); await entryData.actionUpdateVolumeVisual(next); } }), _jsx(ExpandGroup, { header: 'Detailed Volume Params', headerStyle: { marginTop: 1 }, children: _jsx(UpdateTransformControl, { state: entryData.plugin.state.data, transform: vol, customHeader: 'none' }) })] });
}
function WaitingSlider({ value, onChange, ...etc }) {
    const [changing, sliderValue, execute] = useAsyncChange(value);
    return _jsx(Slider, { value: sliderValue, disabled: changing, onChange: newValue => execute(onChange, newValue), ...etc });
}
function WaitingButton({ onClick, ...etc }) {
    const [changing, _, execute] = useAsyncChange(undefined);
    return _jsx(Button, { disabled: changing, onClick: () => execute(onClick, undefined), ...etc, children: etc.children });
}
function WaitingParameterControls({ values, onChangeValues, ...etc }) {
    const [changing, currentValues, execute] = useAsyncChange(values);
    return _jsx(ParameterControls, { isDisabled: changing, values: currentValues, onChangeValues: newValue => execute(onChangeValues, newValue), ...etc });
}
function capitalize(text) {
    const first = text.charAt(0);
    const rest = text.slice(1);
    return first.toUpperCase() + rest;
}
function useAsyncChange(initialValue) {
    const [isExecuting, setIsExecuting] = useState(false);
    const [value, setValue] = useState(initialValue);
    const isMounted = useRef(false);
    useEffect(() => setValue(initialValue), [initialValue]);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);
    const execute = useCallback(async (func, val) => {
        setIsExecuting(true);
        setValue(val);
        try {
            await func(val);
        }
        catch (err) {
            if (isMounted.current) {
                setValue(initialValue);
            }
            throw err;
        }
        finally {
            if (isMounted.current) {
                setIsExecuting(false);
            }
        }
    }, []);
    return [isExecuting, value, execute];
}
