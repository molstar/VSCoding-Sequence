/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CoarseHierarchy } from '../../../mol-model/structure/model/properties/coarse';
import { getCoarseKeys } from '../../../mol-model/structure/model/properties/utils/coarse-keys';
import { UUID } from '../../../mol-util';
import { Segmentation, Interval } from '../../../mol-data/int';
import { Mat3, Tensor } from '../../../mol-math/linear-algebra';
import { getCoarseRanges } from '../../../mol-model/structure/model/properties/utils/coarse-ranges';
import { BasicSchema } from './schema';
export const EmptyCoarse = { hierarchy: CoarseHierarchy.Empty, conformation: void 0 };
export function getCoarse(data, chemicalComponentMap) {
    const { ihm_sphere_obj_site, ihm_gaussian_obj_site } = data;
    if (ihm_sphere_obj_site._rowCount === 0 && ihm_gaussian_obj_site._rowCount === 0)
        return EmptyCoarse;
    const sphereData = getData(ihm_sphere_obj_site);
    const sphereConformation = getSphereConformation(ihm_sphere_obj_site);
    const sphereKeys = getCoarseKeys(sphereData, data.entities);
    const sphereRanges = getCoarseRanges(sphereData, chemicalComponentMap);
    const gaussianData = getData(ihm_gaussian_obj_site);
    const gaussianConformation = getGaussianConformation(ihm_gaussian_obj_site);
    const gaussianKeys = getCoarseKeys(gaussianData, data.entities);
    const gaussianRanges = getCoarseRanges(gaussianData, chemicalComponentMap);
    return {
        hierarchy: {
            isDefined: true,
            spheres: { ...sphereData, ...sphereKeys, ...sphereRanges },
            gaussians: { ...gaussianData, ...gaussianKeys, ...gaussianRanges },
        },
        conformation: {
            id: UUID.create22(),
            spheres: sphereConformation,
            gaussians: gaussianConformation
        }
    };
}
function getSphereConformation(data) {
    return {
        x: data.Cartn_x.toArray({ array: Float32Array }),
        y: data.Cartn_y.toArray({ array: Float32Array }),
        z: data.Cartn_z.toArray({ array: Float32Array }),
        radius: data.object_radius.toArray({ array: Float32Array }),
        rmsf: data.rmsf.toArray({ array: Float32Array })
    };
}
function getGaussianConformation(data) {
    const matrix_space = BasicSchema.ihm_gaussian_obj_site.covariance_matrix.space;
    const covariance_matrix = [];
    const { covariance_matrix: cm } = data;
    for (let i = 0, _i = cm.rowCount; i < _i; i++) {
        covariance_matrix[i] = Tensor.toMat3(Mat3(), matrix_space, cm.value(i));
    }
    return {
        x: data.mean_Cartn_x.toArray({ array: Float32Array }),
        y: data.mean_Cartn_y.toArray({ array: Float32Array }),
        z: data.mean_Cartn_z.toArray({ array: Float32Array }),
        weight: data.weight.toArray({ array: Float32Array }),
        covariance_matrix
    };
}
function getSegments(asym_id, seq_id_begin, seq_id_end) {
    const chainOffsets = [0];
    for (let i = 1, _i = asym_id.rowCount; i < _i; i++) {
        const newChain = !asym_id.areValuesEqual(i - 1, i);
        if (newChain)
            chainOffsets[chainOffsets.length] = i;
    }
    return {
        chainElementSegments: Segmentation.ofOffsets(chainOffsets, Interval.ofBounds(0, asym_id.rowCount))
    };
}
function getData(data) {
    const { entity_id, seq_id_begin, seq_id_end, asym_id } = data;
    return { count: entity_id.rowCount, entity_id, asym_id, seq_id_begin, seq_id_end, ...getSegments(asym_id, seq_id_begin, seq_id_end) };
}
