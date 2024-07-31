"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateTransforms = void 0;
const tslib_1 = require("tslib");
const Data = tslib_1.__importStar(require("./transforms/data"));
const Misc = tslib_1.__importStar(require("./transforms/misc"));
const Model = tslib_1.__importStar(require("./transforms/model"));
const Volume = tslib_1.__importStar(require("./transforms/volume"));
const Representation = tslib_1.__importStar(require("./transforms/representation"));
const Shape = tslib_1.__importStar(require("./transforms/shape"));
exports.StateTransforms = {
    Data,
    Misc,
    Model,
    Volume,
    Representation,
    Shape
};
