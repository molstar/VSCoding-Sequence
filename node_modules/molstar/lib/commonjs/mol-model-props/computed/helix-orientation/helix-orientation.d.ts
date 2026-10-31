/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Model } from '../../../mol-model/structure/model';
export interface HelixOrientation {
    centers: ArrayLike<number>;
}
/** Usees same definition as GROMACS' helixorient */
export declare function calcHelixOrientation(model: Model): HelixOrientation;
