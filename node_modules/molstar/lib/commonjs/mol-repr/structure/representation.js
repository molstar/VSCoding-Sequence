"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsVisual = exports.UnitsRepresentation = exports.ComplexVisual = exports.ComplexRepresentation = exports.StructureRepresentationStateBuilder = void 0;
exports.StructureRepresentationProvider = StructureRepresentationProvider;
const representation_1 = require("../representation");
exports.StructureRepresentationStateBuilder = {
    create: () => {
        return {
            ...representation_1.Representation.createState(),
            unitTransforms: null,
            unitTransformsVersion: -1
        };
    },
    update: (state, update) => {
        representation_1.Representation.updateState(state, update);
        if (update.unitTransforms !== undefined)
            state.unitTransforms = update.unitTransforms;
    }
};
function StructureRepresentationProvider(p) { return p; }
//
var complex_representation_1 = require("./complex-representation");
Object.defineProperty(exports, "ComplexRepresentation", { enumerable: true, get: function () { return complex_representation_1.ComplexRepresentation; } });
var complex_visual_1 = require("./complex-visual");
Object.defineProperty(exports, "ComplexVisual", { enumerable: true, get: function () { return complex_visual_1.ComplexVisual; } });
var units_representation_1 = require("./units-representation");
Object.defineProperty(exports, "UnitsRepresentation", { enumerable: true, get: function () { return units_representation_1.UnitsRepresentation; } });
var units_visual_1 = require("./units-visual");
Object.defineProperty(exports, "UnitsVisual", { enumerable: true, get: function () { return units_visual_1.UnitsVisual; } });
