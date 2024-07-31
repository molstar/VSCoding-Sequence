/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column } from '../db';
class GroupingImpl {
    add(a) {
        const key = this.getKey(a);
        if (!!this.map.has(key)) {
            const group = this.map.get(key);
            group[group.length] = a;
        }
        else {
            const group = [a];
            this.map.set(key, group);
            this.keys[this.keys.length] = key;
            this.groups[this.groups.length] = group;
        }
    }
    getGrouping() {
        return { keys: this.keys, groups: this.groups, map: this.map };
    }
    constructor(getKey) {
        this.getKey = getKey;
        this.map = new Map();
        this.keys = [];
        this.groups = [];
    }
}
export function Grouper(getKey) {
    return new GroupingImpl(getKey);
}
export function groupBy(values, getKey) {
    const gs = Grouper(getKey);
    if (Column.is(values)) {
        const v = values.value;
        for (let i = 0, _i = values.rowCount; i < _i; i++)
            gs.add(v(i));
    }
    else {
        for (let i = 0, _i = values.length; i < _i; i++)
            gs.add(values[i]);
    }
    return gs.getGrouping();
}
