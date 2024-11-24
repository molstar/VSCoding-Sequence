/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Scene } from '../../mol-gl/scene';
import { WebGLContext } from '../../mol-gl/webgl/context';
export declare const DebugHelperParams: {
    sceneBoundingSpheres: PD.BooleanParam;
    visibleSceneBoundingSpheres: PD.BooleanParam;
    objectBoundingSpheres: PD.BooleanParam;
    instanceBoundingSpheres: PD.BooleanParam;
};
export type DebugHelperParams = typeof DebugHelperParams;
export type DebugHelperProps = PD.Values<DebugHelperParams>;
export declare class BoundingSphereHelper {
    readonly scene: Scene;
    private readonly parent;
    private _props;
    private objectsData;
    private instancesData;
    private sceneData;
    private visibleSceneData;
    constructor(ctx: WebGLContext, parent: Scene, props: Partial<DebugHelperProps>);
    update(): void;
    syncVisibility(): void;
    clear(): void;
    get isEnabled(): boolean;
    get props(): Readonly<DebugHelperProps>;
    setProps(props: Partial<DebugHelperProps>): void;
}
