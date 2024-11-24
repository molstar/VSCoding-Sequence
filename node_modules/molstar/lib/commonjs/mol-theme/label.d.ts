/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StructureElement, Bond } from '../mol-model/structure';
import { Loci } from '../mol-model/loci';
export type LabelGranularity = 'element' | 'conformation' | 'residue' | 'chain' | 'structure';
export declare const DefaultLabelOptions: {
    granularity: LabelGranularity;
    condensed: boolean;
    reverse: boolean;
    countsOnly: boolean;
    hidePrefix: boolean;
    htmlStyling: boolean;
};
export type LabelOptions = typeof DefaultLabelOptions;
export declare function lociLabel(loci: Loci, options?: Partial<LabelOptions>): string;
export declare function structureElementStatsLabel(stats: StructureElement.Stats, options?: Partial<LabelOptions>): string;
export declare function structureElementLociLabelMany(locis: StructureElement.Loci[], options?: Partial<LabelOptions>): string;
export declare function bondLabel(bond: Bond.Location, options?: Partial<LabelOptions>): string;
export declare function bundleLabel(bundle: Loci.Bundle<any>, options?: Partial<LabelOptions>): string;
export declare function _bundleLabel(bundle: Loci.Bundle<any>, options: LabelOptions): string;
export declare function elementLabel(location: StructureElement.Location, options?: Partial<LabelOptions>): string;
export declare function distanceLabel(pair: Loci.Bundle<2>, options?: Partial<LabelOptions & {
    measureOnly: boolean;
    unitLabel: string;
}>): string;
export declare function angleLabel(triple: Loci.Bundle<3>, options?: Partial<LabelOptions & {
    measureOnly: boolean;
}>): string;
export declare function dihedralLabel(quad: Loci.Bundle<4>, options?: Partial<LabelOptions & {
    measureOnly: boolean;
}>): string;
