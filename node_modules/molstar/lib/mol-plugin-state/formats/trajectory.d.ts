/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 */
import { DataFormatProvider } from './provider';
import { StateObjectRef } from '../../mol-state';
import { PluginStateObject } from '../objects';
export interface TrajectoryFormatProvider<P extends {
    trajectoryTags?: string | string[];
} = {
    trajectoryTags?: string | string[];
}, R extends {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
} = {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}> extends DataFormatProvider<P, R> {
}
export declare const TrajectoryFormatCategory = "Trajectory";
export declare const MmcifProvider: TrajectoryFormatProvider;
export declare const CifCoreProvider: TrajectoryFormatProvider;
export declare const PdbProvider: TrajectoryFormatProvider;
export declare const PdbqtProvider: TrajectoryFormatProvider;
export declare const XyzProvider: TrajectoryFormatProvider;
export declare const LammpsDataProvider: TrajectoryFormatProvider;
export declare const LammpsTrajectoryDataProvider: TrajectoryFormatProvider;
export declare const GroProvider: TrajectoryFormatProvider;
export declare const MolProvider: TrajectoryFormatProvider;
export declare const SdfProvider: TrajectoryFormatProvider;
export declare const Mol2Provider: TrajectoryFormatProvider;
export declare const BuiltInTrajectoryFormats: readonly [readonly ["mmcif", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>], readonly ["cifCore", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>], readonly ["pdb", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>], readonly ["pdbqt", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>], readonly ["gro", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>], readonly ["xyz", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>], readonly ["lammps_data", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>], readonly ["lammps_traj_data", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>], readonly ["mol", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>], readonly ["sdf", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>], readonly ["mol2", TrajectoryFormatProvider<{
    trajectoryTags?: string | string[];
}, {
    trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>;
}>]];
export type BuiltInTrajectoryFormat = (typeof BuiltInTrajectoryFormats)[number][0];
