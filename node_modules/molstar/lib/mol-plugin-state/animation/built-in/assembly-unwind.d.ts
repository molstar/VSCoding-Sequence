/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginStateAnimation } from '../model';
export declare const AnimateAssemblyUnwind: PluginStateAnimation<{
    durationInMs: number;
    playOnce: boolean;
    target: string;
}, {
    t: number;
}>;
