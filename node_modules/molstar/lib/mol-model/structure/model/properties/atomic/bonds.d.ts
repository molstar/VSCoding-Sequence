/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/**
 * Get order for bonds in aminoacids and nucleotides assuming standard IUPAC naming
 */
export declare function getIntraBondOrderFromTable(compId: string, atomId1: string, atomId2: string): number;
/**
 * Get order for bonds between component assuming PDBx/mmCIF naming.
 */
export declare function getInterBondOrderFromTable(compId1: string, atomId1: string, compId2: string, atomId2: string): number;
