/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export { PropertyProvider };
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
})(PropertyProvider || (PropertyProvider = {}));
//
export { RecommendedIsoValue };
var RecommendedIsoValue;
(function (RecommendedIsoValue) {
    RecommendedIsoValue.Descriptor = {
        name: 'recommended_iso_value',
    };
    RecommendedIsoValue.Provider = PropertyProvider.create(RecommendedIsoValue.Descriptor);
})(RecommendedIsoValue || (RecommendedIsoValue = {}));
