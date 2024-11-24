/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { shallowEqualObjects } from './index';
import { Vec2 as Vec2Data, Vec3 as Vec3Data, Mat4 as Mat4Data, EPSILON } from '../mol-math/linear-algebra';
import { deepClone } from './object';
import { stringToWords } from './string';
import { getColorListFromName } from './color/lists';
import { Asset } from './assets';
export var ParamDefinition;
(function (ParamDefinition) {
    ParamDefinition.Essential = { isEssential: true };
    function setInfo(param, info) {
        if (!info)
            return param;
        if (info.label)
            param.label = info.label;
        if (info.description)
            param.description = info.description;
        if (info.legend)
            param.legend = info.legend;
        if (info.fieldLabels)
            param.fieldLabels = info.fieldLabels;
        if (info.isHidden)
            param.isHidden = info.isHidden;
        if (info.shortLabel)
            param.shortLabel = info.shortLabel;
        if (info.twoColumns)
            param.twoColumns = info.twoColumns;
        if (info.isEssential)
            param.isEssential = info.isEssential;
        if (info.category)
            param.category = info.category;
        if (info.hideIf)
            param.hideIf = info.hideIf;
        if (info.help)
            param.help = info.help;
        return param;
    }
    function Optional(p) {
        const ret = { ...p };
        ret.isOptional = true;
        return ret;
    }
    ParamDefinition.Optional = Optional;
    function Value(defaultValue, info) {
        return setInfo({ type: 'value', defaultValue }, info);
    }
    ParamDefinition.Value = Value;
    function Select(defaultValue, options, info) {
        return setInfo({ type: 'select', defaultValue: checkDefaultKey(defaultValue, options), options, cycle: info === null || info === void 0 ? void 0 : info.cycle }, info);
    }
    ParamDefinition.Select = Select;
    function MultiSelect(defaultValue, options, info) {
        // TODO: check if default value is a subset of options?
        const ret = setInfo({ type: 'multi-select', defaultValue, options }, info);
        if (info === null || info === void 0 ? void 0 : info.emptyValue)
            ret.emptyValue = info.emptyValue;
        return ret;
    }
    ParamDefinition.MultiSelect = MultiSelect;
    function Boolean(defaultValue, info) {
        return setInfo({ type: 'boolean', defaultValue }, info);
    }
    ParamDefinition.Boolean = Boolean;
    function Text(defaultValue = '', info) {
        return setInfo({ type: 'text', defaultValue: defaultValue, multiline: info === null || info === void 0 ? void 0 : info.multiline, placeholder: info === null || info === void 0 ? void 0 : info.placeholder, disableInteractiveUpdates: info === null || info === void 0 ? void 0 : info.disableInteractiveUpdates }, info);
    }
    ParamDefinition.Text = Text;
    function Color(defaultValue, info) {
        const ret = setInfo({ type: 'color', defaultValue }, info);
        if (info === null || info === void 0 ? void 0 : info.isExpanded)
            ret.isExpanded = info.isExpanded;
        return ret;
    }
    ParamDefinition.Color = Color;
    function ColorList(defaultValue, info) {
        let def;
        if (typeof defaultValue === 'string') {
            const colors = getColorListFromName(defaultValue);
            def = { kind: colors.type !== 'qualitative' ? 'interpolate' : 'set', colors: colors.list };
        }
        else {
            def = defaultValue;
        }
        return setInfo({ type: 'color-list', presetKind: (info === null || info === void 0 ? void 0 : info.presetKind) || 'all', defaultValue: def, offsets: !!(info === null || info === void 0 ? void 0 : info.offsets) }, info);
    }
    ParamDefinition.ColorList = ColorList;
    function Vec3(defaultValue, range, info) {
        return setInfo(setRange({ type: 'vec3', defaultValue }, range), info);
    }
    ParamDefinition.Vec3 = Vec3;
    function Mat4(defaultValue, info) {
        return setInfo({ type: 'mat4', defaultValue }, info);
    }
    ParamDefinition.Mat4 = Mat4;
    function Url(url, info) {
        const defaultValue = typeof url === 'string' ? Asset.Url(url) : Asset.Url(url.url, { body: url.body });
        const ret = setInfo({ type: 'url', defaultValue }, info);
        return ret;
    }
    ParamDefinition.Url = Url;
    function File(info) {
        const ret = setInfo({ type: 'file', defaultValue: null }, info);
        if (info === null || info === void 0 ? void 0 : info.accept)
            ret.accept = info.accept;
        return ret;
    }
    ParamDefinition.File = File;
    function FileList(info) {
        const ret = setInfo({ type: 'file-list', defaultValue: null }, info);
        if (info === null || info === void 0 ? void 0 : info.accept)
            ret.accept = info.accept;
        return ret;
    }
    ParamDefinition.FileList = FileList;
    function setRange(p, range) {
        if (!range)
            return p;
        if (typeof range.min !== 'undefined')
            p.min = range.min;
        if (typeof range.max !== 'undefined')
            p.max = range.max;
        if (typeof range.step !== 'undefined')
            p.step = range.step;
        return p;
    }
    function Numeric(defaultValue, range, info) {
        const ret = setInfo(setRange({ type: 'number', defaultValue }, range), info);
        if (info === null || info === void 0 ? void 0 : info.immediateUpdate)
            ret.immediateUpdate = true;
        return ret;
    }
    ParamDefinition.Numeric = Numeric;
    function Interval(defaultValue, range, info) {
        return setInfo(setRange({ type: 'interval', defaultValue }, range), info);
    }
    ParamDefinition.Interval = Interval;
    function LineGraph(defaultValue, info) {
        const ret = setInfo({ type: 'line-graph', defaultValue }, info);
        if (info === null || info === void 0 ? void 0 : info.getVolume)
            ret.getVolume = info.getVolume;
        return ret;
    }
    ParamDefinition.LineGraph = LineGraph;
    function Group(params, info) {
        const ret = setInfo({ type: 'group', defaultValue: (info === null || info === void 0 ? void 0 : info.customDefault) || getDefaultValues(params), params: params }, info);
        if (info === null || info === void 0 ? void 0 : info.presets)
            ret.presets = info.presets;
        if (info === null || info === void 0 ? void 0 : info.isExpanded)
            ret.isExpanded = info.isExpanded;
        if (info === null || info === void 0 ? void 0 : info.isFlat)
            ret.isFlat = info.isFlat;
        if (info === null || info === void 0 ? void 0 : info.pivot)
            ret.pivot = info.pivot;
        return ret;
    }
    ParamDefinition.Group = Group;
    function EmptyGroup(info) {
        return Group({}, info);
    }
    ParamDefinition.EmptyGroup = EmptyGroup;
    function Mapped(defaultKey, names, map, info) {
        const name = checkDefaultKey(defaultKey, names);
        return setInfo({
            type: 'mapped',
            defaultValue: { name, params: map(name).defaultValue },
            select: Select(name, names, info),
            map
        }, info);
    }
    ParamDefinition.Mapped = Mapped;
    function MappedStatic(defaultKey, map, info) {
        const options = (info === null || info === void 0 ? void 0 : info.options)
            ? info.options
            : Object.keys(map).map(k => [k, map[k].label || stringToWords(k)]);
        const name = checkDefaultKey(defaultKey, options);
        return setInfo({
            type: 'mapped',
            defaultValue: { name, params: map[name].defaultValue },
            select: Select(name, options, info),
            map: key => map[key]
        }, info);
    }
    ParamDefinition.MappedStatic = MappedStatic;
    function ObjectList(element, getLabel, info) {
        return setInfo({ type: 'object-list', element: element, getLabel, ctor: _defaultObjectListCtor, defaultValue: (info === null || info === void 0 ? void 0 : info.defaultValue) || [] }, info);
    }
    ParamDefinition.ObjectList = ObjectList;
    function _defaultObjectListCtor() { return getDefaultValues(this.element); }
    function unsetGetValue() {
        throw new Error('getValue not set. Fix runtime.');
    }
    function ValueRef(getOptions, resolveRef, info) {
        var _a;
        return setInfo({ type: 'value-ref', defaultValue: { ref: (_a = info === null || info === void 0 ? void 0 : info.defaultRef) !== null && _a !== void 0 ? _a : '', getValue: unsetGetValue }, getOptions, resolveRef }, info);
    }
    ParamDefinition.ValueRef = ValueRef;
    function DataRef(info) {
        var _a;
        return setInfo({ type: 'data-ref', defaultValue: { ref: (_a = info === null || info === void 0 ? void 0 : info.defaultRef) !== null && _a !== void 0 ? _a : '', getValue: unsetGetValue } }, info);
    }
    ParamDefinition.DataRef = DataRef;
    function Converted(fromValue, toValue, converted) {
        return setInfo({ type: 'converted', defaultValue: toValue(converted.defaultValue), converted, fromValue, toValue }, converted);
    }
    ParamDefinition.Converted = Converted;
    function Conditioned(defaultValue, conditionParams, conditionForValue, conditionedValue, info) {
        const options = Object.keys(conditionParams).map(k => [k, k]);
        return setInfo({ type: 'conditioned', select: Select(conditionForValue(defaultValue), options, info), defaultValue, conditionParams, conditionForValue, conditionedValue }, info);
    }
    ParamDefinition.Conditioned = Conditioned;
    function Script(defaultValue, info) {
        return setInfo({ type: 'script', defaultValue }, info);
    }
    ParamDefinition.Script = Script;
    function For(params) {
        return 0;
    }
    ParamDefinition.For = For;
    function getDefaultValues(params) {
        const d = {};
        for (const k of Object.keys(params)) {
            if (params[k].isOptional)
                continue;
            d[k] = params[k].defaultValue;
        }
        return d;
    }
    ParamDefinition.getDefaultValues = getDefaultValues;
    function _resolveRef(resolve, ref, getData) {
        return () => resolve(ref, getData);
    }
    function resolveRefValue(p, value, getData) {
        if (!value)
            return;
        if (p.type === 'value-ref') {
            const v = value;
            if (!v.ref)
                v.getValue = () => { throw new Error('Unset ref in ValueRef value.'); };
            else
                v.getValue = _resolveRef(p.resolveRef, v.ref, getData);
        }
        else if (p.type === 'data-ref') {
            const v = value;
            if (!v.ref)
                v.getValue = () => { throw new Error('Unset ref in ValueRef value.'); };
            else
                v.getValue = _resolveRef(getData, v.ref, getData);
        }
        else if (p.type === 'group') {
            resolveRefs(p.params, value, getData);
        }
        else if (p.type === 'mapped') {
            const v = value;
            const param = p.map(v.name);
            resolveRefValue(param, v.params, getData);
        }
        else if (p.type === 'object-list') {
            if (!hasValueRef(p.element))
                return;
            for (const e of value) {
                resolveRefs(p.element, e, getData);
            }
        }
    }
    function hasParamValueRef(p) {
        if (p.type === 'value-ref' || p.type === 'data-ref') {
            return true;
        }
        else if (p.type === 'group') {
            if (hasValueRef(p.params))
                return true;
        }
        else if (p.type === 'mapped') {
            for (const [o] of p.select.options) {
                if (hasParamValueRef(p.map(o)))
                    return true;
            }
        }
        else if (p.type === 'object-list') {
            return hasValueRef(p.element);
        }
        return false;
    }
    function hasValueRef(params) {
        for (const n of Object.keys(params)) {
            if (hasParamValueRef(params[n]))
                return true;
        }
        return false;
    }
    function resolveRefs(params, values, getData) {
        for (const n of Object.keys(params)) {
            resolveRefValue(params[n], values === null || values === void 0 ? void 0 : values[n], getData);
        }
    }
    ParamDefinition.resolveRefs = resolveRefs;
    function setDefaultValues(params, defaultValues) {
        for (const k of Object.keys(params)) {
            if (params[k].isOptional)
                continue;
            params[k].defaultValue = defaultValues[k];
        }
    }
    ParamDefinition.setDefaultValues = setDefaultValues;
    function clone(params) {
        return deepClone(params);
    }
    ParamDefinition.clone = clone;
    function validate(params, values) {
        // TODO
        return void 0;
    }
    ParamDefinition.validate = validate;
    function areEqual(params, a, b) {
        if (a === b)
            return true;
        if (typeof a !== 'object' || typeof b !== 'object')
            return false;
        for (const k of Object.keys(params)) {
            if (!isParamEqual(params[k], a[k], b[k]))
                return false;
        }
        return true;
    }
    ParamDefinition.areEqual = areEqual;
    function isParamEqual(p, a, b) {
        if (a === b)
            return true;
        if (p.type === 'group') {
            return areEqual(p.params, a, b);
        }
        else if (p.type === 'mapped') {
            const u = a, v = b;
            if (u.name !== v.name)
                return false;
            const map = p.map(u.name);
            return isParamEqual(map, u.params, v.params);
        }
        else if (p.type === 'multi-select') {
            const u = a, v = b;
            if (u.length !== v.length)
                return false;
            if (u.length < 10) {
                for (let i = 0, _i = u.length; i < _i; i++) {
                    if (u[i] === v[i])
                        continue;
                    if (v.indexOf(u[i]) < 0)
                        return false;
                }
            }
            else {
                // TODO: should the value of multiselect be a set?
                const vSet = new Set(v);
                for (let i = 0, _i = u.length; i < _i; i++) {
                    if (u[i] === v[i])
                        continue;
                    if (!vSet.has(u[i]))
                        return false;
                }
            }
            return true;
        }
        else if (p.type === 'interval') {
            return a[0] === b[0] && a[1] === b[1];
        }
        else if (p.type === 'line-graph') {
            const u = a, v = b;
            if (u.length !== v.length)
                return false;
            for (let i = 0, _i = u.length; i < _i; i++) {
                if (!Vec2Data.areEqual(u[i], v[i]))
                    return false;
            }
            return true;
        }
        else if (p.type === 'vec3') {
            return Vec3Data.equals(a, b);
        }
        else if (p.type === 'mat4') {
            return Mat4Data.areEqual(a, b, EPSILON);
        }
        else if (p.type === 'script') {
            const u = a, v = b;
            return u.language === v.language && u.expression === v.expression;
        }
        else if (p.type === 'object-list') {
            const u = a, v = b;
            const l = u.length;
            if (l !== v.length)
                return false;
            for (let i = 0; i < l; i++) {
                if (!areEqual(p.element, u[i], v[i]))
                    return false;
            }
            return true;
        }
        else if (typeof a === 'object' && typeof b === 'object') {
            return shallowEqualObjects(a, b);
        }
        // a === b was checked at the top.
        return false;
    }
    ParamDefinition.isParamEqual = isParamEqual;
    function merge(params, a, b) {
        if (a === undefined)
            return { ...b };
        if (b === undefined)
            return { ...a };
        const o = Object.create(null);
        for (const k of Object.keys(params)) {
            o[k] = mergeParam(params[k], a[k], b[k]);
        }
        return o;
    }
    ParamDefinition.merge = merge;
    function mergeParam(p, a, b) {
        if (a === undefined)
            return typeof b === 'object' && !Array.isArray(b) ? { ...b } : b;
        if (b === undefined)
            return typeof a === 'object' && !Array.isArray(a) ? { ...a } : a;
        if (p.type === 'group') {
            return merge(p.params, a, b);
        }
        else if (p.type === 'mapped') {
            const u = a, v = b;
            if (u.name !== v.name)
                return { ...v };
            const map = p.map(v.name);
            return {
                name: v.name,
                params: mergeParam(map, u.params, v.params)
            };
        }
        else if (p.type === 'value') {
            return b;
        }
        else if (typeof a === 'object' && typeof b === 'object') {
            if (Array.isArray(b)) {
                return b;
            }
            return { ...a, ...b };
        }
        else {
            return b;
        }
    }
    ParamDefinition.mergeParam = mergeParam;
    function selectHasOption(p, v) {
        for (const o of p.options) {
            if (o[0] === v)
                return true;
        }
        return false;
    }
    function normalizeParam(p, value, defaultIfUndefined) {
        if (value === void 0 || value === null) {
            return defaultIfUndefined ? p.defaultValue : void 0;
        }
        // TODO: is this a good idea and will work well?
        // if (typeof p.defaultValue !== typeof value) {
        //     return p.defaultValue;
        // }
        if (p.type === 'value') {
            return value;
        }
        else if (p.type === 'group') {
            const ret = Object.create(null);
            for (const key of Object.keys(p.params)) {
                const param = p.params[key];
                if (value[key] === void 0) {
                    if (defaultIfUndefined)
                        ret[key] = param.defaultValue;
                }
                else {
                    ret[key] = normalizeParam(param, value[key], defaultIfUndefined);
                }
            }
            return ret;
        }
        else if (p.type === 'mapped') {
            const v = value;
            if (typeof v.name !== 'string') {
                return p.defaultValue;
            }
            if (typeof v.params === 'undefined') {
                return defaultIfUndefined ? p.defaultValue : void 0;
            }
            if (!selectHasOption(p.select, v.name)) {
                return p.defaultValue;
            }
            const param = p.map(v.name);
            return {
                name: v.name,
                params: normalizeParam(param, v.params, defaultIfUndefined)
            };
        }
        else if (p.type === 'select') {
            if (!selectHasOption(p, value))
                return p.defaultValue;
            return value;
        }
        else if (p.type === 'multi-select') {
            if (!Array.isArray(value))
                return p.defaultValue;
            const ret = value.filter(function (v) { return selectHasOption(this, v); }, p);
            if (value.length > 0 && ret.length === 0)
                return p.defaultValue;
            return ret;
        }
        else if (p.type === 'object-list') {
            if (!Array.isArray(value))
                return p.defaultValue;
            return value.map(v => normalizeParams(p.element, v, defaultIfUndefined ? 'all' : 'skip'));
        }
        // TODO: validate/normalize all param types "properly"??
        return value;
    }
    function normalizeParams(p, value, defaultIfUndefined) {
        if (typeof value !== 'object' || value === null) {
            return defaultIfUndefined ? getDefaultValues(p) : value;
        }
        const ret = Object.create(null);
        for (const key of Object.keys(p)) {
            const param = p[key];
            if (value[key] === void 0) {
                if (defaultIfUndefined === 'all')
                    ret[key] = param.defaultValue;
            }
            else {
                ret[key] = normalizeParam(param, value[key], defaultIfUndefined !== 'skip');
            }
        }
        return ret;
    }
    ParamDefinition.normalizeParams = normalizeParams;
    /**
     * Map an object to a list of [K, string][] to be used as options, stringToWords for key used by default (or identity of null).
     *
     * if options is { [string]: string } and mapping is not provided, use the Value.
     */
    function objectToOptions(options, f) {
        const ret = [];
        for (const k of Object.keys(options)) {
            if (!f) {
                if (typeof options[k] === 'string')
                    ret.push([k, options[k]]);
                else
                    ret.push([k, f === null ? k : stringToWords(k)]);
            }
            else {
                const o = f(k, options[k]);
                ret.push(typeof o === 'string' ? [k, o] : [k, o[0], o[1]]);
            }
        }
        return ret;
    }
    ParamDefinition.objectToOptions = objectToOptions;
    /**
     * Map array of options using stringToWords by default (or identity of null).
     */
    function arrayToOptions(xs, f) {
        const ret = [];
        for (const x of xs) {
            if (!f) {
                ret.push([x, f === null ? x : stringToWords(x)]);
            }
            else {
                ret.push([x, f(x)]);
            }
        }
        return ret;
    }
    ParamDefinition.arrayToOptions = arrayToOptions;
    function optionLabel(param, value) {
        for (const o of param.options) {
            if (o[0] === value)
                return o[1];
        }
        return '';
    }
    ParamDefinition.optionLabel = optionLabel;
    function checkDefaultKey(k, options) {
        for (const o of options) {
            if (o[0] === k)
                return k;
        }
        return options.length > 0 ? options[0][0] : void 0;
    }
    function withDefaults(schema, updates) {
        const next = {};
        for (const k of Object.keys(updates)) {
            const v = updates[k];
            if (!schema[k] || v === null || v === undefined || schema[k].defaultValue === v)
                continue;
            next[k] = { ...schema[k], defaultValue: v };
        }
        return { ...schema, ...next };
    }
    ParamDefinition.withDefaults = withDefaults;
})(ParamDefinition || (ParamDefinition = {}));
