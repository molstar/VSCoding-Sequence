/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginContext } from '../../mol-plugin/context';
import { StateObjectSelector } from '../../mol-state';
import { MeshServerInfo } from './mesh-streaming/server-info';
export declare const DB_URL = "/db";
export declare function runMeshExtensionExamples(plugin: PluginContext, db_url?: string): Promise<void>;
/** Example for downloading multiple separate segments, each containing 1 mesh. */
export declare function runMeshExample(plugin: PluginContext, segments: 'fg' | 'all', db_url?: string): Promise<void>;
/** Example for downloading multiple separate segments, each containing 1 mesh. */
export declare function runMeshExample2(plugin: PluginContext, segments: 'one' | 'few' | 'fg' | 'all'): Promise<void>;
/** Example for downloading a single segment containing multiple meshes. */
export declare function runMultimeshExample(plugin: PluginContext, segments: 'fg' | 'all', detailChoice: 'best' | 'worst', db_url?: string): Promise<void>;
export declare function runMeshStreamingExample(plugin: PluginContext, source?: MeshServerInfo.MeshSource, entryId?: string, serverUrl?: string, parent?: StateObjectSelector): Promise<void>;
/** Example for downloading a protein structure and visualizing molecular surface. */
export declare function runMolsurfaceExample(plugin: PluginContext): Promise<void>;
/** Example for downloading an EMDB density data and visualizing isosurface. */
export declare function runIsosurfaceExample(plugin: PluginContext, db_url?: string): Promise<void>;
export declare function runCifMeshExample(plugin: PluginContext, api?: string, source?: MeshServerInfo.MeshSource, entryId?: string, segmentId?: number, detail?: number): Promise<void>;
