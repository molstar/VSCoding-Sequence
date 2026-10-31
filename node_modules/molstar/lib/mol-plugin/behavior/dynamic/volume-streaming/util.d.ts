/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure, Model } from '../../../../mol-model/structure';
import { VolumeServerInfo } from './model';
import { PluginContext } from '../../../../mol-plugin/context';
import { RuntimeContext } from '../../../../mol-task';
export declare function getStreamingMethod(s?: Structure, defaultKind?: VolumeServerInfo.Kind): VolumeServerInfo.Kind;
/** Returns EMD ID when available, otherwise falls back to PDB ID */
export declare function getEmIds(model: Model): string[];
export declare function getXrayIds(model: Model): string[];
export declare function getIds(method: VolumeServerInfo.Kind, s?: Structure): string[];
export declare function getContourLevel(provider: 'emdb' | 'pdbe', plugin: PluginContext, taskCtx: RuntimeContext, emdbId: string): Promise<any>;
export declare function getContourLevelEmdb(plugin: PluginContext, taskCtx: RuntimeContext, emdbId: string): Promise<number>;
export declare function getContourLevelPdbe(plugin: PluginContext, taskCtx: RuntimeContext, emdbId: string): Promise<any>;
export declare function getEmdbIds(plugin: PluginContext, taskCtx: RuntimeContext, pdbId: string): Promise<string[]>;
