/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { NumberArray } from './type-helpers';
import { ParamDefinition as PD } from './param-definition';
export interface Material {
    /** Normalized to [0, 1] range */
    metalness: number;
    /** Normalized to [0, 1] range */
    roughness: number;
    /** Normalized to [0, 1] range */
    bumpiness: number;
}
export declare function Material(values?: Partial<Material>): {
    metalness: number;
    roughness: number;
    bumpiness: number;
};
export declare namespace Material {
    const Zero: Material;
    function toArray<T extends NumberArray>(material: Material, array: T, offset: number): T;
    function toString({ metalness, roughness, bumpiness }: Material): string;
    function getParam(info?: {
        isExpanded?: boolean;
        isFlat?: boolean;
    }): PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
}
