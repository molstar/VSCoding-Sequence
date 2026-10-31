"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyCarbohydrates = void 0;
const EmptyArray = [];
exports.EmptyCarbohydrates = {
    links: EmptyArray,
    terminalLinks: EmptyArray,
    elements: EmptyArray,
    partialElements: EmptyArray,
    getElementIndices: () => EmptyArray,
    getLinkIndices: () => EmptyArray,
    getTerminalLinkIndices: () => EmptyArray,
};
