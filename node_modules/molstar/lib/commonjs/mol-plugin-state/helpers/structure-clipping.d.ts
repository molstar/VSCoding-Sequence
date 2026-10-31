/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure, StructureElement } from '../../mol-model/structure';
import { PluginContext } from '../../mol-plugin/context';
import { StructureComponentRef } from '../manager/structure/hierarchy-state';
import { EmptyLoci } from '../../mol-model/loci';
import { Clipping } from '../../mol-theme/clipping';
export declare function setStructureClipping(plugin: PluginContext, components: StructureComponentRef[], groups: Clipping.Groups, lociGetter: (structure: Structure) => Promise<StructureElement.Loci | EmptyLoci>, types?: string[]): Promise<void>;
