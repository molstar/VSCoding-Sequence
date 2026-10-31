"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.gpuComputeAlphaOrbitalsGridValues = gpuComputeAlphaOrbitalsGridValues;
exports.gpuComputeAlphaOrbitalsDensityGridValues = gpuComputeAlphaOrbitalsDensityGridValues;
const grid3d_1 = require("../../../mol-gl/compute/grid3d");
const schema_1 = require("../../../mol-gl/renderable/schema");
const mol_util_1 = require("../../../mol-util");
const array_1 = require("../../../mol-util/array");
const spherical_functions_1 = require("../spherical-functions");
const shader_frag_1 = require("./shader.frag");
const Schema = {
    tCenters: (0, schema_1.TextureSpec)('image-float32', 'rgba', 'float', 'nearest'),
    tInfo: (0, schema_1.TextureSpec)('image-float32', 'rgba', 'float', 'nearest'),
    tCoeff: (0, schema_1.TextureSpec)('image-float32', 'rgb', 'float', 'nearest'),
    tAlpha: (0, schema_1.TextureSpec)('image-float32', 'alpha', 'float', 'nearest'),
    uNCenters: (0, schema_1.UniformSpec)('i'),
    uNAlpha: (0, schema_1.UniformSpec)('i'),
    uNCoeff: (0, schema_1.UniformSpec)('i'),
    uMaxCoeffs: (0, schema_1.UniformSpec)('i'),
};
const Orbitals = (0, grid3d_1.createGrid3dComputeRenderable)({
    schema: Schema,
    loopBounds: ['uNCenters', 'uMaxCoeffs'],
    mainCode: shader_frag_1.MAIN,
    utilCode: shader_frag_1.UTILS,
    returnCode: 'v',
    values(params) {
        return createTextureData(params.grid, params.orbital);
    }
});
const Density = (0, grid3d_1.createGrid3dComputeRenderable)({
    schema: {
        ...Schema,
        uOccupancy: (0, schema_1.UniformSpec)('f'),
    },
    loopBounds: ['uNCenters', 'uMaxCoeffs'],
    mainCode: shader_frag_1.MAIN,
    utilCode: shader_frag_1.UTILS,
    returnCode: 'current + uOccupancy * v * v',
    values(params) {
        return {
            ...createTextureData(params.grid, params.orbitals[0]),
            uOccupancy: 0
        };
    },
    cumulative: {
        states(params) {
            return params.orbitals.filter(o => o.occupancy !== 0);
        },
        update({ grid }, state, values) {
            const alpha = getNormalizedAlpha(grid.params.basis, state.alpha, grid.params.sphericalOrder);
            mol_util_1.ValueCell.updateIfChanged(values.uOccupancy, state.occupancy);
            mol_util_1.ValueCell.update(values.tAlpha, { width: alpha.length, height: 1, array: alpha });
        }
    }
});
function gpuComputeAlphaOrbitalsGridValues(ctx, webgl, grid, orbital) {
    return Orbitals(ctx, webgl, grid, { grid, orbital });
}
function gpuComputeAlphaOrbitalsDensityGridValues(ctx, webgl, grid, orbitals) {
    return Density(ctx, webgl, grid, { grid, orbitals });
}
function getNormalizedAlpha(basis, alphaOrbitals, sphericalOrder) {
    const alpha = new Float32Array(alphaOrbitals.length);
    let aO = 0;
    for (const atom of basis.atoms) {
        for (const shell of atom.shells) {
            for (const L of shell.angularMomentum) {
                const a0 = (0, spherical_functions_1.normalizeBasicOrder)(L, alphaOrbitals.slice(aO, aO + 2 * L + 1), sphericalOrder);
                for (let i = 0; i < a0.length; i++)
                    alpha[aO + i] = a0[i];
                aO += 2 * L + 1;
            }
        }
    }
    return alpha;
}
function createTextureData(grid, orbital) {
    const { basis, sphericalOrder, cutoffThreshold } = grid.params;
    let centerCount = 0;
    let baseCount = 0;
    let coeffCount = 0;
    for (const atom of basis.atoms) {
        for (const shell of atom.shells) {
            for (const L of shell.angularMomentum) {
                if (L > 4) {
                    // TODO: will L > 4 be required? Would need to precompute more functions in that case.
                    throw new Error('Angular momentum L > 4 not supported.');
                }
                centerCount++;
                baseCount += 2 * L + 1;
                coeffCount += shell.exponents.length;
            }
        }
    }
    const centers = new Float32Array(4 * centerCount);
    // L, alpha_offset, coeff_offset_start, coeff_offset_end
    const info = new Float32Array(4 * centerCount);
    const alpha = new Float32Array(baseCount);
    const coeff = new Float32Array(3 * coeffCount);
    let maxCoeffs = 0;
    let cO = 0, aO = 0, coeffO = 0;
    for (const atom of basis.atoms) {
        for (const shell of atom.shells) {
            let amIndex = 0;
            for (const L of shell.angularMomentum) {
                const a0 = (0, spherical_functions_1.normalizeBasicOrder)(L, orbital.alpha.slice(aO, aO + 2 * L + 1), sphericalOrder);
                const cutoffRadius = cutoffThreshold > 0
                    ? Math.sqrt(-Math.log(cutoffThreshold) / (0, array_1.arrayMin)(shell.exponents))
                    : 10000;
                centers[4 * cO + 0] = atom.center[0];
                centers[4 * cO + 1] = atom.center[1];
                centers[4 * cO + 2] = atom.center[2];
                centers[4 * cO + 3] = cutoffRadius * cutoffRadius;
                info[4 * cO + 0] = L;
                info[4 * cO + 1] = aO;
                info[4 * cO + 2] = coeffO;
                info[4 * cO + 3] = coeffO + shell.exponents.length;
                for (let i = 0; i < a0.length; i++)
                    alpha[aO + i] = a0[i];
                const c0 = shell.coefficients[amIndex++];
                for (let i = 0; i < shell.exponents.length; i++) {
                    coeff[3 * (coeffO + i) + 0] = c0[i];
                    coeff[3 * (coeffO + i) + 1] = shell.exponents[i];
                }
                if (c0.length > maxCoeffs) {
                    maxCoeffs = c0.length;
                }
                cO++;
                aO += 2 * L + 1;
                coeffO += shell.exponents.length;
            }
        }
    }
    return {
        uNCenters: centerCount,
        uNAlpha: baseCount,
        uNCoeff: coeffCount,
        uMaxCoeffs: maxCoeffs,
        tCenters: { width: centerCount, height: 1, array: centers },
        tInfo: { width: centerCount, height: 1, array: info },
        tCoeff: { width: coeffCount, height: 1, array: coeff },
        tAlpha: { width: baseCount, height: 1, array: alpha },
    };
}
