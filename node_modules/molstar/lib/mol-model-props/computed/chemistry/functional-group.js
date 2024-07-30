/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { isHalogen } from '../../../mol-model/structure/model/properties/atomic/types';
import { BondType } from '../../../mol-model/structure/model/types';
import { eachBondedAtom, bondCount, typeSymbol, bondToElementCount } from './util';
function isAromatic(unit, index) {
    // TODO also extend unit.rings with geometry/composition-based aromaticity detection and use it here in addition
    const { offset, edgeProps } = unit.bonds;
    for (let i = offset[index], il = offset[index + 1]; i < il; ++i) {
        if (BondType.is(16 /* BondType.Flag.Aromatic */, edgeProps.flags[i]))
            return true;
    }
    return false;
}
function bondToCarbonylCount(structure, unit, index) {
    let carbonylCount = 0;
    eachBondedAtom(structure, unit, index, (unit, index) => {
        if (isCarbonyl(structure, unit, index))
            carbonylCount += 1;
    });
    return carbonylCount;
}
//
/**
 * Nitrogen in a quaternary amine
 */
export function isQuaternaryAmine(structure, unit, index) {
    return (typeSymbol(unit, index) === "N" /* Elements.N */ &&
        bondCount(structure, unit, index) === 4 &&
        bondToElementCount(structure, unit, index, "H" /* Elements.H */) === 0);
}
/**
 * Nitrogen in a tertiary amine
 */
export function isTertiaryAmine(structure, unit, index, idealValence) {
    return (typeSymbol(unit, index) === "N" /* Elements.N */ &&
        bondCount(structure, unit, index) === 4 &&
        idealValence === 3);
}
/**
 * Nitrogen in an imide
 */
export function isImide(structure, unit, index) {
    let flag = false;
    if (typeSymbol(unit, index) === "N" /* Elements.N */ &&
        (bondCount(structure, unit, index) - bondToElementCount(structure, unit, index, "H" /* Elements.H */)) === 2) {
        flag = bondToCarbonylCount(structure, unit, index) === 2;
    }
    return flag;
}
/**
 * Nitrogen in an amide
 */
export function isAmide(structure, unit, index) {
    let flag = false;
    if (typeSymbol(unit, index) === "N" /* Elements.N */ &&
        (bondCount(structure, unit, index) - bondToElementCount(structure, unit, index, "H" /* Elements.H */)) === 2) {
        flag = bondToCarbonylCount(structure, unit, index) === 1;
    }
    return flag;
}
/**
 * Sulfur in a sulfonium group
 */
export function isSulfonium(structure, unit, index) {
    return (typeSymbol(unit, index) === "S" /* Elements.S */ &&
        bondCount(structure, unit, index) === 3 &&
        bondToElementCount(structure, unit, index, "H" /* Elements.H */) === 0);
}
/**
 * Sulfur in a sulfonic acid or sulfonate group
 */
export function isSulfonicAcid(structure, unit, index) {
    return (typeSymbol(unit, index) === "S" /* Elements.S */ &&
        bondToElementCount(structure, unit, index, "O" /* Elements.O */) === 3);
}
/**
 * Sulfur in a sulfate group
 */
export function isSulfate(structure, unit, index) {
    return (typeSymbol(unit, index) === "S" /* Elements.S */ &&
        bondToElementCount(structure, unit, index, "O" /* Elements.O */) === 4);
}
/**
 * Phosphor in a phosphate group
 */
export function isPhosphate(structure, unit, index) {
    return (typeSymbol(unit, index) === "P" /* Elements.P */ &&
        bondToElementCount(structure, unit, index, "O" /* Elements.O */) === bondCount(structure, unit, index));
}
/**
 * Halogen with one bond to a carbon
 */
export function isHalocarbon(structure, unit, index) {
    return (isHalogen(typeSymbol(unit, index)) &&
        bondCount(structure, unit, index) === 1 &&
        bondToElementCount(structure, unit, index, "C" /* Elements.C */) === 1);
}
/**
 * Carbon in a carbonyl/acyl group
 *
 * TODO currently only checks intra bonds for group detection
 */
export function isCarbonyl(structure, unit, index) {
    let flag = false;
    if (typeSymbol(unit, index) === "C" /* Elements.C */) {
        const { offset, edgeProps, b } = unit.bonds;
        for (let i = offset[index], il = offset[index + 1]; i < il; ++i) {
            if (edgeProps.order[i] === 2 && typeSymbol(unit, b[i]) === "O" /* Elements.O */) {
                flag = true;
                break;
            }
        }
    }
    return flag;
}
/**
 * Carbon in a carboxylate group
 */
export function isCarboxylate(structure, unit, index) {
    let terminalOxygenCount = 0;
    if (typeSymbol(unit, index) === "C" /* Elements.C */ &&
        bondToElementCount(structure, unit, index, "O" /* Elements.O */) === 2 &&
        bondToElementCount(structure, unit, index, "C" /* Elements.C */) === 1) {
        eachBondedAtom(structure, unit, index, (unit, index) => {
            if (typeSymbol(unit, index) === "O" /* Elements.O */ &&
                bondCount(structure, unit, index) - bondToElementCount(structure, unit, index, "H" /* Elements.H */) === 1) {
                terminalOxygenCount += 1;
            }
        });
    }
    return terminalOxygenCount === 2;
}
/**
 * Carbon in a guanidine group
 */
export function isGuanidine(structure, unit, index) {
    let terminalNitrogenCount = 0;
    if (typeSymbol(unit, index) === "C" /* Elements.C */ &&
        bondCount(structure, unit, index) === 3 &&
        bondToElementCount(structure, unit, index, "N" /* Elements.N */) === 3) {
        eachBondedAtom(structure, unit, index, (unit, index) => {
            if (bondCount(structure, unit, index) - bondToElementCount(structure, unit, index, "H" /* Elements.H */) === 1) {
                terminalNitrogenCount += 1;
            }
        });
    }
    return terminalNitrogenCount === 2;
}
/**
 * Carbon in a acetamidine group
 */
export function isAcetamidine(structure, unit, index) {
    let terminalNitrogenCount = 0;
    if (typeSymbol(unit, index) === "C" /* Elements.C */ &&
        bondCount(structure, unit, index) === 3 &&
        bondToElementCount(structure, unit, index, "N" /* Elements.N */) === 2 &&
        bondToElementCount(structure, unit, index, "C" /* Elements.C */) === 1) {
        eachBondedAtom(structure, unit, index, (unit, index) => {
            if (bondCount(structure, unit, index) - bondToElementCount(structure, unit, index, "H" /* Elements.H */) === 1) {
                terminalNitrogenCount += 1;
            }
        });
    }
    return terminalNitrogenCount === 2;
}
const PolarElements = new Set(['N', 'O', 'S', 'F', 'CL', 'BR', 'I']);
export function isPolar(element) { return PolarElements.has(element); }
export function hasPolarNeighbour(structure, unit, index) {
    let flag = false;
    eachBondedAtom(structure, unit, index, (unit, index) => {
        if (isPolar(typeSymbol(unit, index)))
            flag = true;
    });
    return flag;
}
export function hasAromaticNeighbour(structure, unit, index) {
    let flag = false;
    eachBondedAtom(structure, unit, index, (unit, index) => {
        if (isAromatic(unit, index))
            flag = true;
    });
    return flag;
}
