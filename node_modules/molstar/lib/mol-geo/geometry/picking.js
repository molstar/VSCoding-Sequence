/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export var PickingId;
(function (PickingId) {
    function areSame(a, b) {
        return a.objectId === b.objectId && a.instanceId === b.instanceId && a.groupId === b.groupId;
    }
    PickingId.areSame = areSame;
})(PickingId || (PickingId = {}));
