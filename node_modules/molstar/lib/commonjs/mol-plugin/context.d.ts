/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { List } from 'immutable';
import { Subscription } from 'rxjs';
import { Canvas3D, Canvas3DContext } from '../mol-canvas3d/canvas3d';
import { CustomProperty } from '../mol-model-props/common/custom-property';
import { Model, Structure } from '../mol-model/structure';
import { DataBuilder } from '../mol-plugin-state/builder/data';
import { StructureBuilder } from '../mol-plugin-state/builder/structure';
import { DataFormatRegistry } from '../mol-plugin-state/formats/registry';
import { StructureSelectionQueryRegistry } from '../mol-plugin-state/helpers/structure-selection-query';
import { PluginAnimationManager } from '../mol-plugin-state/manager/animation';
import { CameraManager } from '../mol-plugin-state/manager/camera';
import { InteractivityManager } from '../mol-plugin-state/manager/interactivity';
import { LociLabel, LociLabelManager } from '../mol-plugin-state/manager/loci-label';
import { PluginStateSnapshotManager } from '../mol-plugin-state/manager/snapshots';
import { StructureComponentManager } from '../mol-plugin-state/manager/structure/component';
import { StructureFocusManager } from '../mol-plugin-state/manager/structure/focus';
import { StructureHierarchyManager } from '../mol-plugin-state/manager/structure/hierarchy';
import { StructureHierarchyRef } from '../mol-plugin-state/manager/structure/hierarchy-state';
import { StructureMeasurementManager } from '../mol-plugin-state/manager/structure/measurement';
import { StructureSelectionManager } from '../mol-plugin-state/manager/structure/selection';
import { VolumeHierarchyManager } from '../mol-plugin-state/manager/volume/hierarchy';
import { LeftPanelTabName, PluginLayout } from './layout';
import { StructureRepresentationRegistry } from '../mol-repr/structure/registry';
import { VolumeRepresentationRegistry } from '../mol-repr/volume/registry';
import { RuntimeContext, Task } from '../mol-task';
import { ThemeRegistryContext } from '../mol-theme/theme';
import { AssetManager } from '../mol-util/assets';
import { ajaxGet } from '../mol-util/data-source';
import { KeyInput } from '../mol-util/input/input-observer';
import { LogEntry } from '../mol-util/log-entry';
import { PluginAnimationLoop } from './animation-loop';
import { PluginCommandManager } from './command';
import { PluginConfigManager } from './config';
import { PluginSpec } from './spec';
import { PluginState } from './state';
import { SubstructureParentHelper } from './util/substructure-parent-helper';
import { TaskManager } from './util/task-manager';
import { PluginToastManager } from './util/toast';
import { ViewportScreenshotHelper } from './util/viewport-screenshot';
import { DragAndDropManager } from '../mol-plugin-state/manager/drag-and-drop';
import { ErrorContext } from '../mol-util/error-context';
export type PluginInitializedState = {
    kind: 'no';
} | {
    kind: 'yes';
} | {
    kind: 'error';
    error: any;
};
export declare class PluginContext {
    spec: PluginSpec;
    runTask: <T>(task: Task<T>, params?: {
        useOverlay?: boolean;
    }) => Promise<T>;
    resolveTask: <T>(object: Task<T> | T | undefined) => NonNullable<T> | Promise<T> | undefined;
    protected subs: Subscription[];
    private initCanvas3dPromiseCallbacks;
    private _isInitialized;
    private initializedPromiseCallbacks;
    private disposed;
    private canvasContainer;
    private ev;
    readonly config: PluginConfigManager;
    readonly state: PluginState;
    readonly commands: PluginCommandManager;
    private canvas3dInit;
    readonly behaviors: {
        readonly state: {
            readonly isAnimating: import("rxjs").BehaviorSubject<boolean>;
            readonly isUpdating: import("rxjs").BehaviorSubject<boolean>;
            readonly isBusy: import("rxjs").BehaviorSubject<boolean>;
        };
        readonly interaction: {
            readonly hover: import("rxjs").BehaviorSubject<InteractivityManager.HoverEvent>;
            readonly click: import("rxjs").BehaviorSubject<InteractivityManager.ClickEvent>;
            readonly drag: import("rxjs").BehaviorSubject<InteractivityManager.DragEvent>;
            readonly key: import("rxjs").BehaviorSubject<KeyInput>;
            readonly keyReleased: import("rxjs").BehaviorSubject<KeyInput>;
            readonly selectionMode: import("rxjs").BehaviorSubject<boolean>;
        };
        readonly labels: {
            readonly highlight: import("rxjs").BehaviorSubject<{
                labels: ReadonlyArray<LociLabel>;
            }>;
        };
        readonly layout: {
            readonly leftPanelTabName: import("rxjs").BehaviorSubject<LeftPanelTabName>;
        };
        readonly canvas3d: {
            readonly initialized: import("rxjs").Observable<boolean>;
        };
    };
    readonly canvas3dInitialized: Promise<void>;
    readonly initialized: Promise<void>;
    get isInitialized(): boolean;
    readonly canvas3dContext: Canvas3DContext | undefined;
    readonly canvas3d: Canvas3D | undefined;
    readonly layout: PluginLayout;
    readonly animationLoop: PluginAnimationLoop;
    readonly representation: {
        readonly structure: {
            readonly registry: StructureRepresentationRegistry;
            readonly themes: ThemeRegistryContext;
        };
        readonly volume: {
            readonly registry: VolumeRepresentationRegistry;
            readonly themes: ThemeRegistryContext;
        };
    };
    readonly query: {
        readonly structure: {
            readonly registry: StructureSelectionQueryRegistry;
        };
    };
    readonly dataFormats: DataFormatRegistry;
    readonly builders: {
        data: DataBuilder;
        structure: StructureBuilder;
    };
    build(): import("../mol-state").StateBuilder.Root;
    readonly helpers: {
        readonly substructureParent: SubstructureParentHelper;
        readonly viewportScreenshot: ViewportScreenshotHelper | undefined;
    };
    readonly managers: {
        readonly structure: {
            readonly hierarchy: StructureHierarchyManager;
            readonly component: StructureComponentManager;
            readonly measurement: StructureMeasurementManager;
            readonly selection: StructureSelectionManager;
            readonly focus: StructureFocusManager;
        };
        readonly volume: {
            readonly hierarchy: VolumeHierarchyManager;
        };
        readonly interactivity: InteractivityManager;
        readonly camera: CameraManager;
        readonly animation: PluginAnimationManager;
        readonly snapshot: PluginStateSnapshotManager;
        readonly lociLabels: LociLabelManager;
        readonly toast: PluginToastManager;
        readonly asset: AssetManager;
        readonly task: TaskManager;
        readonly dragAndDrop: DragAndDropManager;
    };
    readonly events: {
        readonly log: import("rxjs").Subject<LogEntry>;
        readonly task: {
            progress: import("rxjs").Subject<TaskManager.ProgressEvent>;
            finished: import("rxjs").Subject<{
                id: number;
            }>;
        };
        readonly canvas3d: {
            readonly settingsUpdated: import("rxjs").Subject<unknown>;
        };
    };
    readonly customModelProperties: CustomProperty.Registry<Model>;
    readonly customStructureProperties: CustomProperty.Registry<Structure>;
    readonly customStructureControls: Map<string, new () => any>;
    readonly customImportControls: Map<string, new () => any>;
    readonly genericRepresentationControls: Map<string, (selection: StructureHierarchyManager["selection"]) => [StructureHierarchyRef[], string]>;
    /**
     * A helper for collecting and notifying errors
     * in async contexts such as custom properties.
     *
     * Individual extensions are responsible for using this
     * context and displaying the errors in appropriate ways.
     */
    readonly errorContext: ErrorContext;
    /**
     * Used to store application specific custom state which is then available
     * to State Actions and similar constructs via the PluginContext.
     */
    readonly customState: unknown;
    initContainer(options?: {
        canvas3dContext?: Canvas3DContext;
        checkeredCanvasBackground?: boolean;
    }): boolean;
    /**
     * Mount the plugin into the target element (assumes the target has "relative"-like positioninig).
     * If initContainer wasn't called separately before, initOptions will be passed to it.
     */
    mount(target: HTMLElement, initOptions?: {
        canvas3dContext?: Canvas3DContext;
        checkeredCanvasBackground?: boolean;
    }): boolean;
    unmount(): void;
    initViewer(canvas: HTMLCanvasElement, container: HTMLDivElement, canvas3dContext?: Canvas3DContext): boolean;
    handleResize: () => void;
    readonly log: {
        entries: List<LogEntry>;
        entry: (e: LogEntry) => void;
        error: (msg: string) => void;
        message: (msg: string) => void;
        info: (msg: string) => void;
        warn: (msg: string) => void;
    };
    /**
     * This should be used in all transform related request so that it could be "spoofed" to allow
     * "static" access to resources.
     */
    readonly fetch: typeof ajaxGet;
    /** return true is animating or updating */
    get isBusy(): boolean;
    get selectionMode(): boolean;
    set selectionMode(mode: boolean);
    dataTransaction(f: (ctx: RuntimeContext) => Promise<void> | void, options?: {
        canUndo?: string | boolean;
        rethrowErrors?: boolean;
    }): Promise<void>;
    clear(resetViewportSettings?: boolean): Promise<void>;
    dispose(options?: {
        doNotForceWebGLContextLoss?: boolean;
        doNotDisposeCanvas3DContext?: boolean;
    }): void;
    private initBehaviorEvents;
    private initBuiltInBehavior;
    private initBehaviors;
    private initCustomFormats;
    private initAnimations;
    private initDataActions;
    init(): Promise<void>;
    constructor(spec: PluginSpec);
}
