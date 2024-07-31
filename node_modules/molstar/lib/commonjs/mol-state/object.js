"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateObjectRef = exports.StateObjectSelector = exports.StateObjectTracker = exports.StateObjectCell = exports.StateObject = void 0;
const mol_util_1 = require("../mol-util");
const mol_state_1 = require("../mol-state");
var StateObject;
(function (StateObject) {
    function factory() {
        return (type) => create(type);
    }
    StateObject.factory = factory;
    function create(type) {
        var _a;
        return _a = class O {
                static is(obj) { return !!obj && type === obj.type; }
                constructor(data, props) {
                    this.data = data;
                    this.id = mol_util_1.UUID.create22();
                    this.type = type;
                    this.label = props && props.label || type.name;
                    this.description = props && props.description;
                }
            },
            _a.type = type,
            _a;
    }
    StateObject.create = create;
    function hasTag(o, t) {
        if (!o.tags)
            return false;
        for (const s of o.tags) {
            if (s === t)
                return true;
        }
        return false;
    }
    StateObject.hasTag = hasTag;
    /** A special object indicating a transformer result has no value. */
    StateObject.Null = {
        id: mol_util_1.UUID.create22(),
        type: { name: 'Null', typeClass: 'Null' },
        data: void 0,
        label: 'Null'
    };
})(StateObject || (exports.StateObject = StateObject = {}));
var StateObjectCell;
(function (StateObjectCell) {
    function is(o) {
        const c = o;
        return !!c && !!c.transform && !!c.parent && !!c.status;
    }
    StateObjectCell.is = is;
    function resolve(state, refOrCellOrSelector) {
        const ref = typeof refOrCellOrSelector === 'string'
            ? refOrCellOrSelector
            : StateObjectCell.is(refOrCellOrSelector)
                ? refOrCellOrSelector.transform.ref
                : refOrCellOrSelector.ref;
        return state.cells.get(ref);
    }
    StateObjectCell.resolve = resolve;
})(StateObjectCell || (exports.StateObjectCell = StateObjectCell = {}));
// TODO: improve the API?
class StateObjectTracker {
    setQuery(sel) {
        this.query = mol_state_1.StateSelection.compile(sel);
    }
    update() {
        const cell = this.state.select(this.query)[0];
        const version = cell ? cell.transform.version : void 0;
        const changed = this.cell !== cell || this.version !== version;
        this.cell = cell;
        this.version = version || '';
        this.data = cell && cell.obj ? cell.obj.data : void 0;
        return changed;
    }
    constructor(state) {
        this.state = state;
        this.version = '';
    }
}
exports.StateObjectTracker = StateObjectTracker;
class StateObjectSelector {
    get cell() {
        var _a;
        return (_a = this.state) === null || _a === void 0 ? void 0 : _a.cells.get(this.ref);
    }
    get obj() {
        var _a, _b;
        return (_b = (_a = this.state) === null || _a === void 0 ? void 0 : _a.cells.get(this.ref)) === null || _b === void 0 ? void 0 : _b.obj;
    }
    get data() {
        var _a;
        return (_a = this.obj) === null || _a === void 0 ? void 0 : _a.data;
    }
    update(params, builder) {
        if (!this.state)
            throw new Error(`To use update() from StateObjectSelector, 'state' must be defined.`);
        if (!builder)
            builder = this.state.build();
        (builder || this.state.build()).to(this).update(params);
        return builder;
    }
    /** Checks if the object exists. If not throw an error. */
    checkValid() {
        if (!this.state) {
            throw new Error('Unassigned State.');
        }
        const cell = this.cell;
        if (!cell) {
            throw new Error(`Not created at all. Did you await/then the corresponding state update?`);
        }
        if (cell.status === 'ok')
            return true;
        if (cell.status === 'error')
            throw new Error(cell.errorText);
        if (cell.obj === StateObject.Null)
            throw new Error('The object is Null.');
        throw new Error(`Unresolved. Did you await/then the corresponding state update?`);
    }
    get isOk() {
        const cell = this.cell;
        return cell && cell.status === 'ok' && cell.obj !== StateObject.Null;
    }
    constructor(ref, state) {
        this.ref = ref;
        this.state = state;
    }
}
exports.StateObjectSelector = StateObjectSelector;
var StateObjectRef;
(function (StateObjectRef) {
    function resolveRef(ref) {
        var _a;
        if (!ref)
            return;
        if (typeof ref === 'string')
            return ref;
        if (StateObjectCell.is(ref))
            return ref.transform.ref;
        return (_a = ref.cell) === null || _a === void 0 ? void 0 : _a.transform.ref;
    }
    StateObjectRef.resolveRef = resolveRef;
    function resolve(state, ref) {
        if (!ref)
            return;
        if (StateObjectCell.is(ref))
            return ref;
        if (typeof ref === 'string')
            return state.cells.get(ref);
        return ref.cell;
    }
    StateObjectRef.resolve = resolve;
    function resolveAndCheck(state, ref) {
        const cell = resolve(state, ref);
        if (!cell || !cell.obj || cell.status !== 'ok')
            return;
        return cell;
    }
    StateObjectRef.resolveAndCheck = resolveAndCheck;
})(StateObjectRef || (exports.StateObjectRef = StateObjectRef = {}));
