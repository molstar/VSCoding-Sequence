/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure, StructureElement } from '../../mol-model/structure';
import { PluginContext } from '../../mol-plugin/context';
import { StructureComponentRef } from '../manager/structure/hierarchy-state';
import { EmptyLoci } from '../../mol-model/loci';
export declare function setStructureEmissive(plugin: PluginContext, components: StructureComponentRef[], value: number, lociGetter: (structure: Structure) => Promise<StructureElement.Loci | EmptyLoci>, types?: string[]): Promise<void>;
export declare function clearStructureEmissive(plugin: PluginContext, components: StructureComponentRef[], types?: string[]): Promise<void>;
