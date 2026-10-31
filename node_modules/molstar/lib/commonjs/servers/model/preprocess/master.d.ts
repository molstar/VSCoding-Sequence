/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ModelPropertyProviderConfig } from '../property-provider';
export interface PreprocessConfig {
    numProcesses?: number;
    customProperties?: ModelPropertyProviderConfig | string;
}
