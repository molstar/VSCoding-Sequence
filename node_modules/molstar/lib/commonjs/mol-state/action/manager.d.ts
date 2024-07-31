/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StateAction } from '../action';
import { StateObjectCell } from '../object';
import { StateTransformer } from '../transformer';
import { UUID } from '../../mol-util';
export { StateActionManager };
declare class StateActionManager {
    private ev;
    private actions;
    private fromTypeIndex;
    readonly events: {
        added: import("rxjs").Subject<undefined>;
        removed: import("rxjs").Subject<undefined>;
    };
    add(actionOrTransformer: StateAction | StateTransformer): this;
    remove(actionOrTransformer: StateAction | StateTransformer | UUID): this;
    fromCell(cell: StateObjectCell, ctx: unknown): ReadonlyArray<StateAction>;
    dispose(): void;
}
