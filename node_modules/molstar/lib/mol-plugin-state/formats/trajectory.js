/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 */
import { StateTransforms } from '../transforms';
import { guessCifVariant } from './provider';
export const TrajectoryFormatCategory = 'Trajectory';
function defaultVisuals(plugin, data) {
    return plugin.builders.structure.hierarchy.applyPreset(data.trajectory, 'default');
}
export const MmcifProvider = {
    label: 'mmCIF',
    description: 'mmCIF',
    category: TrajectoryFormatCategory,
    stringExtensions: ['cif', 'mmcif', 'mcif'],
    binaryExtensions: ['bcif'],
    isApplicable: (info, data) => {
        if (info.ext === 'mmcif' || info.ext === 'mcif')
            return true;
        // assume undetermined cif/bcif files are mmCIF
        if (info.ext === 'cif' || info.ext === 'bcif')
            return guessCifVariant(info, data) === -1;
        return false;
    },
    parse: async (plugin, data, params) => {
        var _a, _b;
        const state = plugin.state.data;
        const cif = state.build().to(data)
            .apply(StateTransforms.Data.ParseCif, void 0, { state: { isGhost: true } });
        const trajectory = await cif
            .apply(StateTransforms.Model.TrajectoryFromMmCif, void 0, { tags: params === null || params === void 0 ? void 0 : params.trajectoryTags })
            .commit({ revertOnError: true });
        if ((((_b = (_a = cif.selector.cell) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data.blocks.length) || 0) > 1) {
            plugin.state.data.updateCellState(cif.ref, { isGhost: false });
        }
        return { trajectory };
    },
    visuals: defaultVisuals
};
export const CifCoreProvider = {
    label: 'cifCore',
    description: 'CIF Core',
    category: TrajectoryFormatCategory,
    stringExtensions: ['cif'],
    isApplicable: (info, data) => {
        if (info.ext === 'cif')
            return guessCifVariant(info, data) === 'coreCif';
        return false;
    },
    parse: async (plugin, data, params) => {
        var _a, _b;
        const state = plugin.state.data;
        const cif = state.build().to(data)
            .apply(StateTransforms.Data.ParseCif, void 0, { state: { isGhost: true } });
        const trajectory = await cif
            .apply(StateTransforms.Model.TrajectoryFromCifCore, void 0, { tags: params === null || params === void 0 ? void 0 : params.trajectoryTags })
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
export const PdbProvider = {
    label: 'PDB',
    description: 'PDB',
    category: TrajectoryFormatCategory,
    stringExtensions: ['pdb', 'ent'],
    parse: directTrajectory(StateTransforms.Model.TrajectoryFromPDB),
    visuals: defaultVisuals
};
export const PdbqtProvider = {
    label: 'PDBQT',
    description: 'PDBQT',
    category: TrajectoryFormatCategory,
    stringExtensions: ['pdbqt'],
    parse: directTrajectory(StateTransforms.Model.TrajectoryFromPDB, { isPdbqt: true }),
    visuals: defaultVisuals
};
export const XyzProvider = {
    label: 'XYZ',
    description: 'XYZ',
    category: TrajectoryFormatCategory,
    stringExtensions: ['xyz'],
    parse: directTrajectory(StateTransforms.Model.TrajectoryFromXYZ),
    visuals: defaultVisuals
};
export const LammpsDataProvider = {
    label: 'Lammps Data',
    description: 'Lammps Data',
    category: TrajectoryFormatCategory,
    stringExtensions: ['data'],
    parse: directTrajectory(StateTransforms.Model.TrajectoryFromLammpsData),
    visuals: defaultVisuals
};
export const LammpsTrajectoryDataProvider = {
    label: 'Lammps Trajectory Data',
    description: 'Lammps Trajectory Data',
    category: TrajectoryFormatCategory,
    stringExtensions: ['lammpstrj'],
    parse: directTrajectory(StateTransforms.Model.TrajectoryFromLammpsTrajData),
    visuals: defaultVisuals
};
export const GroProvider = {
    label: 'GRO',
    description: 'GRO',
    category: TrajectoryFormatCategory,
    stringExtensions: ['gro'],
    binaryExtensions: [],
    parse: directTrajectory(StateTransforms.Model.TrajectoryFromGRO),
    visuals: defaultVisuals
};
export const MolProvider = {
    label: 'MOL',
    description: 'MOL',
    category: TrajectoryFormatCategory,
    stringExtensions: ['mol'],
    parse: directTrajectory(StateTransforms.Model.TrajectoryFromMOL),
    visuals: defaultVisuals
};
export const SdfProvider = {
    label: 'SDF',
    description: 'SDF',
    category: TrajectoryFormatCategory,
    stringExtensions: ['sdf', 'sd'],
    parse: directTrajectory(StateTransforms.Model.TrajectoryFromSDF),
    visuals: defaultVisuals
};
export const Mol2Provider = {
    label: 'MOL2',
    description: 'MOL2',
    category: TrajectoryFormatCategory,
    stringExtensions: ['mol2'],
    parse: directTrajectory(StateTransforms.Model.TrajectoryFromMOL2),
    visuals: defaultVisuals
};
export const BuiltInTrajectoryFormats = [
    ['mmcif', MmcifProvider],
    ['cifCore', CifCoreProvider],
    ['pdb', PdbProvider],
    ['pdbqt', PdbqtProvider],
    ['gro', GroProvider],
    ['xyz', XyzProvider],
    ['lammps_data', LammpsDataProvider],
    ['lammps_traj_data', LammpsTrajectoryDataProvider],
    ['mol', MolProvider],
    ['sdf', SdfProvider],
    ['mol2', Mol2Provider],
];
