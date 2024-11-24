/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure, StructureElement } from '../../mol-model/structure';
import { PluginContext } from '../../mol-plugin/context';
import { StructureComponentRef } from '../manager/structure/hierarchy-state';
import { EmptyLoci } from '../../mol-model/loci';
import { Material } from '../../mol-util/material';
export declare function setStructureSubstance(plugin: PluginContext, components: StructureComponentRef[], material: Material | undefined, lociGetter: (structure: Structure) => Promise<StructureElement.Loci | EmptyLoci>, types?: string[]): Promise<void>;
export declare function clearStructureSubstance(plugin: PluginContext, components: StructureComponentRef[], types?: string[]): Promise<void>;
