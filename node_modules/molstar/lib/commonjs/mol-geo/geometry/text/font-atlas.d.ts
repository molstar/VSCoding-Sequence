/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { TextureImage } from '../../../mol-gl/renderable/util';
export declare function getFontAtlas(props: Partial<FontAtlasProps>): FontAtlas;
export type FontFamily = 'sans-serif' | 'monospace' | 'serif' | 'cursive';
export type FontStyle = 'normal' | 'italic' | 'oblique';
export type FontVariant = 'normal' | 'small-caps';
export type FontWeight = 'normal' | 'bold';
export declare const FontAtlasParams: {
    fontFamily: PD.Select<FontFamily>;
    fontQuality: PD.Select<number>;
    fontStyle: PD.Select<FontStyle>;
    fontVariant: PD.Select<FontVariant>;
    fontWeight: PD.Select<FontWeight>;
};
export type FontAtlasParams = typeof FontAtlasParams;
export type FontAtlasProps = PD.Values<FontAtlasParams>;
export type FontAtlasMap = {
    x: number;
    y: number;
    w: number;
    h: number;
    nw: number;
    nh: number;
};
export declare class FontAtlas {
    readonly props: Readonly<FontAtlasProps>;
    readonly mapped: {
        [k: string]: FontAtlasMap;
    };
    readonly placeholder: FontAtlasMap;
    readonly texture: TextureImage<Uint8Array>;
    private scratchW;
    private scratchH;
    private currentX;
    private currentY;
    private readonly scratchData;
    private readonly cutoff;
    readonly buffer: number;
    private readonly radius;
    private gridOuter;
    private gridInner;
    private f;
    private d;
    private z;
    private v;
    private scratchContext;
    readonly lineHeight: number;
    private readonly maxWidth;
    private readonly middle;
    constructor(props?: Partial<FontAtlasProps>);
    get(char: string): FontAtlasMap;
    draw(char: string): void;
}
/** Type of imported `canvas` module (not using `typeof import('canvas')` to avoid missing types) */
type CanvasModule = any;
/** Set `canvas` module, before using Canvas API functionality in NodeJS. Usage: `setCanvasModule(require('canvas')); // some code `*/
export declare function setCanvasModule(canvas: CanvasModule): void;
export {};
