/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 */
export interface Index {
    i: number;
    j: number;
    k: number;
}
export declare function Index(i: number, j: number, k: number): Index;
export interface IndexPair {
    a: Index;
    b: Index;
}
export declare function IndexPair(a: Index, b: Index): IndexPair;
export declare const EdgesXY: number[][];
export declare const EdgesXZ: number[][];
export declare const EdgesYZ: number[][];
export declare const CubeVertices: Index[];
export declare const CubeEdges: IndexPair[];
export declare const EdgeIdInfo: {
    i: number;
    j: number;
    k: number;
    e: number;
}[];
export declare const EdgeTable: number[];
export declare const TriTable: number[][];
/**
 * Triangles are constructed between points on cube edges.
 * AllowedContours[edge1][edge1] indicates which lines from a given
 * triangle should be shown in line mode.
 *
 * Values are bitmasks:
 * In loop over cubes we keep another bitmask indicating whether our current
 * cell is the first x-value (1),
 * first y-value (2) or first z-value (4) of the current loop.
 * We draw all lines on leading faces but only draw trailing face lines the first
 * time through the loop
 * A value of 8 below means the edge is always drawn (leading face)
 *
 * E.g. the first row, lines between edge0 and other edges in the bottom
 * x-y plane are only drawn for the first value of z, edges in the
 * x-z plane are only drawn for the first value of y. No other lines
 * are drawn as they're redundant
 * The line between edge 1 and 5 is always drawn as it's on the leading edge
 */
export declare const AllowedContours: number[][];
