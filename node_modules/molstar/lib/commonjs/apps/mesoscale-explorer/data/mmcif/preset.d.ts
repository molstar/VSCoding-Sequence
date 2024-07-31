/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginStateObject } from '../../../../mol-plugin-state/objects';
import { PluginContext } from '../../../../mol-plugin/context';
import { StateObjectRef } from '../../../../mol-state';
export declare function createMmcifHierarchy(plugin: PluginContext, trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>): Promise<void>;
