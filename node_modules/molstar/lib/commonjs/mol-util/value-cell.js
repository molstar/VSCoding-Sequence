"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueCell = exports.ValueBox = exports.ValueRef = void 0;
const id_factory_1 = require("./id-factory");
var ValueRef;
(function (ValueRef) {
    function create(ref) { return { ref }; }
    ValueRef.create = create;
    function set(ref, value) { ref.ref = value; return ref; }
    ValueRef.set = set;
})(ValueRef || (exports.ValueRef = ValueRef = {}));
const getNextId = (0, id_factory_1.idFactory)(0, 0x7FFFFFFF);
var ValueBox;
(function (ValueBox) {
    function create(value, metadata) {
        return { id: getNextId(), version: 0, value, metadata: metadata };
    }
    ValueBox.create = create;
    /** The box.metadata is carried over from the old box */
    function withValue(box, value) {
        return { id: box.id, version: box.version + 1, value, metadata: box.metadata };
    }
    ValueBox.withValue = withValue;
})(ValueBox || (exports.ValueBox = ValueBox = {}));
var ValueCell;
(function (ValueCell) {
    function create(value, metadata) {
        return ValueRef.create(ValueBox.create(value, metadata));
    }
    ValueCell.create = create;
    /** The box.metadata is carried over from the old box */
    function update(cell, value) {
        return ValueRef.set(cell, ValueBox.withValue(cell.ref, value));
    }
    ValueCell.update = update;
    function set(cell, box) {
        return ValueRef.set(cell, box);
    }
    ValueCell.set = set;
    /** Updates the cell if the value is has changed, comparing by reference */
    function updateIfChanged(cell, value) {
        return cell.ref.value !== value ? update(cell, value) : cell;
    }
    ValueCell.updateIfChanged = updateIfChanged;
})(ValueCell || (exports.ValueCell = ValueCell = {}));
