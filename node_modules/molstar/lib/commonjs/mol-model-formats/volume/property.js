"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendedIsoValue = exports.PropertyProvider = void 0;
var PropertyProvider;
(function (PropertyProvider) {
    function create(descriptor) {
        const { name } = descriptor;
        return {
            descriptor,
            get(volume) {
                return volume._propertyData[name];
            },
            set(volume, value) {
                volume.customProperties.add(descriptor);
                volume._propertyData[name] = value;
            }
        };
    }
    PropertyProvider.create = create;
})(PropertyProvider || (exports.PropertyProvider = PropertyProvider = {}));
var RecommendedIsoValue;
(function (RecommendedIsoValue) {
    RecommendedIsoValue.Descriptor = {
        name: 'recommended_iso_value',
    };
    RecommendedIsoValue.Provider = PropertyProvider.create(RecommendedIsoValue.Descriptor);
})(RecommendedIsoValue || (exports.RecommendedIsoValue = RecommendedIsoValue = {}));
