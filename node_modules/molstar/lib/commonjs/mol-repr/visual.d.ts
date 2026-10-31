/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { RuntimeContext } from '../mol-task';
import { GraphicsRenderObject } from '../mol-gl/render-object';
import { PickingId } from '../mol-geo/geometry/picking';
import { Loci } from '../mol-model/loci';
import { MarkerAction, MarkerInfo } from '../mol-util/marker-action';
import { ParamDefinition as PD } from '../mol-util/param-definition';
import { WebGLContext } from '../mol-gl/webgl/context';
import { Theme } from '../mol-theme/theme';
import { Mat4 } from '../mol-math/linear-algebra';
import { Overpaint } from '../mol-theme/overpaint';
import { Interval } from '../mol-data/int';
import { Transparency } from '../mol-theme/transparency';
import { Clipping } from '../mol-theme/clipping';
import { Geometry } from '../mol-geo/geometry/geometry';
import { Substance } from '../mol-theme/substance';
import { LocationCallback } from './util';
import { Emissive } from '../mol-theme/emissive';
export interface VisualContext {
    readonly runtime: RuntimeContext;
    readonly webgl?: WebGLContext;
}
export { Visual };
interface Visual<D, P extends PD.Params> {
    /** Number of addressable groups in all instances of the visual */
    readonly groupCount: number;
    readonly renderObject: GraphicsRenderObject | undefined;
    readonly geometryVersion: number;
    createOrUpdate: (ctx: VisualContext, theme: Theme, props: PD.Values<P>, data?: D) => Promise<void> | void;
    getLoci: (pickingId: PickingId) => Loci;
    eachLocation: (cb: LocationCallback) => void;
    mark: (loci: Loci, action: MarkerAction) => boolean;
    setVisibility: (visible: boolean) => void;
    setAlphaFactor: (alphaFactor: number) => void;
    setPickable: (pickable: boolean) => void;
    setColorOnly: (colorOnly: boolean) => void;
    setTransform: (matrix?: Mat4, instanceMatrices?: Float32Array | null) => void;
    setOverpaint: (overpaint: Overpaint, webgl?: WebGLContext) => void;
    setTransparency: (transparency: Transparency, webgl?: WebGLContext) => void;
    setEmissive: (emissive: Emissive, webgl?: WebGLContext) => void;
    setSubstance: (substance: Substance, webgl?: WebGLContext) => void;
    setClipping: (clipping: Clipping) => void;
    setThemeStrength: (strength: {
        overpaint: number;
        transparency: number;
        emissive: number;
        substance: number;
    }) => void;
    destroy: () => void;
    mustRecreate?: (data: D, props: PD.Values<P>, webgl?: WebGLContext) => boolean;
}
declare namespace Visual {
    export type LociApply = (loci: Loci, apply: (interval: Interval) => boolean, isMarking: boolean) => boolean;
    export function setVisibility(renderObject: GraphicsRenderObject | undefined, visible: boolean): void;
    export function setAlphaFactor(renderObject: GraphicsRenderObject | undefined, alphaFactor: number): void;
    export function setPickable(renderObject: GraphicsRenderObject | undefined, pickable: boolean): void;
    export function setColorOnly(renderObject: GraphicsRenderObject | undefined, colorOnly: boolean): void;
    export type PreviousMark = {
        loci: Loci;
        action: MarkerAction;
        status: MarkerInfo['status'];
    };
    export function mark(renderObject: GraphicsRenderObject | undefined, loci: Loci, action: MarkerAction, lociApply: LociApply, previous?: PreviousMark): boolean;
    type SmoothingContext = {
        geometry: Geometry;
        props: PD.Values<any>;
        webgl?: WebGLContext;
    };
    export function setOverpaint(renderObject: GraphicsRenderObject | undefined, overpaint: Overpaint, lociApply: LociApply, clear: boolean, smoothing?: SmoothingContext): void;
    export function setTransparency(renderObject: GraphicsRenderObject | undefined, transparency: Transparency, lociApply: LociApply, clear: boolean, smoothing?: SmoothingContext): void;
    export function setEmissive(renderObject: GraphicsRenderObject | undefined, emissive: Emissive, lociApply: LociApply, clear: boolean, smoothing?: SmoothingContext): void;
    export function setSubstance(renderObject: GraphicsRenderObject | undefined, substance: Substance, lociApply: LociApply, clear: boolean, smoothing?: SmoothingContext): void;
    export function setClipping(renderObject: GraphicsRenderObject | undefined, clipping: Clipping, lociApply: LociApply, clear: boolean): void;
    export function setThemeStrength(renderObject: GraphicsRenderObject | undefined, strength: {
        overpaint: number;
        transparency: number;
        emissive: number;
        substance: number;
    }): void;
    export function setTransform(renderObject: GraphicsRenderObject | undefined, transform?: Mat4, instanceTransforms?: Float32Array | null): void;
    export {};
}
