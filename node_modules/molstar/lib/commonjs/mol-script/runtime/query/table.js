"use strict";
/**
 * Copyright (c) 2018-2022 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const symbol_table_1 = require("../../language/symbol-table");
const base_1 = require("./base");
const structure_1 = require("../../../mol-model/structure");
const types_1 = require("../../../mol-model/structure/model/types");
const set_1 = require("../../../mol-util/set");
const string_1 = require("../../../mol-util/string");
const atomic_1 = require("../../../mol-model/structure/model/properties/atomic");
const util_1 = require("../../../mol-data/util");
const internal_1 = require("../../../mol-model/structure/query/queries/internal");
const array_1 = require("../../../mol-util/array");
const C = base_1.QuerySymbolRuntime.Const;
const D = base_1.QuerySymbolRuntime.Dynamic;
const symbols = [
    // ============= TYPES =============
    C(symbol_table_1.MolScriptSymbolTable.core.type.bool, function core_type_bool(ctx, v) { return !!v[0](ctx); }),
    C(symbol_table_1.MolScriptSymbolTable.core.type.num, function core_type_num(ctx, v) { return +v[0](ctx); }),
    C(symbol_table_1.MolScriptSymbolTable.core.type.str, function core_type_str(ctx, v) { return '' + v[0](ctx); }),
    C(symbol_table_1.MolScriptSymbolTable.core.type.list, function core_type_list(ctx, xs) { return base_1.QueryRuntimeArguments.forEachEval(xs, ctx, (v, i, list) => list[i] = v, []); }),
    C(symbol_table_1.MolScriptSymbolTable.core.type.set, function core_type_set(ctx, xs) { return base_1.QueryRuntimeArguments.forEachEval(xs, ctx, function core_type_set_argEval(v, i, set) { return set.add(v); }, new Set()); }),
    C(symbol_table_1.MolScriptSymbolTable.core.type.regex, function core_type_regex(ctx, v) { return new RegExp(v[0](ctx), (v[1] && v[1](ctx)) || ''); }),
    C(symbol_table_1.MolScriptSymbolTable.core.type.bitflags, function core_type_bitflags(ctx, v) { return +v[0](ctx); }),
    C(symbol_table_1.MolScriptSymbolTable.core.type.compositeKey, function core_type_compositeKey(ctx, xs) { return base_1.QueryRuntimeArguments.forEachEval(xs, ctx, (v, i, list) => list[i] = '' + v, []).join('-'); }),
    // ============= LOGIC ================
    C(symbol_table_1.MolScriptSymbolTable.core.logic.not, (ctx, v) => !v[0](ctx)),
    C(symbol_table_1.MolScriptSymbolTable.core.logic.and, (ctx, xs) => {
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++)
                if (!xs[i](ctx))
                    return false;
        }
        else {
            for (const k of Object.keys(xs))
                if (!xs[k](ctx))
                    return false;
        }
        return true;
    }),
    C(symbol_table_1.MolScriptSymbolTable.core.logic.or, (ctx, xs) => {
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++)
                if (xs[i](ctx))
                    return true;
        }
        else {
            for (const k of Object.keys(xs))
                if (xs[k](ctx))
                    return true;
        }
        return false;
    }),
    // ============= RELATIONAL ================
    C(symbol_table_1.MolScriptSymbolTable.core.rel.eq, (ctx, v) => v[0](ctx) === v[1](ctx)),
    C(symbol_table_1.MolScriptSymbolTable.core.rel.neq, (ctx, v) => v[0](ctx) !== v[1](ctx)),
    C(symbol_table_1.MolScriptSymbolTable.core.rel.lt, (ctx, v) => v[0](ctx) < v[1](ctx)),
    C(symbol_table_1.MolScriptSymbolTable.core.rel.lte, (ctx, v) => v[0](ctx) <= v[1](ctx)),
    C(symbol_table_1.MolScriptSymbolTable.core.rel.gr, (ctx, v) => v[0](ctx) > v[1](ctx)),
    C(symbol_table_1.MolScriptSymbolTable.core.rel.gre, (ctx, v) => v[0](ctx) >= v[1](ctx)),
    C(symbol_table_1.MolScriptSymbolTable.core.rel.inRange, (ctx, v) => {
        const x = v[0](ctx);
        return x >= v[1](ctx) && x <= v[2](ctx);
    }),
    // ============= ARITHMETIC ================
    C(symbol_table_1.MolScriptSymbolTable.core.math.add, (ctx, xs) => {
        let ret = 0;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++)
                ret += xs[i](ctx);
        }
        else {
            for (const k of Object.keys(xs))
                ret += xs[k](ctx);
        }
        return ret;
    }),
    C(symbol_table_1.MolScriptSymbolTable.core.math.sub, (ctx, xs) => {
        let ret = 0;
        if (typeof xs.length === 'number') {
            if (xs.length === 1)
                return -xs[0](ctx);
            ret = xs[0](ctx) || 0;
            for (let i = 1, _i = xs.length; i < _i; i++)
                ret -= xs[i](ctx);
        }
        else {
            const keys = Object.keys(xs);
            if (keys.length === 1)
                return -xs[keys[0]](ctx);
            ret = xs[keys[0]](ctx) || 0;
            for (let i = 1, _i = keys.length; i < _i; i++)
                ret -= xs[keys[i]](ctx);
        }
        return ret;
    }),
    C(symbol_table_1.MolScriptSymbolTable.core.math.mult, (ctx, xs) => {
        let ret = 1;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++)
                ret *= xs[i](ctx);
        }
        else {
            for (const k of Object.keys(xs))
                ret *= xs[k](ctx);
        }
        return ret;
    }),
    C(symbol_table_1.MolScriptSymbolTable.core.math.div, (ctx, v) => v[0](ctx) / v[1](ctx)),
    C(symbol_table_1.MolScriptSymbolTable.core.math.pow, (ctx, v) => Math.pow(v[0](ctx), v[1](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.mod, (ctx, v) => v[0](ctx) % v[1](ctx)),
    C(symbol_table_1.MolScriptSymbolTable.core.math.min, (ctx, xs) => {
        let ret = Number.POSITIVE_INFINITY;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++)
                ret = Math.min(xs[i](ctx), ret);
        }
        else {
            for (const k of Object.keys(xs))
                ret = Math.min(xs[k](ctx), ret);
        }
        return ret;
    }),
    C(symbol_table_1.MolScriptSymbolTable.core.math.max, (ctx, xs) => {
        let ret = Number.NEGATIVE_INFINITY;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++)
                ret = Math.max(xs[i](ctx), ret);
        }
        else {
            for (const k of Object.keys(xs))
                ret = Math.max(xs[k](ctx), ret);
        }
        return ret;
    }),
    C(symbol_table_1.MolScriptSymbolTable.core.math.cantorPairing, (ctx, v) => (0, util_1.cantorPairing)(v[0](ctx), v[1](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.sortedCantorPairing, (ctx, v) => (0, util_1.sortedCantorPairing)(v[0](ctx), v[1](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.invertCantorPairing, (ctx, v) => (0, util_1.invertCantorPairing)([0, 0], v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.floor, (ctx, v) => Math.floor(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.ceil, (ctx, v) => Math.ceil(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.roundInt, (ctx, v) => Math.round(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.trunc, (ctx, v) => Math.trunc(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.abs, (ctx, v) => Math.abs(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.sign, (ctx, v) => Math.sign(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.sqrt, (ctx, v) => Math.sqrt(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.cbrt, (ctx, v) => Math.cbrt(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.sin, (ctx, v) => Math.sin(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.cos, (ctx, v) => Math.cos(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.tan, (ctx, v) => Math.tan(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.asin, (ctx, v) => Math.asin(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.acos, (ctx, v) => Math.acos(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.atan, (ctx, v) => Math.atan(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.sinh, (ctx, v) => Math.sinh(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.cosh, (ctx, v) => Math.cosh(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.tanh, (ctx, v) => Math.tanh(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.exp, (ctx, v) => Math.exp(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.log, (ctx, v) => Math.log(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.log10, (ctx, v) => Math.log10(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.math.atan2, (ctx, v) => Math.atan2(v[0](ctx), v[1](ctx))),
    // ============= STRING ================
    C(symbol_table_1.MolScriptSymbolTable.core.str.match, (ctx, v) => v[0](ctx).test(v[1](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.core.str.concat, (ctx, xs) => {
        const ret = [];
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++)
                ret.push(xs[i](ctx).toString());
        }
        else {
            for (const k of Object.keys(xs))
                ret.push(xs[k](ctx).toString());
        }
        return ret.join('');
    }),
    // ============= LIST ================
    C(symbol_table_1.MolScriptSymbolTable.core.list.getAt, (ctx, v) => v[0](ctx)[v[1](ctx)]),
    C(symbol_table_1.MolScriptSymbolTable.core.list.equal, (ctx, v) => (0, array_1.arrayEqual)(v[0](ctx), v[1](ctx))),
    // ============= SET ================
    C(symbol_table_1.MolScriptSymbolTable.core.set.has, function core_set_has(ctx, v) { return v[0](ctx).has(v[1](ctx)); }),
    C(symbol_table_1.MolScriptSymbolTable.core.set.isSubset, function core_set_isSubset(ctx, v) { return set_1.SetUtils.isSuperset(v[1](ctx), v[0](ctx)); }),
    // ============= FLAGS ================
    C(symbol_table_1.MolScriptSymbolTable.core.flags.hasAny, (ctx, v) => {
        const test = v[1](ctx);
        const tested = v[0](ctx);
        if (!test)
            return !!tested;
        return (tested & test) !== 0;
    }),
    C(symbol_table_1.MolScriptSymbolTable.core.flags.hasAll, (ctx, v) => {
        const test = v[1](ctx);
        const tested = v[0](ctx);
        if (!test)
            return !tested;
        return (tested & test) === test;
    }),
    // Structure
    // ============= TYPES ================
    C(symbol_table_1.MolScriptSymbolTable.structureQuery.type.elementSymbol, (ctx, v) => (0, types_1.ElementSymbol)(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.structureQuery.type.atomName, (ctx, v) => (0, string_1.upperCaseAny)(v[0](ctx))),
    C(symbol_table_1.MolScriptSymbolTable.structureQuery.type.bondFlags, (ctx, xs) => {
        let ret = 0 /* BondType.Flag.None */;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++)
                ret = bondFlag(ret, xs[i](ctx));
        }
        else {
            for (const k of Object.keys(xs))
                ret = bondFlag(ret, xs[k](ctx));
        }
        return ret;
    }),
    C(symbol_table_1.MolScriptSymbolTable.structureQuery.type.ringFingerprint, (ctx, xs) => structure_1.UnitRing.elementFingerprint(getArray(ctx, xs))),
    C(symbol_table_1.MolScriptSymbolTable.structureQuery.type.secondaryStructureFlags, (ctx, xs) => {
        let ret = 0 /* SecondaryStructureType.Flag.None */;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++)
                ret = secondaryStructureFlag(ret, xs[i](ctx));
        }
        else {
            for (const k of Object.keys(xs))
                ret = secondaryStructureFlag(ret, xs[k](ctx));
        }
        return ret;
    }),
    // TODO:
    // C(MolScript.structureQuery.type.entityType, (ctx, v) => StructureRuntime.Common.entityType(v[0](ctx))),
    // C(MolScript.structureQuery.type.authResidueId, (ctx, v) => ResidueIdentifier.auth(v[0](ctx), v[1](ctx), v[2] && v[2](ctx))),
    // C(MolScript.structureQuery.type.labelResidueId, (ctx, v) => ResidueIdentifier.label(v[0](ctx), v[1](ctx), v[2](ctx), v[3] && v[3](ctx))),
    // ============= SLOTS ================
    // TODO: slots might not be needed after all: reducer simply pushes/pops current element
    // C(MolScript.structureQuery.slot.element, (ctx, _) => ctx_.element),
    // C(MolScript.structureQuery.slot.elementSetReduce, (ctx, _) => ctx_.element),
    // ============= FILTERS ================
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.filter.pick, (ctx, xs) => structure_1.Queries.filters.pick(xs[0], xs['test'])(ctx)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.filter.first, (ctx, xs) => structure_1.Queries.filters.first(xs[0])(ctx)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.filter.withSameAtomProperties, (ctx, xs) => structure_1.Queries.filters.withSameAtomProperties(xs[0], xs['source'], xs['property'])(ctx)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.filter.intersectedBy, (ctx, xs) => structure_1.Queries.filters.areIntersectedBy(xs[0], xs['by'])(ctx)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.filter.within, (ctx, xs) => {
        var _a, _b, _c;
        return structure_1.Queries.filters.within({
            query: xs[0],
            target: xs['target'],
            minRadius: (_a = xs['min-radius']) === null || _a === void 0 ? void 0 : _a.call(xs, ctx),
            maxRadius: (_b = xs['max-radius']) === null || _b === void 0 ? void 0 : _b.call(xs, ctx),
            elementRadius: xs['atom-radius'],
            invert: (_c = xs['invert']) === null || _c === void 0 ? void 0 : _c.call(xs, ctx)
        })(ctx);
    }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.filter.isConnectedTo, (ctx, xs) => {
        var _a, _b;
        return structure_1.Queries.filters.isConnectedTo({
            query: xs[0],
            target: xs['target'],
            disjunct: (_a = xs['disjunct']) === null || _a === void 0 ? void 0 : _a.call(xs, ctx),
            invert: (_b = xs['invert']) === null || _b === void 0 ? void 0 : _b.call(xs, ctx),
            bondTest: xs['bond-test']
        })(ctx);
    }),
    // ============= GENERATORS ================
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.generator.atomGroups, function structureQuery_generator_atomGroups(ctx, xs) {
        return structure_1.Queries.generators.atoms({
            entityTest: xs['entity-test'],
            chainTest: xs['chain-test'],
            residueTest: xs['residue-test'],
            atomTest: xs['atom-test'],
            groupBy: xs['group-by']
        })(ctx);
    }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.generator.all, function structureQuery_generator_all(ctx) { return structure_1.Queries.generators.all(ctx); }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.generator.empty, function structureQuery_generator_empty(ctx) { return structure_1.Queries.generators.none(ctx); }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.generator.bondedAtomicPairs, function structureQuery_generator_bondedAtomicPairs(ctx, xs) {
        return structure_1.Queries.generators.bondedAtomicPairs(xs && xs[0])(ctx);
    }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.generator.rings, function structureQuery_generator_rings(ctx, xs) {
        var _a, _b;
        return structure_1.Queries.generators.rings((_a = xs === null || xs === void 0 ? void 0 : xs['fingerprint']) === null || _a === void 0 ? void 0 : _a.call(xs, ctx), (_b = xs === null || xs === void 0 ? void 0 : xs['only-aromatic']) === null || _b === void 0 ? void 0 : _b.call(xs, ctx))(ctx);
    }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.generator.queryInSelection, function structureQuery_generator_queryInSelection(ctx, xs) {
        var _a;
        return structure_1.Queries.generators.querySelection(xs[0], xs['query'], (_a = xs['in-complement']) === null || _a === void 0 ? void 0 : _a.call(xs, ctx))(ctx);
    }),
    // ============= MODIFIERS ================
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.modifier.includeSurroundings, function structureQuery_modifier_includeSurroundings(ctx, xs) {
        return structure_1.Queries.modifiers.includeSurroundings(xs[0], {
            radius: xs['radius'](ctx),
            wholeResidues: !!(xs['as-whole-residues'] && xs['as-whole-residues'](ctx)),
            elementRadius: xs['atom-radius']
        })(ctx);
    }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.modifier.surroundingLigands, function structureQuery_modifier_includeSurroundingLigands(ctx, xs) {
        return structure_1.Queries.modifiers.surroundingLigands({
            query: xs[0],
            radius: xs['radius'](ctx),
            includeWater: !!(xs['include-water'] && xs['include-water'](ctx)),
        })(ctx);
    }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.modifier.wholeResidues, function structureQuery_modifier_wholeResidues(ctx, xs) { return structure_1.Queries.modifiers.wholeResidues(xs[0])(ctx); }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.modifier.union, function structureQuery_modifier_union(ctx, xs) { return structure_1.Queries.modifiers.union(xs[0])(ctx); }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.modifier.expandProperty, function structureQuery_modifier_expandProperty(ctx, xs) { return structure_1.Queries.modifiers.expandProperty(xs[0], xs['property'])(ctx); }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.modifier.exceptBy, function structureQuery_modifier_exceptBy(ctx, xs) { return structure_1.Queries.modifiers.exceptBy(xs[0], xs['by'])(ctx); }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.modifier.includeConnected, function structureQuery_modifier_includeConnected(ctx, xs) {
        var _a, _b;
        return structure_1.Queries.modifiers.includeConnected({
            query: xs[0],
            bondTest: xs['bond-test'],
            wholeResidues: !!(xs['as-whole-residues'] && xs['as-whole-residues'](ctx)),
            layerCount: (xs['layer-count'] && xs['layer-count'](ctx)) || 1,
            fixedPoint: (_b = (_a = xs['fixed-point']) === null || _a === void 0 ? void 0 : _a.call(xs, ctx)) !== null && _b !== void 0 ? _b : false
        })(ctx);
    }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.modifier.intersectBy, function structureQuery_modifier_intersectBy(ctx, xs) { return structure_1.Queries.modifiers.intersectBy(xs[0], xs['by'])(ctx); }),
    // ============= COMBINATORS ================
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.combinator.merge, (ctx, xs) => structure_1.Queries.combinators.merge(xs)(ctx)),
    // ============= ATOM PROPERTIES ================
    // ~~~ CORE ~~~
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.elementSymbol, atomProp(structure_1.StructureProperties.atom.type_symbol)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.vdw, (ctx, xs) => (0, atomic_1.VdwRadius)(structure_1.StructureProperties.atom.type_symbol((xs && xs[0] && xs[0](ctx)) || ctx.element))),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.mass, (ctx, xs) => (0, atomic_1.AtomWeight)(structure_1.StructureProperties.atom.type_symbol((xs && xs[0] && xs[0](ctx)) || ctx.element))),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.atomicNumber, (ctx, xs) => (0, atomic_1.AtomNumber)(structure_1.StructureProperties.atom.type_symbol((xs && xs[0] && xs[0](ctx)) || ctx.element))),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.x, atomProp(structure_1.StructureProperties.atom.x)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.y, atomProp(structure_1.StructureProperties.atom.y)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.z, atomProp(structure_1.StructureProperties.atom.z)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.sourceIndex, atomProp(structure_1.StructureProperties.atom.sourceIndex)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.operatorName, atomProp(structure_1.StructureProperties.unit.operator_name)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.operatorKey, atomProp(structure_1.StructureProperties.unit.operator_key)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.modelIndex, atomProp(structure_1.StructureProperties.unit.model_index)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.modelLabel, atomProp(structure_1.StructureProperties.unit.model_label)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.core.atomKey, (ctx, xs) => {
        const e = (xs && xs[0] && xs[0](ctx)) || ctx.element;
        return (0, util_1.cantorPairing)(e.unit.id, e.element);
    }),
    // TODO:
    // D(MolScript.structureQuery.atomProperty.core.bondCount, (ctx, _) => ),
    // ~~~ TOPOLOGY ~~~
    // TODO
    // ~~~ MACROMOLECULAR ~~~
    // TODO:
    // // identifiers
    // labelResidueId: prop((env, v) => ResidueIdentifier.labelOfResidueIndex(env.context.model, getAddress(env, v).residue)),
    // authResidueId: prop((env, v) => ResidueIdentifier.authOfResidueIndex(env.context.model, getAddress(env, v).residue)),
    // keys
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.residueKey, (ctx, xs) => structure_1.StructureElement.residueIndex((xs && xs[0] && xs[0](ctx)) || ctx.element)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.chainKey, (ctx, xs) => structure_1.StructureElement.chainIndex((xs && xs[0] && xs[0](ctx)) || ctx.element)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.entityKey, (ctx, xs) => structure_1.StructureElement.entityIndex((xs && xs[0] && xs[0](ctx)) || ctx.element)),
    // mmCIF
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.id, atomProp(structure_1.StructureProperties.atom.id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.isHet, (ctx, xs) => structure_1.StructureProperties.residue.group_PDB((xs && xs[0] && xs[0](ctx)) || ctx.element) !== 'ATOM'),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.label_atom_id, atomProp(structure_1.StructureProperties.atom.label_atom_id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.label_alt_id, atomProp(structure_1.StructureProperties.atom.label_alt_id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.label_comp_id, atomProp(structure_1.StructureProperties.atom.label_comp_id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.label_seq_id, atomProp(structure_1.StructureProperties.residue.label_seq_id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.label_asym_id, atomProp(structure_1.StructureProperties.chain.label_asym_id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.label_entity_id, atomProp(structure_1.StructureProperties.entity.id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.auth_atom_id, atomProp(structure_1.StructureProperties.atom.auth_atom_id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.auth_comp_id, atomProp(structure_1.StructureProperties.atom.auth_comp_id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.auth_seq_id, atomProp(structure_1.StructureProperties.residue.auth_seq_id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.auth_asym_id, atomProp(structure_1.StructureProperties.chain.auth_asym_id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.pdbx_PDB_ins_code, atomProp(structure_1.StructureProperties.residue.pdbx_PDB_ins_code)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.pdbx_formal_charge, atomProp(structure_1.StructureProperties.atom.pdbx_formal_charge)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.occupancy, atomProp(structure_1.StructureProperties.atom.occupancy)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.B_iso_or_equiv, atomProp(structure_1.StructureProperties.atom.B_iso_or_equiv)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.entityType, atomProp(structure_1.StructureProperties.entity.type)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.entitySubtype, atomProp(structure_1.StructureProperties.entity.subtype)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.entityPrdId, atomProp(structure_1.StructureProperties.entity.prd_id)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.entityDescription, atomProp(structure_1.StructureProperties.entity.pdbx_description)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.objectPrimitive, atomProp(structure_1.StructureProperties.unit.object_primitive)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.isNonStandard, atomProp(structure_1.StructureProperties.residue.isNonStandard)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.secondaryStructureKey, atomProp(structure_1.StructureProperties.residue.secondary_structure_key)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.secondaryStructureFlags, atomProp(structure_1.StructureProperties.residue.secondary_structure_type)),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomProperty.macromolecular.chemCompType, atomProp(structure_1.StructureProperties.residue.chem_comp_type)),
    // ============= ATOM SET ================
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomSet.atomCount, function structureQuery_atomset_atomCount(ctx, xs) {
        return structure_1.Queries.atomset.atomCount(ctx);
    }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomSet.countQuery, function structureQuery_atomset_countQuery(ctx, xs) {
        return structure_1.Queries.atomset.countQuery(xs[0])(ctx);
    }),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.atomSet.propertySet, function structureQuery_atomset_propertySet(ctx, xs) {
        return structure_1.Queries.atomset.propertySet(xs[0])(ctx);
    }),
    // ============= BOND PROPERTIES ================
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.bondProperty.order, (ctx, xs) => ctx.atomicBond.order),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.bondProperty.flags, (ctx, xs) => ctx.atomicBond.type),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.bondProperty.key, (ctx, xs) => ctx.atomicBond.key),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.bondProperty.atomA, (ctx, xs) => ctx.atomicBond.a),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.bondProperty.atomB, (ctx, xs) => ctx.atomicBond.b),
    D(symbol_table_1.MolScriptSymbolTable.structureQuery.bondProperty.length, (ctx, xs) => ctx.atomicBond.length),
    // Internal
    D(symbol_table_1.MolScriptSymbolTable.internal.generator.bundleElement, function internal_generator_bundleElement(ctx, xs) { return (0, internal_1.bundleElementImpl)(xs.groupedUnits(ctx), xs.ranges(ctx), xs.set(ctx)); }),
    D(symbol_table_1.MolScriptSymbolTable.internal.generator.bundle, function internal_generator_bundle(ctx, xs) { return (0, internal_1.bundleGenerator)(xs.elements(ctx))(ctx); }),
    D(symbol_table_1.MolScriptSymbolTable.internal.generator.current, function internal_generator_current(ctx, xs) { return ctx.tryGetCurrentSelection(); }),
];
function atomProp(p) {
    return (ctx, xs) => p((xs && xs[0] && xs[0](ctx)) || ctx.element);
}
function bondFlag(current, f) {
    return current | (types_1.BondType.isName(f) ? types_1.BondType.fromName(f) : 0 /* BondType.Flag.None */);
}
function secondaryStructureFlag(current, f) {
    switch (f.toLowerCase()) {
        case 'helix': return current | 2 /* SecondaryStructureType.Flag.Helix */;
        case 'alpha': return current | 2 /* SecondaryStructureType.Flag.Helix */ | 4096 /* SecondaryStructureType.Flag.HelixAlpha */;
        case 'pi': return current | 2 /* SecondaryStructureType.Flag.Helix */ | 32768 /* SecondaryStructureType.Flag.HelixPi */;
        case '310': return current | 2 /* SecondaryStructureType.Flag.Helix */ | 2048 /* SecondaryStructureType.Flag.Helix3Ten */;
        case 'beta': return current | 4 /* SecondaryStructureType.Flag.Beta */;
        case 'strand': return current | 4 /* SecondaryStructureType.Flag.Beta */ | 4194304 /* SecondaryStructureType.Flag.BetaStrand */;
        case 'sheet': return current | 4 /* SecondaryStructureType.Flag.Beta */ | 8388608 /* SecondaryStructureType.Flag.BetaSheet */;
        case 'turn': return current | 16 /* SecondaryStructureType.Flag.Turn */;
        case 'bend': return current | 8 /* SecondaryStructureType.Flag.Bend */;
        case 'coil': return current | 536870912 /* SecondaryStructureType.Flag.NA */;
        default: return current;
    }
}
function getArray(ctx, xs) {
    const ret = [];
    if (!xs)
        return ret;
    if (typeof xs.length === 'number') {
        for (let i = 0, _i = xs.length; i < _i; i++)
            ret.push(xs[i](ctx));
    }
    else {
        const keys = Object.keys(xs);
        for (let i = 1, _i = keys.length; i < _i; i++)
            ret.push(xs[keys[i]](ctx));
    }
    return ret;
}
(function () {
    for (const s of symbols) {
        base_1.DefaultQueryRuntimeTable.addSymbol(s);
    }
})();
