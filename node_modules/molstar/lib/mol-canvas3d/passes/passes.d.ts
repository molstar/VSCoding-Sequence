/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { DrawPass } from './draw';
import { PickPass } from './pick';
import { MultiSamplePass } from './multi-sample';
import { WebGLContext } from '../../mol-gl/webgl/context';
import { AssetManager } from '../../mol-util/assets';
import { IlluminationPass } from './illumination';
export declare class Passes {
    private webgl;
    readonly draw: DrawPass;
    readonly pick: PickPass;
    readonly multiSample: MultiSamplePass;
    readonly illumination: IlluminationPass;
    constructor(webgl: WebGLContext, assetManager: AssetManager, attribs?: Partial<{
        pickScale: number;
        transparency: 'wboit' | 'dpoit' | 'blended';
    }>);
    setPickScale(pickScale: number): void;
    setTransparency(transparency: 'wboit' | 'dpoit' | 'blended'): void;
    updateSize(): void;
}
