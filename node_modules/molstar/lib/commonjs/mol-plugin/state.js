"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginState = void 0;
const mol_state_1 = require("../mol-state");
const objects_1 = require("../mol-plugin-state/objects");
const behavior_1 = require("./behavior");
const canvas3d_1 = require("../mol-canvas3d/canvas3d");
const commands_1 = require("./commands");
const param_definition_1 = require("../mol-util/param-definition");
const mol_util_1 = require("../mol-util");
const immer_1 = require("immer");
const rxjs_1 = require("rxjs");
const component_1 = require("../mol-plugin-state/component");
const config_1 = require("./config");
class PluginState extends component_1.PluginComponent {
    get animation() { return this.plugin.managers.animation; }
    getSnapshot(params) {
        var _a, _b, _c;
        const p = { ...this.snapshotParams.value, ...params };
        return {
            id: mol_util_1.UUID.create22(),
            data: p.data ? this.data.getSnapshot() : void 0,
            behaviour: p.behavior ? this.behaviors.getSnapshot() : void 0,
            animation: p.animation ? this.animation.getSnapshot() : void 0,
            startAnimation: p.startAnimation ? !!p.startAnimation : void 0,
            camera: p.camera ? {
                current: this.plugin.canvas3d.camera.getSnapshot(),
                transitionStyle: p.cameraTransition.name,
                transitionDurationInMs: ((_a = p === null || p === void 0 ? void 0 : p.cameraTransition) === null || _a === void 0 ? void 0 : _a.name) === 'animate' ? p.cameraTransition.params.durationInMs : void 0
            } : void 0,
            canvas3dContext: p.canvas3dContext ? { props: (_b = this.plugin.canvas3dContext) === null || _b === void 0 ? void 0 : _b.props } : void 0,
            canvas3d: p.canvas3d ? { props: (_c = this.plugin.canvas3d) === null || _c === void 0 ? void 0 : _c.props } : void 0,
            interactivity: p.interactivity ? { props: this.plugin.managers.interactivity.props } : void 0,
            structureFocus: this.plugin.managers.structure.focus.getSnapshot(),
            structureSelection: p.structureSelection ? this.plugin.managers.structure.selection.getSnapshot() : void 0,
            structureComponentManager: p.componentManager ? {
                options: this.plugin.managers.structure.component.state.options
            } : void 0,
            durationInMs: p === null || p === void 0 ? void 0 : p.durationInMs
        };
    }
    async setSnapshot(snapshot) {
        var _a, _b, _c, _d, _e;
        await this.animation.stop();
        // this needs to go 1st since these changes are already baked into the behavior and data state
        if ((_a = snapshot.structureComponentManager) === null || _a === void 0 ? void 0 : _a.options)
            this.plugin.managers.structure.component._setSnapshotState((_b = snapshot.structureComponentManager) === null || _b === void 0 ? void 0 : _b.options);
        if (snapshot.behaviour)
            await this.plugin.runTask(this.behaviors.setSnapshot(snapshot.behaviour));
        if (snapshot.data)
            await this.plugin.runTask(this.data.setSnapshot(snapshot.data));
        if ((_c = snapshot.canvas3d) === null || _c === void 0 ? void 0 : _c.props) {
            const settings = param_definition_1.ParamDefinition.normalizeParams(canvas3d_1.Canvas3DParams, snapshot.canvas3d.props, 'children');
            await commands_1.PluginCommands.Canvas3D.SetSettings(this.plugin, { settings });
        }
        if ((_d = snapshot.canvas3dContext) === null || _d === void 0 ? void 0 : _d.props) {
            const props = param_definition_1.ParamDefinition.normalizeParams(canvas3d_1.Canvas3DContext.Params, snapshot.canvas3dContext.props, 'children');
            (_e = this.plugin.canvas3dContext) === null || _e === void 0 ? void 0 : _e.setProps(props);
        }
        if (snapshot.interactivity) {
            if (snapshot.interactivity.props)
                this.plugin.managers.interactivity.setProps(snapshot.interactivity.props);
        }
        if (snapshot.structureFocus) {
            this.plugin.managers.structure.focus.setSnapshot(snapshot.structureFocus);
        }
        if (snapshot.structureSelection) {
            this.plugin.managers.structure.selection.setSnapshot(snapshot.structureSelection);
        }
        if (snapshot.animation) {
            this.animation.setSnapshot(snapshot.animation);
        }
        if (snapshot.camera) {
            commands_1.PluginCommands.Camera.Reset(this.plugin, {
                snapshot: snapshot.camera.current,
                durationMs: snapshot.camera.transitionStyle === 'animate'
                    ? snapshot.camera.transitionDurationInMs
                    : void 0
            });
        }
        if (snapshot.startAnimation) {
            this.animation.start();
        }
    }
    updateTransform(state, a, params, canUndo) {
        const tree = state.build().to(a).update(params);
        return commands_1.PluginCommands.State.Update(this.plugin, { state, tree, options: { canUndo } });
    }
    hasBehavior(behavior) {
        return this.behaviors.tree.transforms.has(behavior.id);
    }
    updateBehavior(behavior, params) {
        const tree = this.behaviors.build();
        if (!this.behaviors.tree.transforms.has(behavior.id)) {
            const defaultParams = behavior.createDefaultParams(void 0, this.plugin);
            tree.to(behavior_1.PluginBehavior.getCategoryId(behavior)).apply(behavior, (0, immer_1.produce)(defaultParams, params), { ref: behavior.id });
        }
        else {
            tree.to(behavior.id).update(params);
        }
        return this.plugin.runTask(this.behaviors.updateTree(tree));
    }
    dispose() {
        this.behaviors.cells.forEach(cell => {
            var _a, _b, _c, _d;
            if (behavior_1.PluginBehavior.Behavior.is(cell.obj)) {
                (_b = (_a = cell.obj.data).unregister) === null || _b === void 0 ? void 0 : _b.call(_a);
                (_d = (_c = cell.obj.data).dispose) === null || _d === void 0 ? void 0 : _d.call(_c);
            }
        });
        super.dispose();
        this.data.dispose();
        this.behaviors.dispose();
        this.animation.dispose();
    }
    constructor(plugin) {
        super();
        this.plugin = plugin;
        this.data = mol_state_1.State.create(new objects_1.PluginStateObject.Root({}), { runTask: this.plugin.runTask, globalContext: this.plugin, historyCapacity: this.plugin.config.get(config_1.PluginConfig.State.HistoryCapacity) });
        this.behaviors = mol_state_1.State.create(new behavior_1.PluginBehavior.Root({}), { runTask: this.plugin.runTask, globalContext: this.plugin, rootState: { isLocked: true } });
        this.events = {
            cell: {
                stateUpdated: (0, rxjs_1.merge)(this.data.events.cell.stateUpdated, this.behaviors.events.cell.stateUpdated),
                created: (0, rxjs_1.merge)(this.data.events.cell.created, this.behaviors.events.cell.created),
                removed: (0, rxjs_1.merge)(this.data.events.cell.removed, this.behaviors.events.cell.removed),
            },
            object: {
                created: (0, rxjs_1.merge)(this.data.events.object.created, this.behaviors.events.object.created),
                removed: (0, rxjs_1.merge)(this.data.events.object.removed, this.behaviors.events.object.removed),
                updated: (0, rxjs_1.merge)(this.data.events.object.updated, this.behaviors.events.object.updated)
            }
        };
        this.snapshotParams = this.ev.behavior(PluginState.DefaultSnapshotParams);
        this.setSnapshotParams = (params) => {
            this.snapshotParams.next({ ...PluginState.DefaultSnapshotParams, ...params });
        };
    }
}
exports.PluginState = PluginState;
(function (PluginState) {
    PluginState.SnapshotParams = {
        durationInMs: param_definition_1.ParamDefinition.Numeric(1500, { min: 100, max: 15000, step: 100 }, { label: 'Duration in ms' }),
        data: param_definition_1.ParamDefinition.Boolean(true),
        behavior: param_definition_1.ParamDefinition.Boolean(false),
        structureSelection: param_definition_1.ParamDefinition.Boolean(false),
        componentManager: param_definition_1.ParamDefinition.Boolean(true),
        animation: param_definition_1.ParamDefinition.Boolean(true),
        startAnimation: param_definition_1.ParamDefinition.Boolean(false),
        canvas3d: param_definition_1.ParamDefinition.Boolean(true),
        canvas3dContext: param_definition_1.ParamDefinition.Boolean(true),
        interactivity: param_definition_1.ParamDefinition.Boolean(true),
        camera: param_definition_1.ParamDefinition.Boolean(true),
        cameraTransition: param_definition_1.ParamDefinition.MappedStatic('animate', {
            animate: param_definition_1.ParamDefinition.Group({
                durationInMs: param_definition_1.ParamDefinition.Numeric(250, { min: 100, max: 5000, step: 500 }, { label: 'Duration in ms' }),
            }),
            instant: param_definition_1.ParamDefinition.Group({})
        }, { options: [['animate', 'Animate'], ['instant', 'Instant']] }),
        image: param_definition_1.ParamDefinition.Boolean(false),
    };
    PluginState.DefaultSnapshotParams = param_definition_1.ParamDefinition.getDefaultValues(PluginState.SnapshotParams);
})(PluginState || (exports.PluginState = PluginState = {}));
