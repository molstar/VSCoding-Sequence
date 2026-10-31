/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure, StructureElement } from '../../mol-model/structure';
import { PluginContext } from '../../mol-plugin/context';
import { Color } from '../../mol-util/color';
import { StructureComponentRef } from '../manager/structure/hierarchy-state';
import { EmptyLoci } from '../../mol-model/loci';
export declare function setStructureOverpaint(plugin: PluginContext, components: StructureComponentRef[], color: Color | -1, lociGetter: (structure: Structure) => Promise<StructureElement.Loci | EmptyLoci>, types?: string[]): Promise<void>;
export declare function clearStructureOverpaint(plugin: PluginContext, components: StructureComponentRef[], types?: string[]): Promise<void>;
