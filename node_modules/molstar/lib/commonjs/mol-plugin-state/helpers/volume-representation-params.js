"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVolumeRepresentationParams = createVolumeRepresentationParams;
exports.getVolumeThemeTypes = getVolumeThemeTypes;
exports.createVolumeColorThemeParams = createVolumeColorThemeParams;
exports.createVolumeSizeThemeParams = createVolumeSizeThemeParams;
const volume_1 = require("../../mol-model/volume");
const param_definition_1 = require("../../mol-util/param-definition");
function createVolumeRepresentationParams(ctx, volume, props = {}) {
    const p = props;
    if (typeof p.type === 'string' || typeof p.color === 'string' || typeof p.size === 'string')
        return createParamsByName(ctx, volume || volume_1.Volume.One, props);
    return createParamsProvider(ctx, volume || volume_1.Volume.One, props);
}
function getVolumeThemeTypes(ctx, volume) {
    const { themes: themeCtx } = ctx.representation.volume;
    if (!volume)
        return themeCtx.colorThemeRegistry.types;
    return themeCtx.colorThemeRegistry.getApplicableTypes({ volume });
}
function createVolumeColorThemeParams(ctx, volume, typeName, themeName, params) {
    const { registry, themes } = ctx.representation.volume;
    const repr = registry.get(typeName || registry.default.name);
    const color = themes.colorThemeRegistry.get(themeName || repr.defaultColorTheme.name);
    const colorDefaultParams = param_definition_1.ParamDefinition.getDefaultValues(color.getParams({ volume: volume || volume_1.Volume.One }));
    if (color.name === repr.defaultColorTheme.name)
        Object.assign(colorDefaultParams, repr.defaultColorTheme.props);
    return { name: color.name, params: Object.assign(colorDefaultParams, params) };
}
function createVolumeSizeThemeParams(ctx, volume, typeName, themeName, params) {
    const { registry, themes } = ctx.representation.volume;
    const repr = registry.get(typeName || registry.default.name);
    const size = themes.sizeThemeRegistry.get(themeName || repr.defaultSizeTheme.name);
    const sizeDefaultParams = param_definition_1.ParamDefinition.getDefaultValues(size.getParams({ volume: volume || volume_1.Volume.One }));
    if (size.name === repr.defaultSizeTheme.name)
        Object.assign(sizeDefaultParams, repr.defaultSizeTheme.props);
    return { name: size.name, params: Object.assign(sizeDefaultParams, params) };
}
function createParamsByName(ctx, volume, props) {
    const typeProvider = (props.type && ctx.representation.volume.registry.get(props.type))
        || ctx.representation.volume.registry.default.provider;
    const colorProvider = (props.color && ctx.representation.volume.themes.colorThemeRegistry.get(props.color))
        || ctx.representation.volume.themes.colorThemeRegistry.get(typeProvider.defaultColorTheme.name);
    const sizeProvider = (props.size && ctx.representation.volume.themes.sizeThemeRegistry.get(props.size))
        || ctx.representation.volume.themes.sizeThemeRegistry.get(typeProvider.defaultSizeTheme.name);
    return createParamsProvider(ctx, volume, {
        type: typeProvider,
        typeParams: props.typeParams,
        color: colorProvider,
        colorParams: props.colorParams,
        size: sizeProvider,
        sizeParams: props.sizeParams
    });
}
function createParamsProvider(ctx, volume, props = {}) {
    const { themes: themeCtx } = ctx.representation.volume;
    const themeDataCtx = { volume };
    const repr = props.type || ctx.representation.volume.registry.default.provider;
    const reprDefaultParams = param_definition_1.ParamDefinition.getDefaultValues(repr.getParams(themeCtx, volume));
    const reprParams = Object.assign(reprDefaultParams, props.typeParams);
    const color = props.color || themeCtx.colorThemeRegistry.get(repr.defaultColorTheme.name);
    const colorDefaultParams = param_definition_1.ParamDefinition.getDefaultValues(color.getParams(themeDataCtx));
    if (color.name === repr.defaultColorTheme.name)
        Object.assign(colorDefaultParams, repr.defaultColorTheme.props);
    const colorParams = Object.assign(colorDefaultParams, props.colorParams);
    const size = props.size || themeCtx.sizeThemeRegistry.get(repr.defaultSizeTheme.name);
    const sizeDefaultParams = param_definition_1.ParamDefinition.getDefaultValues(size.getParams(themeDataCtx));
    if (size.name === repr.defaultSizeTheme.name)
        Object.assign(sizeDefaultParams, repr.defaultSizeTheme.props);
    const sizeParams = Object.assign(sizeDefaultParams, props.sizeParams);
    return ({
        type: { name: repr.name, params: reprParams },
        colorTheme: { name: color.name, params: colorParams },
        sizeTheme: { name: size.name, params: sizeParams }
    });
}
