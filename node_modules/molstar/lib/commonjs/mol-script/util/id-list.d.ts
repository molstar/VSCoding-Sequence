/**
 * Copyright (c) 2021-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 */
import { StructureQuery } from '../../mol-model/structure/query';
export declare function compileIdListSelection(input: string, idType: 'auth' | 'label' | 'atom-id' | 'element-symbol'): StructureQuery;
