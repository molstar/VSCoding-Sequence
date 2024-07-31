/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginContext } from '../../mol-plugin/context';
export type PluginDragAndDropHandler = (files: File[], plugin: PluginContext) => Promise<boolean> | boolean;
export declare class DragAndDropManager {
    plugin: PluginContext;
    private handlers;
    addHandler(name: string, handler: PluginDragAndDropHandler): void;
    removeHandler(name: string): void;
    handle(files: File[]): Promise<void>;
    dispose(): void;
    constructor(plugin: PluginContext);
}
