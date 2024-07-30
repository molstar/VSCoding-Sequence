/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Gianluca Tomasello <giagitom@gmail.com>
 *
 * Adapted from https://github.com/gwtw/ts-fibonacci-heap, Copyright (c) 2014 Daniel Imms, MIT
 */
interface INode<K, V> {
    key: K;
    value?: V;
}
type CompareFunction<K, V> = (a: INode<K, V>, b: INode<K, V>) => number;
declare class Node<K, V> implements INode<K, V> {
    key: K;
    value: V | undefined;
    prev: Node<K, V>;
    next: Node<K, V>;
    parent: Node<K, V> | null;
    child: Node<K, V> | null;
    degree: number;
    isMarked: boolean;
    constructor(key: K, value?: V);
}
/**
 * A Fibonacci heap data structure with a key and optional value.
*/
export declare class FibonacciHeap<K, V> {
    private _minNode;
    private _nodeCount;
    private _compare;
    constructor(compare?: CompareFunction<K, V>);
    /**
   * Clears the heap's data, making it an empty heap.
   */
    clear(): void;
    /**
   * Decreases a key of a node.
   * @param node The node to decrease the key of.
   * @param newKey The new key to assign to the node.
   */
    decreaseKey(node: Node<K, V>, newKey: K): void;
    /**
   * Deletes a node.
   * @param node The node to delete.
   */
    delete(node: Node<K, V>): void;
    /**
   * Extracts and returns the minimum node from the heap.
   * @return The heap's minimum node or null if the heap is empty.
   */
    extractMinimum(): Node<K, V> | null;
    /**
   * Returns the minimum node from the heap.
   * @return The heap's minimum node or null if the heap is empty.
   */
    findMinimum(): Node<K, V> | null;
    /**
   * Inserts a new key-value pair into the heap.
   * @param key The key to insert.
   * @param value The value to insert.
   * @return node The inserted node.
   */
    insert(key: K, value?: V): Node<K, V>;
    /**
   * @return Whether the heap is empty.
   */
    isEmpty(): boolean;
    /**
   * @return The size of the heap.
   */
    size(): number;
    /**
   * Joins another heap to this heap.
   * @param other The other heap.
   */
    union(other: FibonacciHeap<K, V>): void;
    /**
   * Compares two nodes with each other.
   * @param a The first key to compare.
   * @param b The second key to compare.
   * @return -1, 0 or 1 if a < b, a == b or a > b respectively.
   */
    private _defaultCompare;
    /**
   * Cut the link between a node and its parent, moving the node to the root list.
   * @param node The node being cut.
   * @param parent The parent of the node being cut.
   * @param minNode The minimum node in the root list.
   * @return The heap's new minimum node.
   */
    private _cut;
    /**
   * Perform a cascading cut on a node; mark the node if it is not marked,
   * otherwise cut the node and perform a cascading cut on its parent.
   * @param node The node being considered to be cut.
   * @param minNode The minimum node in the root list.
   * @return The heap's new minimum node.
   */
    private _cascadingCut;
    /**
   * Merge all trees of the same order together until there are no two trees of
   * the same order.
   * @param minNode The current minimum node.
   * @return The new minimum node.
   */
    private _consolidate;
    /**
   * Removes a node from a node list.
   * @param node The node to remove.
   */
    private _removeNodeFromList;
    /**
   * Links two heaps of the same order together.
   *
   * @private
   * @param max The heap with the larger root.
   * @param min The heap with the smaller root.
   */
    private _linkHeaps;
    /**
   * Merge two lists of nodes together.
   *
   * @private
   * @param a The first list to merge.
   * @param b The second list to merge.
   * @return The new minimum node from the two lists.
   */
    private _mergeLists;
    /**
   * Gets the size of a node list.
   * @param node A node within the node list.
   * @return The size of the node list.
   */
    private _getNodeListSize;
}
export {};
