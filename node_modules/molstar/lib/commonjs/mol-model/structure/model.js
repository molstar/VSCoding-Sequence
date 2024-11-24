"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureSequence = exports.Symmetry = exports.Types = exports.Model = void 0;
const tslib_1 = require("tslib");
const model_1 = require("./model/model");
Object.defineProperty(exports, "Model", { enumerable: true, get: function () { return model_1.Model; } });
const Types = tslib_1.__importStar(require("./model/types"));
exports.Types = Types;
const symmetry_1 = require("./model/properties/symmetry");
Object.defineProperty(exports, "Symmetry", { enumerable: true, get: function () { return symmetry_1.Symmetry; } });
const sequence_1 = require("./model/properties/sequence");
Object.defineProperty(exports, "StructureSequence", { enumerable: true, get: function () { return sequence_1.StructureSequence; } });
tslib_1.__exportStar(require("./model/properties/custom/indexed"), exports);
tslib_1.__exportStar(require("./model/indexing"), exports);
