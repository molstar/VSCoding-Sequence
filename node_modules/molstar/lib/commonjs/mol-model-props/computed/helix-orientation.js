"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixOrientationProvider = exports.HelixOrientationParams = void 0;
const custom_property_1 = require("../../mol-model/custom-property");
const custom_model_property_1 = require("../common/custom-model-property");
const helix_orientation_1 = require("./helix-orientation/helix-orientation");
exports.HelixOrientationParams = {};
exports.HelixOrientationProvider = custom_model_property_1.CustomModelProperty.createProvider({
    label: 'Helix Orientation',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'molstar_helix_orientation'
    }),
    type: 'dynamic',
    defaultParams: {},
    getParams: () => ({}),
    isApplicable: (data) => true,
    obtain: async (ctx, data) => {
        return { value: (0, helix_orientation_1.calcHelixOrientation)(data) };
    }
});
