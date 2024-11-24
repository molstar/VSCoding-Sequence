/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { Unit } from '../../../mol-model/structure';
import { Representation } from '../../../mol-repr/representation';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder } from '../representation';
import { UnitsRepresentation } from '../units-representation';
import { NucleotideBlockParams, NucleotideBlockVisual } from '../visual/nucleotide-block-mesh';
import { NucleotideRingParams, NucleotideRingVisual } from '../visual/nucleotide-ring-mesh';
import { NucleotideAtomicRingFillParams, NucleotideAtomicRingFillVisual } from '../visual/nucleotide-atomic-ring-fill';
import { NucleotideAtomicBondParams, NucleotideAtomicBondVisual } from '../visual/nucleotide-atomic-bond';
import { NucleotideAtomicElementParams, NucleotideAtomicElementVisual } from '../visual/nucleotide-atomic-element';
import { PolymerDirectionParams, PolymerDirectionVisual } from '../visual/polymer-direction-wedge';
import { PolymerGapParams, PolymerGapVisual } from '../visual/polymer-gap-cylinder';
import { PolymerTraceParams, PolymerTraceVisual } from '../visual/polymer-trace-mesh';
import { SecondaryStructureProvider } from '../../../mol-model-props/computed/secondary-structure';
import { HelixOrientationProvider } from '../../../mol-model-props/computed/helix-orientation';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
const CartoonVisuals = {
    'polymer-trace': (ctx, getParams) => UnitsRepresentation('Polymer trace mesh', ctx, getParams, PolymerTraceVisual),
    'polymer-gap': (ctx, getParams) => UnitsRepresentation('Polymer gap cylinder', ctx, getParams, PolymerGapVisual),
    'nucleotide-block': (ctx, getParams) => UnitsRepresentation('Nucleotide block mesh', ctx, getParams, NucleotideBlockVisual),
    'nucleotide-ring': (ctx, getParams) => UnitsRepresentation('Nucleotide ring mesh', ctx, getParams, NucleotideRingVisual),
    'nucleotide-atomic-ring-fill': (ctx, getParams) => UnitsRepresentation('Nucleotide atomic ring fill', ctx, getParams, NucleotideAtomicRingFillVisual),
    'nucleotide-atomic-bond': (ctx, getParams) => UnitsRepresentation('Nucleotide atomic bond', ctx, getParams, NucleotideAtomicBondVisual),
    'nucleotide-atomic-element': (ctx, getParams) => UnitsRepresentation('Nucleotide atomic element', ctx, getParams, NucleotideAtomicElementVisual),
    'direction-wedge': (ctx, getParams) => UnitsRepresentation('Polymer direction wedge', ctx, getParams, PolymerDirectionVisual),
};
export const CartoonParams = {
    ...PolymerTraceParams,
    ...PolymerGapParams,
    ...NucleotideBlockParams,
    ...NucleotideRingParams,
    ...NucleotideAtomicBondParams,
    ...NucleotideAtomicElementParams,
    ...NucleotideAtomicRingFillParams,
    ...PolymerDirectionParams,
    sizeFactor: PD.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    visuals: PD.MultiSelect(['polymer-trace', 'polymer-gap', 'nucleotide-ring', 'nucleotide-atomic-ring-fill', 'nucleotide-atomic-bond', 'nucleotide-atomic-element'], PD.objectToOptions(CartoonVisuals)),
    bumpFrequency: PD.Numeric(2, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory),
    density: PD.Numeric(0.1, { min: 0, max: 1, step: 0.01 }, BaseGeometry.ShadingCategory),
    colorMode: PD.Select('default', PD.arrayToOptions(['default', 'interpolate']), { ...BaseGeometry.ShadingCategory, isHidden: true }),
};
export function getCartoonParams(ctx, structure) {
    const params = PD.clone(CartoonParams);
    let hasNucleotides = false;
    let hasGaps = false;
    structure.units.forEach(u => {
        if (!hasNucleotides && Unit.isAtomic(u) && u.nucleotideElements.length)
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
export function CartoonRepresentation(ctx, getParams) {
    return Representation.createMulti('Cartoon', ctx, getParams, StructureRepresentationStateBuilder, CartoonVisuals);
}
export const CartoonRepresentationProvider = StructureRepresentationProvider({
    name: 'cartoon',
    label: 'Cartoon',
    description: 'Displays ribbons, planks, tubes smoothly following the trace atoms of polymers.',
    factory: CartoonRepresentation,
    getParams: getCartoonParams,
    defaultValues: PD.getDefaultValues(CartoonParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.polymerResidueCount > 0,
    ensureCustomProperties: {
        attach: async (ctx, structure) => {
            await SecondaryStructureProvider.attach(ctx, structure, void 0, true);
            for (const m of structure.models) {
                await HelixOrientationProvider.attach(ctx, m, void 0, true);
            }
        },
        detach: (data) => {
            SecondaryStructureProvider.ref(data, false);
            for (const m of data.models) {
                HelixOrientationProvider.ref(m, false);
            }
        }
    }
});
