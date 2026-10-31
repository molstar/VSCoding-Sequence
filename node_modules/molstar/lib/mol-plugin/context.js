/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { produce, setAutoFreeze } from 'immer';
import { List } from 'immutable';
import { merge } from 'rxjs';
import { debounceTime, filter, take, throttleTime } from 'rxjs/operators';
import { Canvas3D, Canvas3DContext, DefaultCanvas3DParams } from '../mol-canvas3d/canvas3d';
import { resizeCanvas } from '../mol-canvas3d/util';
import { Vec2 } from '../mol-math/linear-algebra';
import { CustomProperty } from '../mol-model-props/common/custom-property';
import { DataBuilder } from '../mol-plugin-state/builder/data';
import { StructureBuilder } from '../mol-plugin-state/builder/structure';
import { DataFormatRegistry } from '../mol-plugin-state/formats/registry';
import { StructureSelectionQueryRegistry } from '../mol-plugin-state/helpers/structure-selection-query';
import { PluginAnimationManager } from '../mol-plugin-state/manager/animation';
import { CameraManager } from '../mol-plugin-state/manager/camera';
import { InteractivityManager } from '../mol-plugin-state/manager/interactivity';
import { LociLabelManager } from '../mol-plugin-state/manager/loci-label';
import { PluginStateSnapshotManager } from '../mol-plugin-state/manager/snapshots';
import { StructureComponentManager } from '../mol-plugin-state/manager/structure/component';
import { StructureFocusManager } from '../mol-plugin-state/manager/structure/focus';
import { StructureHierarchyManager } from '../mol-plugin-state/manager/structure/hierarchy';
import { StructureMeasurementManager } from '../mol-plugin-state/manager/structure/measurement';
import { StructureSelectionManager } from '../mol-plugin-state/manager/structure/selection';
import { VolumeHierarchyManager } from '../mol-plugin-state/manager/volume/hierarchy';
import { PluginLayout } from './layout';
import { Representation } from '../mol-repr/representation';
import { StructureRepresentationRegistry } from '../mol-repr/structure/registry';
import { VolumeRepresentationRegistry } from '../mol-repr/volume/registry';
import { StateTransform } from '../mol-state';
import { Scheduler, Task } from '../mol-task';
import { ColorTheme } from '../mol-theme/color';
import { SizeTheme } from '../mol-theme/size';
import { AssetManager } from '../mol-util/assets';
import { Color } from '../mol-util/color';
import { ajaxGet } from '../mol-util/data-source';
import { isDebugMode, isProductionMode } from '../mol-util/debug';
import { EmptyKeyInput, ModifiersKeys } from '../mol-util/input/input-observer';
import { LogEntry } from '../mol-util/log-entry';
import { objectForEach } from '../mol-util/object';
import { RxEventHelper } from '../mol-util/rx-event-helper';
import { PluginAnimationLoop } from './animation-loop';
import { BuiltInPluginBehaviors } from './behavior';
import { PluginBehavior } from './behavior/behavior';
import { PluginCommandManager } from './command';
import { PluginCommands } from './commands';
import { PluginConfig, PluginConfigManager } from './config';
import { PluginState } from './state';
import { SubstructureParentHelper } from './util/substructure-parent-helper';
import { TaskManager } from './util/task-manager';
import { PluginToastManager } from './util/toast';
import { ViewportScreenshotHelper } from './util/viewport-screenshot';
import { PLUGIN_VERSION, PLUGIN_VERSION_DATE } from './version';
import { setSaccharideCompIdMapType } from '../mol-model/structure/structure/carbohydrates/constants';
import { DragAndDropManager } from '../mol-plugin-state/manager/drag-and-drop';
import { ErrorContext } from '../mol-util/error-context';
export class PluginContext {
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
                canvas3dContext = Canvas3DContext.fromCanvas(canvas, this.managers.asset, {
                    antialias: !((_a = this.config.get(PluginConfig.General.DisableAntialiasing)) !== null && _a !== void 0 ? _a : false),
                    preserveDrawingBuffer: !((_b = this.config.get(PluginConfig.General.DisablePreserveDrawingBuffer)) !== null && _b !== void 0 ? _b : false),
                    preferWebGl1: this.config.get(PluginConfig.General.PreferWebGl1) || false,
                    failIfMajorPerformanceCaveat: !((_c = this.config.get(PluginConfig.General.AllowMajorPerformanceCaveat)) !== null && _c !== void 0 ? _c : false),
                    powerPreference: this.config.get(PluginConfig.General.PowerPreference) || 'high-performance',
                    handleResize: this.handleResize,
                }, {
                    pixelScale: this.config.get(PluginConfig.General.PixelScale) || 1,
                    pickScale: this.config.get(PluginConfig.General.PickScale) || 0.25,
                    transparency: this.config.get(PluginConfig.General.Transparency) || 'wboit',
                    resolutionMode: this.config.get(PluginConfig.General.ResolutionMode) || 'auto',
                });
            }
            this.canvas3dContext = canvas3dContext;
            this.canvas3d = Canvas3D.create(this.canvas3dContext);
            this.canvas3dInit.next(true);
            let props = this.spec.canvas3d;
            const backgroundColor = Color(0xFCFBF9);
            if (!props) {
                (_d = this.canvas3d) === null || _d === void 0 ? void 0 : _d.setProps({ renderer: { backgroundColor } });
            }
            else {
                if (((_e = props.renderer) === null || _e === void 0 ? void 0 : _e.backgroundColor) === void 0) {
                    props = produce(props, p => {
                        if (p.renderer)
                            p.renderer.backgroundColor = backgroundColor;
                        else
                            p.renderer = { backgroundColor };
                    });
                }
                (_f = this.canvas3d) === null || _f === void 0 ? void 0 : _f.setProps(props);
            }
            this.animationLoop.start();
            this.helpers.viewportScreenshot = new ViewportScreenshotHelper(this);
            this.subs.push(this.canvas3d.interaction.click.subscribe(e => this.behaviors.interaction.click.next(e)));
            this.subs.push(this.canvas3d.interaction.drag.subscribe(e => this.behaviors.interaction.drag.next(e)));
            this.subs.push(this.canvas3d.interaction.hover.subscribe(e => this.behaviors.interaction.hover.next(e)));
            this.subs.push(this.canvas3d.input.resize.pipe(debounceTime(50), throttleTime(100, undefined, { leading: false, trailing: true })).subscribe(() => this.handleResize()));
            this.subs.push(this.canvas3d.input.keyDown.subscribe(e => this.behaviors.interaction.key.next(e)));
            this.subs.push(this.canvas3d.input.keyUp.subscribe(e => this.behaviors.interaction.keyReleased.next(e)));
            this.subs.push(this.layout.events.updated.subscribe(() => requestAnimationFrame(() => this.handleResize())));
            this.handleResize();
            Scheduler.setImmediate(() => this.initCanvas3dPromiseCallbacks[0]());
            return true;
        }
        catch (e) {
            this.log.error('' + e);
            console.error(e);
            Scheduler.setImmediate(() => this.initCanvas3dPromiseCallbacks[1](e));
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
            (_a = this.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps(DefaultCanvas3DParams);
        return PluginCommands.State.RemoveObject(this, { state: this.state.data, ref: StateTransform.RootRef });
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
        objectForEach(this.managers, m => { var _a; return (_a = m === null || m === void 0 ? void 0 : m.dispose) === null || _a === void 0 ? void 0 : _a.call(m); });
        objectForEach(this.managers.structure, m => { var _a; return (_a = m === null || m === void 0 ? void 0 : m.dispose) === null || _a === void 0 ? void 0 : _a.call(m); });
        objectForEach(this.managers.volume, m => { var _a; return (_a = m === null || m === void 0 ? void 0 : m.dispose) === null || _a === void 0 ? void 0 : _a.call(m); });
        this.unmount();
        this.canvasContainer = undefined;
        this.customState = {};
        this.disposed = true;
    }
    initBehaviorEvents() {
        this.subs.push(merge(this.state.data.behaviors.isUpdating, this.state.behaviors.behaviors.isUpdating).subscribe(u => {
            if (this.behaviors.state.isUpdating.value !== u)
                this.behaviors.state.isUpdating.next(u);
        }));
        const timeoutMs = this.config.get(PluginConfig.General.IsBusyTimeoutMs) || 750;
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
        this.subs.push(merge(this.behaviors.state.isUpdating, this.behaviors.state.isAnimating).subscribe(v => {
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
        BuiltInPluginBehaviors.State.registerDefault(this);
        BuiltInPluginBehaviors.Representation.registerDefault(this);
        BuiltInPluginBehaviors.Camera.registerDefault(this);
        BuiltInPluginBehaviors.Misc.registerDefault(this);
        this.subs.push(merge(this.state.data.events.log, this.state.behaviors.events.log).subscribe(e => this.events.log.next(e)));
    }
    async initBehaviors() {
        let tree = this.state.behaviors.build();
        for (const cat of Object.keys(PluginBehavior.Categories)) {
            tree.toRoot().apply(PluginBehavior.CreateCategory, { label: PluginBehavior.Categories[cat] }, { ref: cat, state: { isLocked: true } });
        }
        // Init custom properties 1st
        for (const b of this.spec.behaviors) {
            const cat = PluginBehavior.getCategoryId(b.transformer);
            if (cat !== 'custom-props')
                continue;
            tree.to(PluginBehavior.getCategoryId(b.transformer)).apply(b.transformer, b.defaultParams, { ref: b.transformer.id });
        }
        await this.runTask(this.state.behaviors.updateTree(tree, { doNotUpdateCurrent: true, doNotLogTiming: true }));
        tree = this.state.behaviors.build();
        for (const b of this.spec.behaviors) {
            const cat = PluginBehavior.getCategoryId(b.transformer);
            if (cat === 'custom-props')
                continue;
            tree.to(PluginBehavior.getCategoryId(b.transformer)).apply(b.transformer, b.defaultParams, { ref: b.transformer.id });
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
            this.managers.interactivity = new InteractivityManager(this);
            this.managers.lociLabels = new LociLabelManager(this);
            this.builders.structure = new StructureBuilder(this);
            this.initAnimations();
            this.initDataActions();
            await this.initBehaviors();
            this.log.message(`Mol* Plugin ${PLUGIN_VERSION} [${PLUGIN_VERSION_DATE.toLocaleString()}]`);
            if (!isProductionMode)
                this.log.message(`Development mode enabled`);
            if (isDebugMode)
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
            if (Task.is(object))
                return this.runTask(object);
            return object;
        };
        this.subs = [];
        this.initCanvas3dPromiseCallbacks = [() => { }, () => { }];
        this._isInitialized = false;
        this.initializedPromiseCallbacks = [() => { }, () => { }];
        this.disposed = false;
        this.canvasContainer = void 0;
        this.ev = RxEventHelper.create();
        this.config = new PluginConfigManager(this.spec.config); // needed to init state
        this.state = new PluginState(this);
        this.commands = new PluginCommandManager();
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
                hover: this.ev.behavior({ current: Representation.Loci.Empty, modifiers: ModifiersKeys.None, buttons: 0, button: 0 }),
                click: this.ev.behavior({ current: Representation.Loci.Empty, modifiers: ModifiersKeys.None, buttons: 0, button: 0 }),
                drag: this.ev.behavior({ current: Representation.Loci.Empty, modifiers: ModifiersKeys.None, buttons: 0, button: 0, pageStart: Vec2(), pageEnd: Vec2() }),
                key: this.ev.behavior(EmptyKeyInput),
                keyReleased: this.ev.behavior(EmptyKeyInput),
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
                initialized: this.canvas3dInit.pipe(filter(v => !!v), take(1))
            }
        };
        this.canvas3dInitialized = new Promise((res, rej) => {
            this.initCanvas3dPromiseCallbacks = [res, rej];
        });
        this.initialized = new Promise((res, rej) => {
            this.initializedPromiseCallbacks = [res, rej];
        });
        this.layout = new PluginLayout(this);
        this.animationLoop = new PluginAnimationLoop(this);
        this.representation = {
            structure: {
                registry: new StructureRepresentationRegistry(),
                themes: { colorThemeRegistry: ColorTheme.createRegistry(), sizeThemeRegistry: SizeTheme.createRegistry() },
            },
            volume: {
                registry: new VolumeRepresentationRegistry(),
                themes: { colorThemeRegistry: ColorTheme.createRegistry(), sizeThemeRegistry: SizeTheme.createRegistry() }
            }
        };
        this.query = {
            structure: {
                registry: new StructureSelectionQueryRegistry()
            }
        };
        this.dataFormats = new DataFormatRegistry();
        this.builders = {
            data: new DataBuilder(this),
            structure: void 0
        };
        this.helpers = {
            substructureParent: new SubstructureParentHelper(this),
            viewportScreenshot: void 0
        };
        this.managers = {
            structure: {
                hierarchy: new StructureHierarchyManager(this),
                component: new StructureComponentManager(this),
                measurement: new StructureMeasurementManager(this),
                selection: new StructureSelectionManager(this),
                focus: new StructureFocusManager(this),
            },
            volume: {
                hierarchy: new VolumeHierarchyManager(this)
            },
            interactivity: void 0,
            camera: new CameraManager(this),
            animation: new PluginAnimationManager(this),
            snapshot: new PluginStateSnapshotManager(this),
            lociLabels: void 0,
            toast: new PluginToastManager(this),
            asset: new AssetManager(),
            task: new TaskManager(),
            dragAndDrop: new DragAndDropManager(this),
        };
        this.events = {
            log: this.ev(),
            task: this.managers.task.events,
            canvas3d: {
                settingsUpdated: this.ev(),
            }
        };
        this.customModelProperties = new CustomProperty.Registry();
        this.customStructureProperties = new CustomProperty.Registry();
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
        this.errorContext = new ErrorContext();
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
                resizeCanvas(canvas, container, this.canvas3dContext.pixelScale);
                this.canvas3dContext.syncPixelScale();
                (_b = this.canvas3d) === null || _b === void 0 ? void 0 : _b.requestResize();
            }
        };
        this.log = {
            entries: List(),
            entry: (e) => this.events.log.next(e),
            error: (msg) => this.events.log.next(LogEntry.error(msg)),
            message: (msg) => this.events.log.next(LogEntry.message(msg)),
            info: (msg) => this.events.log.next(LogEntry.info(msg)),
            warn: (msg) => this.events.log.next(LogEntry.warning(msg)),
        };
        /**
         * This should be used in all transform related request so that it could be "spoofed" to allow
         * "static" access to resources.
         */
        this.fetch = ajaxGet;
        // the reason for this is that sometimes, transform params get modified inline (i.e. palette.valueLabel)
        // and freezing the params object causes "read-only exception"
        // TODO: is this the best place to do it?
        setAutoFreeze(false);
        setSaccharideCompIdMapType((_a = this.config.get(PluginConfig.Structure.SaccharideCompIdMapType)) !== null && _a !== void 0 ? _a : 'default');
    }
}
