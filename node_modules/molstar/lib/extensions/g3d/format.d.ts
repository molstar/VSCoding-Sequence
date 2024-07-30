/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Trajectory } from '../../mol-model/structure';
import { TrajectoryFormatProvider } from '../../mol-plugin-state/formats/trajectory';
import { PluginStateObject as SO } from '../../mol-plugin-state/objects';
import { PluginBehavior } from '../../mol-plugin/behavior';
import { StateAction } from '../../mol-state';
import { ParamDefinition } from '../../mol-util/param-definition';
import { G3dHeader } from './data';
export declare const G3dProvider: TrajectoryFormatProvider;
declare const G3dHeaderObject_base: {
    new (data: {
        header: G3dHeader;
        urlOrData: Uint8Array | string;
        cache: {
            [resolution: number]: Trajectory | undefined;
        };
    }, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: import("../../mol-util").UUID;
        type: SO.TypeInfo;
        label: string;
        description?: string;
        data: {
            header: G3dHeader;
            urlOrData: Uint8Array | string;
            cache: {
                [resolution: number]: Trajectory | undefined;
            };
        };
    };
    type: SO.TypeInfo;
    is(obj?: import("../../mol-state").StateObject): obj is import("../../mol-state").StateObject<{
        header: G3dHeader;
        urlOrData: Uint8Array | string;
        cache: {
            [resolution: number]: Trajectory | undefined;
        };
    }, SO.TypeInfo>;
};
export declare class G3dHeaderObject extends G3dHeaderObject_base {
}
export type G3DHeaderFromFile = typeof G3DHeaderFromFile;
export declare const G3DHeaderFromFile: import("../../mol-state").StateTransformer<SO.Data.Binary, G3dHeaderObject, ParamDefinition.Normalize<{}>>;
export type G3DHeaderFromUrl = typeof G3DHeaderFromUrl;
export declare const G3DHeaderFromUrl: import("../../mol-state").StateTransformer<SO.Root, G3dHeaderObject, ParamDefinition.Normalize<{
    url: string;
}>>;
export type G3DTrajectory = typeof G3DHeaderFromUrl;
export declare const G3DTrajectory: import("../../mol-state").StateTransformer<G3dHeaderObject, SO.Molecule.Trajectory, ParamDefinition.Normalize<{
    resolution: number;
}>>;
export declare const LoadG3D: StateAction<SO.Root, void, ParamDefinition.Normalize<{
    url: string;
}>>;
export declare const G3DFormat: import("../../mol-state").StateTransformer<PluginBehavior.Category, PluginBehavior.Behavior, {
    autoAttach: boolean;
    showTooltip: boolean;
}>;
export {};
