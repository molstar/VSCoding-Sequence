/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 *
 * based in part on NGL (https://github.com/arose/ngl)
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Features } from './features';
import { typeSymbol, eachBondedAtom } from '../chemistry/util';
import { FeatureGroup, InteractionType } from './common';
const HydrophobicParams = {
    distanceMax: PD.Numeric(4.0, { min: 1, max: 5, step: 0.1 }),
};
/**
 * Hydropbobic atoms
 * - Carbon only bonded to carbon or hydrogen
 * - Fluorine
 */
function addHydrophobicAtom(structure, unit, builder) {
    const { elements } = unit;
    const { x, y, z } = unit.model.atomicConformation;
    for (let i = 0, il = elements.length; i < il; ++i) {
        const element = typeSymbol(unit, i);
        let flag = false;
        if (element === "C" /* Elements.C */) {
            flag = true;
            eachBondedAtom(structure, unit, i, (unitB, indexB) => {
                const elementB = typeSymbol(unitB, indexB);
                if (elementB !== "C" /* Elements.C */ && elementB !== "H" /* Elements.H */)
                    flag = false;
            });
        }
        else if (element === "F" /* Elements.F */) {
            flag = true;
        }
        if (flag) {
            builder.add(8 /* FeatureType.HydrophobicAtom */, FeatureGroup.None, x[elements[i]], y[elements[i]], z[elements[i]], i);
        }
    }
}
function isHydrophobicContact(ti, tj) {
    return ti === 8 /* FeatureType.HydrophobicAtom */ && tj === 8 /* FeatureType.HydrophobicAtom */;
}
function testHydrophobic(structure, infoA, infoB, distanceSq) {
    const typeA = infoA.types[infoA.feature];
    const typeB = infoB.types[infoB.feature];
    if (!isHydrophobicContact(typeA, typeB))
        return;
    const indexA = infoA.members[infoA.offsets[infoA.feature]];
    const indexB = infoB.members[infoB.offsets[infoB.feature]];
    if (typeSymbol(infoA.unit, indexA) === "F" /* Elements.F */ && typeSymbol(infoB.unit, indexB) === "F" /* Elements.F */)
        return;
    return InteractionType.Hydrophobic;
}
//
export const HydrophobicAtomProvider = Features.Provider([8 /* FeatureType.HydrophobicAtom */], addHydrophobicAtom);
export const HydrophobicProvider = {
    name: 'hydrophobic',
    params: HydrophobicParams,
    createTester: (props) => {
        return {
            maxDistance: props.distanceMax,
            requiredFeatures: new Set([8 /* FeatureType.HydrophobicAtom */]),
            getType: (structure, infoA, infoB, distanceSq) => testHydrophobic(structure, infoA, infoB, distanceSq)
        };
    }
};
