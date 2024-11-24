/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { Box3D } from '../../mol-math/geometry';
import { Vec3 } from '../../mol-math/linear-algebra';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject as SO } from '../objects';
export { BoxShape3D };
type BoxShape3D = typeof BoxShape3D;
declare const BoxShape3D: import("../../mol-state").StateTransformer<SO.Root, SO.Shape.Provider, PD.Normalize<{
    bottomLeft: Vec3;
    topRight: Vec3;
    radius: number;
    color: import("../../mol-util/color").Color;
}>>;
export declare function getBoxMesh(box: Box3D, radius: number, oldMesh?: Mesh): Mesh;
