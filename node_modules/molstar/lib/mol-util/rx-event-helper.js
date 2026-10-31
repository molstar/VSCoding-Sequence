/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Subject, BehaviorSubject } from 'rxjs';
export { RxEventHelper };
var RxEventHelper;
(function (RxEventHelper) {
    function create() {
        const helper = new _RxEventHelper();
        const ret = (() => helper.create());
        ret.dispose = () => helper.dispose();
        ret.behavior = (v) => helper.behavior(v);
        return ret;
    }
    RxEventHelper.create = create;
})(RxEventHelper || (RxEventHelper = {}));
class _RxEventHelper {
    constructor() {
        this._eventList = [];
        this._disposed = false;
    }
    create() {
        const s = new Subject();
        this._eventList.push(s);
        return s;
    }
    behavior(v) {
        const s = new BehaviorSubject(v);
        this._eventList.push(s);
        return s;
    }
    dispose() {
        if (this._disposed)
            return;
        for (const e of this._eventList)
            e.complete();
        this._disposed = true;
    }
}
