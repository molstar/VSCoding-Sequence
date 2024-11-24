/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Mat4 } from '../../mol-math/linear-algebra';
import { PluginContext } from '../../mol-plugin/context';
export type SuperpositionTestInput = {
    pdbId: string;
    auth_asym_id: string;
    matrix: Mat4;
}[];
export declare function buildStaticSuperposition(plugin: PluginContext, src: SuperpositionTestInput): Promise<void>;
export declare const StaticSuperpositionTestData: SuperpositionTestInput;
export declare function dynamicSuperpositionTest(plugin: PluginContext, src: string[], comp_id: string): Promise<void>;
