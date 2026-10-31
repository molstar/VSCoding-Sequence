/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Sphere3D } from '../../mol-math/geometry';
import { Vec3 } from '../../mol-math/linear-algebra';
import { Structure } from '../../mol-model/structure';
import { StructureUnitTransforms } from '../../mol-model/structure/structure/util/unit-transforms';
export declare function unwindStructureAssembly(structure: Structure, unitTransforms: StructureUnitTransforms, t: number): void;
export declare function explodeStructure(structure: Structure, unitTransforms: StructureUnitTransforms, t: number, sphere: Sphere3D): void;
export declare const SpinStructureParams: {
    axis: PD.Mapped<PD.NamedParams<PD.Normalize<{
        principalAxis: "dirA" | "dirB" | "dirC";
    }>, "structure"> | PD.NamedParams<PD.Normalize<{
        vector: Vec3;
    }>, "custom">>;
    origin: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "structure"> | PD.NamedParams<PD.Normalize<{
        vector: Vec3;
    }>, "custom">>;
};
export type SpinStructureProps = PD.Values<typeof SpinStructureParams>;
export declare function getSpinStructureAxisAndOrigin(structure: Structure, props: SpinStructureProps): {
    axis: Vec3;
    origin: Vec3;
};
export declare function spinStructure(structure: Structure, unitTransforms: StructureUnitTransforms, t: number, axis: Vec3, origin: Vec3): void;
