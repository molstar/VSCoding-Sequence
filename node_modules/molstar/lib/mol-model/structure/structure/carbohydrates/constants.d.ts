/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Color, ColorMap } from '../../../../mol-util/color';
export declare enum SaccharideShape {
    FilledSphere = 0,
    FilledCube = 1,
    CrossedCube = 2,
    DividedDiamond = 3,
    FilledCone = 4,
    DevidedCone = 5,
    FlatBox = 6,
    FilledStar = 7,
    FilledDiamond = 8,
    FlatDiamond = 9,
    FlatHexagon = 10,
    Pentagon = 11,
    DiamondPrism = 12,
    PentagonalPrism = 13,
    HexagonalPrism = 14,
    HeptagonalPrism = 15
}
export declare const SaccharideColors: ColorMap<{
    Blue: number;
    Green: number;
    Yellow: number;
    Orange: number;
    Pink: number;
    Purple: number;
    LightBlue: number;
    Brown: number;
    Red: number;
    Secondary: number;
}>;
export declare enum SaccharideType {
    Hexose = 0,
    HexNAc = 1,
    Hexosamine = 2,
    Hexuronate = 3,
    Deoxyhexose = 4,
    DeoxyhexNAc = 5,
    DiDeoxyhexose = 6,
    Pentose = 7,
    Deoxynonulosonate = 8,
    DiDeoxynonulosonate = 9,
    Unknown = 10,
    Assigned = 11
}
export declare function getSaccharideName(type: SaccharideType): string;
export declare function getSaccharideShape(type: SaccharideType, ringMemberCount: number): SaccharideShape;
export type SaccharideComponent = {
    abbr: string;
    name: string;
    color: Color;
    type: SaccharideType;
};
export declare const UnknownSaccharideComponent: SaccharideComponent;
export declare const SaccharidesSnfgMap: Map<string, SaccharideComponent>;
export declare const MonosaccharidesColorTable: [string, Color][];
export type SaccharideCompIdMapType = 'default' | 'glycam';
export declare function setSaccharideCompIdMapType(type: SaccharideCompIdMapType): void;
export declare let SaccharideCompIdMap: Map<string, SaccharideComponent>;
export type SaccharideComponentMap = ReadonlyMap<string, SaccharideComponent>;
