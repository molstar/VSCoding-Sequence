/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { RenderableState, Renderable } from './renderable';
import { WebGLContext } from './webgl/context';
import { DirectVolumeValues } from './renderable/direct-volume';
import { MeshValues } from './renderable/mesh';
import { PointsValues } from './renderable/points';
import { LinesValues } from './renderable/lines';
import { SpheresValues } from './renderable/spheres';
import { TextValues } from './renderable/text';
import { TextureMeshValues } from './renderable/texture-mesh';
import { ImageValues } from './renderable/image';
import { CylindersValues } from './renderable/cylinders';
import { Transparency } from './webgl/render-item';
export declare const getNextMaterialId: () => number;
export interface GraphicsRenderObject<T extends RenderObjectType = RenderObjectType> {
    readonly id: number;
    readonly type: T;
    readonly values: RenderObjectValues<T>;
    readonly state: RenderableState;
    readonly materialId: number;
}
export type RenderObjectType = 'mesh' | 'points' | 'spheres' | 'cylinders' | 'text' | 'lines' | 'direct-volume' | 'image' | 'texture-mesh';
export type RenderObjectValues<T extends RenderObjectType> = T extends 'mesh' ? MeshValues : T extends 'points' ? PointsValues : T extends 'spheres' ? SpheresValues : T extends 'cylinders' ? CylindersValues : T extends 'text' ? TextValues : T extends 'lines' ? LinesValues : T extends 'direct-volume' ? DirectVolumeValues : T extends 'image' ? ImageValues : T extends 'texture-mesh' ? TextureMeshValues : never;
export declare function createRenderObject<T extends RenderObjectType>(type: T, values: RenderObjectValues<T>, state: RenderableState, materialId: number): GraphicsRenderObject<T>;
export declare function createRenderable<T extends RenderObjectType>(ctx: WebGLContext, o: GraphicsRenderObject<T>, transparency: Transparency): Renderable<any>;
