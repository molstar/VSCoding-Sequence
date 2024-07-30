/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { canonicalJsonString } from '../../../../mol-util/json';
import { getParams } from './tree-schema';
/** Run DFS (depth-first search) algorithm on a rooted tree.
 * Runs `visit` function when a node is discovered (before visiting any descendants).
 * Runs `postVisit` function when leaving a node (after all descendants have been visited). */
export function dfs(root, visit, postVisit) {
    return _dfs(root, undefined, visit, postVisit);
}
function _dfs(root, parent, visit, postVisit) {
    var _a;
    if (visit)
        visit(root, parent);
    for (const child of (_a = root.children) !== null && _a !== void 0 ? _a : []) {
        _dfs(child, root, visit, postVisit);
    }
    if (postVisit)
        postVisit(root, parent);
}
/** Convert a tree into a pretty-printed string. */
export function treeToString(tree) {
    let level = 0;
    const lines = [];
    dfs(tree, node => { var _a; return lines.push('  '.repeat(level++) + `- ${node.kind} ${formatObject((_a = node.params) !== null && _a !== void 0 ? _a : {})}`); }, node => level--);
    return lines.join('\n');
}
/** Convert object to a human-friendly string (similar to JSON.stringify but without quoting keys) */
export function formatObject(obj) {
    if (!obj)
        return 'undefined';
    return JSON.stringify(obj).replace(/,("\w+":)/g, ', $1').replace(/"(\w+)":/g, '$1: ');
}
/** Create a copy of a tree node, ignoring children. */
export function copyNodeWithoutChildren(node) {
    return {
        kind: node.kind,
        params: node.params ? { ...node.params } : undefined,
    };
}
/** Create a copy of a tree node, including a shallow copy of children. */
export function copyNode(node) {
    return {
        kind: node.kind,
        params: node.params ? { ...node.params } : undefined,
        children: node.children ? [...node.children] : undefined,
    };
}
/** Create a deep copy of a tree. */
export function copyTree(root) {
    return convertTree(root, {});
}
/** Apply a set of conversion rules to a tree to change to a different schema. */
export function convertTree(root, conversions) {
    const mapping = new Map();
    let convertedRoot;
    dfs(root, (node, parent) => {
        var _a, _b;
        var _c;
        const conversion = conversions[node.kind];
        if (conversion) {
            const convertidos = conversion(node, parent);
            if (!parent && convertidos.length === 0)
                throw new Error('Cannot convert root to empty path');
            let convParent = parent ? mapping.get(parent) : undefined;
            for (const conv of convertidos) {
                if (convParent) {
                    ((_a = convParent.children) !== null && _a !== void 0 ? _a : (convParent.children = [])).push(conv);
                }
                else {
                    convertedRoot = conv;
                }
                convParent = conv;
            }
            mapping.set(node, convParent);
        }
        else {
            const converted = copyNodeWithoutChildren(node);
            if (parent) {
                ((_b = (_c = mapping.get(parent)).children) !== null && _b !== void 0 ? _b : (_c.children = [])).push(converted);
            }
            else {
                convertedRoot = converted;
            }
            mapping.set(node, converted);
        }
    });
    return convertedRoot;
}
/** Create a copy of the tree where twins (siblings of the same kind with the same params) are merged into one node.
 * Applies only to the node kinds listed in `condenseNodes` (or all if undefined) except node kinds in `skipNodes`. */
export function condenseTree(root, condenseNodes, skipNodes) {
    const map = new Map();
    const result = copyTree(root);
    dfs(result, node => {
        var _a, _b, _c;
        map.clear();
        const newChildren = [];
        for (const child of (_a = node.children) !== null && _a !== void 0 ? _a : []) {
            let twin = undefined;
            const doApply = (!condenseNodes || condenseNodes.has(child.kind)) && !(skipNodes === null || skipNodes === void 0 ? void 0 : skipNodes.has(child.kind));
            if (doApply) {
                const key = child.kind + canonicalJsonString(getParams(child));
                twin = map.get(key);
                if (!twin)
                    map.set(key, child);
            }
            if (twin) {
                ((_b = twin.children) !== null && _b !== void 0 ? _b : (twin.children = [])).push(...(_c = child.children) !== null && _c !== void 0 ? _c : []);
            }
            else {
                newChildren.push(child);
            }
        }
        node.children = newChildren;
    });
    return result;
}
/** Create a copy of the tree where missing optional params for each node are added based on `defaults`. */
export function addDefaults(tree, defaults) {
    const rules = {};
    for (const kind in defaults) {
        rules[kind] = node => [{ kind: node.kind, params: { ...defaults[kind], ...node.params } }];
    }
    return convertTree(tree, rules);
}
/** Resolve any URI params in a tree, in place. URI params are those listed in `uriParamNames`.
 * Relative URIs are treated as relative to `baseUri`, which can in turn be relative to the window URL (if available). */
export function resolveUris(tree, baseUri, uriParamNames) {
    dfs(tree, node => {
        const params = node.params;
        if (!params)
            return;
        for (const name in params) {
            if (uriParamNames.includes(name)) {
                const uri = params[name];
                if (typeof uri === 'string') {
                    params[name] = resolveUri(uri, baseUri, windowUrl());
                }
            }
        }
    });
}
/** Resolve a sequence of URI references (relative URIs), where each reference is either absolute or relative to the next one
 * (i.e. the last one is the base URI). Skip any `undefined`.
 * E.g. `resolveUri('./unexpected.png', '/spanish/inquisition/expectations.html', 'https://example.org/spam/spam/spam')`
 * returns `'https://example.org/spanish/inquisition/unexpected.png'`. */
function resolveUri(...refs) {
    let result = undefined;
    for (const ref of refs.reverse()) {
        if (ref !== undefined) {
            if (result === undefined)
                result = ref;
            else
                result = new URL(ref, result).href;
        }
    }
    return result;
}
/** Return URL of the current page when running in a browser; `undefined` when running in Node. */
function windowUrl() {
    return (typeof window !== 'undefined') ? window.location.href : undefined;
}
