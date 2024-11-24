"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltInShapeFormats = exports.PlyProvider = exports.ShapeFormatCategory = void 0;
const transforms_1 = require("../transforms");
const provider_1 = require("./provider");
exports.ShapeFormatCategory = 'Shape';
exports.PlyProvider = (0, provider_1.DataFormatProvider)({
    label: 'PLY',
    description: 'PLY',
    category: exports.ShapeFormatCategory,
    stringExtensions: ['ply'],
    parse: async (plugin, data) => {
        const format = plugin.state.data.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Data.ParsePly, {}, { state: { isGhost: true } });
        const shape = format.apply(transforms_1.StateTransforms.Model.ShapeFromPly);
        await format.commit();
        return { format: format.selector, shape: shape.selector };
    },
    visuals(plugin, data) {
        const repr = plugin.state.data.build()
            .to(data.shape)
            .apply(transforms_1.StateTransforms.Representation.ShapeRepresentation3D);
        return repr.commit();
    }
});
exports.BuiltInShapeFormats = [
    ['ply', exports.PlyProvider],
];
