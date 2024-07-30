/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsMeshParams, UnitsSpheresParams, UnitsSpheresVisual, UnitsMeshVisual } from '../units-visual';
import { createElementSphereImpostor, ElementIterator, getElementLoci, eachElement, createElementSphereMesh, createStructureElementSphereImpostor, getSerialElementLoci, eachSerialElement, createStructureElementSphereMesh } from './util/element';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
import { ComplexMeshParams, ComplexMeshVisual, ComplexSpheresParams, ComplexSpheresVisual } from '../complex-visual';
export const CommonElementSphereParams = {
    sizeFactor: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }),
    detail: PD.Numeric(0, { min: 0, max: 3, step: 1 }, BaseGeometry.CustomQualityParamInfo),
    ignoreHydrogens: PD.Boolean(false),
    ignoreHydrogensVariant: PD.Select('all', PD.arrayToOptions(['all', 'non-polar'])),
    traceOnly: PD.Boolean(false),
    tryUseImpostor: PD.Boolean(true),
    stride: PD.Numeric(1, { min: 1, max: 100, step: 1 }),
};
//
export const ElementSphereParams = {
    ...UnitsMeshParams,
    ...UnitsSpheresParams,
    ...CommonElementSphereParams,
};
export function ElementSphereVisual(materialId, structure, props, webgl) {
    return props.tryUseImpostor && webgl && webgl.extensions.fragDepth && webgl.extensions.textureFloat
        ? ElementSphereImpostorVisual(materialId)
        : ElementSphereMeshVisual(materialId);
}
export function ElementSphereImpostorVisual(materialId) {
    return UnitsSpheresVisual({
        defaultProps: PD.getDefaultValues(ElementSphereParams),
        createGeometry: createElementSphereImpostor,
        createLocationIterator: ElementIterator.fromGroup,
        getLoci: getElementLoci,
        eachLocation: eachElement,
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
export function ElementSphereMeshVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(ElementSphereParams),
        createGeometry: createElementSphereMesh,
        createLocationIterator: ElementIterator.fromGroup,
        getLoci: getElementLoci,
        eachLocation: eachElement,
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
export const StructureElementSphereParams = {
    ...ComplexMeshParams,
    ...ComplexSpheresParams,
    ...CommonElementSphereParams,
};
export function StructureElementSphereVisual(materialId, structure, props, webgl) {
    return props.tryUseImpostor && webgl && webgl.extensions.fragDepth && webgl.extensions.textureFloat
        ? StructureElementSphereImpostorVisual(materialId)
        : StructureElementSphereMeshVisual(materialId);
}
export function StructureElementSphereImpostorVisual(materialId) {
    return ComplexSpheresVisual({
        defaultProps: PD.getDefaultValues(StructureElementSphereParams),
        createGeometry: createStructureElementSphereImpostor,
        createLocationIterator: ElementIterator.fromStructure,
        getLoci: getSerialElementLoci,
        eachLocation: eachSerialElement,
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
export function StructureElementSphereMeshVisual(materialId) {
    return ComplexMeshVisual({
        defaultProps: PD.getDefaultValues(StructureElementSphereParams),
        createGeometry: createStructureElementSphereMesh,
        createLocationIterator: ElementIterator.fromStructure,
        getLoci: getSerialElementLoci,
        eachLocation: eachSerialElement,
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
