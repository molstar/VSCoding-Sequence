/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure } from '../../mol-model/structure';
import { PluginContext } from '../../mol-plugin/context';
export declare const ModelExport: {
    getStructureName(structure: Structure): string | undefined;
    setStructureName(structure: Structure, name: string): string;
};
export declare function exportHierarchy(plugin: PluginContext, options?: {
    format?: 'cif' | 'bcif';
}): Promise<void>;
