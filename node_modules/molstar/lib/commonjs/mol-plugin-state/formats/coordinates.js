"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltInCoordinatesFormats = exports.NctrajProvider = exports.TrrProvider = exports.XtcProvider = exports.DcdProvider = exports.CoordinatesFormatCategory = void 0;
const transforms_1 = require("../transforms");
const provider_1 = require("./provider");
exports.CoordinatesFormatCategory = 'Coordinates';
const DcdProvider = (0, provider_1.DataFormatProvider)({
    label: 'DCD',
    description: 'DCD',
    category: exports.CoordinatesFormatCategory,
    binaryExtensions: ['dcd'],
    parse: (plugin, data) => {
        const coordinates = plugin.state.data.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Model.CoordinatesFromDcd);
        return coordinates.commit();
    }
});
exports.DcdProvider = DcdProvider;
const XtcProvider = (0, provider_1.DataFormatProvider)({
    label: 'XTC',
    description: 'XTC',
    category: exports.CoordinatesFormatCategory,
    binaryExtensions: ['xtc'],
    parse: (plugin, data) => {
        const coordinates = plugin.state.data.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Model.CoordinatesFromXtc);
        return coordinates.commit();
    }
});
exports.XtcProvider = XtcProvider;
const TrrProvider = (0, provider_1.DataFormatProvider)({
    label: 'TRR',
    description: 'TRR',
    category: exports.CoordinatesFormatCategory,
    binaryExtensions: ['trr'],
    parse: (plugin, data) => {
        const coordinates = plugin.state.data.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Model.CoordinatesFromTrr);
        return coordinates.commit();
    }
});
exports.TrrProvider = TrrProvider;
const NctrajProvider = (0, provider_1.DataFormatProvider)({
    label: 'NCTRAJ',
    description: 'NCTRAJ',
    category: exports.CoordinatesFormatCategory,
    binaryExtensions: ['nc', 'nctraj'],
    parse: (plugin, data) => {
        const coordinates = plugin.state.data.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Model.CoordinatesFromNctraj);
        return coordinates.commit();
    }
});
exports.NctrajProvider = NctrajProvider;
exports.BuiltInCoordinatesFormats = [
    ['dcd', DcdProvider],
    ['xtc', XtcProvider],
    ['trr', TrrProvider],
    ['nctraj', NctrajProvider],
];
