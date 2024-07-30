/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { isTimingMode } from '../../mol-util/debug';
const hasPerformance = (typeof performance !== 'undefined') && !!performance.mark && performance.measure;
const timingEnabled = hasPerformance && isTimingMode;
export var UserTiming;
(function (UserTiming) {
    function startMarkName(task) { return `startTask${task.id}`; }
    function endMarkName(task) { return `endTask${task.id}`; }
    function markStart(task) {
        if (timingEnabled)
            performance.mark(startMarkName(task));
    }
    UserTiming.markStart = markStart;
    function markEnd(task) {
        if (timingEnabled)
            performance.mark(endMarkName(task));
    }
    UserTiming.markEnd = markEnd;
    function measure(task) {
        if (timingEnabled)
            performance.measure(`✳️ ${task.name}`, startMarkName(task), endMarkName(task));
    }
    UserTiming.measure = measure;
})(UserTiming || (UserTiming = {}));
