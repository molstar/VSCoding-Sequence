import { SpacegroupCell } from '../../../../mol-math/geometry';
/** Information about a region sampled in fractional coordinates */
export interface GridInfo {
    /** Origin in fractional coords. */
    origin: Fractional;
    /** Box dimensions in fractional coords. */
    dimensions: Fractional;
    /** Grid delta in fractional coordinates along each axis (in axis order) */
    delta: Fractional;
    /** Sample count of the grid box */
    sampleCount: number[];
}
/**
 * Grid domain with the supplied info and "kind".
 * The "kind" is used so that the TypeScript compiler
 * can distinguish between different types of grids,
 * e.g. GridDomain<'Data'>, GridDomain<'Query'>, GridDomain<'Block'>, etc.
 */
export interface GridDomain<K> extends GridInfo {
    kind: K;
    sampleVolume: number;
}
export declare const enum Space {
    Cartesian = 0,
    Fractional = 1,
    Grid = 2
}
export interface Coord<S extends Space> {
    kind: S;
    '0': number;
    '1': number;
    '2': number;
    [index: number]: number;
}
export interface Cartesian extends Coord<Space.Cartesian> {
}
export interface Fractional extends Coord<Space.Fractional> {
}
export interface Grid<K> extends Coord<Space.Grid> {
    domain: GridDomain<K>;
}
export declare function domain<K>(kind: K, info: GridInfo): GridDomain<K>;
export declare function cartesian(x: number, y: number, z: number): Cartesian;
export declare function fractional(x: number, y: number, z: number): Fractional;
export declare function grid<K>(domain: GridDomain<K>, x: number, y: number, z: number): Grid<K>;
export declare function withCoord<C extends (Coord<Space> | Grid<any>)>(a: C, x: number, y: number, z: number): C;
export declare function clone<C extends (Coord<Space> | Grid<any>)>(a: C): C;
export declare function cartesianToFractional(a: Cartesian, spacegroup: SpacegroupCell): Fractional;
export declare function fractionalToGrid<K>(a: Fractional, domain: GridDomain<K>, snap: 'bottom' | 'top'): Grid<K>;
export declare function gridToFractional<K>(a: Grid<K>): Fractional;
export declare function clampGridToSamples<K>(a: Grid<K>): Grid<K>;
export declare function add<S extends Space>(a: Coord<S>, b: Coord<S>): Coord<S>;
export declare function sub<S extends Space>(a: Coord<S>, b: Coord<S>): Coord<S>;
export declare function invert<S extends Space>(a: Coord<S>): Coord<S>;
/** Maps each grid point to a unique integer */
export declare function linearGridIndex<K>(a: Grid<K>): number;
export declare function gridMetrics(dimensions: {
    [i: number]: number;
}): {
    sizeX: number;
    sizeXY: number;
    sizeXYZ: number;
};
export declare function sampleCounts(dimensions: Fractional, delta: Fractional): number[];
export declare function round(v: number): number;
