"use strict";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtomicDerivedData = getAtomicDerivedData;
const atomic_1 = require("../atomic");
const types_1 = require("../../types");
const util_1 = require("../../../../../mol-model/structure/util");
const debug_1 = require("../../../../../mol-util/debug");
function getAtomicDerivedData(data, segments, index, chemicalComponentMap) {
    const { label_comp_id, type_symbol, _rowCount: atomCount } = data.atoms;
    const { _rowCount: residueCount } = data.residues;
    const { offsets } = segments.residueAtomSegments;
    const atomicNumber = new Uint8Array(atomCount);
    for (let i = 0; i < atomCount; ++i) {
        atomicNumber[i] = (0, atomic_1.AtomNumber)(type_symbol.value(i));
    }
    const traceElementIndex = new Int32Array(residueCount);
    const directionFromElementIndex = new Int32Array(residueCount);
    const directionToElementIndex = new Int32Array(residueCount);
    const moleculeType = new Uint8Array(residueCount);
    const polymerType = new Uint8Array(residueCount);
    const moleculeTypeMap = new Map();
    const polymerTypeMap = new Map();
    for (let i = 0; i < residueCount; ++i) {
        const compId = label_comp_id.value(offsets[i]);
        const chemCompMap = chemicalComponentMap;
        let molType;
        let polyType;
        if (moleculeTypeMap.has(compId)) {
            molType = moleculeTypeMap.get(compId);
            polyType = polymerTypeMap.get(compId);
        }
        else {
            let type;
            if (chemCompMap.has(compId)) {
                type = chemCompMap.get(compId).type;
            }
            else {
                if (!debug_1.isProductionMode)
                    console.info('chemComp not found', compId);
                type = (0, types_1.getComponentType)(compId);
            }
            molType = (0, types_1.getMoleculeType)(type, compId);
            // TODO if unknown molecule type, use atom names to guess molecule type
            polyType = (0, types_1.getPolymerType)(type, molType);
            moleculeTypeMap.set(compId, molType);
            polymerTypeMap.set(compId, polyType);
        }
        moleculeType[i] = molType;
        polymerType[i] = polyType;
        const traceAtomId = (0, util_1.getAtomIdForAtomRole)(polyType, 'trace');
        let traceIndex = index.findAtomsOnResidue(i, traceAtomId);
        if (traceIndex === -1) {
            const coarseAtomId = (0, util_1.getAtomIdForAtomRole)(polyType, 'coarseBackbone');
            traceIndex = index.findAtomsOnResidue(i, coarseAtomId);
            if (traceIndex === -1 && (0, types_1.isPolymer)(molType)) {
                traceIndex = index.findElementOnResidue(i, (0, types_1.ElementSymbol)('C'));
            }
        }
        traceElementIndex[i] = traceIndex;
        const directionFromAtomId = (0, util_1.getAtomIdForAtomRole)(polyType, 'directionFrom');
        directionFromElementIndex[i] = index.findAtomsOnResidue(i, directionFromAtomId);
        const directionToAtomId = (0, util_1.getAtomIdForAtomRole)(polyType, 'directionTo');
        directionToElementIndex[i] = index.findAtomsOnResidue(i, directionToAtomId);
    }
    return {
        atom: {
            atomicNumber: atomicNumber
        },
        residue: {
            traceElementIndex: traceElementIndex,
            directionFromElementIndex: directionFromElementIndex,
            directionToElementIndex: directionToElementIndex,
            moleculeType: moleculeType,
            polymerType: polymerType,
        }
    };
}
