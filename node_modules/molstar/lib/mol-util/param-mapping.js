/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { produce } from 'immer';
export function ParamMapping(def) {
    return ({ values, update, apply }) => ({
        params: typeof def.params === 'function' ? def.params : ctx => def.params,
        getTarget: def.target,
        getValues: values,
        update(s, ctx) {
            const t = def.target(ctx);
            return produce(t, (t1) => update(s, t1, ctx));
        },
        apply: apply ? apply : () => { }
    });
}
