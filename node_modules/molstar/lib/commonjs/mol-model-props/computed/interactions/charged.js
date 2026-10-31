"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 *
 * based in part on NGL (https://github.com/arose/ngl)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CationPiProvider = exports.PiStackingProvider = exports.IonicProvider = exports.AromaticRingProvider = exports.PositiveChargeProvider = exports.NegativChargeProvider = void 0;
const param_definition_1 = require("../../../mol-util/param-definition");
const features_1 = require("./features");
const types_1 = require("../../../mol-model/structure/model/types");
const util_1 = require("../chemistry/util");
const valence_model_1 = require("../valence-model");
const misc_1 = require("../../../mol-math/misc");
const common_1 = require("./common");
const int_1 = require("../../../mol-data/int");
const functional_group_1 = require("../chemistry/functional-group");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const IonicParams = {
    distanceMax: param_definition_1.ParamDefinition.Numeric(5.0, { min: 0, max: 8, step: 0.1 }),
};
const PiStackingParams = {
    distanceMax: param_definition_1.ParamDefinition.Numeric(5.5, { min: 1, max: 8, step: 0.1 }),
    offsetMax: param_definition_1.ParamDefinition.Numeric(2.0, { min: 0, max: 4, step: 0.1 }),
    angleDevMax: param_definition_1.ParamDefinition.Numeric(30, { min: 0, max: 180, step: 1 }),
};
const CationPiParams = {
    distanceMax: param_definition_1.ParamDefinition.Numeric(6.0, { min: 1, max: 8, step: 0.1 }),
    offsetMax: param_definition_1.ParamDefinition.Numeric(2.0, { min: 0, max: 4, step: 0.1 }),
};
//
const PositvelyCharged = ['ARG', 'HIS', 'LYS'];
const NegativelyCharged = ['GLU', 'ASP'];
function getUnitValenceModel(structure, unit) {
    const valenceModel = valence_model_1.ValenceModelProvider.get(structure).value;
    if (!valenceModel)
        throw Error('expected valence model to be available');
    const unitValenceModel = valenceModel.get(unit.id);
    if (!unitValenceModel)
        throw Error('expected valence model for unit to be available');
    return unitValenceModel;
}
function addUnitPositiveCharges(structure, unit, builder) {
    const { charge } = getUnitValenceModel(structure, unit);
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    const addedElements = new Set();
    const { label_comp_id } = unit.model.atomicHierarchy.atoms;
    const residueIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
    while (residueIt.hasNext) {
        const { index: residueIndex, start, end } = residueIt.move();
        const compId = label_comp_id.value(unit.model.atomicHierarchy.residueAtomSegments.offsets[residueIndex]);
        if (PositvelyCharged.includes(compId)) {
            builder.startState();
            for (let j = start; j < end; ++j) {
                if ((0, util_1.typeSymbol)(unit, j) === "N" /* Elements.N */ && !types_1.ProteinBackboneAtoms.has((0, util_1.atomId)(unit, j))) {
                    builder.pushMember(x[elements[j]], y[elements[j]], z[elements[j]], j);
                }
            }
            builder.finishState(1 /* FeatureType.PositiveCharge */, common_1.FeatureGroup.None);
        }
        else if (!types_1.PolymerNames.has(compId)) {
            addedElements.clear();
            for (let j = start; j < end; ++j) {
                let group = common_1.FeatureGroup.None;
                if ((0, functional_group_1.isGuanidine)(structure, unit, j)) {
                    group = common_1.FeatureGroup.Guanidine;
                }
                else if ((0, functional_group_1.isAcetamidine)(structure, unit, j)) {
                    group = common_1.FeatureGroup.Acetamidine;
                }
                if (group) {
                    builder.startState();
                    (0, util_1.eachBondedAtom)(structure, unit, j, (_, k) => {
                        if ((0, util_1.typeSymbol)(unit, k) === "N" /* Elements.N */) {
                            addedElements.add(k);
                            builder.pushMember(x[elements[k]], y[elements[k]], z[elements[k]], k);
                        }
                    });
                    builder.finishState(1 /* FeatureType.PositiveCharge */, group);
                }
            }
            for (let j = start; j < end; ++j) {
                if (charge[j] > 0 && !addedElements.has(j)) {
                    builder.add(1 /* FeatureType.PositiveCharge */, common_1.FeatureGroup.None, x[elements[j]], y[elements[j]], z[elements[j]], j);
                }
            }
        }
    }
}
function addUnitNegativeCharges(structure, unit, builder) {
    const { charge } = getUnitValenceModel(structure, unit);
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    const addedElements = new Set();
    const { label_comp_id } = unit.model.atomicHierarchy.atoms;
    const residueIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
    while (residueIt.hasNext) {
        const { index: residueIndex, start, end } = residueIt.move();
        const compId = label_comp_id.value(unit.model.atomicHierarchy.residueAtomSegments.offsets[residueIndex]);
        if (NegativelyCharged.includes(compId)) {
            builder.startState();
            for (let j = start; j < end; ++j) {
                if ((0, util_1.typeSymbol)(unit, j) === "O" /* Elements.O */ && !types_1.ProteinBackboneAtoms.has((0, util_1.atomId)(unit, j))) {
                    builder.pushMember(x[elements[j]], y[elements[j]], z[elements[j]], j);
                }
            }
            builder.finishState(2 /* FeatureType.NegativeCharge */, common_1.FeatureGroup.None);
        }
        else if (types_1.BaseNames.has(compId)) {
            for (let j = start; j < end; ++j) {
                if ((0, functional_group_1.isPhosphate)(structure, unit, j)) {
                    builder.startState();
                    (0, util_1.eachBondedAtom)(structure, unit, j, (_, k) => {
                        if ((0, util_1.typeSymbol)(unit, k) === "O" /* Elements.O */) {
                            builder.pushMember(x[elements[k]], y[elements[k]], z[elements[k]], k);
                        }
                    });
                    builder.finishState(2 /* FeatureType.NegativeCharge */, common_1.FeatureGroup.Phosphate);
                }
            }
        }
        else if (!types_1.PolymerNames.has(compId)) {
            for (let j = start; j < end; ++j) {
                builder.startState();
                if ((0, util_1.typeSymbol)(unit, j) === "N" /* Elements.N */ && !types_1.ProteinBackboneAtoms.has((0, util_1.atomId)(unit, j))) {
                    builder.pushMember(x[elements[j]], y[elements[j]], z[elements[j]], j);
                }
                builder.finishState(2 /* FeatureType.NegativeCharge */, common_1.FeatureGroup.None);
                let group = common_1.FeatureGroup.None;
                if ((0, functional_group_1.isSulfonicAcid)(structure, unit, j)) {
                    group = common_1.FeatureGroup.SulfonicAcid;
                }
                else if ((0, functional_group_1.isPhosphate)(structure, unit, j)) {
                    group = common_1.FeatureGroup.Phosphate;
                }
                else if ((0, functional_group_1.isSulfate)(structure, unit, j)) {
                    group = common_1.FeatureGroup.Sulfate;
                }
                else if ((0, functional_group_1.isCarboxylate)(structure, unit, j)) {
                    group = common_1.FeatureGroup.Carboxylate;
                }
                if (group) {
                    builder.startState();
                    (0, util_1.eachBondedAtom)(structure, unit, j, (_, k) => {
                        if ((0, util_1.typeSymbol)(unit, k) === "O" /* Elements.O */) {
                            addedElements.add(k);
                            builder.pushMember(x[elements[k]], y[elements[k]], z[elements[k]], k);
                        }
                    });
                    builder.finishState(2 /* FeatureType.NegativeCharge */, group);
                }
            }
            for (let j = start; j < end; ++j) {
                if (charge[j] < 0 && !addedElements.has(j)) {
                    builder.add(2 /* FeatureType.NegativeCharge */, common_1.FeatureGroup.None, x[elements[j]], y[elements[j]], z[elements[j]], j);
                }
            }
        }
    }
}
function addUnitAromaticRings(structure, unit, builder) {
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    for (const ringIndex of unit.rings.aromaticRings) {
        const ring = unit.rings.all[ringIndex];
        builder.startState();
        for (let i = 0, il = ring.length; i < il; ++i) {
            const j = ring[i];
            builder.pushMember(x[elements[j]], y[elements[j]], z[elements[j]], j);
        }
        builder.finishState(3 /* FeatureType.AromaticRing */, common_1.FeatureGroup.None);
    }
}
function isIonic(ti, tj) {
    return ((ti === 2 /* FeatureType.NegativeCharge */ && tj === 1 /* FeatureType.PositiveCharge */) ||
        (ti === 1 /* FeatureType.PositiveCharge */ && tj === 2 /* FeatureType.NegativeCharge */));
}
function isPiStacking(ti, tj) {
    return ti === 3 /* FeatureType.AromaticRing */ && tj === 3 /* FeatureType.AromaticRing */;
}
function isCationPi(ti, tj) {
    return ((ti === 3 /* FeatureType.AromaticRing */ && tj === 1 /* FeatureType.PositiveCharge */) ||
        (ti === 1 /* FeatureType.PositiveCharge */ && tj === 3 /* FeatureType.AromaticRing */));
}
const tmpPointA = (0, linear_algebra_1.Vec3)();
const tmpPointB = (0, linear_algebra_1.Vec3)();
function areFeaturesWithinDistanceSq(infoA, infoB, distanceSq) {
    const { feature: featureA, offsets: offsetsA, members: membersA } = infoA;
    const { feature: featureB, offsets: offsetsB, members: membersB } = infoB;
    for (let i = offsetsA[featureA], il = offsetsA[featureA + 1]; i < il; ++i) {
        const elementA = membersA[i];
        infoA.unit.conformation.position(infoA.unit.elements[elementA], tmpPointA);
        for (let j = offsetsB[featureB], jl = offsetsB[featureB + 1]; j < jl; ++j) {
            const elementB = membersB[j];
            infoB.unit.conformation.position(infoB.unit.elements[elementB], tmpPointB);
            if (linear_algebra_1.Vec3.squaredDistance(tmpPointA, tmpPointB) < distanceSq)
                return true;
        }
    }
    return false;
}
const tmpVecA = (0, linear_algebra_1.Vec3)();
const tmpVecB = (0, linear_algebra_1.Vec3)();
const tmpVecC = (0, linear_algebra_1.Vec3)();
const tmpVecD = (0, linear_algebra_1.Vec3)();
function getNormal(out, info) {
    const { unit, feature, offsets, members } = info;
    const { elements } = unit;
    const i = offsets[feature];
    info.unit.conformation.position(elements[members[i]], tmpVecA);
    info.unit.conformation.position(elements[members[i + 1]], tmpVecB);
    info.unit.conformation.position(elements[members[i + 2]], tmpVecC);
    return linear_algebra_1.Vec3.triangleNormal(out, tmpVecA, tmpVecB, tmpVecC);
}
const getOffset = function (infoA, infoB, normal) {
    features_1.Features.position(tmpVecA, infoA);
    features_1.Features.position(tmpVecB, infoB);
    linear_algebra_1.Vec3.sub(tmpVecC, tmpVecA, tmpVecB);
    linear_algebra_1.Vec3.projectOnPlane(tmpVecD, tmpVecC, normal);
    linear_algebra_1.Vec3.add(tmpVecD, tmpVecD, tmpVecB);
    return linear_algebra_1.Vec3.distance(tmpVecD, tmpVecB);
};
function getIonicOptions(props) {
    return {
        distanceMaxSq: props.distanceMax * props.distanceMax,
    };
}
function getPiStackingOptions(props) {
    return {
        offsetMax: props.offsetMax,
        angleDevMax: (0, misc_1.degToRad)(props.angleDevMax),
    };
}
function getCationPiOptions(props) {
    return {
        offsetMax: props.offsetMax
    };
}
const deg180InRad = (0, misc_1.degToRad)(180);
const deg90InRad = (0, misc_1.degToRad)(90);
const tmpNormalA = (0, linear_algebra_1.Vec3)();
const tmpNormalB = (0, linear_algebra_1.Vec3)();
function testIonic(structure, infoA, infoB, distanceSq, opts) {
    const typeA = infoA.types[infoA.feature];
    const typeB = infoB.types[infoB.feature];
    if (isIonic(typeA, typeB)) {
        if (areFeaturesWithinDistanceSq(infoA, infoB, opts.distanceMaxSq)) {
            return common_1.InteractionType.Ionic;
        }
    }
}
function testPiStacking(structure, infoA, infoB, distanceSq, opts) {
    const typeA = infoA.types[infoA.feature];
    const typeB = infoB.types[infoB.feature];
    if (isPiStacking(typeA, typeB)) {
        getNormal(tmpNormalA, infoA);
        getNormal(tmpNormalB, infoB);
        const angle = linear_algebra_1.Vec3.angle(tmpNormalA, tmpNormalB);
        const offset = Math.min(getOffset(infoA, infoB, tmpNormalB), getOffset(infoB, infoA, tmpNormalA));
        if (offset <= opts.offsetMax) {
            if (angle <= opts.angleDevMax || angle >= deg180InRad - opts.angleDevMax) {
                return common_1.InteractionType.PiStacking; // parallel
            }
            else if (angle <= opts.angleDevMax + deg90InRad && angle >= deg90InRad - opts.angleDevMax) {
                return common_1.InteractionType.PiStacking; // t-shaped
            }
        }
    }
}
function testCationPi(structure, infoA, infoB, distanceSq, opts) {
    const typeA = infoA.types[infoA.feature];
    const typeB = infoB.types[infoB.feature];
    if (isCationPi(typeA, typeB)) {
        const [infoR, infoC] = typeA === 3 /* FeatureType.AromaticRing */ ? [infoA, infoB] : [infoB, infoA];
        getNormal(tmpNormalA, infoR);
        const offset = getOffset(infoC, infoR, tmpNormalA);
        if (offset <= opts.offsetMax) {
            return common_1.InteractionType.CationPi;
        }
    }
}
//
exports.NegativChargeProvider = features_1.Features.Provider([2 /* FeatureType.NegativeCharge */], addUnitNegativeCharges);
exports.PositiveChargeProvider = features_1.Features.Provider([1 /* FeatureType.PositiveCharge */], addUnitPositiveCharges);
exports.AromaticRingProvider = features_1.Features.Provider([3 /* FeatureType.AromaticRing */], addUnitAromaticRings);
exports.IonicProvider = {
    name: 'ionic',
    params: IonicParams,
    createTester: (props) => {
        const opts = getIonicOptions(props);
        return {
            maxDistance: props.distanceMax,
            requiredFeatures: new Set([2 /* FeatureType.NegativeCharge */, 1 /* FeatureType.PositiveCharge */]),
            getType: (structure, infoA, infoB, distanceSq) => testIonic(structure, infoA, infoB, distanceSq, opts)
        };
    }
};
exports.PiStackingProvider = {
    name: 'pi-stacking',
    params: PiStackingParams,
    createTester: (props) => {
        const opts = getPiStackingOptions(props);
        return {
            maxDistance: props.distanceMax,
            requiredFeatures: new Set([3 /* FeatureType.AromaticRing */]),
            getType: (structure, infoA, infoB, distanceSq) => testPiStacking(structure, infoA, infoB, distanceSq, opts)
        };
    }
};
exports.CationPiProvider = {
    name: 'cation-pi',
    params: CationPiParams,
    createTester: (props) => {
        const opts = getCationPiOptions(props);
        return {
            maxDistance: props.distanceMax,
            requiredFeatures: new Set([3 /* FeatureType.AromaticRing */, 1 /* FeatureType.PositiveCharge */]),
            getType: (structure, infoA, infoB, distanceSq) => testCationPi(structure, infoA, infoB, distanceSq, opts)
        };
    }
};
