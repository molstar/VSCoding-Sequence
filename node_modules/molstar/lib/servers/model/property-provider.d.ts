/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Model } from '../../mol-model/structure';
export interface ModelPropertyProviderConfig {
    sources: string[];
    params?: {
        [name: string]: any;
    };
}
export type AttachModelProperty = (args: {
    model: Model;
    params: any;
    cache: any;
}) => Promise<any>;
export type AttachModelProperties = (args: {
    model: Model;
    params: any;
    cache: any;
}) => Promise<any>[];
export type ModelPropertiesProvider = (model: Model, cache: any) => Promise<any>[];
export declare function createModelPropertiesProviderFromConfig(): ModelPropertiesProvider | undefined;
export declare function createModelPropertiesProvider(configOrPath: ModelPropertyProviderConfig | string | undefined): ModelPropertiesProvider | undefined;
