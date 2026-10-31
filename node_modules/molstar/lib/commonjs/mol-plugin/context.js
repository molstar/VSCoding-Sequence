"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginContext = void 0;
const immer_1 = require("immer");
const immutable_1 = require("immutable");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const canvas3d_1 = require("../mol-canvas3d/canvas3d");
const util_1 = require("../mol-canvas3d/util");
const linear_algebra_1 = require("../mol-math/linear-algebra");
const custom_property_1 = require("../mol-model-props/common/custom-property");
const data_1 = require("../mol-plugin-state/builder/data");
const structure_1 = require("../mol-plugin-state/builder/structure");
const registry_1 = require("../mol-plugin-state/formats/registry");
const structure_selection_query_1 = require("../mol-plugin-state/helpers/structure-selection-query");
const animation_1 = require("../mol-plugin-state/manager/animation");
const camera_1 = require("../mol-plugin-state/manager/camera");
const interactivity_1 = require("../mol-plugin-state/manager/interactivity");
const loci_label_1 = require("../mol-plugin-state/manager/loci-label");
const snapshots_1 = require("../mol-plugin-state/manager/snapshots");
const component_1 = require("../mol-plugin-state/manager/structure/component");
const focus_1 = require("../mol-plugin-state/manager/structure/focus");
const hierarchy_1 = require("../mol-plugin-state/manager/structure/hierarchy");
const measurement_1 = require("../mol-plugin-state/manager/structure/measurement");
const selection_1 = require("../mol-plugin-state/manager/structure/selection");
const hierarchy_2 = require("../mol-plugin-state/manager/volume/hierarchy");
const layout_1 = require("./layout");
const representation_1 = require("../mol-repr/representation");
const registry_2 = require("../mol-repr/structure/registry");
const registry_3 = require("../mol-repr/volume/registry");
const mol_state_1 = require("../mol-state");
const mol_task_1 = require("../mol-task");
const color_1 = require("../mol-theme/color");
const size_1 = require("../mol-theme/size");
const assets_1 = require("../mol-util/assets");
const color_2 = require("../mol-util/color");
const data_source_1 = require("../mol-util/data-source");
const debug_1 = require("../mol-util/debug");
const input_observer_1 = require("../mol-util/input/input-observer");
const log_entry_1 = require("../mol-util/log-entry");
const object_1 = require("../mol-util/object");
const rx_event_helper_1 = require("../mol-util/rx-event-helper");
const animation_loop_1 = require("./animation-loop");
const behavior_1 = require("./behavior");
const behavior_2 = require("./behavior/behavior");
const command_1 = require("./command");
const commands_1 = require("./commands");
const config_1 = require("./config");
const state_1 = require("./state");
const substructure_parent_helper_1 = require("./util/substructure-parent-helper");
const task_manager_1 = require("./util/task-manager");
const toast_1 = require("./util/toast");
const viewport_screenshot_1 = require("./util/viewport-screenshot");
const version_1 = require("./version");
const constants_1 = require("../mol-model/structure/structure/carbohydrates/constants");
const drag_and_drop_1 = require("../mol-plugin-state/manager/drag-and-drop");
const error_context_1 = require("../mol-util/error-context");
class PluginContext {
    get isInitialized() {
        return this._isInitialized;
    }
    build() {
        return this.state.data.build();
    }
    initContainer(options) {
        var _a;
        if (this.canvasContainer)
            return true;
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            '-webkit-user-select': 'none',
            'user-select': 'none',
            '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
            '-webkit-touch-callout': 'none',
            'touch-action': 'manipulation',
        });
        let canvas = (_a = options === null || options === void 0 ? void 0 : options.canvas3dContext) === null || _a === void 0 ? void 0 : _a.canvas;
        if (!canvas) {
            canvas = document.createElement('canvas');
            if (options === null || options === void 0 ? void 0 : options.checkeredCanvasBackground) {
                Object.assign(canvas.style, {
                    'background-image': 'linear-gradient(45deg, lightgrey 25%, transparent 25%, transparent 75%, lightgrey 75%, lightgrey), linear-gradient(45deg, lightgrey 25%, transparent 25%, transparent 75%, lightgrey 75%, lightgrey)',
                    'background-size': '60px 60px',
                    'background-position': '0 0, 30px 30px'
                });
            }
            container.appendChild(canvas);
        }
        if (!this.initViewer(canvas, container, options === null || options === void 0 ? void 0 : options.canvas3dContext)) {
            return false;
        }
        this.canvasContainer = container;
        return true;
    }
    /**
     * Mount the plugin into the target element (assumes the target has "relative"-like positioninig).
     * If initContainer wasn't called separately before, initOptions will be passed to it.
     */
    mount(target, initOptions) {
        var _a;
        if (this.disposed)
            throw new Error('Cannot mount a disposed context');
        if (!this.initContainer(initOptions))
            return false;
        if (this.canvasContainer.parentElement !== target) {
            (_a = this.canvasContainer.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this.canvasContainer);
        }
        target.appendChild(this.canvasContainer);
        this.handleResize();
        return true;
    }
    unmount() {
        var _a, _b;
        (_b = (_a = this.canvasContainer) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.removeChild(this.canvasContainer);
    }
    initViewer(canvas, container, canvas3dContext) {
        var _a, _b, _c, _d, _e, _f;
        try {
            this.layout.setRoot(container);
            if (this.spec.layout && this.spec.layout.initial)
                this.layout.setProps(this.spec.layout.initial);
            if (!canvas3dContext) {
                canvas3dContext = canvas3d_1.Canvas3DContext.fromCanvas(canvas, this.managers.asset, {
                    antialias: !((_a = this.config.get(config_1.PluginConfig.General.DisableAntialiasing)) !== null && _a !== void 0 ? _a : false),
                    preserveDrawingBuffer: !((_b = this.config.get(config_1.PluginConfig.General.DisablePreserveDrawingBuffer)) !== null && _b !== void 0 ? _b : false),
                    preferWebGl1: this.config.get(config_1.PluginConfig.General.PreferWebGl1) || false,
                    failIfMajorPerformanceCaveat: !((_c = this.config.get(config_1.PluginConfig.General.AllowMajorPerformanceCaveat)) !== null && _c !== void 0 ? _c : false),
                    powerPreference: this.config.get(config_1.PluginConfig.General.PowerPreference) || 'high-performance',
                    handleResize: this.handleResize,
                }, {
                    pixelScale: this.config.get(config_1.PluginConfig.General.PixelScale) || 1,
                    pickScale: this.config.get(config_1.PluginConfig.General.PickScale) || 0.25,
                    transparency: this.config.get(config_1.PluginConfig.General.Transparency) || 'wboit',
                    resolutionMode: this.config.get(config_1.PluginConfig.General.ResolutionMode) || 'auto',
                });
            }
            this.canvas3dContext = canvas3dContext;
            this.canvas3d = canvas3d_1.Canvas3D.create(this.canvas3dContext);
            this.canvas3dInit.next(true);
            let props = this.spec.canvas3d;
            const backgroundColor = (0, color_2.Color)(0xFCFBF9);
            if (!props) {
                (_d = this.canvas3d) === null || _d === void 0 ? void 0 : _d.setProps({ renderer: { backgroundColor } });
            }
            else {
                if (((_e = props.renderer) === null || _e === void 0 ? void 0 : _e.backgroundColor) === void 0) {
                    props = (0, immer_1.produce)(props, p => {
                        if (p.renderer)
                            p.renderer.backgroundColor = backgroundColor;
                        else
                            p.renderer = { backgroundColor };
                    });
                }
                (_f = this.canvas3d) === null || _f === void 0 ? void 0 : _f.setProps(props);
            }
            this.animationLoop.start();
            this.helpers.viewportScreenshot = new viewport_screenshot_1.ViewportScreenshotHelper(this);
            this.subs.push(this.canvas3d.interaction.click.subscribe(e => this.behaviors.interaction.click.next(e)));
            this.subs.push(this.canvas3d.interaction.drag.subscribe(e => this.behaviors.interaction.drag.next(e)));
            this.subs.push(this.canvas3d.interaction.hover.subscribe(e => this.behaviors.interaction.hover.next(e)));
            this.subs.push(this.canvas3d.input.resize.pipe((0, operators_1.debounceTime)(50), (0, operators_1.throttleTime)(100, undefined, { leading: false, trailing: true })).subscribe(() => this.handleResize()));
            this.subs.push(this.canvas3d.input.keyDown.subscribe(e => this.behaviors.interaction.key.next(e)));
            this.subs.push(this.canvas3d.input.keyUp.subscribe(e => this.behaviors.interaction.keyReleased.next(e)));
            this.subs.push(this.layout.events.updated.subscribe(() => requestAnimationFrame(() => this.handleResize())));
            this.handleResize();
            mol_task_1.Scheduler.setImmediate(() => this.initCanvas3dPromiseCallbacks[0]());
            return true;
        }
        catch (e) {
            this.log.error('' + e);
            console.error(e);
            mol_task_1.Scheduler.setImmediate(() => this.initCanvas3dPromiseCallbacks[1](e));
            return false;
        }
    }
    /** return true is animating or updating */
    get isBusy() {
        return this.behaviors.state.isAnimating.value || this.behaviors.state.isUpdating.value;
    }
    get selectionMode() {
        return this.behaviors.interaction.selectionMode.value;
    }
    set selectionMode(mode) {
        this.behaviors.interaction.selectionMode.next(mode);
    }
    dataTransaction(f, options) {
        return this.runTask(this.state.data.transaction(f, options));
    }
    clear(resetViewportSettings = false) {
        var _a;
        if (resetViewportSettings)
            (_a = this.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps(canvas3d_1.DefaultCanvas3DParams);
        return commands_1.PluginCommands.State.RemoveObject(this, { state: this.state.data, ref: mol_state_1.StateTransform.RootRef });
    }
    dispose(options) {
        var _a, _b;
        if (this.disposed)
            return;
        for (const s of this.subs) {
            s.unsubscribe();
        }
        this.subs = [];
        this.animationLoop.stop();
        this.commands.dispose();
        (_a = this.canvas3d) === null || _a === void 0 ? void 0 : _a.dispose();
        if (!(options === null || options === void 0 ? void 0 : options.doNotDisposeCanvas3DContext)) {
            (_b = this.canvas3dContext) === null || _b === void 0 ? void 0 : _b.dispose(options);
        }
        this.ev.dispose();
        this.state.dispose();
        this.helpers.substructureParent.dispose();
        (0, object_1.objectForEach)(this.managers, m => { var _a; return (_a = m === null || m === void 0 ? void 0 : m.dispose) === null || _a === void 0 ? void 0 : _a.call(m); });
        (0, object_1.objectForEach)(this.managers.structure, m => { var _a; return (_a = m === null || m === void 0 ? void 0 : m.dispose) === null || _a === void 0 ? void 0 : _a.call(m); });
        (0, object_1.objectForEach)(this.managers.volume, m => { var _a; return (_a = m === null || m === void 0 ? void 0 : m.dispose) === null || _a === void 0 ? void 0 : _a.call(m); });
        this.unmount();
        this.canvasContainer = undefined;
        this.customState = {};
        this.disposed = true;
    }
    initBehaviorEvents() {
        this.subs.push((0, rxjs_1.merge)(this.state.data.behaviors.isUpdating, this.state.behaviors.behaviors.isUpdating).subscribe(u => {
            if (this.behaviors.state.isUpdating.value !== u)
                this.behaviors.state.isUpdating.next(u);
        }));
        const timeoutMs = this.config.get(config_1.PluginConfig.General.IsBusyTimeoutMs) || 750;
        const isBusy = this.behaviors.state.isBusy;
        let timeout = void 0;
        const setBusy = () => {
            if (!isBusy.value)
                isBusy.next(true);
        };
        const reset = () => {
            if (timeout !== void 0)
                clearTimeout(timeout);
            timeout = void 0;
        };
        this.subs.push((0, rxjs_1.merge)(this.behaviors.state.isUpdating, this.behaviors.state.isAnimating).subscribe(v => {
            const isUpdating = this.behaviors.state.isUpdating.value;
            const isAnimating = this.behaviors.state.isAnimating.value;
            if (isUpdating || isAnimating) {
                if (!isBusy.value) {
                    reset();
                    timeout = setTimeout(setBusy, timeoutMs);
                }
            }
            else {
                reset();
                isBusy.next(false);
            }
        }));
        this.subs.push(this.behaviors.interaction.selectionMode.subscribe(v => {
            var _a;
            if (!v) {
                (_a = this.managers.interactivity) === null || _a === void 0 ? void 0 : _a.lociSelects.deselectAll();
            }
        }));
    }
    initBuiltInBehavior() {
        behavior_1.BuiltInPluginBehaviors.State.registerDefault(this);
        behavior_1.BuiltInPluginBehaviors.Representation.registerDefault(this);
        behavior_1.BuiltInPluginBehaviors.Camera.registerDefault(this);
        behavior_1.BuiltInPluginBehaviors.Misc.registerDefault(this);
        this.subs.push((0, rxjs_1.merge)(this.state.data.events.log, this.state.behaviors.events.log).subscribe(e => this.events.log.next(e)));
    }
    async initBehaviors() {
        let tree = this.state.behaviors.build();
        for (const cat of Object.keys(behavior_2.PluginBehavior.Categories)) {
            tree.toRoot().apply(behavior_2.PluginBehavior.CreateCategory, { label: behavior_2.PluginBehavior.Categories[cat] }, { ref: cat, state: { isLocked: true } });
        }
        // Init custom properties 1st
        for (const b of this.spec.behaviors) {
            const cat = behavior_2.PluginBehavior.getCategoryId(b.transformer);
            if (cat !== 'custom-props')
                continue;
            tree.to(behavior_2.PluginBehavior.getCategoryId(b.transformer)).apply(b.transformer, b.defaultParams, { ref: b.transformer.id });
        }
        await this.runTask(this.state.behaviors.updateTree(tree, { doNotUpdateCurrent: true, doNotLogTiming: true }));
        tree = this.state.behaviors.build();
        for (const b of this.spec.behaviors) {
            const cat = behavior_2.PluginBehavior.getCategoryId(b.transformer);
            if (cat === 'custom-props')
                continue;
            tree.to(behavior_2.PluginBehavior.getCategoryId(b.transformer)).apply(b.transformer, b.defaultParams, { ref: b.transformer.id });
        }
        await this.runTask(this.state.behaviors.updateTree(tree, { doNotUpdateCurrent: true, doNotLogTiming: true }));
    }
    initCustomFormats() {
        if (!this.spec.customFormats)
            return;
        for (const f of this.spec.customFormats) {
            this.dataFormats.add(f[0], f[1]);
        }
    }
    initAnimations() {
        if (!this.spec.animations)
            return;
        for (const anim of this.spec.animations) {
            this.managers.animation.register(anim);
        }
    }
    initDataActions() {
        if (!this.spec.actions)
            return;
        for (const a of this.spec.actions) {
            this.state.data.actions.add(a.action);
        }
    }
    async init() {
        try {
            this.subs.push(this.events.log.subscribe(e => this.log.entries = this.log.entries.push(e)));
            this.initCustomFormats();
            this.initBehaviorEvents();
            this.initBuiltInBehavior();
            this.managers.interactivity = new interactivity_1.InteractivityManager(this);
            this.managers.lociLabels = new loci_label_1.LociLabelManager(this);
            this.builders.structure = new structure_1.StructureBuilder(this);
            this.initAnimations();
            this.initDataActions();
            await this.initBehaviors();
            this.log.message(`Mol* Plugin ${version_1.PLUGIN_VERSION} [${version_1.PLUGIN_VERSION_DATE.toLocaleString()}]`);
            if (!debug_1.isProductionMode)
                this.log.message(`Development mode enabled`);
            if (debug_1.isDebugMode)
                this.log.message(`Debug mode enabled`);
            this._isInitialized = true;
            this.initializedPromiseCallbacks[0]();
        }
        catch (err) {
            this.initializedPromiseCallbacks[1](err);
            throw err;
        }
    }
    constructor(spec) {
        var _a;
        this.spec = spec;
        this.runTask = (task, params) => this.managers.task.run(task, params);
        this.resolveTask = (object) => {
            if (!object)
                return void 0;
            if (mol_task_1.Task.is(object))
                return this.runTask(object);
            return object;
        };
        this.subs = [];
        this.initCanvas3dPromiseCallbacks = [() => { }, () => { }];
        this._isInitialized = false;
        this.initializedPromiseCallbacks = [() => { }, () => { }];
        this.disposed = false;
        this.canvasContainer = void 0;
        this.ev = rx_event_helper_1.RxEventHelper.create();
        this.config = new config_1.PluginConfigManager(this.spec.config); // needed to init state
        this.state = new state_1.PluginState(this);
        this.commands = new command_1.PluginCommandManager();
        this.canvas3dInit = this.ev.behavior(false);
        this.behaviors = {
            state: {
                isAnimating: this.ev.behavior(false),
                isUpdating: this.ev.behavior(false),
                // TODO: should there be separate "updated" event?
                //   Often, this is used to indicate that the state has updated
                //   and it might not be the best way to react to state updates.
                isBusy: this.ev.behavior(false)
            },
            interaction: {
                hover: this.ev.behavior({ current: representation_1.Representation.Loci.Empty, modifiers: input_observer_1.ModifiersKeys.None, buttons: 0, button: 0 }),
                click: this.ev.behavior({ current: representation_1.Representation.Loci.Empty, modifiers: input_observer_1.ModifiersKeys.None, buttons: 0, button: 0 }),
                drag: this.ev.behavior({ current: representation_1.Representation.Loci.Empty, modifiers: input_observer_1.ModifiersKeys.None, buttons: 0, button: 0, pageStart: (0, linear_algebra_1.Vec2)(), pageEnd: (0, linear_algebra_1.Vec2)() }),
                key: this.ev.behavior(input_observer_1.EmptyKeyInput),
                keyReleased: this.ev.behavior(input_observer_1.EmptyKeyInput),
                selectionMode: this.ev.behavior(false),
            },
            labels: {
                highlight: this.ev.behavior({ labels: [] })
            },
            layout: {
                leftPanelTabName: this.ev.behavior('root')
            },
            canvas3d: {
                // TODO: remove in 4.0?
                initialized: this.canvas3dInit.pipe((0, operators_1.filter)(v => !!v), (0, operators_1.take)(1))
            }
        };
        this.canvas3dInitialized = new Promise((res, rej) => {
            this.initCanvas3dPromiseCallbacks = [res, rej];
        });
        this.initialized = new Promise((res, rej) => {
            this.initializedPromiseCallbacks = [res, rej];
        });
        this.layout = new layout_1.PluginLayout(this);
        this.animationLoop = new animation_loop_1.PluginAnimationLoop(this);
        this.representation = {
            structure: {
                registry: new registry_2.StructureRepresentationRegistry(),
                themes: { colorThemeRegistry: color_1.ColorTheme.createRegistry(), sizeThemeRegistry: size_1.SizeTheme.createRegistry() },
            },
            volume: {
                registry: new registry_3.VolumeRepresentationRegistry(),
                themes: { colorThemeRegistry: color_1.ColorTheme.createRegistry(), sizeThemeRegistry: size_1.SizeTheme.createRegistry() }
            }
        };
        this.query = {
            structure: {
                registry: new structure_selection_query_1.StructureSelectionQueryRegistry()
            }
        };
        this.dataFormats = new registry_1.DataFormatRegistry();
        this.builders = {
            data: new data_1.DataBuilder(this),
            structure: void 0
        };
        this.helpers = {
            substructureParent: new substructure_parent_helper_1.SubstructureParentHelper(this),
            viewportScreenshot: void 0
        };
        this.managers = {
            structure: {
                hierarchy: new hierarchy_1.StructureHierarchyManager(this),
                component: new component_1.StructureComponentManager(this),
                measurement: new measurement_1.StructureMeasurementManager(this),
                selection: new selection_1.StructureSelectionManager(this),
                focus: new focus_1.StructureFocusManager(this),
            },
            volume: {
                hierarchy: new hierarchy_2.VolumeHierarchyManager(this)
            },
            interactivity: void 0,
            camera: new camera_1.CameraManager(this),
            animation: new animation_1.PluginAnimationManager(this),
            snapshot: new snapshots_1.PluginStateSnapshotManager(this),
            lociLabels: void 0,
            toast: new toast_1.PluginToastManager(this),
            asset: new assets_1.AssetManager(),
            task: new task_manager_1.TaskManager(),
            dragAndDrop: new drag_and_drop_1.DragAndDropManager(this),
        };
        this.events = {
            log: this.ev(),
            task: this.managers.task.events,
            canvas3d: {
                settingsUpdated: this.ev(),
            }
        };
        this.customModelProperties = new custom_property_1.CustomProperty.Registry();
        this.customStructureProperties = new custom_property_1.CustomProperty.Registry();
        this.customStructureControls = new Map();
        this.customImportControls = new Map();
        this.genericRepresentationControls = new Map();
        /**
         * A helper for collecting and notifying errors
         * in async contexts such as custom properties.
         *
         * Individual extensions are responsible for using this
         * context and displaying the errors in appropriate ways.
         */
        this.errorContext = new error_context_1.ErrorContext();
        /**
         * Used to store application specific custom state which is then available
         * to State Actions and similar constructs via the PluginContext.
         */
        this.customState = Object.create(null);
        this.handleResize = () => {
            var _a, _b;
            const canvas = (_a = this.canvas3dContext) === null || _a === void 0 ? void 0 : _a.canvas;
            const container = this.layout.root;
            if (container && canvas) {
                (0, util_1.resizeCanvas)(canvas, container, this.canvas3dContext.pixelScale);
                this.canvas3dContext.syncPixelScale();
                (_b = this.canvas3d) === null || _b === void 0 ? void 0 : _b.requestResize();
            }
        };
        this.log = {
            entries: (0, immutable_1.List)(),
            entry: (e) => this.events.log.next(e),
            error: (msg) => this.events.log.next(log_entry_1.LogEntry.error(msg)),
            message: (msg) => this.events.log.next(log_entry_1.LogEntry.message(msg)),
            info: (msg) => this.events.log.next(log_entry_1.LogEntry.info(msg)),
            warn: (msg) => this.events.log.next(log_entry_1.LogEntry.warning(msg)),
        };
        /**
         * This should be used in all transform related request so that it could be "spoofed" to allow
         * "static" access to resources.
         */
        this.fetch = data_source_1.ajaxGet;
        // the reason for this is that sometimes, transform params get modified inline (i.e. palette.valueLabel)
        // and freezing the params object causes "read-only exception"
        // TODO: is this the best place to do it?
        (0, immer_1.setAutoFreeze)(false);
        (0, constants_1.setSaccharideCompIdMapType)((_a = this.config.get(config_1.PluginConfig.Structure.SaccharideCompIdMapType)) !== null && _a !== void 0 ? _a : 'default');
    }
}
exports.PluginContext = PluginContext;
