"use strict";
/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const observable_1 = require("./execution/observable");
const synchronous_1 = require("./execution/synchronous");
const id_factory_1 = require("../mol-util/id-factory");
var Task;
(function (Task) {
    class Impl {
        run(observer, updateRateMs = 250) {
            if (observer)
                return (0, observable_1.ExecuteObservable)(this, observer, updateRateMs);
            return this.f(synchronous_1.SyncRuntimeContext);
        }
        runAsChild(ctx, progress) {
            if (ctx.isSynchronous)
                return this.f(synchronous_1.SyncRuntimeContext);
            return (0, observable_1.ExecuteObservableChild)(ctx, this, progress);
        }
        runInContext(ctx) {
            if (ctx.isSynchronous)
                return this.f(synchronous_1.SyncRuntimeContext);
            return (0, observable_1.ExecuteInContext)(ctx, this);
        }
        constructor(name, f, onAbort) {
            this.name = name;
            this.f = f;
            this.onAbort = onAbort;
            this.id = getNextId();
        }
    }
    function is(t) {
        const _t = t;
        return !!t && typeof _t.id === 'number' && typeof _t.name === 'string' && !!_t.run;
    }
    Task.is = is;
    function isAbort(e) { return !!e && !!e.isAborted; }
    Task.isAbort = isAbort;
    function Aborted(reason) { return { isAborted: true, reason, toString() { return `Aborted${reason ? ': ' + reason : ''}`; } }; }
    Task.Aborted = Aborted;
    function create(name, f, onAbort) {
        return new Impl(name, f, onAbort);
    }
    Task.create = create;
    function constant(name, value) { return create(name, async (ctx) => value); }
    Task.constant = constant;
    function empty() { return create('', async (ctx) => { }); }
    Task.empty = empty;
    function fail(name, reason) { return create(name, async (ctx) => { throw new Error(reason); }); }
    Task.fail = fail;
    function resolveInContext(object, ctx) {
        if (is(object))
            return ctx ? object.runInContext(ctx) : object.run();
        return object;
    }
    Task.resolveInContext = resolveInContext;
    const getNextId = (0, id_factory_1.idFactory)(0, 0x3fffffff);
})(Task || (exports.Task = Task = {}));
