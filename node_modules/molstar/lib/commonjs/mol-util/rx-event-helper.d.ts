/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Subject, BehaviorSubject } from 'rxjs';
export { RxEventHelper };
interface RxEventHelper {
    <T>(): Subject<T>;
    behavior<T>(v: T): BehaviorSubject<T>;
    dispose(): void;
}
declare namespace RxEventHelper {
    function create(): RxEventHelper;
}
