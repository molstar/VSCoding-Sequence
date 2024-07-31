/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Unit, StructureElement, Structure, ElementIndex } from '../../../../mol-model/structure';
import { Loci } from '../../../../mol-model/loci';
import { Interval } from '../../../../mol-data/int';
import { Mesh } from '../../../../mol-geo/geometry/mesh/mesh';
import { PickingId } from '../../../../mol-geo/geometry/picking';
import { LocationIterator } from '../../../../mol-geo/util/location-iterator';
import { VisualContext } from '../../../../mol-repr/visual';
import { Theme } from '../../../../mol-theme/theme';
import { Spheres } from '../../../../mol-geo/geometry/spheres/spheres';
import { StructureGroup } from './common';
type ElementProps = {
    ignoreHydrogens: boolean;
    ignoreHydrogensVariant: 'all' | 'non-polar';
    traceOnly: boolean;
    stride?: number;
};
export type ElementSphereMeshProps = {
    detail: number;
    sizeFactor: number;
} & ElementProps;
export type ElementSphereImpostorProps = {
    sizeFactor: number;
} & ElementProps;
export declare function makeElementIgnoreTest(structure: Structure, unit: Unit, props: ElementProps): undefined | ((i: ElementIndex) => boolean);
export declare function createElementSphereMesh(ctx: VisualContext, unit: Unit, structure: Structure, theme: Theme, props: ElementSphereMeshProps, mesh?: Mesh): Mesh;
export declare function createElementSphereImpostor(ctx: VisualContext, unit: Unit, structure: Structure, theme: Theme, props: ElementSphereImpostorProps, spheres?: Spheres): Spheres;
export declare function eachElement(loci: Loci, structureGroup: StructureGroup, apply: (interval: Interval) => boolean): boolean;
export declare function getElementLoci(pickingId: PickingId, structureGroup: StructureGroup, id: number): StructureElement.Loci | {
    kind: "empty-loci";
};
export declare function createStructureElementSphereMesh(ctx: VisualContext, structure: Structure, theme: Theme, props: ElementSphereMeshProps, mesh?: Mesh): Mesh;
export declare function createStructureElementSphereImpostor(ctx: VisualContext, structure: Structure, theme: Theme, props: ElementSphereImpostorProps, spheres?: Spheres): Spheres;
export declare function eachSerialElement(loci: Loci, structure: Structure, apply: (interval: Interval) => boolean): boolean;
export declare function getSerialElementLoci(pickingId: PickingId, structure: Structure, id: number): StructureElement.Loci | {
    kind: "empty-loci";
};
export declare namespace ElementIterator {
    function fromGroup(structureGroup: StructureGroup): LocationIterator;
    function fromStructure(structure: Structure): LocationIterator;
}
export {};
