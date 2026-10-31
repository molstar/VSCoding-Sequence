/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * based in part on NGL (https://github.com/arose/ngl)
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Features } from './features';
import { typeSymbol, compId, atomId } from '../chemistry/util';
import { isTransitionMetal, isHalogen } from '../../../mol-model/structure/model/properties/atomic/types';
import { FeatureGroup, InteractionType } from './common';
import { AminoAcidNames, BaseNames, ProteinBackboneAtoms, NucleicBackboneAtoms } from '../../../mol-model/structure/model/types';
export const MetalCoordinationParams = {
    distanceMax: PD.Numeric(3.0, { min: 1, max: 5, step: 0.1 }),
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
        const element = typeSymbol(unit, i);
        let type = 0 /* FeatureType.None */;
        if (IonicTypeMetals.includes(element)) {
            type = 13 /* FeatureType.IonicTypeMetal */;
        }
        else if (isTransitionMetal(element) || element === "ZN" /* Elements.ZN */ || element === "CD" /* Elements.CD */) {
            type = 12 /* FeatureType.TransitionMetal */;
        }
        if (type) {
            builder.add(type, FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
        }
    }
}
function isProteinSidechain(atomname) {
    return !ProteinBackboneAtoms.has(atomname);
}
function isProteinBackbone(atomname) {
    return ProteinBackboneAtoms.has(atomname);
}
function isNucleicBackbone(atomname) {
    return NucleicBackboneAtoms.has(atomname);
}
/**
 * Metal binding partners (dative bond or ionic-type interaction)
 */
function addMetalBinding(structure, unit, builder) {
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    for (let i = 0, il = elements.length; i < il; ++i) {
        const element = typeSymbol(unit, i);
        const resname = compId(unit, i);
        const atomname = atomId(unit, i);
        let dative = false;
        let ionic = false;
        const isStandardAminoacid = AminoAcidNames.has(resname);
        const isStandardBase = BaseNames.has(resname);
        if (!isStandardAminoacid && !isStandardBase) {
            if (isHalogen(element) || element === "O" /* Elements.O */ || element === "S" /* Elements.S */) {
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
            builder.add(11 /* FeatureType.DativeBondPartner */, FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
        }
        if (ionic) {
            builder.add(10 /* FeatureType.IonicTypePartner */, FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
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
    return InteractionType.MetalCoordination;
}
//
export const MetalProvider = Features.Provider([13 /* FeatureType.IonicTypeMetal */, 12 /* FeatureType.TransitionMetal */], addMetal);
export const MetalBindingProvider = Features.Provider([10 /* FeatureType.IonicTypePartner */, 11 /* FeatureType.DativeBondPartner */], addMetalBinding);
export const MetalCoordinationProvider = {
    name: 'metal-coordination',
    params: MetalCoordinationParams,
    createTester: (props) => {
        return {
            maxDistance: props.distanceMax,
            requiredFeatures: new Set([13 /* FeatureType.IonicTypeMetal */, 12 /* FeatureType.TransitionMetal */, 10 /* FeatureType.IonicTypePartner */, 11 /* FeatureType.DativeBondPartner */]),
            getType: (structure, infoA, infoB, distanceSq) => testMetalCoordination(structure, infoA, infoB, distanceSq)
        };
    }
};
