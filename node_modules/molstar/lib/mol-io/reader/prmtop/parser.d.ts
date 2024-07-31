/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
import { Column } from '../../../mol-data/db';
declare const Pointers: {
    NATOM: string;
    NTYPES: string;
    NBONH: string;
    MBONA: string;
    NTHETH: string;
    MTHETA: string;
    NPHIH: string;
    MPHIA: string;
    NHPARM: string;
    NPARM: string;
    NNB: string;
    NRES: string;
    NBONA: string;
    NTHETA: string;
    NPHIA: string;
    NUMBND: string;
    NUMANG: string;
    NPTRA: string;
    NATYP: string;
    NPHB: string;
    IFPERT: string;
    NBPER: string;
    NGPER: string;
    NDPER: string;
    MBPER: string;
    MGPER: string;
    MDPER: string;
    IFBOX: string;
    NMXRS: string;
    IFCAP: string;
    NUMEXTRA: string;
    NCOPY: string;
};
type PointerName = keyof typeof Pointers;
export interface PrmtopFile {
    readonly version: string;
    readonly title: ReadonlyArray<string>;
    readonly pointers: Readonly<Record<PointerName, number>>;
    readonly atomName: Column<string>;
    readonly charge: Column<number>;
    readonly mass: Column<number>;
    readonly residueLabel: Column<string>;
    readonly residuePointer: Column<number>;
    readonly bondsIncHydrogen: Column<number>;
    readonly bondsWithoutHydrogen: Column<number>;
    readonly radii: Column<number>;
}
export declare function parsePrmtop(data: string): Task<Result<PrmtopFile>>;
export {};
