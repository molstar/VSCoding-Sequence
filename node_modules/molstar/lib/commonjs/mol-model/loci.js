"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loci = exports.EmptyLoci = exports.EveryLoci = void 0;
exports.isEveryLoci = isEveryLoci;
exports.isEmptyLoci = isEmptyLoci;
exports.isDataLoci = isDataLoci;
exports.areDataLociEqual = areDataLociEqual;
exports.isDataLociEmpty = isDataLociEmpty;
exports.DataLoci = DataLoci;
const structure_1 = require("./structure");
const bonds_1 = require("./structure/structure/unit/bonds");
const shape_1 = require("./shape");
const geometry_1 = require("../mol-math/geometry");
const linear_algebra_1 = require("../mol-math/linear-algebra");
const structure_2 = require("./structure/structure");
const param_definition_1 = require("../mol-util/param-definition");
const mol_util_1 = require("../mol-util");
const boundary_helper_1 = require("../mol-math/geometry/boundary-helper");
const string_1 = require("../mol-util/string");
const volume_1 = require("./volume/volume");
/** A Loci that includes every loci */
exports.EveryLoci = { kind: 'every-loci' };
function isEveryLoci(x) {
    return !!x && x.kind === 'every-loci';
}
/** A Loci that is empty */
exports.EmptyLoci = { kind: 'empty-loci' };
function isEmptyLoci(x) {
    return !!x && x.kind === 'empty-loci';
}
function isDataLoci(x) {
    return !!x && x.kind === 'data-loci';
}
function areDataLociEqual(a, b) {
    // use shallowEqual to allow simple data objects that are contructed on-the-fly
    if (!(0, mol_util_1.shallowEqual)(a.data, b.data) || a.tag !== b.tag)
        return false;
    if (a.elements.length !== b.elements.length)
        return false;
    for (let i = 0, il = a.elements.length; i < il; ++i) {
        if (!(0, mol_util_1.shallowEqual)(a.elements[i], b.elements[i]))
            return false;
    }
    return true;
}
function isDataLociEmpty(loci) {
    return loci.elements.length === 0 ? true : false;
}
function DataLoci(tag, data, elements, getBoundingSphere, getLabel) {
    return { kind: 'data-loci', tag, data, elements, getBoundingSphere, getLabel };
}
var Loci;
(function (Loci) {
    const boundaryHelper = new boundary_helper_1.BoundaryHelper('98');
    function getBundleBoundingSphere(bundle) {
        const spheres = bundle.loci.map(l => getBoundingSphere(l)).filter(s => !!s);
        boundaryHelper.reset();
        for (const s of spheres)
            boundaryHelper.includePositionRadius(s.center, s.radius);
        boundaryHelper.finishedIncludeStep();
        for (const s of spheres)
            boundaryHelper.radiusPositionRadius(s.center, s.radius);
        return boundaryHelper.getSphere();
    }
    Loci.getBundleBoundingSphere = getBundleBoundingSphere;
    function areEqual(lociA, lociB) {
        if (isEveryLoci(lociA) && isEveryLoci(lociB))
            return true;
        if (isEmptyLoci(lociA) && isEmptyLoci(lociB))
            return true;
        if (isDataLoci(lociA) && isDataLoci(lociB)) {
            return areDataLociEqual(lociA, lociB);
        }
        if (structure_2.Structure.isLoci(lociA) && structure_2.Structure.isLoci(lociB)) {
            return structure_2.Structure.areLociEqual(lociA, lociB);
        }
        if (structure_1.StructureElement.Loci.is(lociA) && structure_1.StructureElement.Loci.is(lociB)) {
            return structure_1.StructureElement.Loci.areEqual(lociA, lociB);
        }
        if (bonds_1.Bond.isLoci(lociA) && bonds_1.Bond.isLoci(lociB)) {
            return bonds_1.Bond.areLociEqual(lociA, lociB);
        }
        if (shape_1.Shape.isLoci(lociA) && shape_1.Shape.isLoci(lociB)) {
            return shape_1.Shape.areLociEqual(lociA, lociB);
        }
        if (shape_1.ShapeGroup.isLoci(lociA) && shape_1.ShapeGroup.isLoci(lociB)) {
            return shape_1.ShapeGroup.areLociEqual(lociA, lociB);
        }
        if (volume_1.Volume.isLoci(lociA) && volume_1.Volume.isLoci(lociB)) {
            return volume_1.Volume.areLociEqual(lociA, lociB);
        }
        if (volume_1.Volume.Isosurface.isLoci(lociA) && volume_1.Volume.Isosurface.isLoci(lociB)) {
            return volume_1.Volume.Isosurface.areLociEqual(lociA, lociB);
        }
        if (volume_1.Volume.Cell.isLoci(lociA) && volume_1.Volume.Cell.isLoci(lociB)) {
            return volume_1.Volume.Cell.areLociEqual(lociA, lociB);
        }
        if (volume_1.Volume.Segment.isLoci(lociA) && volume_1.Volume.Segment.isLoci(lociB)) {
            return volume_1.Volume.Segment.areLociEqual(lociA, lociB);
        }
        return false;
    }
    Loci.areEqual = areEqual;
    function isEvery(loci) {
        return !!loci && loci.kind === 'every-loci';
    }
    Loci.isEvery = isEvery;
    function isEmpty(loci) {
        if (isEveryLoci(loci))
            return false;
        if (isEmptyLoci(loci))
            return true;
        if (isDataLoci(loci))
            return isDataLociEmpty(loci);
        if (structure_2.Structure.isLoci(loci))
            return structure_2.Structure.isLociEmpty(loci);
        if (structure_1.StructureElement.Loci.is(loci))
            return structure_1.StructureElement.Loci.isEmpty(loci);
        if (bonds_1.Bond.isLoci(loci))
            return bonds_1.Bond.isLociEmpty(loci);
        if (shape_1.Shape.isLoci(loci))
            return shape_1.Shape.isLociEmpty(loci);
        if (shape_1.ShapeGroup.isLoci(loci))
            return shape_1.ShapeGroup.isLociEmpty(loci);
        if (volume_1.Volume.isLoci(loci))
            return volume_1.Volume.isLociEmpty(loci);
        if (volume_1.Volume.Isosurface.isLoci(loci))
            return volume_1.Volume.Isosurface.isLociEmpty(loci);
        if (volume_1.Volume.Cell.isLoci(loci))
            return volume_1.Volume.Cell.isLociEmpty(loci);
        if (volume_1.Volume.Segment.isLoci(loci))
            return volume_1.Volume.Segment.isLociEmpty(loci);
        return false;
    }
    Loci.isEmpty = isEmpty;
    function remap(loci, data) {
        if (data instanceof structure_2.Structure) {
            if (structure_1.StructureElement.Loci.is(loci)) {
                loci = structure_1.StructureElement.Loci.remap(loci, data);
            }
            else if (structure_2.Structure.isLoci(loci)) {
                loci = structure_2.Structure.remapLoci(loci, data);
            }
            else if (bonds_1.Bond.isLoci(loci)) {
                loci = bonds_1.Bond.remapLoci(loci, data);
            }
        }
        return loci;
    }
    Loci.remap = remap;
    function getBoundingSphere(loci, boundingSphere) {
        var _a;
        if (loci.kind === 'every-loci' || loci.kind === 'empty-loci')
            return void 0;
        if (!boundingSphere)
            boundingSphere = (0, geometry_1.Sphere3D)();
        if (loci.kind === 'structure-loci') {
            return geometry_1.Sphere3D.copy(boundingSphere, loci.structure.boundary.sphere);
        }
        else if (loci.kind === 'element-loci') {
            return geometry_1.Sphere3D.copy(boundingSphere, structure_1.StructureElement.Loci.getBoundary(loci).sphere);
        }
        else if (loci.kind === 'bond-loci') {
            return bonds_1.Bond.getBoundingSphere(loci, boundingSphere);
        }
        else if (loci.kind === 'shape-loci') {
            return geometry_1.Sphere3D.copy(boundingSphere, loci.shape.geometry.boundingSphere);
        }
        else if (loci.kind === 'group-loci') {
            return shape_1.ShapeGroup.getBoundingSphere(loci, boundingSphere);
        }
        else if (loci.kind === 'data-loci') {
            return (_a = loci.getBoundingSphere) === null || _a === void 0 ? void 0 : _a.call(loci, boundingSphere);
        }
        else if (loci.kind === 'volume-loci') {
            return volume_1.Volume.getBoundingSphere(loci.volume, boundingSphere);
        }
        else if (loci.kind === 'isosurface-loci') {
            return volume_1.Volume.Isosurface.getBoundingSphere(loci.volume, loci.isoValue, boundingSphere);
        }
        else if (loci.kind === 'cell-loci') {
            return volume_1.Volume.Cell.getBoundingSphere(loci.volume, loci.indices, boundingSphere);
        }
        else if (loci.kind === 'segment-loci') {
            return volume_1.Volume.Segment.getBoundingSphere(loci.volume, loci.segments, boundingSphere);
        }
    }
    Loci.getBoundingSphere = getBoundingSphere;
    const tmpSphere3D = geometry_1.Sphere3D.zero();
    function getCenter(loci, center) {
        const boundingSphere = getBoundingSphere(loci, tmpSphere3D);
        return boundingSphere ? linear_algebra_1.Vec3.copy(center || (0, linear_algebra_1.Vec3)(), boundingSphere.center) : undefined;
    }
    Loci.getCenter = getCenter;
    function getPrincipalAxes(loci) {
        if (loci.kind === 'every-loci' || loci.kind === 'empty-loci')
            return void 0;
        if (loci.kind === 'structure-loci') {
            return structure_1.StructureElement.Loci.getPrincipalAxes(structure_2.Structure.toStructureElementLoci(loci.structure));
        }
        else if (loci.kind === 'element-loci') {
            return structure_1.StructureElement.Loci.getPrincipalAxes(loci);
        }
        else if (loci.kind === 'bond-loci') {
            // TODO
            return void 0;
        }
        else if (loci.kind === 'shape-loci') {
            // TODO
            return void 0;
        }
        else if (loci.kind === 'group-loci') {
            // TODO
            return void 0;
        }
        else if (loci.kind === 'data-loci') {
            // TODO maybe add loci.getPrincipalAxes()???
            return void 0;
        }
        else if (loci.kind === 'volume-loci') {
            // TODO
            return void 0;
        }
        else if (loci.kind === 'isosurface-loci') {
            // TODO
            return void 0;
        }
        else if (loci.kind === 'cell-loci') {
            // TODO
            return void 0;
        }
        else if (loci.kind === 'segment-loci') {
            // TODO
            return void 0;
        }
    }
    Loci.getPrincipalAxes = getPrincipalAxes;
    //
    const Granularity = {
        'element': (loci) => loci,
        'residue': (loci) => {
            return structure_1.StructureElement.Loci.is(loci)
                ? structure_1.StructureElement.Loci.extendToWholeResidues(loci, true)
                : loci;
        },
        'chain': (loci) => {
            return structure_1.StructureElement.Loci.is(loci)
                ? structure_1.StructureElement.Loci.extendToWholeChains(loci)
                : loci;
        },
        'entity': (loci) => {
            return structure_1.StructureElement.Loci.is(loci)
                ? structure_1.StructureElement.Loci.extendToWholeEntities(loci)
                : loci;
        },
        'model': (loci) => {
            return structure_1.StructureElement.Loci.is(loci)
                ? structure_1.StructureElement.Loci.extendToWholeModels(loci)
                : loci;
        },
        'operator': (loci) => {
            return structure_1.StructureElement.Loci.is(loci)
                ? structure_1.StructureElement.Loci.extendToWholeOperators(loci)
                : loci;
        },
        'structure': (loci) => {
            return structure_1.StructureElement.Loci.is(loci)
                ? structure_2.Structure.toStructureElementLoci(loci.structure)
                : shape_1.ShapeGroup.isLoci(loci)
                    ? shape_1.Shape.Loci(loci.shape)
                    : volume_1.Volume.Cell.isLoci(loci)
                        ? volume_1.Volume.Loci(loci.volume)
                        : loci;
        },
        'elementInstances': (loci) => {
            return structure_1.StructureElement.Loci.is(loci)
                ? structure_1.StructureElement.Loci.extendToAllInstances(loci)
                : loci;
        },
        'residueInstances': (loci) => {
            return structure_1.StructureElement.Loci.is(loci)
                ? structure_1.StructureElement.Loci.extendToAllInstances(structure_1.StructureElement.Loci.extendToWholeResidues(loci, true))
                : loci;
        },
        'chainInstances': (loci) => {
            return structure_1.StructureElement.Loci.is(loci)
                ? structure_1.StructureElement.Loci.extendToAllInstances(structure_1.StructureElement.Loci.extendToWholeChains(loci))
                : loci;
        },
    };
    Loci.GranularityOptions = param_definition_1.ParamDefinition.objectToOptions(Granularity, k => {
        switch (k) {
            case 'element': return 'Atom/Coarse Element';
            case 'elementInstances': return ['Atom/Coarse Element Instances', 'With Symmetry'];
            case 'structure': return 'Structure/Shape';
            default: return k.indexOf('Instances')
                ? [(0, string_1.stringToWords)(k), 'With Symmetry'] : (0, string_1.stringToWords)(k);
        }
    });
    /** Exclude `Instances` granularity kinds */
    function simpleGranularity(granularity) {
        return granularity.replace('Instances', '');
    }
    Loci.simpleGranularity = simpleGranularity;
    function applyGranularity(loci, granularity) {
        return Granularity[granularity](loci);
    }
    Loci.applyGranularity = applyGranularity;
    /**
     * Converts structure related loci to StructureElement.Loci and applies
     * granularity if given
     */
    function normalize(loci, granularity, alwaysConvertBonds = false) {
        if ((granularity !== 'element' || alwaysConvertBonds) && bonds_1.Bond.isLoci(loci)) {
            // convert Bond.Loci to a StructureElement.Loci so granularity can be applied
            loci = bonds_1.Bond.toStructureElementLoci(loci);
        }
        if (structure_2.Structure.isLoci(loci)) {
            // convert to StructureElement.Loci
            loci = structure_2.Structure.toStructureElementLoci(loci.structure);
        }
        if (structure_1.StructureElement.Loci.is(loci)) {
            // ensure the root structure is used
            loci = structure_1.StructureElement.Loci.remap(loci, loci.structure.root);
        }
        if (granularity) {
            // needs to be applied AFTER remapping to root
            loci = applyGranularity(loci, granularity);
        }
        return loci;
    }
    Loci.normalize = normalize;
})(Loci || (exports.Loci = Loci = {}));
