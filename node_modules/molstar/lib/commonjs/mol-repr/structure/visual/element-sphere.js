"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureElementSphereParams = exports.ElementSphereParams = exports.CommonElementSphereParams = void 0;
exports.ElementSphereVisual = ElementSphereVisual;
exports.ElementSphereImpostorVisual = ElementSphereImpostorVisual;
exports.ElementSphereMeshVisual = ElementSphereMeshVisual;
exports.StructureElementSphereVisual = StructureElementSphereVisual;
exports.StructureElementSphereImpostorVisual = StructureElementSphereImpostorVisual;
exports.StructureElementSphereMeshVisual = StructureElementSphereMeshVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const units_visual_1 = require("../units-visual");
const element_1 = require("./util/element");
const base_1 = require("../../../mol-geo/geometry/base");
const complex_visual_1 = require("../complex-visual");
exports.CommonElementSphereParams = {
    sizeFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.1 }),
    detail: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 3, step: 1 }, base_1.BaseGeometry.CustomQualityParamInfo),
    ignoreHydrogens: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogensVariant: param_definition_1.ParamDefinition.Select('all', param_definition_1.ParamDefinition.arrayToOptions(['all', 'non-polar'])),
    traceOnly: param_definition_1.ParamDefinition.Boolean(false),
    tryUseImpostor: param_definition_1.ParamDefinition.Boolean(true),
    stride: param_definition_1.ParamDefinition.Numeric(1, { min: 1, max: 100, step: 1 }),
};
//
exports.ElementSphereParams = {
    ...units_visual_1.UnitsMeshParams,
    ...units_visual_1.UnitsSpheresParams,
    ...exports.CommonElementSphereParams,
};
function ElementSphereVisual(materialId, structure, props, webgl) {
    return props.tryUseImpostor && webgl && webgl.extensions.fragDepth && webgl.extensions.textureFloat
        ? ElementSphereImpostorVisual(materialId)
        : ElementSphereMeshVisual(materialId);
}
function ElementSphereImpostorVisual(materialId) {
    return (0, units_visual_1.UnitsSpheresVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.ElementSphereParams),
        createGeometry: element_1.createElementSphereImpostor,
        createLocationIterator: element_1.ElementIterator.fromGroup,
        getLoci: element_1.getElementLoci,
        eachLocation: element_1.eachElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                newProps.traceOnly !== currentProps.traceOnly ||
                newProps.stride !== currentProps.stride);
        },
        mustRecreate: (structureGroup, props, webgl) => {
            return !props.tryUseImpostor || !webgl;
        }
    }, materialId);
}
function ElementSphereMeshVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.ElementSphereParams),
        createGeometry: element_1.createElementSphereMesh,
        createLocationIterator: element_1.ElementIterator.fromGroup,
        getLoci: element_1.getElementLoci,
        eachLocation: element_1.eachElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.detail !== currentProps.detail ||
                newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                newProps.traceOnly !== currentProps.traceOnly ||
                newProps.stride !== currentProps.stride);
        },
        mustRecreate: (structureGroup, props, webgl) => {
            return props.tryUseImpostor && !!webgl;
        }
    }, materialId);
}
//
exports.StructureElementSphereParams = {
    ...complex_visual_1.ComplexMeshParams,
    ...complex_visual_1.ComplexSpheresParams,
    ...exports.CommonElementSphereParams,
};
function StructureElementSphereVisual(materialId, structure, props, webgl) {
    return props.tryUseImpostor && webgl && webgl.extensions.fragDepth && webgl.extensions.textureFloat
        ? StructureElementSphereImpostorVisual(materialId)
        : StructureElementSphereMeshVisual(materialId);
}
function StructureElementSphereImpostorVisual(materialId) {
    return (0, complex_visual_1.ComplexSpheresVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.StructureElementSphereParams),
        createGeometry: element_1.createStructureElementSphereImpostor,
        createLocationIterator: element_1.ElementIterator.fromStructure,
        getLoci: element_1.getSerialElementLoci,
        eachLocation: element_1.eachSerialElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                newProps.traceOnly !== currentProps.traceOnly ||
                newProps.stride !== currentProps.stride);
        },
        mustRecreate: (structure, props, webgl) => {
            return !props.tryUseImpostor || !webgl;
        }
    }, materialId);
}
function StructureElementSphereMeshVisual(materialId) {
    return (0, complex_visual_1.ComplexMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.StructureElementSphereParams),
        createGeometry: element_1.createStructureElementSphereMesh,
        createLocationIterator: element_1.ElementIterator.fromStructure,
        getLoci: element_1.getSerialElementLoci,
        eachLocation: element_1.eachSerialElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.detail !== currentProps.detail ||
                newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                newProps.traceOnly !== currentProps.traceOnly ||
                newProps.stride !== currentProps.stride);
        },
        mustRecreate: (structure, props, webgl) => {
            return props.tryUseImpostor && !!webgl;
        }
    }, materialId);
}
