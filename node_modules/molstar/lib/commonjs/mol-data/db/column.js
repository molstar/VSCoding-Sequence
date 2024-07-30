"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Column = void 0;
const tslib_1 = require("tslib");
const ColumnHelpers = tslib_1.__importStar(require("./column-helpers"));
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const number_parser_1 = require("../../mol-io/reader/common/text/number-parser");
var Column;
(function (Column) {
    let Schema;
    (function (Schema) {
        // T also serves as a default value for undefined columns
        Schema.str = { '@type': 'str', T: '', valueType: 'str' };
        Schema.ustr = { '@type': 'str', T: '', valueType: 'str', transform: 'uppercase' };
        Schema.lstr = { '@type': 'str', T: '', valueType: 'str', transform: 'lowercase' };
        Schema.int = { '@type': 'int', T: 0, valueType: 'int' };
        Schema.coord = { '@type': 'coord', T: 0, valueType: 'float' };
        Schema.float = { '@type': 'float', T: 0, valueType: 'float' };
        function Str(options) { var _a; return { '@type': 'str', T: (_a = options === null || options === void 0 ? void 0 : options.defaultValue) !== null && _a !== void 0 ? _a : '', transform: options === null || options === void 0 ? void 0 : options.transform, valueType: 'str' }; }
        Schema.Str = Str;
        ;
        function Int(defaultValue = 0) { return { '@type': 'int', T: defaultValue, valueType: 'int' }; }
        Schema.Int = Int;
        ;
        function Float(defaultValue = 0) { return { '@type': 'float', T: defaultValue, valueType: 'float' }; }
        Schema.Float = Float;
        ;
        function Tensor(space, baseType = Schema.float) { return { '@type': 'tensor', T: space.create(), space, valueType: 'tensor', baseType }; }
        Schema.Tensor = Tensor;
        function Vector(dim, baseType = Schema.float) { return Tensor(linear_algebra_1.Tensor.Vector(dim, baseType['@type'] === 'int' ? Int32Array : Float64Array), baseType); }
        Schema.Vector = Vector;
        function Matrix(rows, cols, baseType = Schema.float) { return Tensor(linear_algebra_1.Tensor.ColumnMajorMatrix(rows, cols, baseType['@type'] === 'int' ? Int32Array : Float64Array), baseType); }
        Schema.Matrix = Matrix;
        function Aliased(t) {
            return t;
        }
        Schema.Aliased = Aliased;
        function List(separator, itemParse, defaultValue = []) {
            return { '@type': 'list', T: defaultValue, separator, itemParse, valueType: 'list' };
        }
        Schema.List = List;
    })(Schema = Column.Schema || (Column.Schema = {}));
    function is(v) {
        return !!v && !!v.schema && !!v.value;
    }
    Column.is = is;
    Column.ValueKind = {
        /** Defined value (= 0) */
        Present: 0 /* ValueKinds.Present */,
        /** Expressed in CIF as `.` (= 1) */
        NotPresent: 1 /* ValueKinds.NotPresent */,
        /** Expressed in CIF as `?` (= 2) */
        Unknown: 2 /* ValueKinds.Unknown */
    };
    function Undefined(rowCount, schema) {
        return constColumn(schema['T'], rowCount, schema, 1 /* ValueKinds.NotPresent */);
    }
    Column.Undefined = Undefined;
    function ofConst(v, rowCount, type) {
        return constColumn(v, rowCount, type, 0 /* ValueKinds.Present */);
    }
    Column.ofConst = ofConst;
    function ofLambda(spec) {
        return lambdaColumn(spec);
    }
    Column.ofLambda = ofLambda;
    /** values [min, max] (i.e. include both values) */
    function range(min, max) {
        return ofLambda({
            value: i => i + min,
            rowCount: Math.max(max - min + 1, 0),
            schema: Schema.int
        });
    }
    Column.range = range;
    function ofArray(spec) {
        return arrayColumn(spec);
    }
    Column.ofArray = ofArray;
    function ofIntArray(array) {
        return arrayColumn({ array, schema: Schema.int });
    }
    Column.ofIntArray = ofIntArray;
    function ofFloatArray(array) {
        return arrayColumn({ array, schema: Schema.float });
    }
    Column.ofFloatArray = ofFloatArray;
    function ofStringArray(array) {
        return arrayColumn({ array, schema: Schema.str });
    }
    Column.ofStringArray = ofStringArray;
    function ofStringAliasArray(array) {
        return arrayColumn({ array, schema: Schema.Aliased(Schema.str) });
    }
    Column.ofStringAliasArray = ofStringAliasArray;
    function ofStringListArray(array, separator = ',') {
        return arrayColumn({ array, schema: Schema.List(separator, x => x) });
    }
    Column.ofStringListArray = ofStringListArray;
    function ofIntTokens(tokens) {
        const { count, data, indices } = tokens;
        return lambdaColumn({
            value: (row) => (0, number_parser_1.parseInt)(data, indices[2 * row], indices[2 * row + 1]) || 0,
            rowCount: count,
            schema: Schema.int,
        });
    }
    Column.ofIntTokens = ofIntTokens;
    function ofFloatTokens(tokens) {
        const { count, data, indices } = tokens;
        return lambdaColumn({
            value: (row) => (0, number_parser_1.parseFloat)(data, indices[2 * row], indices[2 * row + 1]) || 0,
            rowCount: count,
            schema: Schema.float,
        });
    }
    Column.ofFloatTokens = ofFloatTokens;
    function ofStringTokens(tokens) {
        const { count, data, indices } = tokens;
        return lambdaColumn({
            value: (row) => {
                const ret = data.substring(indices[2 * row], indices[2 * row + 1]);
                if (ret === '.' || ret === '?')
                    return '';
                return ret;
            },
            rowCount: count,
            schema: Schema.str,
        });
    }
    Column.ofStringTokens = ofStringTokens;
    function window(column, start, end) {
        return windowColumn(column, start, end);
    }
    Column.window = window;
    function view(column, indices, checkIndentity = true) {
        return columnView(column, indices, checkIndentity);
    }
    Column.view = view;
    /** A map of the 1st occurence of each value. */
    function createFirstIndexMap(column) {
        return createFirstIndexMapOfColumn(column);
    }
    Column.createFirstIndexMap = createFirstIndexMap;
    function createIndexer(column) {
        return createIndexerOfColumn(column);
    }
    Column.createIndexer = createIndexer;
    function mapToArray(column, f, ctor) {
        return mapToArrayImpl(column, f, ctor || Array);
    }
    Column.mapToArray = mapToArray;
    function areEqual(a, b) {
        return areColumnsEqual(a, b);
    }
    Column.areEqual = areEqual;
    function indicesOf(c, test) {
        return columnIndicesOf(c, test);
    }
    Column.indicesOf = indicesOf;
    /** Makes the column backed by an array. Useful for columns that are accessed often. */
    function asArrayColumn(c, array) {
        if (c.__array)
            return c;
        if (!c.isDefined)
            return Undefined(c.rowCount, c.schema);
        return arrayColumn({ array: c.toArray({ array }), schema: c.schema, valueKind: c.valueKind });
    }
    Column.asArrayColumn = asArrayColumn;
    function copyToArray(c, array, offset = 0) {
        if (!c.isDefined)
            return;
        const cArray = c.__array;
        if (cArray) {
            for (let i = 0, _i = cArray.length; i < _i; i++)
                array[offset + i] = cArray[i];
        }
        else {
            for (let i = 0, _i = c.rowCount; i < _i; i++)
                array[offset + i] = c.value(i);
        }
    }
    Column.copyToArray = copyToArray;
    function isIdentity(c) {
        for (let i = 0, _i = c.rowCount; i < _i; i++) {
            if (i !== c.value(i))
                return false;
        }
        return true;
    }
    Column.isIdentity = isIdentity;
})(Column || (exports.Column = Column = {}));
function createFirstIndexMapOfColumn(c) {
    const map = new Map();
    for (let i = 0, _i = c.rowCount; i < _i; i++) {
        const v = c.value(i);
        if (!map.has(v))
            map.set(c.value(i), i);
    }
    return map;
}
function createIndexerOfColumn(c) {
    const map = new Map();
    for (let i = 0, _i = c.rowCount; i < _i; i++) {
        const v = c.value(i);
        if (!map.has(v))
            map.set(c.value(i), i);
    }
    return v => map.has(v) ? map.get(v) : -1;
}
function constColumn(v, rowCount, schema, valueKind) {
    const value = row => v;
    return {
        schema: schema,
        __array: void 0,
        isDefined: valueKind === 0 /* Column.ValueKinds.Present */,
        rowCount,
        value,
        valueKind: row => valueKind,
        toArray: params => {
            const { array } = ColumnHelpers.createArray(rowCount, params);
            for (let i = 0, _i = array.length; i < _i; i++)
                array[i] = v;
            return array;
        },
        areValuesEqual: (rowA, rowB) => true
    };
}
function lambdaColumn({ value, valueKind, areValuesEqual, rowCount, schema }) {
    return {
        schema: schema,
        __array: void 0,
        isDefined: true,
        rowCount,
        value,
        valueKind: valueKind ? valueKind : row => 0 /* Column.ValueKinds.Present */,
        toArray: params => {
            const { array, start } = ColumnHelpers.createArray(rowCount, params);
            for (let i = 0, _i = array.length; i < _i; i++)
                array[i] = value(i + start);
            return array;
        },
        areValuesEqual: areValuesEqual ? areValuesEqual : (rowA, rowB) => value(rowA) === value(rowB)
    };
}
function arrayColumn({ array, schema, valueKind }) {
    const rowCount = array.length;
    const defaultValue = schema.T;
    const value = schema.valueType === 'str'
        ? schema.transform === 'lowercase'
            ? row => { const v = array[row]; return typeof v === 'string' ? v.toLowerCase() : `${v !== null && v !== void 0 ? v : defaultValue}`.toLowerCase(); }
            : schema.transform === 'uppercase'
                ? row => { const v = array[row]; return typeof v === 'string' ? v.toUpperCase() : `${v !== null && v !== void 0 ? v : defaultValue}`.toUpperCase(); }
                : row => { const v = array[row]; return typeof v === 'string' ? v : `${v !== null && v !== void 0 ? v : defaultValue}`; }
        : row => array[row];
    const isTyped = ColumnHelpers.isTypedArray(array);
    return {
        schema: schema,
        __array: array,
        isDefined: true,
        rowCount,
        value,
        valueKind: valueKind ? valueKind : row => 0 /* Column.ValueKinds.Present */,
        toArray: schema.valueType === 'str'
            ? schema.transform === 'lowercase'
                ? params => {
                    const { start, end } = ColumnHelpers.getArrayBounds(rowCount, params);
                    const ret = new (params && typeof params.array !== 'undefined' ? params.array : array.constructor)(end - start);
                    for (let i = 0, _i = end - start; i < _i; i++) {
                        const v = array[start + i];
                        ret[i] = typeof v === 'string' ? v.toLowerCase() : `${v !== null && v !== void 0 ? v : defaultValue}`.toLowerCase();
                    }
                    return ret;
                }
                : schema.transform === 'uppercase'
                    ? params => {
                        const { start, end } = ColumnHelpers.getArrayBounds(rowCount, params);
                        const ret = new (params && typeof params.array !== 'undefined' ? params.array : array.constructor)(end - start);
                        for (let i = 0, _i = end - start; i < _i; i++) {
                            const v = array[start + i];
                            ret[i] = typeof v === 'string' ? v.toUpperCase() : `${v !== null && v !== void 0 ? v : defaultValue}`.toUpperCase();
                        }
                        return ret;
                    }
                    : params => {
                        const { start, end } = ColumnHelpers.getArrayBounds(rowCount, params);
                        const ret = new (params && typeof params.array !== 'undefined' ? params.array : array.constructor)(end - start);
                        for (let i = 0, _i = end - start; i < _i; i++) {
                            const v = array[start + i];
                            ret[i] = typeof v === 'string' ? v : `${v !== null && v !== void 0 ? v : defaultValue}`;
                        }
                        return ret;
                    }
            : isTyped
                ? params => ColumnHelpers.typedArrayWindow(array, params)
                : params => {
                    const { start, end } = ColumnHelpers.getArrayBounds(rowCount, params);
                    if (start === 0 && end === array.length)
                        return array;
                    const ret = new (params && typeof params.array !== 'undefined' ? params.array : array.constructor)(end - start);
                    for (let i = 0, _i = end - start; i < _i; i++)
                        ret[i] = array[start + i];
                    return ret;
                },
        areValuesEqual: (rowA, rowB) => array[rowA] === array[rowB]
    };
}
function windowColumn(column, start, end) {
    if (!column.isDefined)
        return Column.Undefined(end - start, column.schema);
    if (start === 0 && end === column.rowCount)
        return column;
    if (!!column.__array && ColumnHelpers.isTypedArray(column.__array))
        return windowTyped(column, start, end);
    return windowFull(column, start, end);
}
function windowTyped(c, start, end) {
    const array = ColumnHelpers.typedArrayWindow(c.__array, { start, end });
    const vk = c.valueKind;
    return arrayColumn({ array, schema: c.schema, valueKind: row => vk(start + row) });
}
function windowFull(c, start, end) {
    const v = c.value, vk = c.valueKind, ave = c.areValuesEqual;
    const value = start === 0 ? v : row => v(row + start);
    const rowCount = end - start;
    return {
        schema: c.schema,
        __array: void 0,
        isDefined: c.isDefined,
        rowCount,
        value,
        valueKind: start === 0 ? vk : row => vk(row + start),
        toArray: params => {
            const { array } = ColumnHelpers.createArray(rowCount, params);
            for (let i = 0, _i = array.length; i < _i; i++)
                array[i] = v(i + start);
            return array;
        },
        areValuesEqual: start === 0 ? ave : (rowA, rowB) => ave(rowA + start, rowB + start)
    };
}
function isIdentity(map, rowCount) {
    if (map.length !== rowCount)
        return false;
    for (let i = 0, _i = map.length; i < _i; i++) {
        if (map[i] !== i)
            return false;
    }
    return true;
}
function columnView(c, map, checkIdentity) {
    if (c.rowCount === 0)
        return c;
    if (checkIdentity && isIdentity(map, c.rowCount))
        return c;
    if (!!c.__array && typeof c.value(0) === typeof c.__array[0])
        return arrayView(c, map);
    return viewFull(c, map);
}
function arrayView(c, map) {
    const array = c.__array;
    const ret = new array.constructor(map.length);
    for (let i = 0, _i = map.length; i < _i; i++)
        ret[i] = array[map[i]];
    const vk = c.valueKind;
    return arrayColumn({ array: ret, schema: c.schema, valueKind: row => vk(map[row]) });
}
function viewFull(c, map) {
    const v = c.value, vk = c.valueKind, ave = c.areValuesEqual;
    const value = row => v(map[row]);
    const rowCount = map.length;
    return {
        schema: c.schema,
        __array: void 0,
        isDefined: c.isDefined,
        rowCount,
        value,
        valueKind: row => vk(map[row]),
        toArray: params => {
            const { array } = ColumnHelpers.createArray(rowCount, params);
            for (let i = 0, _i = array.length; i < _i; i++)
                array[i] = v(map[i]);
            return array;
        },
        areValuesEqual: (rowA, rowB) => ave(map[rowA], map[rowB])
    };
}
function mapToArrayImpl(c, f, ctor) {
    const ret = new ctor(c.rowCount);
    for (let i = 0, _i = c.rowCount; i < _i; i++)
        ret[i] = f(c.value(i));
    return ret;
}
function areColumnsEqual(a, b) {
    if (a === b)
        return true;
    if (a.rowCount !== b.rowCount || a.isDefined !== b.isDefined || a.schema.valueType !== b.schema.valueType)
        return false;
    if (!!a.__array && !!b.__array)
        return areArraysEqual(a, b);
    return areValuesEqual(a, b);
}
function areArraysEqual(a, b) {
    const xs = a.__array, ys = b.__array;
    for (let i = 0, _i = a.rowCount; i < _i; i++) {
        if (xs[i] !== ys[i])
            return false;
    }
    return true;
}
function areValuesEqual(a, b) {
    const va = a.value, vb = b.value;
    for (let i = 0, _i = a.rowCount; i < _i; i++) {
        if (va(i) !== vb(i))
            return false;
    }
    return true;
}
function columnIndicesOf(c, test) {
    const ret = [], v = c.value;
    for (let i = 0, _i = c.rowCount; i < _i; i++) {
        if (test(v(i)))
            ret[ret.length] = i;
    }
    return ret;
}
