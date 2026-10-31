/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/**
 * on node `process.env.NODE_ENV` is available, in webpack build it is automatically set
 * by the DefinePlugin to the webpack `mode` value
 */
declare let isProductionMode: boolean;
/**
 * set to true to enable more comprehensive checks and assertions,
 * mostly used in `mol-gl` and in valence-model calculation
 */
declare let isDebugMode: boolean;
/**
 * set to true to gather timings, mostly used in `mol-gl`
 */
declare let isTimingMode: boolean;
export { isProductionMode, isDebugMode, isTimingMode };
export declare function setProductionMode(value?: boolean): void;
export declare function setDebugMode(value?: boolean): void;
export declare function setTimingMode(value?: boolean): void;
type ConsoleStatsProvider = () => void;
export declare function addConsoleStatsProvider(p: ConsoleStatsProvider): void;
export declare function removeConsoleStatsProvider(p: ConsoleStatsProvider): void;
export declare function consoleStats(): void;
