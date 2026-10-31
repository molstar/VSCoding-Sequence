"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsParams = void 0;
exports.addUnitContacts = addUnitContacts;
exports.addStructureContacts = addStructureContacts;
const int_1 = require("../../../mol-data/int");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const structure_1 = require("../../../mol-model/structure");
const atomic_1 = require("../../../mol-model/structure/model/properties/atomic");
const lookup3d_1 = require("../../../mol-model/structure/structure/util/lookup3d");
const param_definition_1 = require("../../../mol-util/param-definition");
const util_1 = require("../chemistry/util");
const features_1 = require("./features");
exports.ContactsParams = {
    lineOfSightDistFactor: param_definition_1.ParamDefinition.Numeric(1.0, { min: 0, max: 3, step: 0.1 }),
};
const MAX_LINE_OF_SIGHT_DISTANCE = 3;
function validPair(structure, infoA, infoB) {
    const indexA = infoA.members[infoA.offsets[infoA.feature]];
    const indexB = infoB.members[infoB.offsets[infoB.feature]];
    if (indexA === indexB && infoA.unit === infoB.unit)
        return false; // no self interaction
    const altA = (0, util_1.altLoc)(infoA.unit, indexA);
    const altB = (0, util_1.altLoc)(infoB.unit, indexB);
    if (altA && altB && altA !== altB)
        return false; // incompatible alternate location id
    if (infoA.unit === infoB.unit && infoA.unit.model.atomicHierarchy.residueAtomSegments.count > 1 && infoA.unit.residueIndex[infoA.unit.elements[indexA]] === infoB.unit.residueIndex[infoB.unit.elements[indexB]])
        return false; // same residue (and more than one residue)
    // e.g. no hbond if donor and acceptor are bonded
    if ((0, util_1.connectedTo)(structure, infoA.unit, indexA, infoB.unit, indexB))
        return false;
    return true;
}
//
function invalidAltLoc(unitA, indexA, unitB, indexB) {
    const altA = (0, util_1.altLoc)(unitA, indexA);
    const altB = (0, util_1.altLoc)(unitB, indexB);
    return altA && altB && altA !== altB;
}
function isMember(element, info) {
    const { feature, offsets, members } = info;
    for (let i = offsets[feature], il = offsets[feature + 1]; i < il; ++i) {
        if (members[i] === element)
            return true;
    }
    return false;
}
const tmpVec = (0, linear_algebra_1.Vec3)();
const tmpVecA = (0, linear_algebra_1.Vec3)();
const tmpVecB = (0, linear_algebra_1.Vec3)();
// need to use a separate context for structure.lookup3d.find because of nested queries
const lineOfSightLookupCtx = (0, lookup3d_1.StructureLookup3DResultContext)();
function checkLineOfSight(structure, infoA, infoB, distFactor) {
    const featureA = infoA.feature;
    const featureB = infoB.feature;
    const indexA = infoA.members[infoA.offsets[featureA]];
    const indexB = infoB.members[infoB.offsets[featureB]];
    features_1.Features.position(tmpVecA, infoA);
    features_1.Features.position(tmpVecB, infoB);
    linear_algebra_1.Vec3.scale(tmpVec, linear_algebra_1.Vec3.add(tmpVec, tmpVecA, tmpVecB), 0.5);
    const distMax = distFactor * MAX_LINE_OF_SIGHT_DISTANCE;
    const { count, indices, units, squaredDistances } = structure.lookup3d.find(tmpVec[0], tmpVec[1], tmpVec[2], distMax, lineOfSightLookupCtx);
    if (count === 0)
        return true;
    for (let r = 0; r < count; ++r) {
        const i = indices[r];
        const unit = units[r];
        if (!structure_1.Unit.isAtomic(unit))
            continue;
        const element = (0, util_1.typeSymbol)(unit, i);
        // allow hydrogens
        if (element === "H" /* Elements.H */)
            continue;
        const vdw = (0, atomic_1.VdwRadius)(element);
        // check distance
        if (vdw * vdw * distFactor * distFactor <= squaredDistances[r])
            continue;
        // allow different altlocs
        if (invalidAltLoc(unit, i, infoA.unit, indexA) || invalidAltLoc(unit, i, infoB.unit, indexB))
            continue;
        // allow member atoms
        if ((infoA.unit === unit && isMember(i, infoA)) || (infoB.unit === unit && isMember(i, infoB)))
            continue;
        unit.conformation.position(unit.elements[i], tmpVec);
        // allow atoms at the center of functional groups
        if (linear_algebra_1.Vec3.squaredDistance(tmpVec, tmpVecA) < 1 || linear_algebra_1.Vec3.squaredDistance(tmpVec, tmpVecB) < 1)
            continue;
        return false;
    }
    return true;
}
/**
 * Add all intra-unit contacts, i.e. pairs of features
 */
function addUnitContacts(structure, unit, features, builder, testers, props) {
    for (const tester of testers) {
        _addUnitContacts(structure, unit, features, builder, tester, props);
    }
}
function _addUnitContacts(structure, unit, features, builder, tester, props) {
    const { x, y, z } = features;
    const { lookup3d, indices: subsetIndices } = features.subset(tester.requiredFeatures);
    const infoA = features_1.Features.Info(structure, unit, features);
    const infoB = { ...infoA };
    const distFactor = props.lineOfSightDistFactor;
    for (let t = 0, tl = int_1.OrderedSet.size(subsetIndices); t < tl; ++t) {
        const i = int_1.OrderedSet.getAt(subsetIndices, t);
        const { count, indices, squaredDistances } = lookup3d.find(x[i], y[i], z[i], tester.maxDistance);
        if (count === 0)
            continue;
        infoA.feature = i;
        for (let r = 0; r < count; ++r) {
            const j = int_1.OrderedSet.getAt(subsetIndices, indices[r]);
            if (j <= i)
                continue;
            infoB.feature = j;
            if (!validPair(structure, infoA, infoB))
                continue;
            const type = tester.getType(structure, infoA, infoB, squaredDistances[r]);
            if (type && checkLineOfSight(structure, infoA, infoB, distFactor)) {
                builder.add(i, j, type);
            }
        }
    }
}
const _imageTransform = (0, linear_algebra_1.Mat4)();
/**
 * Add all inter-unit contacts, i.e. pairs of features
 */
function addStructureContacts(structure, unitA, featuresA, unitB, featuresB, builder, testers, props) {
    const { count: countA, x: xA, y: yA, z: zA } = featuresA;
    const { lookup3d } = featuresB;
    // the lookup queries need to happen in the "unitB space".
    // that means imageA = inverseOperB(operA(i))
    const imageTransform = linear_algebra_1.Mat4.mul(_imageTransform, unitB.conformation.operator.inverse, unitA.conformation.operator.matrix);
    const isNotIdentity = !linear_algebra_1.Mat4.isIdentity(imageTransform);
    const imageA = (0, linear_algebra_1.Vec3)();
    const maxDistance = Math.max(...testers.map(t => t.maxDistance));
    const { center, radius } = lookup3d.boundary.sphere;
    const testDistanceSq = (radius + maxDistance) * (radius + maxDistance);
    const distFactor = props.lineOfSightDistFactor;
    const infoA = features_1.Features.Info(structure, unitA, featuresA);
    const infoB = features_1.Features.Info(structure, unitB, featuresB);
    builder.startUnitPair(unitA, unitB);
    for (let i = 0; i < countA; ++i) {
        linear_algebra_1.Vec3.set(imageA, xA[i], yA[i], zA[i]);
        if (isNotIdentity)
            linear_algebra_1.Vec3.transformMat4(imageA, imageA, imageTransform);
        if (linear_algebra_1.Vec3.squaredDistance(imageA, center) > testDistanceSq)
            continue;
        const { indices, count, squaredDistances } = lookup3d.find(imageA[0], imageA[1], imageA[2], maxDistance);
        if (count === 0)
            continue;
        infoA.feature = i;
        for (let r = 0; r < count; ++r) {
            const j = indices[r];
            infoB.feature = j;
            if (!validPair(structure, infoA, infoB))
                continue;
            const distanceSq = squaredDistances[r];
            for (const tester of testers) {
                if (distanceSq < tester.maxDistance * tester.maxDistance) {
                    const type = tester.getType(structure, infoA, infoB, distanceSq);
                    if (type && checkLineOfSight(structure, infoA, infoB, distFactor)) {
                        builder.add(i, j, type);
                        break;
                    }
                }
            }
        }
    }
    builder.finishUnitPair();
}
