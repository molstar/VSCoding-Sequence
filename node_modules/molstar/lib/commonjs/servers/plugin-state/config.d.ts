/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export interface Config {
    working_folder: string;
    port?: string | number;
    api_prefix: string;
    max_states: number;
}
export declare function getConfig(): Config;
