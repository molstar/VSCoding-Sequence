"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.idFactory = idFactory;
/** Builds id function returning ids within [firstId, maxId) */
function idFactory(firstId = 0, maxId = Number.MAX_SAFE_INTEGER) {
    let _nextId = firstId;
    return () => {
        const ret = _nextId;
        _nextId = (_nextId + 1) % maxId;
        return ret;
    };
}
