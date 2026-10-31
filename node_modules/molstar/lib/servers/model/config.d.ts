/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { ModelPropertyProviderConfig } from './property-provider';
declare const DefaultModelServerConfig: {
    cacheMaxSizeInBytes: number;
    cacheEntryTimeoutMs: number;
    /**
     * Node (V8) sometimes exhibits GC related issues  that significantly slow down the execution
     * (https://github.com/nodejs/node/issues/8670).
     *
     * Therefore an option is provided that automatically shuts down the server.
     * For this to work, the server must be run using a deamon (i.e. forever.js on Linux
     * or IISnode on Windows) so that the server is automatically restarted when the shutdown happens.
     */
    shutdownTimeoutMinutes: number;
    shutdownTimeoutVarianceMinutes: number;
    defaultPort: number;
    /**
     * Specify the prefix of the API, i.e.
     * <host>/<apiPrefix>/<API queries>
     */
    apiPrefix: string;
    /**
     * The maximum time the server dedicates to executing a query.
     * Does not include the time it takes to read and export the data.
     */
    queryTimeoutMs: number;
    /**
     * The maximum number of ms the server spends on a request
     */
    requestTimeoutMs: number;
    /** Maximum number of requests before "server busy" */
    maxQueueLength: number;
    /** The maximum number of queries allowed by the query-many at a time */
    maxQueryManyQueries: number;
    /**
     * Provide a property config or a path a JSON file with the config.
     */
    customProperties: ModelPropertyProviderConfig | string;
    /**
     * Default source for fileMapping.
     */
    defaultSource: string;
    /**
     * Maps a request identifier to either:
     * - filename [source, mapping]
     * - URI [source, mapping, format]
     *
     * Mapping is provided 'source' and 'id' variables to interpolate.
     *
     * /static query uses 'pdb-cif' and 'pdb-bcif' source names.
     */
    sourceMap: ([string, string] | [string, string, ModelServerFetchFormats])[];
    /**
     * Optionally point to files. The service health-check will assert that all are readable and fail otherwise.
     */
    healthCheckPath: string[];
};
export declare const ModelServerFetchFormats: readonly ["cif", "bcif", "cif.gz", "bcif.gz"];
export type ModelServerFetchFormats = (typeof ModelServerFetchFormats)[number];
export declare let mapSourceAndIdToFilename: (source: string, id: string) => [string, ModelServerFetchFormats];
export type ModelServerConfig = typeof DefaultModelServerConfig;
export declare const ModelServerConfig: {
    cacheMaxSizeInBytes: number;
    cacheEntryTimeoutMs: number;
    /**
     * Node (V8) sometimes exhibits GC related issues  that significantly slow down the execution
     * (https://github.com/nodejs/node/issues/8670).
     *
     * Therefore an option is provided that automatically shuts down the server.
     * For this to work, the server must be run using a deamon (i.e. forever.js on Linux
     * or IISnode on Windows) so that the server is automatically restarted when the shutdown happens.
     */
    shutdownTimeoutMinutes: number;
    shutdownTimeoutVarianceMinutes: number;
    defaultPort: number;
    /**
     * Specify the prefix of the API, i.e.
     * <host>/<apiPrefix>/<API queries>
     */
    apiPrefix: string;
    /**
     * The maximum time the server dedicates to executing a query.
     * Does not include the time it takes to read and export the data.
     */
    queryTimeoutMs: number;
    /**
     * The maximum number of ms the server spends on a request
     */
    requestTimeoutMs: number;
    /** Maximum number of requests before "server busy" */
    maxQueueLength: number;
    /** The maximum number of queries allowed by the query-many at a time */
    maxQueryManyQueries: number;
    /**
     * Provide a property config or a path a JSON file with the config.
     */
    customProperties: ModelPropertyProviderConfig | string;
    /**
     * Default source for fileMapping.
     */
    defaultSource: string;
    /**
     * Maps a request identifier to either:
     * - filename [source, mapping]
     * - URI [source, mapping, format]
     *
     * Mapping is provided 'source' and 'id' variables to interpolate.
     *
     * /static query uses 'pdb-cif' and 'pdb-bcif' source names.
     */
    sourceMap: ([string, string] | [string, string, ModelServerFetchFormats])[];
    /**
     * Optionally point to files. The service health-check will assert that all are readable and fail otherwise.
     */
    healthCheckPath: string[];
};
export declare const ModelServerConfigTemplate: ModelServerConfig;
export declare function configureServer(): void;
export {};
