/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Volume } from '../../mol-model/volume';
import { PluginContext } from '../../mol-plugin/context';
import { RepresentationProvider } from '../../mol-repr/representation';
import { VolumeRepresentationRegistry } from '../../mol-repr/volume/registry';
import { StateTransformer } from '../../mol-state';
import { ColorTheme } from '../../mol-theme/color';
import { SizeTheme } from '../../mol-theme/size';
import { VolumeRepresentation3D } from '../transforms/representation';
export interface VolumeRepresentationBuiltInProps<R extends VolumeRepresentationRegistry.BuiltIn = VolumeRepresentationRegistry.BuiltIn, C extends ColorTheme.BuiltIn = ColorTheme.BuiltIn, S extends SizeTheme.BuiltIn = SizeTheme.BuiltIn> {
    /** Using any registered name will work, but code completion will break */
    type?: R;
    typeParams?: VolumeRepresentationRegistry.BuiltInParams<R>;
    /** Using any registered name will work, but code completion will break */
    color?: C;
    colorParams?: ColorTheme.BuiltInParams<C>;
    /** Using any registered name will work, but code completion will break */
    size?: S;
    sizeParams?: SizeTheme.BuiltInParams<S>;
}
export interface VolumeRepresentationProps<R extends RepresentationProvider<Volume> = RepresentationProvider<Volume>, C extends ColorTheme.Provider = ColorTheme.Provider, S extends SizeTheme.Provider = SizeTheme.Provider> {
    type?: R;
    typeParams?: Partial<RepresentationProvider.ParamValues<R>>;
    color?: C;
    colorParams?: Partial<ColorTheme.ParamValues<C>>;
    size?: S;
    sizeParams?: Partial<SizeTheme.ParamValues<S>>;
}
export declare function createVolumeRepresentationParams<R extends VolumeRepresentationRegistry.BuiltIn, C extends ColorTheme.BuiltIn, S extends SizeTheme.BuiltIn>(ctx: PluginContext, volume?: Volume, props?: VolumeRepresentationBuiltInProps<R, C, S>): StateTransformer.Params<VolumeRepresentation3D>;
export declare function createVolumeRepresentationParams<R extends RepresentationProvider<Volume>, C extends ColorTheme.Provider, S extends SizeTheme.Provider>(ctx: PluginContext, volume?: Volume, props?: VolumeRepresentationProps<R, C, S>): StateTransformer.Params<VolumeRepresentation3D>;
export declare function getVolumeThemeTypes(ctx: PluginContext, volume?: Volume): [string, string, string][];
export declare function createVolumeColorThemeParams<T extends ColorTheme.BuiltIn>(ctx: PluginContext, volume: Volume | undefined, typeName: string | undefined, themeName: T, params?: ColorTheme.BuiltInParams<T>): StateTransformer.Params<VolumeRepresentation3D>['colorTheme'];
export declare function createVolumeColorThemeParams(ctx: PluginContext, volume: Volume | undefined, typeName: string | undefined, themeName?: string, params?: any): StateTransformer.Params<VolumeRepresentation3D>['colorTheme'];
export declare function createVolumeSizeThemeParams<T extends SizeTheme.BuiltIn>(ctx: PluginContext, volume: Volume | undefined, typeName: string | undefined, themeName: T, params?: SizeTheme.BuiltInParams<T>): StateTransformer.Params<VolumeRepresentation3D>['sizeTheme'];
export declare function createVolumeSizeThemeParams(ctx: PluginContext, volume: Volume | undefined, typeName: string | undefined, themeName?: string, params?: any): StateTransformer.Params<VolumeRepresentation3D>['sizeTheme'];
