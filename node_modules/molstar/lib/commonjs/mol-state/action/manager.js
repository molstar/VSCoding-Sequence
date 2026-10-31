"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateActionManager = void 0;
const transformer_1 = require("../transformer");
const mol_util_1 = require("../../mol-util");
const array_1 = require("../../mol-util/array");
const rx_event_helper_1 = require("../../mol-util/rx-event-helper");
class StateActionManager {
    constructor() {
        this.ev = rx_event_helper_1.RxEventHelper.create();
        this.actions = new Map();
        this.fromTypeIndex = new Map();
        this.events = {
            added: this.ev(),
            removed: this.ev(),
        };
    }
    add(actionOrTransformer) {
        const action = transformer_1.StateTransformer.is(actionOrTransformer) ? actionOrTransformer.toAction() : actionOrTransformer;
        if (this.actions.has(action.id))
            return this;
        this.actions.set(action.id, action);
        for (const t of action.definition.from) {
            if (this.fromTypeIndex.has(t.type)) {
                this.fromTypeIndex.get(t.type).push(action);
            }
            else {
                this.fromTypeIndex.set(t.type, [action]);
            }
        }
        this.events.added.next(void 0);
        return this;
    }
    remove(actionOrTransformer) {
        const id = transformer_1.StateTransformer.is(actionOrTransformer)
            ? actionOrTransformer.toAction().id
            : mol_util_1.UUID.is(actionOrTransformer)
                ? actionOrTransformer
                : actionOrTransformer.id;
        const action = this.actions.get(id);
        if (!action)
            return this;
        this.actions.delete(id);
        for (const t of action.definition.from) {
            const xs = this.fromTypeIndex.get(t.type);
            if (!xs)
                continue;
            (0, array_1.arraySetRemove)(xs, action);
            if (xs.length === 0)
                this.fromTypeIndex.delete(t.type);
        }
        this.events.removed.next(void 0);
        return this;
    }
    fromCell(cell, ctx) {
        const obj = cell.obj;
        if (!obj)
            return [];
        const actions = this.fromTypeIndex.get(obj.type);
        if (!actions)
            return [];
        let hasTest = false;
        for (const a of actions) {
            if (a.definition.isApplicable) {
                hasTest = true;
                break;
            }
        }
        if (!hasTest)
            return actions;
        const ret = [];
        for (const a of actions) {
            if (a.definition.isApplicable) {
                if (a.definition.isApplicable(obj, cell.transform, ctx)) {
                    ret.push(a);
                }
            }
            else {
                ret.push(a);
            }
        }
        return ret;
    }
    dispose() {
        this.ev.dispose();
    }
}
exports.StateActionManager = StateActionManager;
