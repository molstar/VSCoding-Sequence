/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { DirectVolume } from '../../mol-geo/geometry/direct-volume/direct-volume';
import { Lines } from '../../mol-geo/geometry/lines/lines';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { Points } from '../../mol-geo/geometry/points/points';
import { Spheres } from '../../mol-geo/geometry/spheres/spheres';
import { Cylinders } from '../../mol-geo/geometry/cylinders/cylinders';
import { Text } from '../../mol-geo/geometry/text/text';
import { TextureMesh } from '../../mol-geo/geometry/texture-mesh/texture-mesh';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { UnitKindOptions } from './visual/util/common';
export function getUnitKindsParam(defaultValue) {
    return PD.MultiSelect(defaultValue, UnitKindOptions, { description: 'For which kinds of units/chains to show the representation visuals.' });
}
export const StructureParams = {
    unitKinds: getUnitKindsParam(['atomic', 'spheres']),
    includeParent: PD.Boolean(false, { isHidden: true }),
};
export const StructureMeshParams = { ...Mesh.Params };
export const StructureSpheresParams = { ...Spheres.Params };
export const StructureCylindersParams = { ...Cylinders.Params };
export const StructurePointsParams = { ...Points.Params };
export const StructureLinesParams = { ...Lines.Params };
export const StructureTextParams = { ...Text.Params };
export const StructureDirectVolumeParams = { ...DirectVolume.Params };
export const StructureTextureMeshParams = { ...TextureMesh.Params };
