/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginContext } from '../mol-plugin/context';
import { PluginUISpec } from './spec';
import { StateTransformParameters } from './state/common';
export declare class PluginUIContext extends PluginContext {
    spec: PluginUISpec;
    readonly customParamEditors: Map<string, StateTransformParameters.Class>;
    private initCustomParamEditors;
    dispose(options?: {
        doNotForceWebGLContextLoss?: boolean;
    }): void;
    constructor(spec: PluginUISpec);
}
