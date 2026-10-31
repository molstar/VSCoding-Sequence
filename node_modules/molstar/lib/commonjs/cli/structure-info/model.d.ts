#!/usr/bin/env node
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CifFrame } from '../../mol-io/reader/cif';
import { Model, Structure, Trajectory } from '../../mol-model/structure';
export declare function readCifFile(path: string): Promise<import("../../mol-io/reader/cif").CifBlock>;
export declare function atomLabel(model: Model, aI: number): string;
export declare function residueLabel(model: Model, rI: number): string;
export declare function printSecStructure(model: Model): void;
export declare function printBonds(structure: Structure, showIntra: boolean, showInter: boolean): void;
export declare function printSequence(model: Model): void;
export declare function printRings(structure: Structure): void;
export declare function printUnits(structure: Structure): void;
export declare function printSymmetryInfo(model: Model): void;
export declare function printModelStats(models: Trajectory): Promise<void>;
export declare function getModelsAndStructure(frame: CifFrame): Promise<{
    models: Trajectory;
    structure: Structure;
}>;
