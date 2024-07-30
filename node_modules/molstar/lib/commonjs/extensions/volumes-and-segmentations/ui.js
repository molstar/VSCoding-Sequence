"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegUI = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
const react_1 = require("react");
const base_1 = require("../../mol-plugin-ui/base");
const common_1 = require("../../mol-plugin-ui/controls/common");
const Icons = tslib_1.__importStar(require("../../mol-plugin-ui/controls/icons"));
const parameters_1 = require("../../mol-plugin-ui/controls/parameters");
const slider_1 = require("../../mol-plugin-ui/controls/slider");
const use_behavior_1 = require("../../mol-plugin-ui/hooks/use-behavior");
const update_transform_1 = require("../../mol-plugin-ui/state/update-transform");
const mol_util_1 = require("../../mol-util");
const param_definition_1 = require("../../mol-util/param-definition");
const sleep_1 = require("../../mol-util/sleep");
const entry_root_1 = require("./entry-root");
const entry_volume_1 = require("./entry-volume");
const global_state_1 = require("./global-state");
const helpers_1 = require("./helpers");
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
        return (0, mol_util_1.shallowEqualArrays)(data1.availableNodes, data2.availableNodes) && data1.activeNode === data2.activeNode && data1.globalState === data2.globalState;
    }
    VolsegUIData.equals = equals;
})(VolsegUIData || (VolsegUIData = {}));
class VolsegUI extends base_1.CollapsableControls {
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
        return (0, jsx_runtime_1.jsx)(VolsegControls, { plugin: this.plugin, data: this.state.data, setData: d => this.setState({ data: d }) });
    }
    componentDidMount() {
        this.setState({ isHidden: true, isCollapsed: false });
        this.subscribe(this.plugin.state.data.events.changed, e => {
            var _a, _b, _c;
            const nodes = e.state.selectQ(q => q.ofType(entry_root_1.VolsegEntry)).map(cell => cell === null || cell === void 0 ? void 0 : cell.obj).filter(helpers_1.isDefined);
            const isHidden = nodes.length === 0;
            const newData = VolsegUIData.changeAvailableNodes(this.state.data, nodes);
            if (!((_a = this.state.data.globalState) === null || _a === void 0 ? void 0 : _a.isRegistered())) {
                const globalState = (_c = (_b = e.state.selectQ(q => q.ofType(global_state_1.VolsegGlobalState))[0]) === null || _b === void 0 ? void 0 : _b.obj) === null || _c === void 0 ? void 0 : _c.data;
                if (globalState)
                    newData.globalState = globalState;
            }
            if (!VolsegUIData.equals(this.state.data, newData) || this.state.isHidden !== isHidden) {
                this.setState({ data: newData, isHidden: isHidden });
            }
        });
    }
}
exports.VolsegUI = VolsegUI;
function VolsegControls({ plugin, data, setData }) {
    var _a;
    const entryData = (_a = data.activeNode) === null || _a === void 0 ? void 0 : _a.data;
    if (!entryData) {
        return (0, jsx_runtime_1.jsx)("p", { children: "No data!" });
    }
    if (!data.globalState) {
        return (0, jsx_runtime_1.jsx)("p", { children: "No global state!" });
    }
    const params = {
        /** Reference to the active VolsegEntry node */
        entry: param_definition_1.ParamDefinition.Select(data.activeNode.data.ref, data.availableNodes.map(entry => [entry.data.ref, entry.data.entryId]))
    };
    const values = {
        entry: data.activeNode.data.ref,
    };
    const globalState = (0, use_behavior_1.useBehavior)(data.globalState.currentState);
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: params, values: values, onChangeValues: next => setData(VolsegUIData.changeActiveNode(data, next.entry)) }), (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: 'Global options', children: (0, jsx_runtime_1.jsx)(WaitingParameterControls, { params: global_state_1.VolsegGlobalStateParams, values: globalState, onChangeValues: async (next) => { var _a; return await ((_a = data.globalState) === null || _a === void 0 ? void 0 : _a.updateState(plugin, next)); } }) }), (0, jsx_runtime_1.jsx)(VolsegEntryControls, { entryData: entryData }, entryData.ref)] });
}
function VolsegEntryControls({ entryData }) {
    var _a, _b, _c;
    const state = (0, use_behavior_1.useBehavior)(entryData.currentState);
    const allSegments = entryData.metadata.allSegments;
    const selectedSegment = entryData.metadata.getSegment(state.selectedSegment);
    const visibleSegments = state.visibleSegments.map(seg => seg.segmentId);
    const visibleModels = state.visibleModels.map(model => model.pdbId);
    const allPdbs = entryData.pdbs;
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold', padding: 8, paddingTop: 6, paddingBottom: 4, overflow: 'hidden' }, children: (_b = (_a = entryData.metadata.raw.annotation) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Unnamed Annotation' }), allPdbs.length > 0 && (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: 'Fitted models in PDB', initiallyExpanded: true, children: allPdbs.map(pdb => (0, jsx_runtime_1.jsx)(WaitingButton, { onClick: () => entryData.actionShowFittedModel(visibleModels.includes(pdb) ? [] : [pdb]), style: { fontWeight: visibleModels.includes(pdb) ? 'bold' : undefined, textAlign: 'left', marginTop: 1 }, children: pdb }, pdb)) }), (0, jsx_runtime_1.jsx)(VolumeControls, { entryData: entryData }), (0, jsx_runtime_1.jsxs)(common_1.ExpandGroup, { header: 'Segmentation data', initiallyExpanded: true, children: [(0, jsx_runtime_1.jsx)(common_1.ControlRow, { label: 'Opacity', control: (0, jsx_runtime_1.jsx)(WaitingSlider, { min: 0, max: 1, value: state.segmentOpacity, step: 0.05, onChange: async (v) => await entryData.actionSetOpacity(v) }) }), allSegments.length > 0 && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(WaitingButton, { onClick: async () => { await (0, sleep_1.sleep)(20); await entryData.actionToggleAllSegments(); }, style: { marginTop: 1 }, children: "Toggle All segments" }), (0, jsx_runtime_1.jsx)("div", { style: { maxHeight: 200, overflow: 'hidden', overflowY: 'auto', marginBlock: 1 }, children: allSegments.map(segment => {
                                    var _a, _b;
                                    return (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', marginBottom: 1 }, onMouseEnter: () => entryData.actionHighlightSegment(segment), onMouseLeave: () => entryData.actionHighlightSegment(), children: [(0, jsx_runtime_1.jsx)(common_1.Button, { onClick: () => entryData.actionSelectSegment(segment !== selectedSegment ? segment.id : undefined), style: { fontWeight: segment.id === (selectedSegment === null || selectedSegment === void 0 ? void 0 : selectedSegment.id) ? 'bold' : undefined, marginRight: 1, flexGrow: 1, textAlign: 'left' }, children: (0, jsx_runtime_1.jsxs)("div", { title: (_a = segment.biological_annotation.name) !== null && _a !== void 0 ? _a : 'Unnamed segment', style: { maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: [(_b = segment.biological_annotation.name) !== null && _b !== void 0 ? _b : 'Unnamed segment', " (", segment.id, ")"] }) }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: visibleSegments.includes(segment.id) ? Icons.VisibilityOutlinedSvg : Icons.VisibilityOffOutlinedSvg, onClick: () => entryData.actionToggleSegment(segment.id) })] }, segment.id);
                                }) })] })] }), (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: 'Selected segment annotation', initiallyExpanded: true, children: (0, jsx_runtime_1.jsxs)("div", { style: { paddingTop: 4, paddingRight: 8, maxHeight: 300, overflow: 'hidden', overflowY: 'auto' }, children: [!selectedSegment && 'No segment selected', selectedSegment && (0, jsx_runtime_1.jsxs)("b", { children: ["Segment ", selectedSegment.id, ":", (0, jsx_runtime_1.jsx)("br", {}), (_c = selectedSegment.biological_annotation.name) !== null && _c !== void 0 ? _c : 'Unnamed segment'] }), selectedSegment === null || selectedSegment === void 0 ? void 0 : selectedSegment.biological_annotation.external_references.map(ref => (0, jsx_runtime_1.jsxs)("p", { style: { marginTop: 4 }, children: [(0, jsx_runtime_1.jsxs)("small", { children: [ref.resource, ":", ref.accession] }), (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("b", { children: capitalize(ref.label) }), (0, jsx_runtime_1.jsx)("br", {}), ref.description] }, ref.id))] }) })] });
}
function VolumeControls({ entryData }) {
    var _a, _b;
    const vol = (0, use_behavior_1.useBehavior)(entryData.currentVolume);
    if (!vol)
        return null;
    const volumeValues = {
        volumeType: vol.state.isHidden ? 'off' : (_a = vol.params) === null || _a === void 0 ? void 0 : _a.type.name,
        opacity: (_b = vol.params) === null || _b === void 0 ? void 0 : _b.type.params.alpha,
    };
    return (0, jsx_runtime_1.jsxs)(common_1.ExpandGroup, { header: 'Volume data', initiallyExpanded: true, children: [(0, jsx_runtime_1.jsx)(WaitingParameterControls, { params: entry_volume_1.SimpleVolumeParams, values: volumeValues, onChangeValues: async (next) => { await (0, sleep_1.sleep)(20); await entryData.actionUpdateVolumeVisual(next); } }), (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: 'Detailed Volume Params', headerStyle: { marginTop: 1 }, children: (0, jsx_runtime_1.jsx)(update_transform_1.UpdateTransformControl, { state: entryData.plugin.state.data, transform: vol, customHeader: 'none' }) })] });
}
function WaitingSlider({ value, onChange, ...etc }) {
    const [changing, sliderValue, execute] = useAsyncChange(value);
    return (0, jsx_runtime_1.jsx)(slider_1.Slider, { value: sliderValue, disabled: changing, onChange: newValue => execute(onChange, newValue), ...etc });
}
function WaitingButton({ onClick, ...etc }) {
    const [changing, _, execute] = useAsyncChange(undefined);
    return (0, jsx_runtime_1.jsx)(common_1.Button, { disabled: changing, onClick: () => execute(onClick, undefined), ...etc, children: etc.children });
}
function WaitingParameterControls({ values, onChangeValues, ...etc }) {
    const [changing, currentValues, execute] = useAsyncChange(values);
    return (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { isDisabled: changing, values: currentValues, onChangeValues: newValue => execute(onChangeValues, newValue), ...etc });
}
function capitalize(text) {
    const first = text.charAt(0);
    const rest = text.slice(1);
    return first.toUpperCase() + rest;
}
function useAsyncChange(initialValue) {
    const [isExecuting, setIsExecuting] = (0, react_1.useState)(false);
    const [value, setValue] = (0, react_1.useState)(initialValue);
    const isMounted = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => setValue(initialValue), [initialValue]);
    (0, react_1.useEffect)(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);
    const execute = (0, react_1.useCallback)(async (func, val) => {
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
