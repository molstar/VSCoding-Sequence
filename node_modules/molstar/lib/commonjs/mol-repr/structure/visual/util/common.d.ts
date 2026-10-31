/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Unit, Structure, ElementIndex, StructureElement, ResidueIndex } from '../../../../mol-model/structure';
import { TransformData } from '../../../../mol-geo/geometry/transform-data';
import { OrderedSet, SortedArray } from '../../../../mol-data/int';
import { Loci } from '../../../../mol-model/loci';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { AssignableArrayLike } from '../../../../mol-util/type-helpers';
import { Box3D, Sphere3D } from '../../../../mol-math/geometry';
import { SizeTheme } from '../../../../mol-theme/size';
/** Return a Loci for the elements of a whole residue the elementIndex belongs to. */
export declare function getResidueLoci(structure: Structure, unit: Unit.Atomic, elementIndex: ElementIndex): Loci;
/**
 * Return a Loci for the elements of a whole residue the elementIndex belongs to but
 * restrict to elements that have the same label_alt_id or none
 */
export declare function getAltResidueLoci(structure: Structure, unit: Unit.Atomic, elementIndex: ElementIndex): StructureElement.Loci;
export declare function getAltResidueLociFromId(structure: Structure, unit: Unit.Atomic, residueIndex: ResidueIndex, elementAltId: string): StructureElement.Loci;
export type StructureGroup = {
    structure: Structure;
    group: Unit.SymmetryGroup;
};
export declare function createUnitsTransform(structureGroup: StructureGroup, includeParent: boolean, invariantBoundingSphere: Sphere3D, cellSize: number, batchSize: number, transformData?: TransformData): TransformData;
export declare const UnitKindInfo: {
    atomic: {};
    spheres: {};
    gaussians: {};
};
export type UnitKind = keyof typeof UnitKindInfo;
export declare const UnitKindOptions: ["spheres" | "gaussians" | "atomic", string][];
export declare function includesUnitKind(unitKinds: UnitKind[], unit: Unit): boolean;
export declare function getVolumeSliceInfo(box: Box3D, resolution: number, maxCells?: number): {
    area: number;
    areaCells: number;
    maxAreaCells: number;
};
/**
 * Guard against overly high resolution for the given box size.
 * Internally it uses the largest 2d slice of the box to determine the
 * maximum resolution to account for the 2d texture layout on the GPU.
 */
export declare function ensureReasonableResolution<T>(box: Box3D, props: {
    resolution: number;
} & T, maxCells?: number): {
    resolution: number;
} & T & {
    resolution: number;
};
export declare function getConformation(unit: Unit): import("../../../../mol-model/structure/model/properties/atomic").AtomicConformation | import("../../../../mol-model/structure/model/properties/coarse").CoarseSphereConformation | import("../../../../mol-model/structure/model/properties/coarse").CoarseGaussianConformation;
export declare const CommonSurfaceParams: {
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    includeParent: PD.BooleanParam;
};
export declare const DefaultCommonSurfaceProps: PD.Values<{
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    includeParent: PD.BooleanParam;
}>;
export type CommonSurfaceProps = typeof DefaultCommonSurfaceProps;
export declare function getUnitConformationAndRadius(structure: Structure, unit: Unit, sizeTheme: SizeTheme<any>, props: CommonSurfaceProps): {
    position: {
        indices: SortedArray<ElementIndex>;
        x: ArrayLike<number>;
        y: ArrayLike<number>;
        z: ArrayLike<number>;
        id: AssignableArrayLike<number>;
    };
    boundary: import("../../../../mol-math/geometry/boundary").Boundary;
    radius: (index: number) => number;
};
export declare function getStructureConformationAndRadius(structure: Structure, sizeTheme: SizeTheme<any>, props: CommonSurfaceProps): {
    position: {
        indices: OrderedSet<number>;
        x: ArrayLike<number>;
        y: ArrayLike<number>;
        z: ArrayLike<number>;
        id: AssignableArrayLike<number>;
    };
    boundary: import("../../../../mol-math/geometry/boundary").Boundary;
    radius: (index: number) => number;
};
export declare function isHydrogen(structure: Structure, unit: Unit, element: ElementIndex, variant: 'all' | 'non-polar' | 'polar'): boolean;
export declare function isH(atomicNumber: ArrayLike<number>, element: ElementIndex): boolean;
export declare function isTrace(unit: Unit, element: ElementIndex): boolean;
