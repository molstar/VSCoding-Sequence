"use strict";
/**
 * Copyright (c) 2019 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.internal = void 0;
const tslib_1 = require("tslib");
const type_1 = require("../type");
const Struct = tslib_1.__importStar(require("./structure-query"));
const symbol_1 = require("../symbol");
const helpers_1 = require("../helpers");
const generator = {
    '@header': 'Generators',
    bundleElement: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({
        // TODO: should we use more universal unit keys? (i.e. based on chain and "operator name")
        groupedUnits: (0, symbol_1.Argument)(type_1.Type.Any), // SortedArray<number>[],
        set: (0, symbol_1.Argument)(type_1.Type.Any), // SortedArray<UnitIndex>
        ranges: (0, symbol_1.Argument)(type_1.Type.Any) // SortedArray<UnitIndex>
    }), type_1.Type.Any), // returns BundleElement
    bundle: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({
        elements: (0, symbol_1.Argument)(type_1.Type.Any) // BundleElement[]
    }), Struct.Types.ElementSelectionQuery, 'A selection with single structure containing represented by the bundle.'),
    // Use with caution as this is not "state saveable"
    // This query should never be used in any State Transform!
    current: (0, helpers_1.symbol)(symbol_1.Arguments.None, Struct.Types.ElementSelectionQuery, 'Current selection provided by the query context. Avoid using this in State Transforms.')
};
exports.internal = {
    '@header': 'Internal Queries',
    generator
};
