"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltInTrajectoryFormats = exports.Mol2Provider = exports.SdfProvider = exports.MolProvider = exports.GroProvider = exports.LammpsTrajectoryDataProvider = exports.LammpsDataProvider = exports.XyzProvider = exports.PdbqtProvider = exports.PdbProvider = exports.CifCoreProvider = exports.MmcifProvider = exports.TrajectoryFormatCategory = void 0;
const transforms_1 = require("../transforms");
const provider_1 = require("./provider");
exports.TrajectoryFormatCategory = 'Trajectory';
function defaultVisuals(plugin, data) {
    return plugin.builders.structure.hierarchy.applyPreset(data.trajectory, 'default');
}
exports.MmcifProvider = {
    label: 'mmCIF',
    description: 'mmCIF',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['cif', 'mmcif', 'mcif'],
    binaryExtensions: ['bcif'],
    isApplicable: (info, data) => {
        if (info.ext === 'mmcif' || info.ext === 'mcif')
            return true;
        // assume undetermined cif/bcif files are mmCIF
        if (info.ext === 'cif' || info.ext === 'bcif')
            return (0, provider_1.guessCifVariant)(info, data) === -1;
        return false;
    },
    parse: async (plugin, data, params) => {
        var _a, _b;
        const state = plugin.state.data;
        const cif = state.build().to(data)
            .apply(transforms_1.StateTransforms.Data.ParseCif, void 0, { state: { isGhost: true } });
        const trajectory = await cif
            .apply(transforms_1.StateTransforms.Model.TrajectoryFromMmCif, void 0, { tags: params === null || params === void 0 ? void 0 : params.trajectoryTags })
            .commit({ revertOnError: true });
        if ((((_b = (_a = cif.selector.cell) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data.blocks.length) || 0) > 1) {
            plugin.state.data.updateCellState(cif.ref, { isGhost: false });
        }
        return { trajectory };
    },
    visuals: defaultVisuals
};
exports.CifCoreProvider = {
    label: 'cifCore',
    description: 'CIF Core',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['cif'],
    isApplicable: (info, data) => {
        if (info.ext === 'cif')
            return (0, provider_1.guessCifVariant)(info, data) === 'coreCif';
        return false;
    },
    parse: async (plugin, data, params) => {
        var _a, _b;
        const state = plugin.state.data;
        const cif = state.build().to(data)
            .apply(transforms_1.StateTransforms.Data.ParseCif, void 0, { state: { isGhost: true } });
        const trajectory = await cif
            .apply(transforms_1.StateTransforms.Model.TrajectoryFromCifCore, void 0, { tags: params === null || params === void 0 ? void 0 : params.trajectoryTags })
            .commit({ revertOnError: true });
        if ((((_b = (_a = cif.selector.cell) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data.blocks.length) || 0) > 1) {
            plugin.state.data.updateCellState(cif.ref, { isGhost: false });
        }
        return { trajectory };
    },
    visuals: defaultVisuals
};
function directTrajectory(transformer, transformerParams) {
    return async (plugin, data, params) => {
        const state = plugin.state.data;
        const trajectory = await state.build().to(data)
            .apply(transformer, transformerParams, { tags: params === null || params === void 0 ? void 0 : params.trajectoryTags })
            .commit({ revertOnError: true });
        return { trajectory };
    };
}
exports.PdbProvider = {
    label: 'PDB',
    description: 'PDB',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['pdb', 'ent'],
    parse: directTrajectory(transforms_1.StateTransforms.Model.TrajectoryFromPDB),
    visuals: defaultVisuals
};
exports.PdbqtProvider = {
    label: 'PDBQT',
    description: 'PDBQT',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['pdbqt'],
    parse: directTrajectory(transforms_1.StateTransforms.Model.TrajectoryFromPDB, { isPdbqt: true }),
    visuals: defaultVisuals
};
exports.XyzProvider = {
    label: 'XYZ',
    description: 'XYZ',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['xyz'],
    parse: directTrajectory(transforms_1.StateTransforms.Model.TrajectoryFromXYZ),
    visuals: defaultVisuals
};
exports.LammpsDataProvider = {
    label: 'Lammps Data',
    description: 'Lammps Data',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['data'],
    parse: directTrajectory(transforms_1.StateTransforms.Model.TrajectoryFromLammpsData),
    visuals: defaultVisuals
};
exports.LammpsTrajectoryDataProvider = {
    label: 'Lammps Trajectory Data',
    description: 'Lammps Trajectory Data',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['lammpstrj'],
    parse: directTrajectory(transforms_1.StateTransforms.Model.TrajectoryFromLammpsTrajData),
    visuals: defaultVisuals
};
exports.GroProvider = {
    label: 'GRO',
    description: 'GRO',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['gro'],
    binaryExtensions: [],
    parse: directTrajectory(transforms_1.StateTransforms.Model.TrajectoryFromGRO),
    visuals: defaultVisuals
};
exports.MolProvider = {
    label: 'MOL',
    description: 'MOL',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['mol'],
    parse: directTrajectory(transforms_1.StateTransforms.Model.TrajectoryFromMOL),
    visuals: defaultVisuals
};
exports.SdfProvider = {
    label: 'SDF',
    description: 'SDF',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['sdf', 'sd'],
    parse: directTrajectory(transforms_1.StateTransforms.Model.TrajectoryFromSDF),
    visuals: defaultVisuals
};
exports.Mol2Provider = {
    label: 'MOL2',
    description: 'MOL2',
    category: exports.TrajectoryFormatCategory,
    stringExtensions: ['mol2'],
    parse: directTrajectory(transforms_1.StateTransforms.Model.TrajectoryFromMOL2),
    visuals: defaultVisuals
};
exports.BuiltInTrajectoryFormats = [
    ['mmcif', exports.MmcifProvider],
    ['cifCore', exports.CifCoreProvider],
    ['pdb', exports.PdbProvider],
    ['pdbqt', exports.PdbqtProvider],
    ['gro', exports.GroProvider],
    ['xyz', exports.XyzProvider],
    ['lammps_data', exports.LammpsDataProvider],
    ['lammps_traj_data', exports.LammpsTrajectoryDataProvider],
    ['mol', exports.MolProvider],
    ['sdf', exports.SdfProvider],
    ['mol2', exports.Mol2Provider],
];
