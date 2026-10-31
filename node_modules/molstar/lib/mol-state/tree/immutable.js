/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Map as ImmutableMap, OrderedSet } from 'immutable';
import { StateTransform } from '../transform';
import { TransientTree } from './transient';
export { StateTree };
var StateTree;
(function (StateTree) {
    class Impl {
        get root() { return this.transforms.get(StateTransform.RootRef); }
        asTransient() {
            return new TransientTree(this);
        }
        constructor(transforms, children, dependencies) {
            this.transforms = transforms;
            this.children = children;
            this.dependencies = dependencies;
        }
    }
    /**
     * Create an instance of an immutable tree.
     */
    function createEmpty(customRoot) {
        const root = customRoot || StateTransform.createRoot();
        return create(ImmutableMap([[root.ref, root]]), ImmutableMap([[root.ref, OrderedSet()]]), ImmutableMap());
    }
    StateTree.createEmpty = createEmpty;
    function create(nodes, children, dependencies) {
        return new Impl(nodes, children, dependencies);
    }
    StateTree.create = create;
    function _postOrderFunc(c) { _doPostOrder(this, this.tree.transforms.get(c)); }
    function _doPostOrder(ctx, root) {
        const children = ctx.tree.children.get(root.ref);
        if (children && children.size) {
            children.forEach(_postOrderFunc, ctx);
        }
        ctx.f(root, ctx.tree, ctx.state);
    }
    /**
     * Visit all nodes in a subtree in "post order", meaning leafs get visited first.
     */
    function doPostOrder(tree, root, state, f) {
        const ctx = { tree, state, f };
        _doPostOrder(ctx, root);
        return ctx.state;
    }
    StateTree.doPostOrder = doPostOrder;
    function _preOrderFunc(c) { _doPreOrder(this, this.tree.transforms.get(c)); }
    function _doPreOrder(ctx, root) {
        const ret = ctx.f(root, ctx.tree, ctx.state);
        if (typeof ret === 'boolean' && !ret)
            return;
        const children = ctx.tree.children.get(root.ref);
        if (children && children.size) {
            children.forEach(_preOrderFunc, ctx);
        }
    }
    /**
     * Visit all nodes in a subtree in "pre order", meaning leafs get visited last.
     * If the visitor function returns false, the visiting for that branch is interrupted.
     */
    function doPreOrder(tree, root, state, f) {
        const ctx = { tree, state, f };
        _doPreOrder(ctx, root);
        return ctx.state;
    }
    StateTree.doPreOrder = doPreOrder;
    function _subtree(n, _, subtree) { subtree.push(n); }
    /**
     * Get all nodes in a subtree, leafs come first.
     */
    function subtreePostOrder(tree, root) {
        return doPostOrder(tree, root, [], _subtree);
    }
    StateTree.subtreePostOrder = subtreePostOrder;
    function _visitNodeToJson(node, tree, ctx) {
        // const children: Ref[] = [];
        // tree.children.get(node.ref).forEach(_visitChildToJson as any, children);
        ctx.push(StateTransform.toJSON(node));
    }
    function toJSON(tree) {
        const transforms = [];
        doPreOrder(tree, tree.root, transforms, _visitNodeToJson);
        return { transforms };
    }
    StateTree.toJSON = toJSON;
    function fromJSON(data) {
        const nodes = ImmutableMap().asMutable();
        const children = ImmutableMap().asMutable();
        const dependencies = ImmutableMap().asMutable();
        for (const t of data.transforms) {
            const transform = StateTransform.fromJSON(t);
            nodes.set(transform.ref, transform);
            if (!children.has(transform.ref)) {
                children.set(transform.ref, OrderedSet().asMutable());
            }
            if (transform.ref !== transform.parent)
                children.get(transform.parent).add(transform.ref);
        }
        const dependent = new Set();
        for (const t of data.transforms) {
            const ref = t.ref;
            children.set(ref, children.get(ref).asImmutable());
            if (!t.dependsOn)
                continue;
            for (const d of t.dependsOn) {
                dependent.add(d);
                if (!dependencies.has(d)) {
                    dependencies.set(d, OrderedSet([ref]).asMutable());
                }
                else {
                    dependencies.get(d).add(ref);
                }
            }
        }
        dependent.forEach(d => {
            dependencies.set(d, dependencies.get(d).asImmutable());
        });
        return create(nodes.asImmutable(), children.asImmutable(), dependencies.asImmutable());
    }
    StateTree.fromJSON = fromJSON;
    function dump(tree) {
        console.log({
            tr: tree.transforms.keySeq().toArray(),
            tr1: tree.transforms.valueSeq().toArray().map(t => t.ref),
            ch: tree.children.keySeq().toArray()
        });
    }
    StateTree.dump = dump;
    function _subtreeHasRef(tree, root, ref) {
        if (root === ref)
            return true;
        const children = tree.children.get(root);
        const it = children.values();
        while (true) {
            const next = it.next();
            if (next.done)
                return false;
            if (_subtreeHasRef(tree, next.value, ref))
                return true;
        }
    }
    /** Check if the subtree with the given root has the provided ref */
    function subtreeHasRef(tree, root, ref) {
        if (!tree.transforms.has(root) || !tree.transforms.has(ref))
            return false;
        return _subtreeHasRef(tree, root, ref);
    }
    StateTree.subtreeHasRef = subtreeHasRef;
    function getDecoratorRoot(tree, ref) {
        const children = tree.children.get(ref);
        if (children.size !== 1)
            return ref;
        const child = tree.transforms.get(children.first());
        if (child.transformer.definition.isDecorator)
            return getDecoratorRoot(tree, child.ref);
        return ref;
    }
    StateTree.getDecoratorRoot = getDecoratorRoot;
})(StateTree || (StateTree = {}));
