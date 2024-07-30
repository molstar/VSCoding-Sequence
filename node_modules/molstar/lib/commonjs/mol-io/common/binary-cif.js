"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
const tslib_1 = require("tslib");
var decoder_1 = require("./binary-cif/decoder");
Object.defineProperty(exports, "decode", { enumerable: true, get: function () { return decoder_1.decode; } });
tslib_1.__exportStar(require("./binary-cif/encoding"), exports);
tslib_1.__exportStar(require("./binary-cif/array-encoder"), exports);
tslib_1.__exportStar(require("./binary-cif/classifier"), exports);
