/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StateTransform } from '../transform';
export { StateTreeSpine };
var StateTreeSpine;
(function (StateTreeSpine) {
    class Impl {
        get current() { return this._current; }
        set current(cell) { this._current = cell; }
        getAncestorOfType(t) {
            if (!this._current)
                return void 0;
            let cell = this._current;
            while (true) {
                cell = this.cells.get(cell.transform.parent);
                if (!cell.obj)
                    return void 0;
                if (cell.obj.type === t.type)
                    return cell.obj;
                if (cell.transform.ref === StateTransform.RootRef)
                    return void 0;
            }
        }
        getRootOfType(t) {
            if (!this._current)
                return void 0;
            let cell = this._current; // check current first
            let ret = void 0;
            while (true) {
                if (!cell.obj)
                    return void 0;
                if (cell.obj.type === t.type) {
                    ret = cell;
                }
                if (cell.transform.ref === StateTransform.RootRef)
                    return ret ? ret.obj : void 0;
                cell = this.cells.get(cell.transform.parent); // assign parent for next check
            }
        }
        constructor(cells) {
            this.cells = cells;
            this._current = void 0;
        }
    }
    StateTreeSpine.Impl = Impl;
    function getDecoratorChain(state, currentRef) {
        const cells = state.cells;
        let current = cells.get(currentRef);
        const ret = [current];
        while (current === null || current === void 0 ? void 0 : current.transform.transformer.definition.isDecorator) {
            current = cells.get(current.transform.parent);
            ret.push(current);
        }
        return ret;
    }
    StateTreeSpine.getDecoratorChain = getDecoratorChain;
    function getRootOfType(state, t, ref) {
        let ret = void 0;
        let cell = state.cells.get(ref);
        if (!cell)
            return void 0;
        while (true) {
            if (!cell.obj)
                return void 0;
            if (cell.obj.type === t.type) {
                ret = cell;
            }
            if (cell.transform.ref === StateTransform.RootRef)
                return ret ? ret.obj : void 0;
            cell = state.cells.get(cell.transform.parent); // assign parent for next check
        }
    }
    StateTreeSpine.getRootOfType = getRootOfType;
})(StateTreeSpine || (StateTreeSpine = {}));
