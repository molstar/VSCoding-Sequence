"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateSelection = void 0;
const tree_1 = require("../tree");
const transform_1 = require("../transform");
var StateSelection;
(function (StateSelection) {
    function select(s, state) {
        return compile(s)(state);
    }
    StateSelection.select = select;
    function compile(s) {
        const selector = s ? s : Generators.root;
        let query;
        if (isBuilder(selector))
            query = selector.compile();
        else if (isObj(selector))
            query = Generators.byValue(selector).compile();
        else if (isQuery(selector))
            query = selector;
        else
            query = Generators.byRef(selector).compile();
        return query;
    }
    StateSelection.compile = compile;
    function isObj(arg) {
        return arg.transform !== void 0 && arg.status !== void 0;
    }
    function isBuilder(arg) {
        return arg.compile !== void 0;
    }
    function isQuery(arg) {
        return typeof arg === 'function';
    }
    const BuilderPrototype = {
        select(state) {
            return select(this, state || this.state);
        }
    };
    function registerModifier(name, f) {
        BuilderPrototype[name] = function (...args) { return f.call(void 0, this, ...args); };
    }
    function build(compile) {
        return Object.create(BuilderPrototype, { compile: { writable: false, configurable: false, value: compile } });
    }
    let Generators;
    (function (Generators) {
        Generators.root = build(() => (state) => [state.cells.get(state.tree.root.ref)]);
        function byRef(...refs) {
            return build(() => (state) => {
                const ret = [];
                for (const ref of refs) {
                    const n = state.cells.get(ref);
                    if (!n)
                        continue;
                    ret.push(n);
                }
                return ret;
            });
        }
        Generators.byRef = byRef;
        function byValue(...objects) { return build(() => (state) => objects); }
        Generators.byValue = byValue;
        function rootsOfType(type, root = transform_1.StateTransform.RootRef) {
            return build(() => state => {
                const ctx = { roots: [], cells: state.cells, type: type.type };
                tree_1.StateTree.doPreOrder(state.tree, state.tree.transforms.get(root), ctx, _findRootsOfType);
                return ctx.roots;
            });
        }
        Generators.rootsOfType = rootsOfType;
        function ofType(type, root = transform_1.StateTransform.RootRef) {
            return build(() => state => {
                const ctx = { ret: [], cells: state.cells, type: type.type };
                tree_1.StateTree.doPreOrder(state.tree, state.tree.transforms.get(root), ctx, _findOfType);
                return ctx.ret;
            });
        }
        Generators.ofType = ofType;
        function ofTransformer(t, root = transform_1.StateTransform.RootRef) {
            return build(() => state => {
                const ctx = { ret: [], cells: state.cells, t };
                tree_1.StateTree.doPreOrder(state.tree, state.tree.transforms.get(root), ctx, _findOfTransformer);
                return ctx.ret;
            });
        }
        Generators.ofTransformer = ofTransformer;
        function ofTransformerWithError(t, root = transform_1.StateTransform.RootRef) {
            return build(() => state => {
                const ctx = { ret: [], cells: state.cells, t };
                tree_1.StateTree.doPreOrder(state.tree, state.tree.transforms.get(root), ctx, _findOfTransformerWithError);
                return ctx.ret;
            });
        }
        Generators.ofTransformerWithError = ofTransformerWithError;
        function _findRootsOfType(n, _, s) {
            const cell = s.cells.get(n.ref);
            if (cell && cell.obj && cell.obj.type === s.type) {
                s.roots.push(cell);
                return false;
            }
            return true;
        }
        function _findOfType(n, _, s) {
            const cell = s.cells.get(n.ref);
            if (cell && cell.obj && cell.obj.type === s.type) {
                s.ret.push(cell);
            }
            return true;
        }
        function _findOfTransformer(n, _, s) {
            const cell = s.cells.get(n.ref);
            if (cell && cell.obj && cell.transform.transformer === s.t) {
                s.ret.push(cell);
            }
            return true;
        }
        function _findOfTransformerWithError(n, _, s) {
            const cell = s.cells.get(n.ref);
            if (cell && cell.status === 'error' && cell.transform.transformer === s.t) {
                s.ret.push(cell);
            }
            return true;
        }
    })(Generators = StateSelection.Generators || (StateSelection.Generators = {}));
    registerModifier('flatMap', flatMap);
    function flatMap(b, f) {
        const q = compile(b);
        return build(() => (state) => {
            const ret = [];
            for (const n of q(state)) {
                for (const m of f(n, state)) {
                    ret.push(m);
                }
            }
            return ret;
        });
    }
    StateSelection.flatMap = flatMap;
    registerModifier('mapObject', mapObject);
    function mapObject(b, f) {
        const q = compile(b);
        return build(() => (state) => {
            const ret = [];
            for (const n of q(state)) {
                const x = f(n, state);
                if (x)
                    ret.push(x);
            }
            return ret;
        });
    }
    StateSelection.mapObject = mapObject;
    registerModifier('unique', unique);
    function unique(b) {
        const q = compile(b);
        return build(() => (state) => {
            const set = new Set();
            const ret = [];
            for (const n of q(state)) {
                if (!n)
                    continue;
                if (!set.has(n.transform.ref)) {
                    set.add(n.transform.ref);
                    ret.push(n);
                }
            }
            return ret;
        });
    }
    StateSelection.unique = unique;
    registerModifier('first', first);
    function first(b) {
        const q = compile(b);
        return build(() => (state) => {
            const r = q(state);
            return r.length ? [r[0]] : [];
        });
    }
    StateSelection.first = first;
    registerModifier('filter', filter);
    function filter(b, p) { return flatMap(b, n => p(n) ? [n] : []); }
    StateSelection.filter = filter;
    registerModifier('withStatus', withStatus);
    function withStatus(b, s) { return filter(b, n => n.status === s); }
    StateSelection.withStatus = withStatus;
    registerModifier('withTag', withTag);
    function withTag(b, tag) { return filter(b, n => !!n.transform.tags && n.transform.tags.indexOf(tag) >= 0); }
    StateSelection.withTag = withTag;
    registerModifier('subtree', subtree);
    function subtree(b) {
        return flatMap(b, (n, s) => {
            const nodes = [];
            tree_1.StateTree.doPreOrder(s.tree, s.tree.transforms.get(n.transform.ref), nodes, (x, _, ctx) => { ctx.push(x.ref); });
            return nodes.map(x => s.cells.get(x));
        });
    }
    StateSelection.subtree = subtree;
    registerModifier('children', children);
    function children(b) {
        return flatMap(b, (n, s) => {
            const nodes = [];
            s.tree.children.get(n.transform.ref).forEach(c => nodes.push(s.cells.get(c)));
            return nodes;
        });
    }
    StateSelection.children = children;
    registerModifier('ofType', ofType);
    function ofType(b, t) { return filter(b, n => n.obj ? n.obj.type === t.type : false); }
    StateSelection.ofType = ofType;
    registerModifier('ancestor', ancestor);
    function ancestor(b, test) { return unique(mapObject(b, (n, s) => findAncestor(s.tree, s.cells, n.transform.ref, test))); }
    StateSelection.ancestor = ancestor;
    registerModifier('ancestorOfType', ancestorOfType);
    function ancestorOfType(b, types) { return unique(mapObject(b, (n, s) => findAncestorOfType(s.tree, s.cells, n.transform.ref, types))); }
    StateSelection.ancestorOfType = ancestorOfType;
    registerModifier('ancestorWithTransformer', ancestorWithTransformer);
    function ancestorWithTransformer(b, transfomers) { return unique(mapObject(b, (n, s) => findAncestorWithTransformer(s.tree, s.cells, n.transform.ref, transfomers))); }
    StateSelection.ancestorWithTransformer = ancestorWithTransformer;
    registerModifier('withTransformer', withTransformer);
    function withTransformer(b, t) { return filter(b, o => o.transform.transformer === t); }
    StateSelection.withTransformer = withTransformer;
    registerModifier('root', root);
    function root(b, test) { return unique(mapObject(b, (n, s) => findRoot(s.tree, s.cells, n.transform.ref, test))); }
    StateSelection.root = root;
    registerModifier('rootOfType', rootOfType);
    function rootOfType(b, types) { return unique(mapObject(b, (n, s) => findRootOfType(s.tree, s.cells, n.transform.ref, types))); }
    StateSelection.rootOfType = rootOfType;
    registerModifier('parent', parent);
    function parent(b) { return unique(mapObject(b, (n, s) => s.cells.get(s.tree.transforms.get(n.transform.ref).parent))); }
    StateSelection.parent = parent;
    function _findAncestor(tree, cells, root, test, findClosest) {
        let current = tree.transforms.get(root);
        let ret = void 0;
        while (true) {
            current = tree.transforms.get(current.parent);
            const cell = cells.get(current.ref);
            if (cell.obj && test(cell)) {
                ret = cell;
                if (findClosest)
                    return ret;
            }
            if (current.ref === transform_1.StateTransform.RootRef) {
                return ret;
            }
        }
    }
    // Return first ancestor that satisfies the given test
    function findAncestor(tree, cells, root, test) {
        return _findAncestor(tree, cells, root, test, true);
    }
    StateSelection.findAncestor = findAncestor;
    // Return last (with lowest depth) ancestor that satisfies the given test
    function findRoot(tree, cells, root, test) {
        return _findAncestor(tree, cells, root, test, false);
    }
    StateSelection.findRoot = findRoot;
    function findAncestorWithTransformer(tree, cells, root, transfomers) {
        return findAncestor(tree, cells, root, Array.isArray(transfomers)
            ? cell => transfomers.indexOf(cell.transform.transformer) >= 0
            : cell => cell.transform.transformer === transfomers);
    }
    StateSelection.findAncestorWithTransformer = findAncestorWithTransformer;
    function findAncestorOfType(tree, cells, root, types) {
        return findAncestor(tree, cells, root, _testTypes(types));
    }
    StateSelection.findAncestorOfType = findAncestorOfType;
    function findRootOfType(tree, cells, root, types) {
        return findRoot(tree, cells, root, _testTypes(types));
    }
    StateSelection.findRootOfType = findRootOfType;
    function _testTypes(types) {
        return Array.isArray(types)
            ? (cell) => {
                for (const t of types) {
                    if (t.type === cell.obj.type)
                        return true;
                }
            } : (cell) => cell.obj.type === types.type;
    }
    function findUniqueTagsInSubtree(tree, root, tags) {
        return tree_1.StateTree.doPreOrder(tree, tree.transforms.get(root), { refs: {}, tags }, _findUniqueTagsInSubtree).refs;
    }
    StateSelection.findUniqueTagsInSubtree = findUniqueTagsInSubtree;
    function _findUniqueTagsInSubtree(n, _, s) {
        if (n.tags) {
            for (const t of n.tags) {
                if (!s.tags.has(t))
                    continue;
                s.refs[t] = n.ref;
                break;
            }
        }
        return true;
    }
    function findTagInSubtree(tree, root, tag) {
        return tree_1.StateTree.doPreOrder(tree, tree.transforms.get(root), { ref: void 0, tag }, _findTagInSubtree).ref;
    }
    StateSelection.findTagInSubtree = findTagInSubtree;
    function _findTagInSubtree(n, _, s) {
        if (n.tags && n.tags.indexOf(s.tag) >= 0) {
            s.ref = n.ref;
            return false;
        }
        return true;
    }
    function findWithAllTags(tree, root, tags) {
        return tree_1.StateTree.doPreOrder(tree, tree.transforms.get(root), { refs: [], tags }, _findWithAllTags).refs;
    }
    StateSelection.findWithAllTags = findWithAllTags;
    function _findWithAllTags(n, _, s) {
        if (n.tags) {
            const len = s.tags.size;
            let found = 0;
            for (const t of n.tags) {
                if (!s.tags.has(t))
                    continue;
                found++;
                if (found === len) {
                    s.refs.push(n);
                    break;
                }
            }
        }
        else if (s.tags.size === 0) {
            s.refs.push(n);
        }
    }
    function tryFindDecorator(state, root, transformer) {
        const t = state.transforms.get(root);
        if (t.transformer === transformer)
            return state.cells.get(root);
        const children = state.tree.children.get(root);
        if (children.size !== 1)
            return;
        const first = children.first();
        if (state.transforms.get(first).transformer.definition.isDecorator)
            return tryFindDecorator(state, first, transformer);
    }
    StateSelection.tryFindDecorator = tryFindDecorator;
})(StateSelection || (exports.StateSelection = StateSelection = {}));
