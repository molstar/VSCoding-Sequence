/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ParamDefinition as PD } from './param-definition';
import { Mutable } from './type-helpers';
export interface ParamMapping<S, T, Ctx> {
    params(ctx: Ctx): PD.For<S>;
    getTarget(ctx: Ctx): T;
    getValues(t: T, ctx: Ctx): S;
    update(s: S, ctx: Ctx): T;
    apply(t: T, ctx: Ctx): void | Promise<void>;
}
export declare function ParamMapping<S, T, Ctx>(def: {
    params: ((ctx: Ctx) => PD.For<S>) | PD.For<S>;
    target(ctx: Ctx): T;
}): (options: {
    values(t: T, ctx: Ctx): S;
    update(s: S, t: Mutable<T>, ctx: Ctx): void;
    apply?(t: T, ctx: Ctx): void | Promise<void>;
}) => ParamMapping<S, T, Ctx>;
