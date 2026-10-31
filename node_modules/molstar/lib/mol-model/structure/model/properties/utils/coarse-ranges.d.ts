/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CoarseRanges, CoarseElementData } from '../coarse/hierarchy';
import { ChemicalComponent } from '../common';
export declare function getCoarseRanges(data: CoarseElementData, chemicalComponentMap: ReadonlyMap<string, ChemicalComponent>): CoarseRanges;
