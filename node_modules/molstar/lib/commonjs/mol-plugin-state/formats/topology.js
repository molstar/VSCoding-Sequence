"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltInTopologyFormats = exports.TopProvider = exports.PrmtopProvider = exports.PsfProvider = exports.TopologyFormatCategory = void 0;
const transforms_1 = require("../transforms");
const provider_1 = require("./provider");
exports.TopologyFormatCategory = 'Topology';
const PsfProvider = (0, provider_1.DataFormatProvider)({
    label: 'PSF',
    description: 'PSF',
    category: exports.TopologyFormatCategory,
    stringExtensions: ['psf'],
    parse: async (plugin, data) => {
        const format = plugin.state.data.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Data.ParsePsf, {}, { state: { isGhost: true } });
        const topology = format.apply(transforms_1.StateTransforms.Model.TopologyFromPsf);
        await format.commit();
        return { format: format.selector, topology: topology.selector };
    }
});
exports.PsfProvider = PsfProvider;
const PrmtopProvider = (0, provider_1.DataFormatProvider)({
    label: 'PRMTOP',
    description: 'PRMTOP',
    category: exports.TopologyFormatCategory,
    stringExtensions: ['prmtop', 'parm7'],
    parse: async (plugin, data) => {
        const format = plugin.state.data.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Data.ParsePrmtop, {}, { state: { isGhost: true } });
        const topology = format.apply(transforms_1.StateTransforms.Model.TopologyFromPrmtop);
        await format.commit();
        return { format: format.selector, topology: topology.selector };
    }
});
exports.PrmtopProvider = PrmtopProvider;
const TopProvider = (0, provider_1.DataFormatProvider)({
    label: 'TOP',
    description: 'TOP',
    category: exports.TopologyFormatCategory,
    stringExtensions: ['top'],
    parse: async (plugin, data) => {
        const format = plugin.state.data.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Data.ParseTop, {}, { state: { isGhost: true } });
        const topology = format.apply(transforms_1.StateTransforms.Model.TopologyFromTop);
        await format.commit();
        return { format: format.selector, topology: topology.selector };
    }
});
exports.TopProvider = TopProvider;
exports.BuiltInTopologyFormats = [
    ['psf', PsfProvider],
    ['prmtop', PrmtopProvider],
    ['top', TopProvider],
];
