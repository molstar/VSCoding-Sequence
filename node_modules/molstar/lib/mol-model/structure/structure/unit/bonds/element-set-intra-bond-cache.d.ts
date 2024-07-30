/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StructureElement } from '../../element';
import { IntraUnitBonds } from './data';
import { Model } from '../../../model';
export declare class ElementSetIntraBondCache {
    private data;
    get(xs: StructureElement.Set): IntraUnitBonds | undefined;
    set(xs: StructureElement.Set, bonds: IntraUnitBonds): void;
    static get(model: Model): ElementSetIntraBondCache;
}
