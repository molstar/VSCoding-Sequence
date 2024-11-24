/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { AtomsQueryParams } from '../../../mol-model/structure/query/queries/generators';
import { AtomSiteSchema } from '../server/api';
export declare function getAtomsTests(params: AtomSiteSchema): Partial<AtomsQueryParams>[];
