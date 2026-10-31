/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure } from '../../mol-model/structure';
import { PluginContext } from '../../mol-plugin/context';
import { RepresentationProvider } from '../../mol-repr/representation';
import { StructureRepresentationRegistry } from '../../mol-repr/structure/registry';
import { StateTransformer } from '../../mol-state';
import { ColorTheme } from '../../mol-theme/color';
import { SizeTheme } from '../../mol-theme/size';
import { StructureRepresentation3D } from '../transforms/representation';
export interface StructureRepresentationBuiltInProps<R extends StructureRepresentationRegistry.BuiltIn = StructureRepresentationRegistry.BuiltIn, C extends ColorTheme.BuiltIn = ColorTheme.BuiltIn, S extends SizeTheme.BuiltIn = SizeTheme.BuiltIn> {
    /** Using any registered name will work, but code completion will break */
    type?: R;
    typeParams?: StructureRepresentationRegistry.BuiltInParams<R>;
    /** Using any registered name will work, but code completion will break */
    color?: C;
    colorParams?: ColorTheme.BuiltInParams<C>;
    /** Using any registered name will work, but code completion will break */
    size?: S;
    sizeParams?: SizeTheme.BuiltInParams<S>;
}
export interface StructureRepresentationProps<R extends RepresentationProvider<Structure> = RepresentationProvider<Structure>, C extends ColorTheme.Provider = ColorTheme.Provider, S extends SizeTheme.Provider = SizeTheme.Provider> {
    type?: R;
    typeParams?: Partial<RepresentationProvider.ParamValues<R>>;
    color?: C;
    colorParams?: Partial<ColorTheme.ParamValues<C>>;
    size?: S;
    sizeParams?: Partial<SizeTheme.ParamValues<S>>;
}
export declare function createStructureRepresentationParams<R extends StructureRepresentationRegistry.BuiltIn, C extends ColorTheme.BuiltIn, S extends SizeTheme.BuiltIn>(ctx: PluginContext, structure?: Structure, props?: StructureRepresentationBuiltInProps<R, C, S>): StateTransformer.Params<StructureRepresentation3D>;
export declare function createStructureRepresentationParams<R extends RepresentationProvider<Structure>, C extends ColorTheme.Provider, S extends SizeTheme.Provider>(ctx: PluginContext, structure?: Structure, props?: StructureRepresentationProps<R, C, S>): StateTransformer.Params<StructureRepresentation3D>;
export declare function getStructureThemeTypes(ctx: PluginContext, structure?: Structure): [string, string, string][];
export declare function createStructureColorThemeParams<T extends ColorTheme.BuiltIn>(ctx: PluginContext, structure: Structure | undefined, typeName: string | undefined, themeName: T, params?: ColorTheme.BuiltInParams<T>): StateTransformer.Params<StructureRepresentation3D>['colorTheme'];
export declare function createStructureColorThemeParams(ctx: PluginContext, structure: Structure | undefined, typeName: string | undefined, themeName?: string, params?: any): StateTransformer.Params<StructureRepresentation3D>['colorTheme'];
export declare function createStructureSizeThemeParams<T extends SizeTheme.BuiltIn>(ctx: PluginContext, structure: Structure | undefined, typeName: string | undefined, themeName: T, params?: SizeTheme.BuiltInParams<T>): StateTransformer.Params<StructureRepresentation3D>['sizeTheme'];
export declare function createStructureSizeThemeParams(ctx: PluginContext, structure: Structure | undefined, typeName: string | undefined, themeName?: string, params?: any): StateTransformer.Params<StructureRepresentation3D>['sizeTheme'];
