/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Loci } from './loci';
import { Location } from './location';
export interface Stats {
    elementCount: number;
    conformationCount: number;
    residueCount: number;
    chainCount: number;
    unitCount: number;
    structureCount: number;
    firstElementLoc: Location;
    firstConformationLoc: Location;
    firstResidueLoc: Location;
    firstChainLoc: Location;
    firstUnitLoc: Location;
    firstStructureLoc: Location;
}
export declare namespace Stats {
    function create(): Stats;
    function ofLoci(loci: Loci): Stats;
    /** Adds counts of two Stats objects together, assumes they describe different structures */
    function add(out: Stats, a: Stats, b: Stats): Stats;
}
