/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Model, ResidueIndex } from '../../mol-model/structure';
import { PluginContext } from '../../mol-plugin/context';
import { StructureRepresentationRegistry } from '../../mol-repr/structure/registry';
import { ColorTheme } from '../../mol-theme/color';
export interface ModelInfo {
    hetResidues: {
        name: string;
        indices: ResidueIndex[];
    }[];
    assemblies: {
        id: string;
        details: string;
        isPreferred: boolean;
    }[];
    preferredAssemblyId: string | undefined;
}
export declare namespace ModelInfo {
    function get(ctx: PluginContext, model: Model, checkPreferred: boolean): Promise<ModelInfo>;
}
export type SupportedFormats = 'cif' | 'pdb';
export interface LoadParams {
    url: string;
    format?: SupportedFormats;
    isBinary?: boolean;
    assemblyId?: string;
    representationStyle?: RepresentationStyle;
}
export interface RepresentationStyle {
    sequence?: RepresentationStyle.Entry;
    hetGroups?: RepresentationStyle.Entry;
    snfg3d?: {
        hide?: boolean;
    };
    water?: RepresentationStyle.Entry;
}
export declare namespace RepresentationStyle {
    type Entry = {
        hide?: boolean;
        kind?: StructureRepresentationRegistry.BuiltIn;
        coloring?: ColorTheme.BuiltIn;
    };
}
export declare enum StateElements {
    Model = "model",
    ModelProps = "model-props",
    Assembly = "assembly",
    VolumeStreaming = "volume-streaming",
    Sequence = "sequence",
    SequenceVisual = "sequence-visual",
    Het = "het",
    HetVisual = "het-visual",
    Het3DSNFG = "het-3dsnfg",
    Water = "water",
    WaterVisual = "water-visual",
    HetGroupFocus = "het-group-focus",
    HetGroupFocusGroup = "het-group-focus-group"
}
