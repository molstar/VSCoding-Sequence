/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure } from '../../structure';
export declare function structureUnion(source: Structure, structures: Structure[]): Structure;
export declare function structureAreEqual(sA: Structure, sB: Structure): boolean;
export declare function structureAreIntersecting(sA: Structure, sB: Structure): boolean;
export declare function structureIntersect(sA: Structure, sB: Structure): Structure;
export declare function structureSubtract(a: Structure, b: Structure): Structure;
