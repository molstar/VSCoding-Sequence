/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CustomProperty } from '../../mol-model-props/common/custom-property';
import { Structure, StructureQuery, StructureSelection } from '../../mol-model/structure';
import { PluginContext } from '../../mol-plugin/context';
import { Expression } from '../../mol-script/language/expression';
import { StateBuilder } from '../../mol-state';
import { RuntimeContext } from '../../mol-task';
import { PluginStateObject } from '../objects';
export declare enum StructureSelectionCategory {
    Type = "Type",
    Structure = "Structure Property",
    Atom = "Atom Property",
    Bond = "Bond Property",
    Residue = "Residue Property",
    AminoAcid = "Amino Acid",
    NucleicBase = "Nucleic Base",
    Manipulate = "Manipulate Selection",
    Validation = "Validation",
    Misc = "Miscellaneous",
    Internal = "Internal"
}
export { StructureSelectionQuery };
interface StructureSelectionQuery {
    readonly label: string;
    readonly expression: Expression;
    readonly description: string;
    readonly category: string;
    readonly isHidden: boolean;
    readonly priority: number;
    readonly referencesCurrent: boolean;
    readonly query: StructureQuery;
    readonly ensureCustomProperties?: (ctx: CustomProperty.Context, structure: Structure) => Promise<void>;
    getSelection(plugin: PluginContext, runtime: RuntimeContext, structure: Structure): Promise<StructureSelection>;
}
interface StructureSelectionQueryProps {
    description?: string;
    category?: string;
    isHidden?: boolean;
    priority?: number;
    referencesCurrent?: boolean;
    ensureCustomProperties?: (ctx: CustomProperty.Context, structure: Structure) => Promise<void>;
}
declare function StructureSelectionQuery(label: string, expression: Expression, props?: StructureSelectionQueryProps): StructureSelectionQuery;
export declare function ResidueQuery([names, label]: [string[], string], category: string, priority?: number): StructureSelectionQuery;
export declare function ElementSymbolQuery([names, label]: [string[], string], category: string, priority: number): StructureSelectionQuery;
export declare function EntityDescriptionQuery([names, label]: [string[], string], category: string, priority: number): StructureSelectionQuery;
export declare function getElementQueries(structures: Structure[]): StructureSelectionQuery[];
export declare function getNonStandardResidueQueries(structures: Structure[]): StructureSelectionQuery[];
export declare function getPolymerAndBranchedEntityQueries(structures: Structure[]): StructureSelectionQuery[];
export declare function applyBuiltInSelection(to: StateBuilder.To<PluginStateObject.Molecule.Structure>, query: keyof typeof StructureSelectionQueries, customTag?: string): StateBuilder.To<PluginStateObject.Molecule.Structure, import("../../mol-state").StateTransformer<PluginStateObject.Molecule.Structure, PluginStateObject.Molecule.Structure, import("../../mol-util/param-definition").ParamDefinition.Normalize<{
    expression: Expression;
    label: string | undefined;
}>>>;
export declare const StructureSelectionQueries: {
    all: StructureSelectionQuery;
    current: StructureSelectionQuery;
    polymer: StructureSelectionQuery;
    trace: StructureSelectionQuery;
    backbone: StructureSelectionQuery;
    sidechain: StructureSelectionQuery;
    sidechainWithTrace: StructureSelectionQuery;
    protein: StructureSelectionQuery;
    nucleic: StructureSelectionQuery;
    helix: StructureSelectionQuery;
    beta: StructureSelectionQuery;
    water: StructureSelectionQuery;
    ion: StructureSelectionQuery;
    lipid: StructureSelectionQuery;
    branched: StructureSelectionQuery;
    branchedPlusConnected: StructureSelectionQuery;
    branchedConnectedOnly: StructureSelectionQuery;
    ligand: StructureSelectionQuery;
    ligandPlusConnected: StructureSelectionQuery;
    ligandConnectedOnly: StructureSelectionQuery;
    connectedOnly: StructureSelectionQuery;
    disulfideBridges: StructureSelectionQuery;
    nosBridges: StructureSelectionQuery;
    nonStandardPolymer: StructureSelectionQuery;
    coarse: StructureSelectionQuery;
    ring: StructureSelectionQuery;
    aromaticRing: StructureSelectionQuery;
    surroundings: StructureSelectionQuery;
    surroundingLigands: StructureSelectionQuery;
    surroundingAtoms: StructureSelectionQuery;
    complement: StructureSelectionQuery;
    covalentlyBonded: StructureSelectionQuery;
    covalentlyOrMetallicBonded: StructureSelectionQuery;
    covalentlyBondedComponent: StructureSelectionQuery;
    wholeResidues: StructureSelectionQuery;
};
export declare class StructureSelectionQueryRegistry {
    list: StructureSelectionQuery[];
    options: [StructureSelectionQuery, string, string][];
    version: number;
    add(q: StructureSelectionQuery): void;
    remove(q: StructureSelectionQuery): void;
    constructor();
}
