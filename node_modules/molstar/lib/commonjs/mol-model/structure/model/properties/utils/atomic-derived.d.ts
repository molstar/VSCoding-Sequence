/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { AtomicData } from '../atomic';
import { AtomicIndex, AtomicDerivedData, AtomicSegments } from '../atomic/hierarchy';
import { ChemicalComponentMap } from '../common';
export declare function getAtomicDerivedData(data: AtomicData, segments: AtomicSegments, index: AtomicIndex, chemicalComponentMap: ChemicalComponentMap): AtomicDerivedData;
