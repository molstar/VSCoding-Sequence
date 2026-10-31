/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { parseCifText } from './cif/text/parser';
import { parseCifBinary } from './cif/binary/parser';
import { toDatabaseCollection, toDatabase } from './cif/schema';
import { mmCIF_Schema } from './cif/schema/mmcif';
import { CCD_Schema } from './cif/schema/ccd';
import { BIRD_Schema } from './cif/schema/bird';
import { dic_Schema } from './cif/schema/dic';
import { DensityServer_Data_Schema } from './cif/schema/density-server';
import { CifCore_Schema, CifCore_Aliases } from './cif/schema/cif-core';
import { Segmentation_Data_Schema } from './cif/schema/segmentation';
export const CIF = {
    parse: (data) => typeof data === 'string' ? parseCifText(data) : parseCifBinary(data),
    parseText: parseCifText,
    parseBinary: parseCifBinary,
    toDatabaseCollection,
    toDatabase,
    schema: {
        mmCIF: (frame) => toDatabase(mmCIF_Schema, frame),
        CCD: (frame) => toDatabase(CCD_Schema, frame),
        BIRD: (frame) => toDatabase(BIRD_Schema, frame),
        dic: (frame) => toDatabase(dic_Schema, frame),
        cifCore: (frame) => toDatabase(CifCore_Schema, frame, CifCore_Aliases),
        densityServer: (frame) => toDatabase(DensityServer_Data_Schema, frame),
        segmentation: (frame) => toDatabase(Segmentation_Data_Schema, frame),
    }
};
export * from './cif/data-model';
