"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * based in part on NGL (https://github.com/arose/ngl)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalCoordinationProvider = exports.MetalBindingProvider = exports.MetalProvider = exports.MetalCoordinationParams = void 0;
const param_definition_1 = require("../../../mol-util/param-definition");
const features_1 = require("./features");
const util_1 = require("../chemistry/util");
const types_1 = require("../../../mol-model/structure/model/properties/atomic/types");
const common_1 = require("./common");
const types_2 = require("../../../mol-model/structure/model/types");
exports.MetalCoordinationParams = {
    distanceMax: param_definition_1.ParamDefinition.Numeric(3.0, { min: 1, max: 5, step: 0.1 }),
};
const IonicTypeMetals = [
    "LI" /* Elements.LI */, "NA" /* Elements.NA */, "K" /* Elements.K */, "RB" /* Elements.RB */, "CS" /* Elements.CS */,
    "MG" /* Elements.MG */, "CA" /* Elements.CA */, "SR" /* Elements.SR */, "BA" /* Elements.BA */, "AL" /* Elements.AL */,
    "GA" /* Elements.GA */, "IN" /* Elements.IN */, "TL" /* Elements.TL */, "SC" /* Elements.SC */, "SN" /* Elements.SN */,
    "PB" /* Elements.PB */, "BI" /* Elements.BI */, "SB" /* Elements.SB */, "HG" /* Elements.HG */
];
function addMetal(structure, unit, builder) {
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    for (let i = 0, il = elements.length; i < il; ++i) {
        const element = (0, util_1.typeSymbol)(unit, i);
        let type = 0 /* FeatureType.None */;
        if (IonicTypeMetals.includes(element)) {
            type = 13 /* FeatureType.IonicTypeMetal */;
        }
        else if ((0, types_1.isTransitionMetal)(element) || element === "ZN" /* Elements.ZN */ || element === "CD" /* Elements.CD */) {
            type = 12 /* FeatureType.TransitionMetal */;
        }
        if (type) {
            builder.add(type, common_1.FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
        }
    }
}
function isProteinSidechain(atomname) {
    return !types_2.ProteinBackboneAtoms.has(atomname);
}
function isProteinBackbone(atomname) {
    return types_2.ProteinBackboneAtoms.has(atomname);
}
function isNucleicBackbone(atomname) {
    return types_2.NucleicBackboneAtoms.has(atomname);
}
/**
 * Metal binding partners (dative bond or ionic-type interaction)
 */
function addMetalBinding(structure, unit, builder) {
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    for (let i = 0, il = elements.length; i < il; ++i) {
        const element = (0, util_1.typeSymbol)(unit, i);
        const resname = (0, util_1.compId)(unit, i);
        const atomname = (0, util_1.atomId)(unit, i);
        let dative = false;
        let ionic = false;
        const isStandardAminoacid = types_2.AminoAcidNames.has(resname);
        const isStandardBase = types_2.BaseNames.has(resname);
        if (!isStandardAminoacid && !isStandardBase) {
            if ((0, types_1.isHalogen)(element) || element === "O" /* Elements.O */ || element === "S" /* Elements.S */) {
                dative = true;
                ionic = true;
            }
            else if (element === "N" /* Elements.N */) {
                dative = true;
            }
        }
        else if (isStandardAminoacid) {
            // main chain oxygen atom or oxygen, nitrogen and sulfur from specific amino acids
            if (element === "O" /* Elements.O */) {
                if (['ASP', 'GLU', 'SER', 'THR', 'TYR', 'ASN', 'GLN'].includes(resname) && isProteinSidechain(atomname)) {
                    dative = true;
                    ionic = true;
                }
                else if (isProteinBackbone(atomname)) {
                    dative = true;
                    ionic = true;
                }
            }
            else if (element === "S" /* Elements.S */ && (resname === 'CYS' || resname === 'MET')) {
                dative = true;
                ionic = true;
            }
            else if (element === "N" /* Elements.N */) {
                if (resname === 'HIS' && isProteinSidechain(atomname)) {
                    dative = true;
                }
            }
        }
        else if (isStandardBase) {
            // http://pubs.acs.org/doi/pdf/10.1021/acs.accounts.6b00253
            // http://onlinelibrary.wiley.com/doi/10.1002/anie.200900399/full
            if (element === "O" /* Elements.O */ && isNucleicBackbone(atomname)) {
                dative = true;
                ionic = true;
            }
            else if (['N3', 'N4', 'N7'].includes(atomname)) {
                dative = true;
            }
            else if (['O2', 'O4', 'O6'].includes(atomname)) {
                dative = true;
                ionic = true;
            }
        }
        if (dative) {
            builder.add(11 /* FeatureType.DativeBondPartner */, common_1.FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
        }
        if (ionic) {
            builder.add(10 /* FeatureType.IonicTypePartner */, common_1.FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
        }
    }
}
function isMetalCoordination(ti, tj) {
    if (ti === 12 /* FeatureType.TransitionMetal */) {
        return (tj === 11 /* FeatureType.DativeBondPartner */ ||
            tj === 12 /* FeatureType.TransitionMetal */);
    }
    else if (ti === 13 /* FeatureType.IonicTypeMetal */) {
        return (tj === 10 /* FeatureType.IonicTypePartner */);
    }
}
function testMetalCoordination(structure, infoA, infoB, distanceSq) {
    const typeA = infoA.types[infoA.feature];
    const typeB = infoB.types[infoB.feature];
    if (!isMetalCoordination(typeA, typeB) && !isMetalCoordination(typeB, typeA))
        return;
    return common_1.InteractionType.MetalCoordination;
}
//
exports.MetalProvider = features_1.Features.Provider([13 /* FeatureType.IonicTypeMetal */, 12 /* FeatureType.TransitionMetal */], addMetal);
exports.MetalBindingProvider = features_1.Features.Provider([10 /* FeatureType.IonicTypePartner */, 11 /* FeatureType.DativeBondPartner */], addMetalBinding);
exports.MetalCoordinationProvider = {
    name: 'metal-coordination',
    params: exports.MetalCoordinationParams,
    createTester: (props) => {
        return {
            maxDistance: props.distanceMax,
            requiredFeatures: new Set([13 /* FeatureType.IonicTypeMetal */, 12 /* FeatureType.TransitionMetal */, 10 /* FeatureType.IonicTypePartner */, 11 /* FeatureType.DativeBondPartner */]),
            getType: (structure, infoA, infoB, distanceSq) => testMetalCoordination(structure, infoA, infoB, distanceSq)
        };
    }
};
