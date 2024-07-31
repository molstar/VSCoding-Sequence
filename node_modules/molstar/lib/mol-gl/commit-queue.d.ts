/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { GraphicsRenderObject } from './render-object';
export declare class CommitQueue {
    private removeList;
    private removeMap;
    private addList;
    private addMap;
    get isEmpty(): boolean;
    get size(): number;
    add(o: GraphicsRenderObject): void;
    remove(o: GraphicsRenderObject): void;
    tryGetRemove(): GraphicsRenderObject<import("./render-object").RenderObjectType> | undefined;
    tryGetAdd(): GraphicsRenderObject<import("./render-object").RenderObjectType> | undefined;
}
