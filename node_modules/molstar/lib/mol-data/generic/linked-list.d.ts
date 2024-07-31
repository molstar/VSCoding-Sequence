/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
interface LinkedList<T> {
    readonly count: number;
    readonly first: LinkedList.Node<T> | null;
    readonly last: LinkedList.Node<T> | null;
    addFirst(value: T): LinkedList.Node<T>;
    addLast(value: T): LinkedList.Node<T>;
    remove(node: LinkedList.Node<T>): void;
    removeFirst(): T | undefined;
    removeLast(): T | undefined;
    find(value: T): LinkedList.Node<T> | undefined;
}
declare function LinkedList<T>(): LinkedList<T>;
declare namespace LinkedList {
    interface Node<T> {
        previous: Node<T> | null;
        next: Node<T> | null;
        inList: boolean;
        value: T;
    }
}
export { LinkedList };
