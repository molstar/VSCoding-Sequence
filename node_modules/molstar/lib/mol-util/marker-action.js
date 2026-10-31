/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Interval } from '../mol-data/int';
import { BitFlags } from './bit-flags';
import { assertUnreachable } from './type-helpers';
export var MarkerAction;
(function (MarkerAction) {
    MarkerAction[MarkerAction["None"] = 0] = "None";
    MarkerAction[MarkerAction["Highlight"] = 1] = "Highlight";
    MarkerAction[MarkerAction["RemoveHighlight"] = 2] = "RemoveHighlight";
    MarkerAction[MarkerAction["Select"] = 4] = "Select";
    MarkerAction[MarkerAction["Deselect"] = 8] = "Deselect";
    MarkerAction[MarkerAction["Toggle"] = 16] = "Toggle";
    MarkerAction[MarkerAction["Clear"] = 32] = "Clear";
})(MarkerAction || (MarkerAction = {}));
export var MarkerActions;
(function (MarkerActions) {
    MarkerActions.is = BitFlags.has;
    MarkerActions.All = (MarkerAction.Highlight | MarkerAction.RemoveHighlight |
        MarkerAction.Select | MarkerAction.Deselect | MarkerAction.Toggle |
        MarkerAction.Clear);
    MarkerActions.Highlighting = (MarkerAction.Highlight | MarkerAction.RemoveHighlight |
        MarkerAction.Clear);
    MarkerActions.Selecting = (MarkerAction.Select | MarkerAction.Deselect | MarkerAction.Toggle |
        MarkerAction.Clear);
    function isReverse(a, b) {
        return ((a === MarkerAction.Highlight && b === MarkerAction.RemoveHighlight) ||
            (a === MarkerAction.RemoveHighlight && b === MarkerAction.Highlight) ||
            (a === MarkerAction.Select && b === MarkerAction.Deselect) ||
            (a === MarkerAction.Deselect && b === MarkerAction.Select) ||
            (a === MarkerAction.Toggle && b === MarkerAction.Toggle));
    }
    MarkerActions.isReverse = isReverse;
})(MarkerActions || (MarkerActions = {}));
export function setMarkerValue(array, status, count) {
    array.fill(status, 0, count);
}
export function applyMarkerActionAtPosition(array, i, action) {
    switch (action) {
        case MarkerAction.Highlight:
            array[i] |= 1;
            break;
        case MarkerAction.RemoveHighlight:
            array[i] &= ~1;
            break;
        case MarkerAction.Select:
            array[i] |= 2;
            break;
        case MarkerAction.Deselect:
            array[i] &= ~2;
            break;
        case MarkerAction.Toggle:
            array[i] ^= 2;
            break;
        case MarkerAction.Clear:
            array[i] = 0;
            break;
    }
}
export function applyMarkerAction(array, set, action) {
    if (action === MarkerAction.None)
        return false;
    if (Interval.is(set)) {
        const start = Interval.start(set);
        const end = Interval.end(set);
        const viewStart = (start + 3) >> 2;
        const viewEnd = viewStart + ((end - 4 * viewStart) >> 2);
        if (viewEnd <= viewStart) {
            // avoid edge cases with overlapping front/end intervals
            for (let i = start; i < end; ++i) {
                applyMarkerActionAtPosition(array, i, action);
            }
            return true;
        }
        const view = new Uint32Array(array.buffer, 0, array.buffer.byteLength >> 2);
        const frontStart = start;
        const frontEnd = Math.min(4 * viewStart, end);
        const backStart = Math.max(start, 4 * viewEnd);
        const backEnd = end;
        switch (action) {
            case MarkerAction.Highlight:
                for (let i = viewStart; i < viewEnd; ++i)
                    view[i] |= 0x01010101;
                break;
            case MarkerAction.RemoveHighlight:
                for (let i = viewStart; i < viewEnd; ++i)
                    view[i] &= ~0x01010101;
                break;
            case MarkerAction.Select:
                for (let i = viewStart; i < viewEnd; ++i)
                    view[i] |= 0x02020202;
                break;
            case MarkerAction.Deselect:
                for (let i = viewStart; i < viewEnd; ++i)
                    view[i] &= ~0x02020202;
                break;
            case MarkerAction.Toggle:
                for (let i = viewStart; i < viewEnd; ++i)
                    view[i] ^= 0x02020202;
                break;
            case MarkerAction.Clear:
                for (let i = viewStart; i < viewEnd; ++i)
                    view[i] = 0;
                break;
            default:
                assertUnreachable(action);
        }
        for (let i = frontStart; i < frontEnd; ++i) {
            applyMarkerActionAtPosition(array, i, action);
        }
        for (let i = backStart; i < backEnd; ++i) {
            applyMarkerActionAtPosition(array, i, action);
        }
    }
    else {
        switch (action) {
            case MarkerAction.Highlight:
                for (let i = 0, il = set.length; i < il; ++i)
                    array[set[i]] |= 1;
                break;
            case MarkerAction.RemoveHighlight:
                for (let i = 0, il = set.length; i < il; ++i)
                    array[set[i]] &= ~1;
                break;
            case MarkerAction.Select:
                for (let i = 0, il = set.length; i < il; ++i)
                    array[set[i]] |= 2;
                break;
            case MarkerAction.Deselect:
                for (let i = 0, il = set.length; i < il; ++i)
                    array[set[i]] &= ~2;
                break;
            case MarkerAction.Toggle:
                for (let i = 0, il = set.length; i < il; ++i)
                    array[set[i]] ^= 2;
                break;
            case MarkerAction.Clear:
                for (let i = 0, il = set.length; i < il; ++i)
                    array[set[i]] = 0;
                break;
            default:
                assertUnreachable(action);
        }
    }
    return true;
}
export function getMarkerInfo(action, currentStatus) {
    let average = -1;
    let status = -1;
    switch (action) {
        case MarkerAction.Highlight:
            if (currentStatus === 0 || currentStatus === 1) {
                average = 1;
                status = 1;
            }
            else if (currentStatus === 2 || currentStatus === 3) {
                average = 1;
                status = 3;
            }
            else {
                average = 1;
            }
            break;
        case MarkerAction.RemoveHighlight:
            if (currentStatus === 0 || currentStatus === 1) {
                average = 0;
                status = 0;
            }
            else if (currentStatus === 2 || currentStatus === 3) {
                average = 1;
                status = 2;
            }
            break;
        case MarkerAction.Select:
            if (currentStatus === 1 || currentStatus === 3) {
                average = 1;
                status = 3;
            }
            else if (currentStatus === 0 || currentStatus === 2) {
                average = 1;
                status = 2;
            }
            else {
                average = 1;
            }
            break;
        case MarkerAction.Deselect:
            if (currentStatus === 1 || currentStatus === 3) {
                average = 1;
                status = 1;
            }
            else if (currentStatus === 0 || currentStatus === 2) {
                average = 0;
                status = 0;
            }
            break;
        case MarkerAction.Toggle:
            if (currentStatus === 1) {
                average = 1;
                status = 3;
            }
            else if (currentStatus === 2) {
                average = 0;
                status = 0;
            }
            else if (currentStatus === 3) {
                average = 1;
                status = 1;
            }
            else if (currentStatus === 0) {
                average = 1;
                status = 2;
            }
            break;
        case MarkerAction.Clear:
            average = 0;
            status = 0;
            break;
    }
    return { average, status };
}
/**
 * Assumes the action is applied to a partial set that is
 * neither the empty set nor the full set.
 */
export function getPartialMarkerAverage(action, currentStatus) {
    switch (action) {
        case MarkerAction.Highlight:
            return 0.5;
        case MarkerAction.RemoveHighlight:
            if (currentStatus === 0) {
                return 0;
            }
            else if (currentStatus === 2 || currentStatus === 3) {
                return 0.5;
            }
            else { // 1 | -1
                return -1;
            }
        case MarkerAction.Select:
            return 0.5;
        case MarkerAction.Deselect:
            if (currentStatus === 1 || currentStatus === 3) {
                return 0.5;
            }
            else if (currentStatus === 0) {
                return 0;
            }
            else { // 2 | -1
                return -1;
            }
        case MarkerAction.Toggle:
            if (currentStatus === -1) {
                return -1;
            }
            else { // 0 | 1 | 2 | 3
                return 0.5;
            }
        case MarkerAction.Clear:
            if (currentStatus === -1) {
                return -1;
            }
            else if (currentStatus === 0) {
                return 0;
            }
            else { // 1 | 2 | 3
                return 0.5;
            }
        case MarkerAction.None:
            return -1;
        default:
            assertUnreachable(action);
    }
}
