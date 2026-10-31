/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement } from './structure';
import { Bond } from './structure/structure/unit/bonds';
import { Shape, ShapeGroup } from './shape';
import { Sphere3D } from '../mol-math/geometry';
import { Vec3 } from '../mol-math/linear-algebra';
import { Structure } from './structure/structure';
import { ParamDefinition } from '../mol-util/param-definition';
import { shallowEqual } from '../mol-util';
import { BoundaryHelper } from '../mol-math/geometry/boundary-helper';
import { stringToWords } from '../mol-util/string';
import { Volume } from './volume/volume';
/** A Loci that includes every loci */
export const EveryLoci = { kind: 'every-loci' };
export function isEveryLoci(x) {
    return !!x && x.kind === 'every-loci';
}
/** A Loci that is empty */
export const EmptyLoci = { kind: 'empty-loci' };
export function isEmptyLoci(x) {
    return !!x && x.kind === 'empty-loci';
}
export function isDataLoci(x) {
    return !!x && x.kind === 'data-loci';
}
export function areDataLociEqual(a, b) {
    // use shallowEqual to allow simple data objects that are contructed on-the-fly
    if (!shallowEqual(a.data, b.data) || a.tag !== b.tag)
        return false;
    if (a.elements.length !== b.elements.length)
        return false;
    for (let i = 0, il = a.elements.length; i < il; ++i) {
        if (!shallowEqual(a.elements[i], b.elements[i]))
            return false;
    }
    return true;
}
export function isDataLociEmpty(loci) {
    return loci.elements.length === 0 ? true : false;
}
export function DataLoci(tag, data, elements, getBoundingSphere, getLabel) {
    return { kind: 'data-loci', tag, data, elements, getBoundingSphere, getLabel };
}
export { Loci };
var Loci;
(function (Loci) {
    const boundaryHelper = new BoundaryHelper('98');
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
        if (Structure.isLoci(lociA) && Structure.isLoci(lociB)) {
            return Structure.areLociEqual(lociA, lociB);
        }
        if (StructureElement.Loci.is(lociA) && StructureElement.Loci.is(lociB)) {
            return StructureElement.Loci.areEqual(lociA, lociB);
        }
        if (Bond.isLoci(lociA) && Bond.isLoci(lociB)) {
            return Bond.areLociEqual(lociA, lociB);
        }
        if (Shape.isLoci(lociA) && Shape.isLoci(lociB)) {
            return Shape.areLociEqual(lociA, lociB);
        }
        if (ShapeGroup.isLoci(lociA) && ShapeGroup.isLoci(lociB)) {
            return ShapeGroup.areLociEqual(lociA, lociB);
        }
        if (Volume.isLoci(lociA) && Volume.isLoci(lociB)) {
            return Volume.areLociEqual(lociA, lociB);
        }
        if (Volume.Isosurface.isLoci(lociA) && Volume.Isosurface.isLoci(lociB)) {
            return Volume.Isosurface.areLociEqual(lociA, lociB);
        }
        if (Volume.Cell.isLoci(lociA) && Volume.Cell.isLoci(lociB)) {
            return Volume.Cell.areLociEqual(lociA, lociB);
        }
        if (Volume.Segment.isLoci(lociA) && Volume.Segment.isLoci(lociB)) {
            return Volume.Segment.areLociEqual(lociA, lociB);
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
        if (Structure.isLoci(loci))
            return Structure.isLociEmpty(loci);
        if (StructureElement.Loci.is(loci))
            return StructureElement.Loci.isEmpty(loci);
        if (Bond.isLoci(loci))
            return Bond.isLociEmpty(loci);
        if (Shape.isLoci(loci))
            return Shape.isLociEmpty(loci);
        if (ShapeGroup.isLoci(loci))
            return ShapeGroup.isLociEmpty(loci);
        if (Volume.isLoci(loci))
            return Volume.isLociEmpty(loci);
        if (Volume.Isosurface.isLoci(loci))
            return Volume.Isosurface.isLociEmpty(loci);
        if (Volume.Cell.isLoci(loci))
            return Volume.Cell.isLociEmpty(loci);
        if (Volume.Segment.isLoci(loci))
            return Volume.Segment.isLociEmpty(loci);
        return false;
    }
    Loci.isEmpty = isEmpty;
    function remap(loci, data) {
        if (data instanceof Structure) {
            if (StructureElement.Loci.is(loci)) {
                loci = StructureElement.Loci.remap(loci, data);
            }
            else if (Structure.isLoci(loci)) {
                loci = Structure.remapLoci(loci, data);
            }
            else if (Bond.isLoci(loci)) {
                loci = Bond.remapLoci(loci, data);
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
            boundingSphere = Sphere3D();
        if (loci.kind === 'structure-loci') {
            return Sphere3D.copy(boundingSphere, loci.structure.boundary.sphere);
        }
        else if (loci.kind === 'element-loci') {
            return Sphere3D.copy(boundingSphere, StructureElement.Loci.getBoundary(loci).sphere);
        }
        else if (loci.kind === 'bond-loci') {
            return Bond.getBoundingSphere(loci, boundingSphere);
        }
        else if (loci.kind === 'shape-loci') {
            return Sphere3D.copy(boundingSphere, loci.shape.geometry.boundingSphere);
        }
        else if (loci.kind === 'group-loci') {
            return ShapeGroup.getBoundingSphere(loci, boundingSphere);
        }
        else if (loci.kind === 'data-loci') {
            return (_a = loci.getBoundingSphere) === null || _a === void 0 ? void 0 : _a.call(loci, boundingSphere);
        }
        else if (loci.kind === 'volume-loci') {
            return Volume.getBoundingSphere(loci.volume, boundingSphere);
        }
        else if (loci.kind === 'isosurface-loci') {
            return Volume.Isosurface.getBoundingSphere(loci.volume, loci.isoValue, boundingSphere);
        }
        else if (loci.kind === 'cell-loci') {
            return Volume.Cell.getBoundingSphere(loci.volume, loci.indices, boundingSphere);
        }
        else if (loci.kind === 'segment-loci') {
            return Volume.Segment.getBoundingSphere(loci.volume, loci.segments, boundingSphere);
        }
    }
    Loci.getBoundingSphere = getBoundingSphere;
    const tmpSphere3D = Sphere3D.zero();
    function getCenter(loci, center) {
        const boundingSphere = getBoundingSphere(loci, tmpSphere3D);
        return boundingSphere ? Vec3.copy(center || Vec3(), boundingSphere.center) : undefined;
    }
    Loci.getCenter = getCenter;
    function getPrincipalAxes(loci) {
        if (loci.kind === 'every-loci' || loci.kind === 'empty-loci')
            return void 0;
        if (loci.kind === 'structure-loci') {
            return StructureElement.Loci.getPrincipalAxes(Structure.toStructureElementLoci(loci.structure));
        }
        else if (loci.kind === 'element-loci') {
            return StructureElement.Loci.getPrincipalAxes(loci);
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
            return StructureElement.Loci.is(loci)
                ? StructureElement.Loci.extendToWholeResidues(loci, true)
                : loci;
        },
        'chain': (loci) => {
            return StructureElement.Loci.is(loci)
                ? StructureElement.Loci.extendToWholeChains(loci)
                : loci;
        },
        'entity': (loci) => {
            return StructureElement.Loci.is(loci)
                ? StructureElement.Loci.extendToWholeEntities(loci)
                : loci;
        },
        'model': (loci) => {
            return StructureElement.Loci.is(loci)
                ? StructureElement.Loci.extendToWholeModels(loci)
                : loci;
        },
        'operator': (loci) => {
            return StructureElement.Loci.is(loci)
                ? StructureElement.Loci.extendToWholeOperators(loci)
                : loci;
        },
        'structure': (loci) => {
            return StructureElement.Loci.is(loci)
                ? Structure.toStructureElementLoci(loci.structure)
                : ShapeGroup.isLoci(loci)
                    ? Shape.Loci(loci.shape)
                    : Volume.Cell.isLoci(loci)
                        ? Volume.Loci(loci.volume)
                        : loci;
        },
        'elementInstances': (loci) => {
            return StructureElement.Loci.is(loci)
                ? StructureElement.Loci.extendToAllInstances(loci)
                : loci;
        },
        'residueInstances': (loci) => {
            return StructureElement.Loci.is(loci)
                ? StructureElement.Loci.extendToAllInstances(StructureElement.Loci.extendToWholeResidues(loci, true))
                : loci;
        },
        'chainInstances': (loci) => {
            return StructureElement.Loci.is(loci)
                ? StructureElement.Loci.extendToAllInstances(StructureElement.Loci.extendToWholeChains(loci))
                : loci;
        },
    };
    Loci.GranularityOptions = ParamDefinition.objectToOptions(Granularity, k => {
        switch (k) {
            case 'element': return 'Atom/Coarse Element';
            case 'elementInstances': return ['Atom/Coarse Element Instances', 'With Symmetry'];
            case 'structure': return 'Structure/Shape';
            default: return k.indexOf('Instances')
                ? [stringToWords(k), 'With Symmetry'] : stringToWords(k);
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
        if ((granularity !== 'element' || alwaysConvertBonds) && Bond.isLoci(loci)) {
            // convert Bond.Loci to a StructureElement.Loci so granularity can be applied
            loci = Bond.toStructureElementLoci(loci);
        }
        if (Structure.isLoci(loci)) {
            // convert to StructureElement.Loci
            loci = Structure.toStructureElementLoci(loci.structure);
        }
        if (StructureElement.Loci.is(loci)) {
            // ensure the root structure is used
            loci = StructureElement.Loci.remap(loci, loci.structure.root);
        }
        if (granularity) {
            // needs to be applied AFTER remapping to root
            loci = applyGranularity(loci, granularity);
        }
        return loci;
    }
    Loci.normalize = normalize;
})(Loci || (Loci = {}));
