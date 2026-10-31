import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginReactContext, PluginUIComponent } from './base';
import { OrderedMap } from 'immutable';
import { IconButton } from './controls/common';
import { CancelSvg } from './controls/icons';
import { useContext, useEffect, useState } from 'react';
import { useBehavior } from './hooks/use-behavior';
export function BackgroundTaskProgress() {
    const plugin = useContext(PluginReactContext);
    const [tracked, setTracked] = useState(OrderedMap());
    useEffect(() => {
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
    return _jsxs("div", { className: 'msp-background-tasks', children: [tracked.valueSeq().map(e => _jsx(ProgressEntry, { event: e }, e.id)), _jsx(CanvasCommitState, {})] });
}
function CanvasCommitState() {
    var _a;
    const plugin = useContext(PluginReactContext);
    const queueSize = useBehavior((_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.commitQueueSize);
    if (!queueSize)
        return null;
    return _jsx("div", { className: 'msp-task-state', children: _jsx("div", { children: _jsxs("div", { children: ["Commiting renderables... ", queueSize, " remaining"] }) }) });
}
class ProgressEntry extends PluginUIComponent {
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
            : _jsxs(_Fragment, { children: ["[", root.progress.current, "/", root.progress.max, "]"] });
        const subtasks = subtaskCount > 0
            ? _jsxs(_Fragment, { children: ["[", subtaskCount, " subtask(s)]"] })
            : void 0;
        return _jsx("div", { className: 'msp-task-state', children: _jsxs("div", { children: [root.progress.canAbort && _jsx(IconButton, { svg: CancelSvg, onClick: this.abort, title: 'Abort' }), _jsxs("div", { children: [root.progress.message, " ", pr, " ", subtasks] })] }) });
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
export function OverlayTaskProgress() {
    const plugin = useContext(PluginReactContext);
    const [tracked, setTracked] = useState(OrderedMap());
    useEffect(() => {
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
    return _jsx("div", { className: 'msp-overlay-tasks', children: tracked.valueSeq().map(e => _jsx(ProgressEntry, { event: e }, e.id)) });
}
