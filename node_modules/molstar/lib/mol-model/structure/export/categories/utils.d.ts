/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { mmCIF_Database, mmCIF_Schema } from '../../../../mol-io/reader/cif/schema/mmcif';
import { Model } from '../../model';
import { Structure } from '../../structure';
import { EntityIndex } from '../../model/indexing';
import { CifWriter } from '../../../../mol-io/writer/cif';
import { CifExportContext } from '../mmcif';
import { CifCategory } from '../../../../mol-io/reader/cif';
export declare function getModelMmCifCategory<K extends keyof mmCIF_Schema>(model: Model, name: K): mmCIF_Database[K] | undefined;
export declare function getUniqueResidueNamesFromStructures(structures: Structure[]): Set<string>;
export declare function getUniqueEntityIdsFromStructures(structures: Structure[]): Set<string>;
export declare function getUniqueEntityIndicesFromStructures(structures: Structure[]): ReadonlyArray<EntityIndex>;
export declare function copy_mmCif_category(name: keyof mmCIF_Schema, condition?: (structure: Structure) => boolean): CifWriter.Category<CifExportContext>;
export declare function copy_source_mmCifCategory(encoder: CifWriter.Encoder, ctx: CifExportContext, category: CifCategory): CifWriter.Category<CifExportContext> | undefined;
