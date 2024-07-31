/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { AllRequired, DefaultsFor, ParamsSchema, ValuesFor } from './params-schema';
/** Tree node without children */
export type Node<TKind extends string = string, TParams extends {} = {}> = {} extends TParams ? {
    kind: TKind;
    params?: TParams;
} : {
    kind: TKind;
    params: TParams;
};
/** Kind type for a tree node */
export type Kind<TNode extends Node> = TNode['kind'];
/** Params type for a tree node */
export type Params<TNode extends Node> = NonNullable<TNode['params']>;
/** Tree (i.e. a node with optional children) where the root node is of type `TRoot` and other nodes are of type `TNode` */
export type Tree<TNode extends Node<string, {}> = Node<string, {}>, TRoot extends TNode = TNode> = TRoot & {
    children?: Tree<TNode, TNode>[];
};
/** Type of any subtree that can occur within given `TTree` tree type */
export type SubTree<TTree extends Tree> = NonNullable<TTree['children']>[number];
/** Type of any subtree that can occur within given `TTree` tree type and has kind type `TKind` */
export type SubTreeOfKind<TTree extends Tree, TKind extends Kind<SubTree<TTree>> = Kind<SubTree<TTree>>> = RootOfKind<SubTree<TTree>, TKind>;
type RootOfKind<TTree extends Tree, TKind extends Kind<TTree>> = Extract<TTree, Tree<any, Node<TKind>>>;
/** Params type for a given kind type within a tree */
export type ParamsOfKind<TTree extends Tree, TKind extends Kind<SubTree<TTree>> = Kind<SubTree<TTree>>> = NonNullable<SubTreeOfKind<TTree, TKind>['params']>;
/** Get params from a tree node */
export declare function getParams<TNode extends Node>(node: TNode): Params<TNode>;
/** Get children from a tree node */
export declare function getChildren<TTree extends Tree>(tree: TTree): SubTree<TTree>[];
type ParamsSchemas = {
    [kind: string]: ParamsSchema;
};
/** Definition of tree type, specifying allowed node kinds, types of their params, required kind for the root, and allowed parent-child kind combinations */
export interface TreeSchema<TParamsSchemas extends ParamsSchemas = ParamsSchemas, TRootKind extends keyof TParamsSchemas = string> {
    /** Required kind of the root node */
    rootKind: TRootKind;
    /** Definition of allowed node kinds */
    nodes: {
        [kind in keyof TParamsSchemas]: {
            /** Params schema for this node kind */
            params: TParamsSchemas[kind];
            /** Documentation for this node kind */
            description?: string;
            /** Node kinds that can serve as parent for this node kind (`undefined` means the parent can be of any kind) */
            parent?: (string & keyof TParamsSchemas)[];
        };
    };
}
export declare function TreeSchema<P extends ParamsSchemas = ParamsSchemas, R extends keyof P = string>(schema: TreeSchema<P, R>): TreeSchema<P, R>;
/** ParamsSchemas per node kind */
type ParamsSchemasOf<TTreeSchema extends TreeSchema> = TTreeSchema extends TreeSchema<infer TParamsSchema, any> ? TParamsSchema : never;
/** Variation of params schemas where all param fields are required */
type ParamsSchemasWithAllRequired<TParamsSchemas extends ParamsSchemas> = {
    [kind in keyof TParamsSchemas]: AllRequired<TParamsSchemas[kind]>;
};
/** Variation of a tree schema where all param fields are required */
export type TreeSchemaWithAllRequired<TTreeSchema extends TreeSchema> = TreeSchema<ParamsSchemasWithAllRequired<ParamsSchemasOf<TTreeSchema>>, TTreeSchema['rootKind']>;
export declare function TreeSchemaWithAllRequired<TTreeSchema extends TreeSchema>(schema: TTreeSchema): TreeSchemaWithAllRequired<TTreeSchema>;
/** Type of tree node which can occur as the root of a tree conforming to tree schema `TTreeSchema` */
export type RootFor<TTreeSchema extends TreeSchema> = NodeFor<TTreeSchema, TTreeSchema['rootKind']>;
/** Type of tree node which can occur anywhere in a tree conforming to tree schema `TTreeSchema`,
 * optionally narrowing down to a given node kind */
export type NodeFor<TTreeSchema extends TreeSchema, TKind extends keyof ParamsSchemasOf<TTreeSchema> = keyof ParamsSchemasOf<TTreeSchema>> = {
    [key in keyof ParamsSchemasOf<TTreeSchema>]: Node<key & string, ValuesFor<ParamsSchemasOf<TTreeSchema>[key]>>;
}[TKind];
/** Type of tree which conforms to tree schema `TTreeSchema` */
export type TreeFor<TTreeSchema extends TreeSchema> = Tree<NodeFor<TTreeSchema>, RootFor<TTreeSchema> & NodeFor<TTreeSchema>>;
/** Type of default parameter values for each node kind in a tree schema `TTreeSchema` */
export type DefaultsForTree<TTreeSchema extends TreeSchema> = {
    [kind in keyof TTreeSchema['nodes']]: DefaultsFor<TTreeSchema['nodes'][kind]['params']>;
};
/** Return `undefined` if a tree conforms to the given schema,
 * return validation issues (as a list of lines) if it does not conform.
 * If `options.requireAll`, all parameters (including optional) must have a value provided.
 * If `options.noExtra` is true, presence of any extra parameters is treated as an issue.
 * If `options.anyRoot` is true, the kind of the root node is not enforced.
 */
export declare function treeValidationIssues(schema: TreeSchema, tree: Tree, options?: {
    requireAll?: boolean;
    noExtra?: boolean;
    anyRoot?: boolean;
    parent?: string;
}): string[] | undefined;
/** Validate a tree against the given schema.
 * Do nothing if OK; print validation issues on console and throw an error is the tree does not conform.
 * Include `label` in the printed output. */
export declare function validateTree(schema: TreeSchema, tree: Tree, label: string): void;
/** Return documentation for a tree schema as plain text */
export declare function treeSchemaToString<S extends TreeSchema>(schema: S, defaults?: DefaultsForTree<S>): string;
/** Return documentation for a tree schema as markdown text */
export declare function treeSchemaToMarkdown<S extends TreeSchema>(schema: S, defaults?: DefaultsForTree<S>): string;
export {};
