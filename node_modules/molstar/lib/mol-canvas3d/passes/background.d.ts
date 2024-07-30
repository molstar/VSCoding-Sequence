/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Texture } from '../../mol-gl/webgl/texture';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ICamera } from '../camera';
import { Color } from '../../mol-util/color';
import { Asset, AssetManager } from '../../mol-util/assets';
export declare const BackgroundParams: {
    variant: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        coverage: string;
        opacity: number;
        saturation: number;
        lightness: number;
        source: PD.NamedParams<any, "url"> | PD.NamedParams<Asset.File | null, "file">;
        blur: number;
    }>, "image"> | PD.NamedParams<PD.Normalize<{
        centerColor: Color;
        edgeColor: Color;
        ratio: number;
        coverage: string;
    }>, "radialGradient"> | PD.NamedParams<PD.Normalize<{
        opacity: number;
        saturation: number;
        lightness: number;
        faces: PD.NamedParams<PD.Normalize<{
            nx: any;
            ny: any;
            nz: any;
            px: any;
            py: any;
            pz: any;
        }>, "urls"> | PD.NamedParams<PD.Normalize<{
            nx: any;
            ny: any;
            nz: any;
            px: any;
            py: any;
            pz: any;
        }>, "files">;
        blur: number;
        rotation: PD.Normalize<{
            x: any;
            y: any;
            z: any;
        }>;
    }>, "skybox"> | PD.NamedParams<PD.Normalize<{
        topColor: Color;
        bottomColor: Color;
        ratio: number;
        coverage: string;
    }>, "horizontalGradient">>;
};
export type BackgroundProps = PD.Values<typeof BackgroundParams>;
export declare class BackgroundPass {
    private readonly webgl;
    private readonly assetManager;
    private renderable;
    private skybox;
    private image;
    private readonly camera;
    private readonly target;
    private readonly position;
    private readonly dir;
    readonly texture: Texture;
    constructor(webgl: WebGLContext, assetManager: AssetManager, width: number, height: number);
    setSize(width: number, height: number): void;
    private clearSkybox;
    private updateSkybox;
    private clearImage;
    private updateImage;
    private updateImageScaling;
    private updateGradient;
    update(camera: ICamera, props: BackgroundProps, onload?: (changed: boolean) => void): void;
    isEnabled(props: BackgroundProps): boolean;
    private isReady;
    render(): void;
    dispose(): void;
}
