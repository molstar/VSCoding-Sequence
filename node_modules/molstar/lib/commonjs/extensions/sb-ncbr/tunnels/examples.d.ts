/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
import { PluginContext } from '../../../mol-plugin/context';
export declare const DB_URL = "https://channelsdb2.biodata.ceitec.cz/api/channels/";
export declare const SUB_DB = "pdb";
export declare const CHANNEL = "1ymg";
export declare const URL = "https://channelsdb2.biodata.ceitec.cz/api/channels/pdb/1ymg";
export declare function runVisualizeTunnels(plugin: PluginContext, url?: string): Promise<void>;
export declare function runVisualizeTunnel(plugin: PluginContext): Promise<void>;
