/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { StateTree } from '../tree/immutable';
import { StateObjectCell, StateObjectSelector, StateObjectRef } from '../object';
import { StateTransform } from '../transform';
import { produce } from 'immer';
export { StateBuilder };
var StateBuilder;
(function (StateBuilder) {
    function buildTree(state) {
        if (!state.state || state.state.tree === state.editInfo.sourceTree) {
            return state.tree.asImmutable();
        }
        // The tree has changed in the meantime, we need to reapply the changes!
        const tree = state.state.tree.asTransient();
        for (const a of state.actions) {
            switch (a.kind) {
                case 'add':
                    tree.add(a.transform);
                    break;
                case 'update':
                    tree.setParams(a.ref, a.params);
                    break;
                case 'delete':
                    tree.remove(a.ref);
                    break;
                case 'insert': {
                    const children = tree.children.get(a.ref).toArray();
                    tree.add(a.transform);
                    for (const c of children) {
                        tree.changeParent(c, a.transform.ref);
                    }
                    break;
                }
            }
        }
        state.editInfo.sourceTree = state.tree;
        return tree.asImmutable();
    }
    function is(obj) {
        return !!obj && typeof obj.getTree === 'function';
    }
    StateBuilder.is = is;
    function isTo(obj) {
        return !!obj && typeof obj.getTree === 'function' && typeof obj.ref === 'string';
    }
    StateBuilder.isTo = isTo;
    // type ToFromCell<C extends StateObjectCell> = C extends StateObjectCell<infer A, StateTransform<infer T extends StateTransformer>> ? To<A, any>: never
    class Root {
        get editInfo() { return this.state.editInfo; }
        get currentTree() { return this.state.tree; }
        to(refOrCellOrSelector) {
            const ref = typeof refOrCellOrSelector === 'string'
                ? refOrCellOrSelector
                : StateObjectCell.is(refOrCellOrSelector)
                    ? refOrCellOrSelector.transform.ref
                    : refOrCellOrSelector.ref;
            return new To(this.state, ref, this);
        }
        toRoot() { return new To(this.state, this.state.tree.root.ref, this); }
        delete(obj) {
            const ref = StateObjectRef.resolveRef(obj);
            if (!ref || !this.state.tree.transforms.has(ref))
                return this;
            this.editInfo.count++;
            this.state.tree.remove(ref);
            this.state.actions.push({ kind: 'delete', ref });
            return this;
        }
        getTree() { return buildTree(this.state); }
        commit(options) {
            if (!this.state.state)
                throw new Error('Cannot commit template tree');
            return this.state.state.runTask(this.state.state.updateTree(this, options));
        }
        constructor(tree, state) { this.state = { state, tree: tree.asTransient(), actions: [], editInfo: { applied: false, sourceTree: tree, count: 0, lastUpdate: void 0 } }; }
    }
    StateBuilder.Root = Root;
    class To {
        get editInfo() { return this.state.editInfo; }
        get selector() { return new StateObjectSelector(this.ref, this.state.state); }
        getApplyRoot() {
            return StateTree.getDecoratorRoot(this.state.tree, this.ref);
        }
        /**
         * Apply the transformed to the parent node
         * If no params are specified (params <- undefined), default params are lazily resolved.
         */
        apply(tr, params, options) {
            if (tr.definition.isDecorator) {
                return this.insert(tr, params, options);
            }
            const applyRoot = this.getApplyRoot();
            const t = tr.apply(applyRoot, params, options);
            this.state.tree.add(t);
            this.editInfo.count++;
            this.editInfo.lastUpdate = t.ref;
            this.state.actions.push({ kind: 'add', transform: t });
            return new To(this.state, t.ref, this.root);
        }
        /**
         * If the ref is present, the transform is applied.
         * Otherwise a transform with the specifed ref is created.
         */
        applyOrUpdate(ref, tr, params, options) {
            if (this.state.tree.transforms.has(ref)) {
                const to = this.to(ref);
                if (params)
                    to.update(params);
                return to;
            }
            else {
                return this.apply(tr, params, { ...options, ref });
            }
        }
        /**
         * Apply the transformed to the parent node
         * If no params are specified (params <- undefined), default params are lazily resolved.
         * The transformer cannot be a decorator to be able to use this.
         */
        applyOrUpdateTagged(tags, tr, params, options) {
            if (tr.definition.isDecorator) {
                throw new Error(`Can't use applyOrUpdateTagged on decorator transformers.`);
            }
            const applyRoot = this.getApplyRoot();
            const children = this.state.tree.children.get(applyRoot).values();
            while (true) {
                const child = children.next();
                if (child.done)
                    break;
                const tr = this.state.tree.transforms.get(child.value);
                if (tr && StateTransform.hasTags(tr, tags)) {
                    const to = this.to(child.value);
                    to.updateTagged(params, stringArrayUnion(tr.tags, tags, options && options.tags));
                    return to;
                }
            }
            const t = tr.apply(applyRoot, params, { ...options, tags: stringArrayUnion(tags, options && options.tags) });
            this.state.tree.add(t);
            this.editInfo.count++;
            this.editInfo.lastUpdate = t.ref;
            this.state.actions.push({ kind: 'add', transform: t });
            return new To(this.state, t.ref, this.root);
        }
        /**
         * A helper to greate a group-like state object and keep the current type.
         */
        group(tr, params, options) {
            return this.apply(tr, params, options);
        }
        /**
         * Inserts a new transform that does not change the object type and move the original children to it.
         */
        insert(tr, params, options) {
            // cache the children
            const children = this.state.tree.children.get(this.ref).toArray();
            // add the new node
            const t = tr.apply(this.ref, params, options);
            this.state.tree.add(t);
            // move the original children to the new node
            for (const c of children) {
                this.state.tree.changeParent(c, t.ref);
            }
            this.editInfo.count++;
            this.editInfo.lastUpdate = t.ref;
            this.state.actions.push({ kind: 'insert', ref: this.ref, transform: t });
            return new To(this.state, t.ref, this.root);
        }
        updateTagged(params, tags) {
            if (this.state.tree.setParams(this.ref, params) || this.state.tree.setTags(this.ref, tags)) {
                this.editInfo.count++;
                this.editInfo.lastUpdate = this.ref;
                this.state.actions.push({ kind: 'update', ref: this.ref, params });
            }
        }
        update(paramsOrTransformer, provider) {
            let params;
            if (provider) {
                const old = this.state.tree.transforms.get(this.ref);
                params = produce(old.params, provider);
            }
            else {
                params = typeof paramsOrTransformer === 'function'
                    ? produce(this.state.tree.transforms.get(this.ref).params, paramsOrTransformer)
                    : paramsOrTransformer;
            }
            if (this.state.tree.setParams(this.ref, params)) {
                this.editInfo.count++;
                this.editInfo.lastUpdate = this.ref;
                this.state.actions.push({ kind: 'update', ref: this.ref, params });
            }
            return this.root;
        }
        /** Add tags to the current node */
        tag(tags) {
            const transform = this.state.tree.transforms.get(this.ref);
            this.updateTagged(transform.params, stringArrayUnion(transform.tags, tags));
            return this;
        }
        /** Add dependsOn to the current node */
        dependsOn(dependsOn) {
            const transform = this.state.tree.transforms.get(this.ref);
            if (this.state.tree.setDependsOn(this.ref, stringArrayUnion(transform.dependsOn, dependsOn))) {
                this.editInfo.count++;
                this.editInfo.lastUpdate = this.ref;
                this.state.actions.push({ kind: 'update', ref: this.ref, params: transform.params });
            }
        }
        to(ref) { return this.root.to(ref); }
        toRoot() { return this.root.toRoot(); }
        delete(ref) { return this.root.delete(ref); }
        getTree() { return buildTree(this.state); }
        /** Returns selector to this node. */
        commit(options) {
            if (!this.state.state)
                throw new Error('Cannot commit template tree');
            return this.state.state.runTask(this.state.state.updateTree(this, options));
        }
        constructor(state, ref, root) {
            this.state = state;
            this.root = root;
            this.ref = ref;
            if (!this.state.tree.transforms.has(ref)) {
                throw new Error(`Could not find node '${ref}'.`);
            }
        }
    }
    StateBuilder.To = To;
})(StateBuilder || (StateBuilder = {}));
function stringArrayUnion(...arrays) {
    let set = void 0;
    const ret = [];
    for (const xs of arrays) {
        if (!xs)
            continue;
        if (!set)
            set = new Set();
        if (typeof xs === 'string') {
            if (set.has(xs))
                continue;
            set.add(xs);
            ret.push(xs);
        }
        else {
            for (const x of xs) {
                if (set.has(x))
                    continue;
                set.add(x);
                ret.push(x);
            }
        }
    }
    return ret;
}
