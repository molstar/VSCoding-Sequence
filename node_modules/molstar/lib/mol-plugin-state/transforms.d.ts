/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Data from './transforms/data';
import * as Misc from './transforms/misc';
import * as Model from './transforms/model';
import * as Volume from './transforms/volume';
import * as Representation from './transforms/representation';
import * as Shape from './transforms/shape';
export declare const StateTransforms: {
    Data: typeof Data;
    Misc: typeof Misc;
    Model: typeof Model;
    Volume: typeof Volume;
    Representation: typeof Representation;
    Shape: typeof Shape;
};
export type StateTransforms = typeof StateTransforms;
