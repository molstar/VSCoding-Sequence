/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { StateSelection } from '../../mol-state';
import { RxEventHelper } from '../../mol-util/rx-event-helper';
export { SubstructureParentHelper };
class SubstructureParentHelper {
    getDecorator(root) {
        const tree = this.plugin.state.data.tree;
        const children = tree.children.get(root);
        if (children.size !== 1)
            return root;
        const child = children.first();
        if (tree.transforms.get(child).transformer.definition.isDecorator) {
            return this.getDecorator(child);
        }
        return root;
    }
    /** Returns the root node of given structure if existing, takes decorators into account */
    get(s, ignoreDecorators = false) {
        const r = this.root.get(s);
        if (!r)
            return;
        if (ignoreDecorators)
            return this.plugin.state.data.cells.get(r.ref);
        return this.plugin.state.data.cells.get(this.getDecorator(r.ref));
    }
    addMapping(state, ref, obj) {
        if (!PluginStateObject.Molecule.Structure.is(obj))
            return false;
        this.tracked.set(ref, obj.data);
        // if the structure is already present in the tree, do not rewrite the root.
        if (this.root.has(obj.data)) {
            const e = this.root.get(obj.data);
            e.count++;
        }
        else {
            const parent = state.select(StateSelection.Generators.byRef(ref).rootOfType([PluginStateObject.Molecule.Structure]))[0];
            if (!parent) {
                this.root.set(obj.data, { ref, count: 1 });
            }
            else {
                this.root.set(obj.data, { ref: parent.transform.ref, count: 1 });
            }
        }
        return true;
    }
    removeMapping(ref) {
        if (!this.tracked.has(ref))
            return false;
        const s = this.tracked.get(ref);
        this.tracked.delete(ref);
        const root = this.root.get(s);
        if (root.count > 1) {
            root.count--;
        }
        else {
            this.root.delete(s);
        }
        return true;
    }
    updateMapping(state, ref, oldObj, obj) {
        if (!PluginStateObject.Molecule.Structure.is(obj))
            return false;
        this.removeMapping(ref);
        this.addMapping(state, ref, obj);
        return true;
    }
    dispose() {
        this.ev.dispose();
    }
    constructor(plugin) {
        this.plugin = plugin;
        this.ev = RxEventHelper.create();
        this.events = {
            updated: this.ev(),
            removed: this.ev(),
        };
        // private decorators = new Map<string, string[]>();
        this.root = new Map();
        this.tracked = new Map();
        plugin.state.data.events.object.created.subscribe(e => {
            this.addMapping(e.state, e.ref, e.obj);
        });
        plugin.state.data.events.object.removed.subscribe(e => {
            if (this.removeMapping(e.ref)) {
                this.events.removed.next({ ref: e.ref, obj: e.obj });
            }
        });
        plugin.state.data.events.object.updated.subscribe(e => {
            if (this.updateMapping(e.state, e.ref, e.oldObj, e.obj)) {
                this.events.updated.next({ ref: e.ref, oldObj: e.oldObj, obj: e.obj });
            }
        });
    }
}
