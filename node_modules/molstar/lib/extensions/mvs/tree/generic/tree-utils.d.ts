/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { DefaultsForTree, Kind, SubTree, SubTreeOfKind, Tree, TreeFor, TreeSchema, TreeSchemaWithAllRequired } from './tree-schema';
/** Run DFS (depth-first search) algorithm on a rooted tree.
 * Runs `visit` function when a node is discovered (before visiting any descendants).
 * Runs `postVisit` function when leaving a node (after all descendants have been visited). */
export declare function dfs<TTree extends Tree>(root: TTree, visit?: (node: SubTree<TTree>, parent?: SubTree<TTree>) => any, postVisit?: (node: SubTree<TTree>, parent?: SubTree<TTree>) => any): void;
/** Convert a tree into a pretty-printed string. */
export declare function treeToString(tree: Tree): string;
/** Convert object to a human-friendly string (similar to JSON.stringify but without quoting keys) */
export declare function formatObject(obj: {} | undefined): string;
/** Create a copy of a tree node, ignoring children. */
export declare function copyNodeWithoutChildren<TTree extends Tree>(node: TTree): TTree;
/** Create a copy of a tree node, including a shallow copy of children. */
export declare function copyNode<TTree extends Tree>(node: TTree): TTree;
/** Create a deep copy of a tree. */
export declare function copyTree<T extends Tree>(root: T): T;
/** Set of rules for converting a tree of one schema into a different schema.
 * Each rule defines how to convert a node of a specific kind, e.g.
 * `{A: node => [], B: node => [{kind: 'X',...}], C: node => [{kind: 'Y',...}, {kind: 'Z',...}]}`:
 * nodes of kind `A` will be deleted (their children moved to parent),
 * nodes of kind `B` will be converted to kind `X`,
 * nodes of kind `C` will be converted to `Y` with a child `Z` (original children moved to `Z`),
 * nodes of other kinds will just be copied. */
export type ConversionRules<A extends Tree, B extends Tree> = {
    [kind in Kind<SubTree<A>>]?: (node: SubTreeOfKind<A, kind>, parent?: SubTree<A>) => SubTree<B>[];
};
/** Apply a set of conversion rules to a tree to change to a different schema. */
export declare function convertTree<A extends Tree, B extends Tree>(root: A, conversions: ConversionRules<A, B>): SubTree<B>;
/** Create a copy of the tree where twins (siblings of the same kind with the same params) are merged into one node.
 * Applies only to the node kinds listed in `condenseNodes` (or all if undefined) except node kinds in `skipNodes`. */
export declare function condenseTree<T extends Tree>(root: T, condenseNodes?: Set<Kind<Tree>>, skipNodes?: Set<Kind<Tree>>): T;
/** Create a copy of the tree where missing optional params for each node are added based on `defaults`. */
export declare function addDefaults<S extends TreeSchema>(tree: TreeFor<S>, defaults: DefaultsForTree<S>): TreeFor<TreeSchemaWithAllRequired<S>>;
/** Resolve any URI params in a tree, in place. URI params are those listed in `uriParamNames`.
 * Relative URIs are treated as relative to `baseUri`, which can in turn be relative to the window URL (if available). */
export declare function resolveUris<T extends Tree>(tree: T, baseUri: string, uriParamNames: string[]): void;
