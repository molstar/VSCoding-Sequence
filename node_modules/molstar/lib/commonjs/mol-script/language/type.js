"use strict";
/*
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = void 0;
var Type;
(function (Type) {
    function Variable(name, type, isConstraint) { return { kind: 'variable', name, type: type, isConstraint }; }
    Type.Variable = Variable;
    function Value(namespace, name, parent) { return { kind: 'value', namespace, name, parent }; }
    Type.Value = Value;
    function Container(namespace, name, child, alias) { return { kind: 'container', namespace, name, child, alias }; }
    Type.Container = Container;
    function Union(types) { return { kind: 'union', types }; }
    Type.Union = Union;
    function OneOf(namespace, name, type, values) {
        const vals = Object.create(null);
        for (const v of values)
            vals[v] = true;
        return { kind: 'oneof', namespace, name, type, values: vals };
    }
    Type.OneOf = OneOf;
    Type.Any = { kind: 'any' };
    Type.AnyValue = { kind: 'any-value' };
    Type.Num = Value('', 'Number');
    Type.Str = Value('', 'String');
    Type.Bool = OneOf('', 'Bool', Type.Str, ['true', 'false']);
    function oneOfValues({ values }) { return Object.keys(values).sort(); }
    Type.oneOfValues = oneOfValues;
})(Type || (exports.Type = Type = {}));
