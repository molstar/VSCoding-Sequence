import * as Coords from './coordinate';
import { SpacegroupCell } from '../../../../mol-math/geometry';
export interface Box<C extends Coords.Coord<Coords.Space>> {
    a: C;
    b: C;
}
export interface Cartesian extends Box<Coords.Cartesian> {
}
export interface Fractional extends Box<Coords.Fractional> {
}
export interface Grid<K> extends Box<Coords.Grid<K>> {
}
export declare function cartesianToFractional(box: Cartesian, spacegroup: SpacegroupCell): Fractional;
export declare function fractionalToGrid<K>(box: Fractional, domain: Coords.GridDomain<K>): Grid<K>;
export declare function gridToFractional<K>(box: Grid<K>): Fractional;
export declare function fractionalBoxReorderAxes(box: Fractional, axisOrder: number[]): {
    a: Coords.Fractional;
    b: Coords.Fractional;
};
export declare function expandGridBox<K>(box: Grid<K>, by: number): {
    a: Coords.Grid<K>;
    b: Coords.Grid<K>;
};
export declare function shift<C extends Coords.Coord<S>, S extends Coords.Space>(box: Box<C>, offset: C): Box<C>;
export declare function clampGridToSamples<C extends Coords.Grid<K>, K>(box: Box<C>): Box<C>;
export declare function fractionalToDomain<K>(box: Fractional, kind: K, delta: Coords.Fractional): Coords.GridDomain<K>;
export declare function fractionalFromBlock(block: Coords.Grid<'Block'>): Fractional;
export declare function bounding<C extends Coords.Coord<Coords.Space>>(xs: C[]): Box<C>;
export declare function areIntersecting<C extends Coords.Coord<S>, S extends Coords.Space>(box1: Box<C>, box2: Box<C>): boolean;
export declare function intersect<C extends Coords.Coord<S>, S extends Coords.Space>(box1: Box<C>, box2: Box<C>): Box<C> | undefined;
export declare function dimensions<C extends Coords.Coord<S>, S extends Coords.Space>(box: Box<C>): number[];
export declare function volume<C extends Coords.Coord<S>, S extends Coords.Space>(box: Box<C>): number;
