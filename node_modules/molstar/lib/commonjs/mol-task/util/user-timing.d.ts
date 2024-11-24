/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../task';
export declare namespace UserTiming {
    function markStart(task: Task<any>): void;
    function markEnd(task: Task<any>): void;
    function measure(task: Task<any>): void;
}
