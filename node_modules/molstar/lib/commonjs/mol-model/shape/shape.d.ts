/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import { UUID } from '../../mol-util';
import { OrderedSet } from '../../mol-data/int';
import { Geometry } from '../../mol-geo/geometry/geometry';
import { Mat4 } from '../../mol-math/linear-algebra';
import { Sphere3D } from '../../mol-math/geometry';
import { Theme } from '../../mol-theme/theme';
import { TransformData } from '../../mol-geo/geometry/transform-data';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { LocationIterator } from '../../mol-geo/util/location-iterator';
export interface Shape<G extends Geometry = Geometry> {
    /** A uuid to identify a shape object */
    readonly id: UUID;
    /** A name to describe the shape */
    readonly name: string;
    /** The data used to create the shape */
    readonly sourceData: unknown;
    /** The geometry of the shape, e.g. `Mesh` or `Lines` */
    readonly geometry: G;
    /** An array of transformation matrices to describe multiple instances of the geometry */
    readonly transforms: Mat4[];
    /** Number of groups in the geometry */
    readonly groupCount: number;
    /** Get color for a given group */
    getColor(groupId: number, instanceId: number): Color;
    /** Get size for a given group */
    getSize(groupId: number, instanceId: number): number;
    /** Get label for a given group */
    getLabel(groupId: number, instanceId: number): string;
}
export declare namespace Shape {
    function create<G extends Geometry>(name: string, sourceData: unknown, geometry: G, getColor: Shape['getColor'], getSize: Shape['getSize'], getLabel: Shape['getLabel'], transforms?: Mat4[]): Shape<G>;
    function getTheme(shape: Shape): Theme;
    function groupIterator(shape: Shape): LocationIterator;
    function createTransform(transforms: Mat4[], invariantBoundingSphere: Sphere3D, cellSize: number, batchSize: number, transformData?: TransformData): TransformData;
    function createRenderObject<G extends Geometry>(shape: Shape<G>, props: PD.Values<Geometry.Params<G>>): import("../../mol-gl/render-object").GraphicsRenderObject<"text" | "image" | "points" | "spheres" | "cylinders" | "lines" | "mesh" | "direct-volume" | "texture-mesh">;
    interface Loci {
        readonly kind: 'shape-loci';
        readonly shape: Shape;
    }
    function Loci(shape: Shape): Loci;
    function isLoci(x: any): x is Loci;
    function areLociEqual(a: Loci, b: Loci): boolean;
    function isLociEmpty(loci: Loci): boolean;
}
export declare namespace ShapeGroup {
    interface Location {
        readonly kind: 'group-location';
        shape: Shape;
        group: number;
        instance: number;
    }
    function Location(shape?: Shape, group?: number, instance?: number): Location;
    function isLocation(x: any): x is Location;
    interface Loci {
        readonly kind: 'group-loci';
        readonly shape: Shape;
        readonly groups: ReadonlyArray<{
            readonly ids: OrderedSet<number>;
            readonly instance: number;
        }>;
    }
    function Loci(shape: Shape, groups: Loci['groups']): Loci;
    function isLoci(x: any): x is Loci;
    function areLociEqual(a: Loci, b: Loci): boolean;
    function isLociEmpty(loci: Loci): boolean;
    function size(loci: Loci): number;
    function getBoundingSphere(loci: Loci, boundingSphere?: Sphere3D): Sphere3D;
}
