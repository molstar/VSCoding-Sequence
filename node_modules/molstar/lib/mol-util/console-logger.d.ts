/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export declare namespace ConsoleLogger {
    function formatTime(t: number): string;
    function log(tag: string, msg: string): void;
    function logId(guid: string, tag: string, msg: string): void;
    function error(ctx: string, e: any): void;
    function warn(ctx: string, e: any): void;
    function errorId(guid: string, e: any): void;
}
