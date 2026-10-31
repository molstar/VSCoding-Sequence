"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateTransformer = void 0;
const transform_1 = require("./transform");
const param_definition_1 = require("../mol-util/param-definition");
const action_1 = require("./action");
const string_1 = require("../mol-util/string");
var Transformer;
(function (Transformer) {
    function getParamDefinition(t, a, globalCtx) {
        return t.definition.params ? t.definition.params(a, globalCtx) : {};
    }
    Transformer.getParamDefinition = getParamDefinition;
    function is(obj) {
        return !!obj && typeof obj.toAction === 'function' && typeof obj.apply === 'function';
    }
    Transformer.is = is;
    let UpdateResult;
    (function (UpdateResult) {
        UpdateResult[UpdateResult["Unchanged"] = 0] = "Unchanged";
        UpdateResult[UpdateResult["Updated"] = 1] = "Updated";
        UpdateResult[UpdateResult["Recreate"] = 2] = "Recreate";
        UpdateResult[UpdateResult["Null"] = 3] = "Null";
    })(UpdateResult = Transformer.UpdateResult || (Transformer.UpdateResult = {}));
    const registry = new Map();
    const fromTypeIndex = new Map();
    function _index(tr) {
        for (const t of tr.definition.from) {
            if (fromTypeIndex.has(t.type)) {
                fromTypeIndex.get(t.type).push(tr);
            }
            else {
                fromTypeIndex.set(t.type, [tr]);
            }
        }
    }
    function getAll() {
        return Array.from(registry.values());
    }
    Transformer.getAll = getAll;
    function get(id) {
        const t = registry.get(id);
        if (!t) {
            throw new Error(`A transformer with signature '${id}' is not registered.`);
        }
        return t;
    }
    Transformer.get = get;
    function fromType(type) {
        return fromTypeIndex.get(type) || [];
    }
    Transformer.fromType = fromType;
    function create(namespace, definition) {
        const { name } = definition;
        const id = `${namespace}.${name}`;
        if (registry.has(id)) {
            throw new Error(`A transform with id '${name}' is already registered. Please pick a unique identifier for your transforms and/or register them only once. This is to ensure that transforms can be serialized and replayed.`);
        }
        const t = {
            apply(parent, params, props) { return transform_1.StateTransform.create(parent, t, params, props); },
            toAction() { return action_1.StateAction.fromTransformer(t); },
            namespace,
            id,
            definition,
            createDefaultParams(a, globalCtx) { return definition.params ? param_definition_1.ParamDefinition.getDefaultValues(definition.params(a, globalCtx)) : {}; }
        };
        registry.set(id, t);
        _index(t);
        return t;
    }
    Transformer.create = create;
    function factory(namespace) {
        return (definition) => create(namespace, definition);
    }
    Transformer.factory = factory;
    function builderFactory(namespace) {
        return Builder.build(namespace);
    }
    Transformer.builderFactory = builderFactory;
    let Builder;
    (function (Builder) {
        function root(namespace, info) {
            return def => create(namespace, {
                name: info.name,
                from: info.from instanceof Array ? info.from : [info.from],
                to: info.to instanceof Array ? info.to : [info.to],
                display: typeof info.display === 'string'
                    ? { name: info.display }
                    : !!info.display
                        ? info.display
                        : { name: (0, string_1.capitalize)(info.name.replace(/[-]/g, ' ')) },
                params: typeof info.params === 'object'
                    ? () => info.params
                    : !!info.params
                        ? info.params
                        : void 0,
                isDecorator: info.isDecorator,
                ...def
            });
        }
        function build(namespace) {
            return (info) => root(namespace, info);
        }
        Builder.build = build;
    })(Builder = Transformer.Builder || (Transformer.Builder = {}));
    function build(namespace) {
        return Builder.build(namespace);
    }
    Transformer.build = build;
    Transformer.ROOT = create('build-in', {
        name: 'root',
        from: [],
        to: [],
        display: { name: 'Root', description: 'For internal use.' },
        apply() { throw new Error('should never be applied'); },
        update() { return UpdateResult.Unchanged; }
    });
})(Transformer || (exports.StateTransformer = Transformer = {}));
