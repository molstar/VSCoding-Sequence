/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
import { Column } from '../../../mol-data/db';
export interface PsfFile {
    readonly id: string;
    readonly title: string[];
    readonly atoms: {
        readonly count: number;
        readonly atomId: Column<number>;
        readonly segmentName: Column<string>;
        readonly residueId: Column<number>;
        readonly residueName: Column<string>;
        readonly atomName: Column<string>;
        readonly atomType: Column<string>;
        readonly charge: Column<number>;
        readonly mass: Column<number>;
    };
    readonly bonds: {
        readonly count: number;
        readonly atomIdA: Column<number>;
        readonly atomIdB: Column<number>;
    };
}
export declare function parsePsf(data: string): Task<Result<PsfFile>>;
