/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { CustomProperty } from '../../../mol-model-props/common/custom-property';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { Model, ElementIndex, ResidueIndex } from '../../../mol-model/structure/model';
import { IntAdjacencyGraph } from '../../../mol-math/graph';
import { CustomStructureProperty } from '../../../mol-model-props/common/custom-structure-property';
import { InterUnitGraph } from '../../../mol-math/graph/inter-unit-graph';
import { UnitIndex } from '../../../mol-model/structure/structure/element/element';
import { IntMap } from '../../../mol-data/int';
import { QuerySymbolRuntime } from '../../../mol-script/runtime/query/compiler';
import { Asset } from '../../../mol-util/assets';
export { ValidationReport };
interface ValidationReport {
    /**
     * Real Space R (RSRZ) for residues,
     * defined for polymer residues in X-ray structures
     */
    rsrz: Map<ResidueIndex, number>;
    /**
     * Real Space Correlation Coefficient (RSCC) for residues,
     * defined for each non-polymer residue in X-ray structures
     */
    rscc: Map<ResidueIndex, number>;
    /**
     * Random Coil Index (RCI) for residues,
     * defined for polymer residues in NMR structures
     */
    rci: Map<ResidueIndex, number>;
    /**
     * Set of geometry issues for residues
     */
    geometryIssues: Map<ResidueIndex, Set<string>>;
    /**
     * Set of bond outliers
     */
    bondOutliers: {
        index: Map<ElementIndex, number[]>;
        data: {
            tag: string;
            atomA: ElementIndex;
            atomB: ElementIndex;
            z: number;
            mean: number;
            obs: number;
            stdev: number;
        }[];
    };
    /**
     * Set of angle outliers
     */
    angleOutliers: {
        index: Map<ElementIndex, number[]>;
        data: {
            tag: string;
            atomA: ElementIndex;
            atomB: ElementIndex;
            atomC: ElementIndex;
            z: number;
            mean: number;
            obs: number;
            stdev: number;
        }[];
    };
    /**
     * Clashes between atoms, including id, magniture and distance
     */
    clashes: IntAdjacencyGraph<ElementIndex, {
        readonly id: ArrayLike<number>;
        readonly magnitude: ArrayLike<number>;
        readonly distance: ArrayLike<number>;
    }>;
}
declare namespace ValidationReport {
    enum Tag {
        DensityFit = "rcsb-density-fit",
        GeometryQuality = "rcsb-geometry-quality",
        RandomCoilIndex = "rcsb-random-coil-index",
        Clashes = "rcsb-clashes"
    }
    const DefaultBaseUrl = "https://files.rcsb.org/pub/pdb/validation_reports";
    function getEntryUrl(pdbId: string, baseUrl: string): string;
    function isApplicable(model?: Model): boolean;
    function fromXml(xml: XMLDocument, model: Model): ValidationReport;
    function fetch(ctx: CustomProperty.Context, model: Model, props: ServerSourceProps): Promise<CustomProperty.Data<ValidationReport>>;
    function open(ctx: CustomProperty.Context, model: Model, props: FileSourceProps): Promise<CustomProperty.Data<ValidationReport>>;
    function obtain(ctx: CustomProperty.Context, model: Model, props: ValidationReportProps): Promise<CustomProperty.Data<ValidationReport>>;
    const symbols: {
        hasClash: QuerySymbolRuntime;
        issueCount: QuerySymbolRuntime;
    };
}
declare const FileSourceParams: {
    input: PD.FileParam;
};
type FileSourceProps = PD.Values<typeof FileSourceParams>;
declare const ServerSourceParams: {
    baseUrl: PD.Text<string>;
};
type ServerSourceProps = PD.Values<typeof ServerSourceParams>;
export declare const ValidationReportParams: {
    source: PD.Mapped<PD.NamedParams<PD.Normalize<{
        input: Asset.File | null;
    }>, "file"> | PD.NamedParams<PD.Normalize<{
        baseUrl: string;
    }>, "server">>;
};
export type ValidationReportParams = typeof ValidationReportParams;
export type ValidationReportProps = PD.Values<ValidationReportParams>;
export declare const ValidationReportProvider: CustomModelProperty.Provider<ValidationReportParams, ValidationReport>;
type IntraUnitClashesProps = {
    readonly id: ArrayLike<number>;
    readonly magnitude: ArrayLike<number>;
    readonly distance: ArrayLike<number>;
};
type InterUnitClashesProps = {
    readonly id: number;
    readonly magnitude: number;
    readonly distance: number;
};
export type IntraUnitClashes = IntAdjacencyGraph<UnitIndex, IntraUnitClashesProps>;
export type InterUnitClashes = InterUnitGraph<number, UnitIndex, InterUnitClashesProps>;
export interface Clashes {
    readonly interUnit: InterUnitClashes;
    readonly intraUnit: IntMap<IntraUnitClashes>;
}
export declare const ClashesProvider: CustomStructureProperty.Provider<{}, Clashes>;
