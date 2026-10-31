"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundTaskProgress = BackgroundTaskProgress;
exports.OverlayTaskProgress = OverlayTaskProgress;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const base_1 = require("./base");
const immutable_1 = require("immutable");
const common_1 = require("./controls/common");
const icons_1 = require("./controls/icons");
const react_1 = require("react");
const use_behavior_1 = require("./hooks/use-behavior");
function BackgroundTaskProgress() {
    const plugin = (0, react_1.useContext)(base_1.PluginReactContext);
    const [tracked, setTracked] = (0, react_1.useState)((0, immutable_1.OrderedMap)());
    (0, react_1.useEffect)(() => {
        const started = plugin.events.task.progress.subscribe(e => {
            var _a;
            const hideOverlay = !!((_a = plugin.spec.components) === null || _a === void 0 ? void 0 : _a.hideTaskOverlay);
            if (e.level === 'background' && (hideOverlay || !e.useOverlay)) {
                setTracked(tracked => tracked.set(e.id, e));
            }
        });
        const finished = plugin.events.task.finished.subscribe(({ id }) => {
            setTracked(tracked => tracked.delete(id));
        });
        return () => {
            started.unsubscribe();
            finished.unsubscribe();
        };
    }, [plugin]);
    return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-background-tasks', children: [tracked.valueSeq().map(e => (0, jsx_runtime_1.jsx)(ProgressEntry, { event: e }, e.id)), (0, jsx_runtime_1.jsx)(CanvasCommitState, {})] });
}
function CanvasCommitState() {
    var _a;
    const plugin = (0, react_1.useContext)(base_1.PluginReactContext);
    const queueSize = (0, use_behavior_1.useBehavior)((_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.commitQueueSize);
    if (!queueSize)
        return null;
    return (0, jsx_runtime_1.jsx)("div", { className: 'msp-task-state', children: (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { children: ["Commiting renderables... ", queueSize, " remaining"] }) }) });
}
class ProgressEntry extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.abort = () => {
            this.plugin.managers.task.requestAbort(this.props.event.progress.root.progress.taskId, 'User Request');
        };
    }
    render() {
        const root = this.props.event.progress.root;
        const subtaskCount = countSubtasks(this.props.event.progress.root) - 1;
        const pr = root.progress.isIndeterminate
            ? void 0
            : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["[", root.progress.current, "/", root.progress.max, "]"] });
        const subtasks = subtaskCount > 0
            ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["[", subtaskCount, " subtask(s)]"] })
            : void 0;
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-task-state', children: (0, jsx_runtime_1.jsxs)("div", { children: [root.progress.canAbort && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.CancelSvg, onClick: this.abort, title: 'Abort' }), (0, jsx_runtime_1.jsxs)("div", { children: [root.progress.message, " ", pr, " ", subtasks] })] }) });
    }
}
function countSubtasks(progress) {
    if (progress.children.length === 0)
        return 1;
    let sum = 0;
    for (const c of progress.children)
        sum += countSubtasks(c);
    return sum;
}
function OverlayTaskProgress() {
    const plugin = (0, react_1.useContext)(base_1.PluginReactContext);
    const [tracked, setTracked] = (0, react_1.useState)((0, immutable_1.OrderedMap)());
    (0, react_1.useEffect)(() => {
        const started = plugin.events.task.progress.subscribe(e => {
            if (!!e.useOverlay) {
                setTracked(tracked => tracked.set(e.id, e));
            }
        });
        const finished = plugin.events.task.finished.subscribe(({ id }) => {
            setTracked(tracked => tracked.delete(id));
        });
        return () => {
            started.unsubscribe();
            finished.unsubscribe();
        };
    }, [plugin]);
    if (tracked.size === 0)
        return null;
    return (0, jsx_runtime_1.jsx)("div", { className: 'msp-overlay-tasks', children: tracked.valueSeq().map(e => (0, jsx_runtime_1.jsx)(ProgressEntry, { event: e }, e.id)) });
}
