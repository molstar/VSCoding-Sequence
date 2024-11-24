/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { GraphicsRenderObject } from '../../mol-gl/render-object';
import { BaseValues } from '../../mol-gl/renderable/schema';
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { RuntimeContext } from '../../mol-task';
import { Color } from '../../mol-util/color/color';
import { RenderObjectExporter, RenderObjectExportData } from './render-object-exporter';
import { ValueCell } from '../../mol-util/value-cell';
type MeshMode = 'points' | 'lines' | 'triangles';
export interface AddMeshInput {
    mesh: {
        vertices: Float32Array;
        normals: Float32Array | undefined;
        indices: Uint32Array | undefined;
        groups: Float32Array | Uint8Array;
        vertexCount: number;
        drawCount: number;
    } | undefined;
    meshes: Mesh[] | undefined;
    values: BaseValues & {
        readonly uDoubleSided?: ValueCell<any>;
    };
    isGeoTexture: boolean;
    mode: MeshMode;
    webgl: WebGLContext | undefined;
    ctx: RuntimeContext;
}
export type MeshGeoData = {
    values: BaseValues;
    groups: Float32Array | Uint8Array;
    vertexCount: number;
    instanceIndex: number;
    isGeoTexture: boolean;
    mode: MeshMode;
};
export declare abstract class MeshExporter<D extends RenderObjectExportData> implements RenderObjectExporter<D> {
    abstract readonly fileExtension: string;
    private static getSizeFromTexture;
    private static getSize;
    protected static getGroup(groups: Float32Array | Uint8Array, i: number): number;
    protected static getInterpolatedColors(webgl: WebGLContext, input: {
        vertices: Float32Array;
        vertexCount: number;
        values: BaseValues;
        stride: 3 | 4;
        colorType: 'volume' | 'volumeInstance';
    }): Uint8Array;
    protected static getInterpolatedOverpaint(webgl: WebGLContext, input: {
        vertices: Float32Array;
        vertexCount: number;
        values: BaseValues;
        stride: 3 | 4;
        colorType: 'volumeInstance';
    }): Uint8Array;
    protected static getInterpolatedTransparency(webgl: WebGLContext, input: {
        vertices: Float32Array;
        vertexCount: number;
        values: BaseValues;
        stride: 3 | 4;
        colorType: 'volumeInstance';
    }): Uint8Array;
    protected static quantizeColors(colorArray: Uint8Array, vertexCount: number): void;
    protected static getInstance(input: AddMeshInput, instanceIndex: number): {
        vertices: Float32Array;
        normals: Float32Array | undefined;
        indices: Uint32Array | undefined;
        groups: Float32Array | Uint8Array;
        vertexCount: number;
        drawCount: number;
    };
    protected static getColor(vertexIndex: number, geoData: MeshGeoData, interpolatedColors?: Uint8Array, interpolatedOverpaint?: Uint8Array): Color;
    protected static getTransparency(vertexIndex: number, geoData: MeshGeoData, interpolatedTransparency?: Uint8Array): number;
    protected abstract addMeshWithColors(input: AddMeshInput): Promise<void>;
    private addMesh;
    private addLines;
    private addPoints;
    private addSpheres;
    private addCylinders;
    private addTextureMesh;
    add(renderObject: GraphicsRenderObject, webgl: WebGLContext, ctx: RuntimeContext): Promise<void> | undefined;
    protected options: {
        includeHidden: boolean;
        linesAsTriangles: boolean;
        pointsAsTriangles: boolean;
        primitivesQuality: "auto" | "high" | "medium" | "low";
    };
    abstract getData(ctx: RuntimeContext): Promise<D>;
    abstract getBlob(ctx: RuntimeContext): Promise<Blob>;
}
export {};
