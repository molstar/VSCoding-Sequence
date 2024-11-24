/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { StateTransform } from '../transform';
import { StateTree } from './immutable';
export { TransientTree };
declare class TransientTree implements StateTree {
    private tree;
    transforms: StateTree.MutableTransforms;
    children: StateTree.MutableChildren;
    dependencies: StateTree.MutableDependencies;
    private changedNodes;
    private changedChildren;
    private changedDependencies;
    private _childMutations;
    private _dependencyMutations;
    private _stateUpdates;
    private get childMutations();
    private get dependencyMutations();
    private changeNodes;
    private changeChildren;
    private changeDependencies;
    get root(): StateTransform<import("..").StateTransformer<import("..").StateObject<any, import("..").StateObject.Type<any>>, import("..").StateObject<any, import("..").StateObject.Type<any>>, any>>;
    asTransient(): TransientTree;
    private addChild;
    private removeChild;
    private clearRoot;
    private mutateDependency;
    changeParent(ref: StateTransform.Ref, newParent: StateTransform.Ref): void;
    add(transform: StateTransform): this;
    /** Calls Transform.definition.params.areEqual if available, otherwise uses shallowEqual to check if the params changed */
    setParams(ref: StateTransform.Ref, params: any): boolean;
    /** Calls Transform.definition.params.areEqual if available, otherwise uses shallowEqual to check if the params changed */
    setTags(ref: StateTransform.Ref, tags: string | string[] | undefined): boolean;
    setDependsOn(ref: StateTransform.Ref, dependsOn: string | string[] | undefined): boolean;
    assignState(ref: StateTransform.Ref, state?: Partial<StateTransform.State>): StateTransform<import("..").StateTransformer<import("..").StateObject<any, import("..").StateObject.Type<any>>, import("..").StateObject<any, import("..").StateObject.Type<any>>, any>>;
    remove(ref: StateTransform.Ref): StateTransform[];
    asImmutable(): StateTree;
    constructor(tree: StateTree);
}
