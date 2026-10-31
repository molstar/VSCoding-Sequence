"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 *
 * based in part on NGL (https://github.com/arose/ngl)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HalogenBondsProvider = exports.HalogenAcceptorProvider = exports.HalogenDonorProvider = void 0;
const param_definition_1 = require("../../../mol-util/param-definition");
const geometry_1 = require("../chemistry/geometry");
const features_1 = require("./features");
const util_1 = require("../chemistry/util");
const misc_1 = require("../../../mol-math/misc");
const common_1 = require("./common");
const HalogenBondsParams = {
    distanceMax: param_definition_1.ParamDefinition.Numeric(4.0, { min: 1, max: 5, step: 0.1 }),
    angleMax: param_definition_1.ParamDefinition.Numeric(30, { min: 0, max: 60, step: 1 }),
};
const halBondElements = ["CL" /* Elements.CL */, "BR" /* Elements.BR */, "I" /* Elements.I */, "AT" /* Elements.AT */];
/**
 * Halogen bond donors (X-C, with X one of Cl, Br, I or At) not F!
 */
function addUnitHalogenDonors(structure, unit, builder) {
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    for (let i = 0, il = elements.length; i < il; ++i) {
        const element = (0, util_1.typeSymbol)(unit, i);
        if (halBondElements.includes(element)) {
            builder.add(6 /* FeatureType.HalogenDonor */, common_1.FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
        }
    }
}
const X = ["N" /* Elements.N */, "O" /* Elements.O */, "S" /* Elements.S */];
const Y = ["C" /* Elements.C */, "N" /* Elements.N */, "P" /* Elements.P */, "S" /* Elements.S */];
/**
 * Halogen bond acceptors (Y-{O|N|S}, with Y=C,P,N,S)
 */
function addUnitHalogenAcceptors(structure, unit, builder) {
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    for (let i = 0, il = elements.length; i < il; ++i) {
        const element = (0, util_1.typeSymbol)(unit, i);
        if (X.includes(element)) {
            let flag = false;
            (0, util_1.eachBondedAtom)(structure, unit, i, (unitB, indexB) => {
                if (Y.includes((0, util_1.typeSymbol)(unitB, indexB))) {
                    flag = true;
                }
            });
            if (flag) {
                builder.add(7 /* FeatureType.HalogenAcceptor */, common_1.FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
            }
        }
    }
}
function isHalogenBond(ti, tj) {
    return ((ti === 7 /* FeatureType.HalogenAcceptor */ && tj === 6 /* FeatureType.HalogenDonor */) ||
        (ti === 6 /* FeatureType.HalogenDonor */ && tj === 7 /* FeatureType.HalogenAcceptor */));
}
// http://www.pnas.org/content/101/48/16789.full
const OptimalHalogenAngle = (0, misc_1.degToRad)(180); // adjusted from 165 to account for spherical statistics
const OptimalAcceptorAngle = (0, misc_1.degToRad)(120);
function getOptions(props) {
    return {
        angleMax: (0, misc_1.degToRad)(props.angleMax),
    };
}
function testHalogenBond(structure, infoA, infoB, opts) {
    const typeA = infoA.types[infoA.feature];
    const typeB = infoB.types[infoB.feature];
    if (!isHalogenBond(typeA, typeB))
        return;
    const [don, acc] = typeA === 6 /* FeatureType.HalogenDonor */ ? [infoA, infoB] : [infoB, infoA];
    const donIndex = don.members[don.offsets[don.feature]];
    const accIndex = acc.members[acc.offsets[acc.feature]];
    const [halogenAngles] = (0, geometry_1.calcAngles)(structure, don.unit, donIndex, acc.unit, accIndex);
    // Singly bonded halogen only (not bromide ion for example)
    if (halogenAngles.length !== 1)
        return;
    if (OptimalHalogenAngle - halogenAngles[0] > opts.angleMax)
        return;
    const [acceptorAngles] = (0, geometry_1.calcAngles)(structure, acc.unit, accIndex, don.unit, donIndex);
    // Angle must be defined. Excludes water as acceptor. Debatable
    if (acceptorAngles.length === 0)
        return;
    if (acceptorAngles.some(acceptorAngle => OptimalAcceptorAngle - acceptorAngle > opts.angleMax))
        return;
    return common_1.InteractionType.HalogenBond;
}
//
exports.HalogenDonorProvider = features_1.Features.Provider([6 /* FeatureType.HalogenDonor */], addUnitHalogenDonors);
exports.HalogenAcceptorProvider = features_1.Features.Provider([7 /* FeatureType.HalogenAcceptor */], addUnitHalogenAcceptors);
exports.HalogenBondsProvider = {
    name: 'halogen-bonds',
    params: HalogenBondsParams,
    createTester: (props) => {
        const opts = getOptions(props);
        return {
            maxDistance: props.distanceMax,
            requiredFeatures: new Set([6 /* FeatureType.HalogenDonor */, 7 /* FeatureType.HalogenAcceptor */]),
            getType: (structure, infoA, infoB) => testHalogenBond(structure, infoA, infoB, opts)
        };
    }
};
