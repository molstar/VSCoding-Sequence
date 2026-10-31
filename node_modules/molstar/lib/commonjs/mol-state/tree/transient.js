"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransientTree = void 0;
const immutable_1 = require("immutable");
const transform_1 = require("../transform");
const immutable_2 = require("./immutable");
const object_1 = require("../../mol-util/object");
const array_1 = require("../../mol-util/array");
class TransientTree {
    get childMutations() {
        if (this._childMutations)
            return this._childMutations;
        this._childMutations = new Map();
        return this._childMutations;
    }
    get dependencyMutations() {
        if (this._dependencyMutations)
            return this._dependencyMutations;
        this._dependencyMutations = new Map();
        return this._dependencyMutations;
    }
    changeNodes() {
        if (this.changedNodes)
            return;
        this.changedNodes = true;
        this.transforms = this.transforms.asMutable();
    }
    changeChildren() {
        if (this.changedChildren)
            return;
        this.changedChildren = true;
        this.children = this.children.asMutable();
    }
    changeDependencies() {
        if (this.changedDependencies)
            return;
        this.changedDependencies = true;
        this.dependencies = this.dependencies.asMutable();
    }
    get root() { return this.transforms.get(transform_1.StateTransform.RootRef); }
    asTransient() {
        return this.asImmutable().asTransient();
    }
    addChild(parent, child) {
        this.changeChildren();
        if (this.childMutations.has(parent)) {
            this.childMutations.get(parent).add(child);
        }
        else {
            const set = this.children.get(parent).asMutable();
            set.add(child);
            this.children.set(parent, set);
            this.childMutations.set(parent, set);
        }
    }
    removeChild(parent, child) {
        this.changeChildren();
        if (this.childMutations.has(parent)) {
            this.childMutations.get(parent).remove(child);
        }
        else {
            const set = this.children.get(parent).asMutable();
            set.remove(child);
            this.children.set(parent, set);
            this.childMutations.set(parent, set);
        }
    }
    clearRoot() {
        const parent = transform_1.StateTransform.RootRef;
        if (this.children.get(parent).size === 0)
            return;
        this.changeChildren();
        const set = (0, immutable_1.OrderedSet)();
        this.children.set(parent, set);
        this.childMutations.set(parent, set);
    }
    mutateDependency(parent, child, action) {
        let set = this.dependencyMutations.get(parent);
        if (!set) {
            const src = this.dependencies.get(parent);
            if (!src && action === 'remove')
                return;
            this.changeDependencies();
            set = src ? src.asMutable() : (0, immutable_1.OrderedSet)().asMutable();
            this.dependencyMutations.set(parent, set);
            this.dependencies.set(parent, set);
        }
        if (action === 'add') {
            set.add(child);
        }
        else {
            set.remove(child);
        }
    }
    changeParent(ref, newParent) {
        ensurePresent(this.transforms, ref);
        const old = this.transforms.get(ref);
        this.removeChild(old.parent, ref);
        this.addChild(newParent, ref);
        this.changeNodes();
        this.transforms.set(ref, transform_1.StateTransform.withParent(old, newParent));
    }
    add(transform) {
        const ref = transform.ref;
        if (this.transforms.has(transform.ref)) {
            const node = this.transforms.get(transform.ref);
            if (node.parent !== transform.parent)
                alreadyPresent(transform.ref);
        }
        const children = this.children.get(transform.parent);
        if (!children)
            parentNotPresent(transform.parent);
        if (!children.has(transform.ref)) {
            this.addChild(transform.parent, transform.ref);
        }
        if (!this.children.has(transform.ref)) {
            if (!this.changedChildren) {
                this.changedChildren = true;
                this.children = this.children.asMutable();
            }
            this.children.set(transform.ref, (0, immutable_1.OrderedSet)());
        }
        this.changeNodes();
        this.transforms.set(ref, transform);
        if (transform.dependsOn) {
            for (const d of transform.dependsOn) {
                this.mutateDependency(d, ref, 'add');
            }
        }
        return this;
    }
    /** Calls Transform.definition.params.areEqual if available, otherwise uses shallowEqual to check if the params changed */
    setParams(ref, params) {
        ensurePresent(this.transforms, ref);
        const transform = this.transforms.get(ref);
        // TODO: should this be here?
        if ((0, object_1.shallowEqual)(transform.params, params)) {
            return false;
        }
        if (!this.changedNodes) {
            this.changedNodes = true;
            this.transforms = this.transforms.asMutable();
        }
        this.transforms.set(transform.ref, transform_1.StateTransform.withParams(transform, params));
        return true;
    }
    /** Calls Transform.definition.params.areEqual if available, otherwise uses shallowEqual to check if the params changed */
    setTags(ref, tags) {
        ensurePresent(this.transforms, ref);
        const transform = this.transforms.get(ref);
        const withTags = transform_1.StateTransform.withTags(transform, tags);
        // TODO: should this be here?
        if ((0, array_1.arrayEqual)(transform.tags, withTags.tags)) {
            return false;
        }
        if (!this.changedNodes) {
            this.changedNodes = true;
            this.transforms = this.transforms.asMutable();
        }
        this.transforms.set(transform.ref, withTags);
        return true;
    }
    setDependsOn(ref, dependsOn) {
        ensurePresent(this.transforms, ref);
        const transform = this.transforms.get(ref);
        const withDependsOn = transform_1.StateTransform.withDependsOn(transform, dependsOn);
        if ((0, array_1.arrayEqual)(transform.dependsOn, withDependsOn.dependsOn)) {
            return false;
        }
        if (!this.changedNodes) {
            this.changedNodes = true;
            this.transforms = this.transforms.asMutable();
        }
        this.transforms.set(transform.ref, withDependsOn);
        return true;
    }
    assignState(ref, state) {
        ensurePresent(this.transforms, ref);
        const old = this.transforms.get(ref);
        if (this._stateUpdates && this._stateUpdates.has(ref)) {
            transform_1.StateTransform.assignState(old.state, state);
            return old;
        }
        else {
            if (!this._stateUpdates)
                this._stateUpdates = new Set();
            this._stateUpdates.add(old.ref);
            this.changeNodes();
            const updated = transform_1.StateTransform.withState(old, state);
            this.transforms.set(ref, updated);
            return updated;
        }
    }
    remove(ref) {
        const node = this.transforms.get(ref);
        if (!node)
            return [];
        const st = immutable_2.StateTree.subtreePostOrder(this, node);
        if (ref === transform_1.StateTransform.RootRef) {
            st.pop();
            if (st.length === 0)
                return st;
            this.clearRoot();
        }
        else {
            if (st.length === 0)
                return st;
            this.removeChild(node.parent, node.ref);
        }
        this.changeNodes();
        this.changeChildren();
        for (const n of st) {
            this.transforms.delete(n.ref);
            this.children.delete(n.ref);
            if (this._childMutations)
                this._childMutations.delete(n.ref);
        }
        const depRemoves = [];
        for (const n of st) {
            if (n.dependsOn) {
                for (const d of n.dependsOn) {
                    if (!this.transforms.has(d))
                        continue;
                    this.mutateDependency(d, n.ref, 'remove');
                }
            }
            if (this.dependencies.has(n.ref)) {
                const deps = this.dependencies.get(n.ref).toArray();
                this.changeDependencies();
                this.dependencies.delete(n.ref);
                if (this._dependencyMutations)
                    this._dependencyMutations.delete(n.ref);
                for (const dep of deps) {
                    if (!this.transforms.has(dep))
                        continue;
                    for (const del of this.remove(dep))
                        depRemoves[depRemoves.length] = del;
                }
            }
        }
        for (const dep of depRemoves)
            st[st.length] = dep;
        return st;
    }
    asImmutable() {
        if (!this.changedNodes && !this.changedChildren && !this._childMutations)
            return this.tree;
        if (this._childMutations)
            this._childMutations.forEach(fixChildMutations, this.children);
        if (this._dependencyMutations)
            this._dependencyMutations.forEach(fixDependencyMutations, this.dependencies);
        return immutable_2.StateTree.create(this.changedNodes ? this.transforms.asImmutable() : this.transforms, this.changedChildren ? this.children.asImmutable() : this.children, this.changedDependencies ? this.dependencies.asImmutable() : this.dependencies);
    }
    constructor(tree) {
        this.tree = tree;
        this.transforms = this.tree.transforms;
        this.children = this.tree.children;
        this.dependencies = this.tree.dependencies;
        this.changedNodes = false;
        this.changedChildren = false;
        this.changedDependencies = false;
        this._childMutations = void 0;
        this._dependencyMutations = void 0;
        this._stateUpdates = void 0;
    }
}
exports.TransientTree = TransientTree;
function fixChildMutations(m, k) {
    this.set(k, m.asImmutable());
}
function fixDependencyMutations(m, k) {
    if (m.size === 0)
        this.delete(k);
    else
        this.set(k, m.asImmutable());
}
function alreadyPresent(ref) {
    throw new Error(`Transform '${ref}' is already present in the tree.`);
}
function parentNotPresent(ref) {
    throw new Error(`Parent '${ref}' must be present in the tree.`);
}
function ensurePresent(nodes, ref) {
    if (!nodes.has(ref)) {
        throw new Error(`Node '${ref}' is not present in the tree.`);
    }
}
