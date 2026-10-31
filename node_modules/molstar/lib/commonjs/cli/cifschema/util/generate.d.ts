/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Database, Filter } from './schema';
export declare function generate(name: string, info: string, schema: Database, fields: Filter | undefined, moldataImportPath: string, addAliases: boolean): string;
