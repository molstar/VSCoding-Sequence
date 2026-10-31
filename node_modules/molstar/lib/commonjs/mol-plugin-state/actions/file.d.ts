/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StateAction } from '../../mol-state';
import { Asset } from '../../mol-util/assets';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject } from '../objects';
export declare const OpenFiles: StateAction<PluginStateObject.Root, void, PD.Normalize<{
    files: Asset.File[] | null;
    format: PD.NamedParams<PD.Normalize<unknown>, "auto"> | PD.NamedParams<string, "specific">;
    visuals: boolean;
}>>;
export declare const DownloadFile: StateAction<PluginStateObject.Root, void, PD.Normalize<{
    url: string | Asset.Url;
    format: string;
    isBinary: boolean;
    visuals: boolean;
}>>;
