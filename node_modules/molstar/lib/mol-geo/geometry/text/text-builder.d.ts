/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Text } from './text';
export interface TextBuilder {
    add(str: string, x: number, y: number, z: number, depth: number, scale: number, group: number): void;
    getText(): Text;
}
export declare namespace TextBuilder {
    function create(props?: Partial<PD.Values<Text.Params>>, initialCount?: number, chunkSize?: number, text?: Text): TextBuilder;
}
