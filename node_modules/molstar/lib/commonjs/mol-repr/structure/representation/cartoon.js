"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartoonRepresentationProvider = exports.CartoonParams = void 0;
exports.getCartoonParams = getCartoonParams;
exports.CartoonRepresentation = CartoonRepresentation;
const structure_1 = require("../../../mol-model/structure");
const representation_1 = require("../../../mol-repr/representation");
const param_definition_1 = require("../../../mol-util/param-definition");
const representation_2 = require("../representation");
const units_representation_1 = require("../units-representation");
const nucleotide_block_mesh_1 = require("../visual/nucleotide-block-mesh");
const nucleotide_ring_mesh_1 = require("../visual/nucleotide-ring-mesh");
const nucleotide_atomic_ring_fill_1 = require("../visual/nucleotide-atomic-ring-fill");
const nucleotide_atomic_bond_1 = require("../visual/nucleotide-atomic-bond");
const nucleotide_atomic_element_1 = require("../visual/nucleotide-atomic-element");
const polymer_direction_wedge_1 = require("../visual/polymer-direction-wedge");
const polymer_gap_cylinder_1 = require("../visual/polymer-gap-cylinder");
const polymer_trace_mesh_1 = require("../visual/polymer-trace-mesh");
const secondary_structure_1 = require("../../../mol-model-props/computed/secondary-structure");
const helix_orientation_1 = require("../../../mol-model-props/computed/helix-orientation");
const base_1 = require("../../../mol-geo/geometry/base");
const CartoonVisuals = {
    'polymer-trace': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Polymer trace mesh', ctx, getParams, polymer_trace_mesh_1.PolymerTraceVisual),
    'polymer-gap': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Polymer gap cylinder', ctx, getParams, polymer_gap_cylinder_1.PolymerGapVisual),
    'nucleotide-block': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Nucleotide block mesh', ctx, getParams, nucleotide_block_mesh_1.NucleotideBlockVisual),
    'nucleotide-ring': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Nucleotide ring mesh', ctx, getParams, nucleotide_ring_mesh_1.NucleotideRingVisual),
    'nucleotide-atomic-ring-fill': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Nucleotide atomic ring fill', ctx, getParams, nucleotide_atomic_ring_fill_1.NucleotideAtomicRingFillVisual),
    'nucleotide-atomic-bond': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Nucleotide atomic bond', ctx, getParams, nucleotide_atomic_bond_1.NucleotideAtomicBondVisual),
    'nucleotide-atomic-element': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Nucleotide atomic element', ctx, getParams, nucleotide_atomic_element_1.NucleotideAtomicElementVisual),
    'direction-wedge': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Polymer direction wedge', ctx, getParams, polymer_direction_wedge_1.PolymerDirectionVisual),
};
exports.CartoonParams = {
    ...polymer_trace_mesh_1.PolymerTraceParams,
    ...polymer_gap_cylinder_1.PolymerGapParams,
    ...nucleotide_block_mesh_1.NucleotideBlockParams,
    ...nucleotide_ring_mesh_1.NucleotideRingParams,
    ...nucleotide_atomic_bond_1.NucleotideAtomicBondParams,
    ...nucleotide_atomic_element_1.NucleotideAtomicElementParams,
    ...nucleotide_atomic_ring_fill_1.NucleotideAtomicRingFillParams,
    ...polymer_direction_wedge_1.PolymerDirectionParams,
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['polymer-trace', 'polymer-gap', 'nucleotide-ring', 'nucleotide-atomic-ring-fill', 'nucleotide-atomic-bond', 'nucleotide-atomic-element'], param_definition_1.ParamDefinition.objectToOptions(CartoonVisuals)),
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(2, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
    density: param_definition_1.ParamDefinition.Numeric(0.1, { min: 0, max: 1, step: 0.01 }, base_1.BaseGeometry.ShadingCategory),
    colorMode: param_definition_1.ParamDefinition.Select('default', param_definition_1.ParamDefinition.arrayToOptions(['default', 'interpolate']), { ...base_1.BaseGeometry.ShadingCategory, isHidden: true }),
};
function getCartoonParams(ctx, structure) {
    const params = param_definition_1.ParamDefinition.clone(exports.CartoonParams);
    let hasNucleotides = false;
    let hasGaps = false;
    structure.units.forEach(u => {
        if (!hasNucleotides && structure_1.Unit.isAtomic(u) && u.nucleotideElements.length)
            hasNucleotides = true;
        if (!hasGaps && u.gapElements.length)
            hasGaps = true;
    });
    params.visuals.defaultValue = ['polymer-trace'];
    if (hasNucleotides)
        params.visuals.defaultValue.push('nucleotide-ring');
    if (hasGaps)
        params.visuals.defaultValue.push('polymer-gap');
    return params;
}
function CartoonRepresentation(ctx, getParams) {
    return representation_1.Representation.createMulti('Cartoon', ctx, getParams, representation_2.StructureRepresentationStateBuilder, CartoonVisuals);
}
exports.CartoonRepresentationProvider = (0, representation_2.StructureRepresentationProvider)({
    name: 'cartoon',
    label: 'Cartoon',
    description: 'Displays ribbons, planks, tubes smoothly following the trace atoms of polymers.',
    factory: CartoonRepresentation,
    getParams: getCartoonParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.CartoonParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.polymerResidueCount > 0,
    ensureCustomProperties: {
        attach: async (ctx, structure) => {
            await secondary_structure_1.SecondaryStructureProvider.attach(ctx, structure, void 0, true);
            for (const m of structure.models) {
                await helix_orientation_1.HelixOrientationProvider.attach(ctx, m, void 0, true);
            }
        },
        detach: (data) => {
            secondary_structure_1.SecondaryStructureProvider.ref(data, false);
            for (const m of data.models) {
                helix_orientation_1.HelixOrientationProvider.ref(m, false);
            }
        }
    }
});
