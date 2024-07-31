/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { RequiredField } from '../generic/params-schema';
import { NodeFor, TreeFor, TreeSchema } from '../generic/tree-schema';
/** Schema for `MolstarTree` (intermediate tree representation between `MVSTree` and a real Molstar state) */
export declare const MolstarTreeSchema: TreeSchema<{
    download: {
        is_binary: RequiredField<boolean>;
        url: RequiredField<string>;
    };
    parse: {
        format: RequiredField<"pdb" | "cif">;
    };
    trajectory: {
        block_header: RequiredField<string | null>;
        block_index: RequiredField<number>;
        format: RequiredField<"pdb" | "cif">;
    };
    model: Pick<import("../generic/params-schema").AllRequired<{
        type: RequiredField<"assembly" | "symmetry" | "model" | "symmetry_mates">;
        block_header: import("../generic/params-schema").OptionalField<string | null>;
        block_index: import("../generic/params-schema").OptionalField<number>;
        model_index: import("../generic/params-schema").OptionalField<number>;
        assembly_id: import("../generic/params-schema").OptionalField<string | null>;
        radius: import("../generic/params-schema").OptionalField<number>;
        ijk_min: import("../generic/params-schema").OptionalField<[number, number, number]>;
        ijk_max: import("../generic/params-schema").OptionalField<[number, number, number]>;
    }>, "model_index">;
    structure: Omit<import("../generic/params-schema").AllRequired<{
        type: RequiredField<"assembly" | "symmetry" | "model" | "symmetry_mates">;
        block_header: import("../generic/params-schema").OptionalField<string | null>;
        block_index: import("../generic/params-schema").OptionalField<number>;
        model_index: import("../generic/params-schema").OptionalField<number>;
        assembly_id: import("../generic/params-schema").OptionalField<string | null>;
        radius: import("../generic/params-schema").OptionalField<number>;
        ijk_min: import("../generic/params-schema").OptionalField<[number, number, number]>;
        ijk_max: import("../generic/params-schema").OptionalField<[number, number, number]>;
    }>, "block_header" | "block_index" | "model_index">;
    root: import("../generic/params-schema").AllRequired<{}>;
    transform: import("../generic/params-schema").AllRequired<{
        rotation: import("../generic/params-schema").OptionalField<number[]>;
        translation: import("../generic/params-schema").OptionalField<[number, number, number]>;
    }>;
    component: import("../generic/params-schema").AllRequired<{
        selector: RequiredField<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "protein" | "nucleic" | {
            label_entity_id?: string | undefined;
            label_asym_id?: string | undefined;
            auth_asym_id?: string | undefined;
            label_seq_id?: number | undefined;
            auth_seq_id?: number | undefined;
            pdbx_PDB_ins_code?: string | undefined;
            beg_label_seq_id?: number | undefined;
            end_label_seq_id?: number | undefined;
            beg_auth_seq_id?: number | undefined;
            end_auth_seq_id?: number | undefined;
            label_atom_id?: string | undefined;
            auth_atom_id?: string | undefined;
            type_symbol?: string | undefined;
            atom_id?: number | undefined;
            atom_index?: number | undefined;
        } | {
            label_entity_id?: string | undefined;
            label_asym_id?: string | undefined;
            auth_asym_id?: string | undefined;
            label_seq_id?: number | undefined;
            auth_seq_id?: number | undefined;
            pdbx_PDB_ins_code?: string | undefined;
            beg_label_seq_id?: number | undefined;
            end_label_seq_id?: number | undefined;
            beg_auth_seq_id?: number | undefined;
            end_auth_seq_id?: number | undefined;
            label_atom_id?: string | undefined;
            auth_atom_id?: string | undefined;
            type_symbol?: string | undefined;
            atom_id?: number | undefined;
            atom_index?: number | undefined;
        }[]>;
    }>;
    component_from_uri: import("../generic/params-schema").AllRequired<{
        field_values: import("../generic/params-schema").OptionalField<string[] | null>;
        uri: RequiredField<string>;
        format: RequiredField<"json" | "cif" | "bcif">;
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        block_header: import("../generic/params-schema").OptionalField<string | null>;
        block_index: import("../generic/params-schema").OptionalField<number>;
        category_name: import("../generic/params-schema").OptionalField<string | null>;
        field_name: import("../generic/params-schema").OptionalField<string>;
    }>;
    component_from_source: import("../generic/params-schema").AllRequired<{
        field_values: import("../generic/params-schema").OptionalField<string[] | null>;
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        block_header: import("../generic/params-schema").OptionalField<string | null>;
        block_index: import("../generic/params-schema").OptionalField<number>;
        category_name: import("../generic/params-schema").OptionalField<string | null>;
        field_name: import("../generic/params-schema").OptionalField<string>;
    }>;
    representation: import("../generic/params-schema").AllRequired<{
        type: RequiredField<"surface" | "cartoon" | "ball_and_stick">;
    }>;
    color: import("../generic/params-schema").AllRequired<{
        color: RequiredField<"aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3" | `#${string}`>;
        selector: import("../generic/params-schema").OptionalField<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "protein" | "nucleic" | {
            label_entity_id?: string | undefined;
            label_asym_id?: string | undefined;
            auth_asym_id?: string | undefined;
            label_seq_id?: number | undefined;
            auth_seq_id?: number | undefined;
            pdbx_PDB_ins_code?: string | undefined;
            beg_label_seq_id?: number | undefined;
            end_label_seq_id?: number | undefined;
            beg_auth_seq_id?: number | undefined;
            end_auth_seq_id?: number | undefined;
            label_atom_id?: string | undefined;
            auth_atom_id?: string | undefined;
            type_symbol?: string | undefined;
            atom_id?: number | undefined;
            atom_index?: number | undefined;
        } | {
            label_entity_id?: string | undefined;
            label_asym_id?: string | undefined;
            auth_asym_id?: string | undefined;
            label_seq_id?: number | undefined;
            auth_seq_id?: number | undefined;
            pdbx_PDB_ins_code?: string | undefined;
            beg_label_seq_id?: number | undefined;
            end_label_seq_id?: number | undefined;
            beg_auth_seq_id?: number | undefined;
            end_auth_seq_id?: number | undefined;
            label_atom_id?: string | undefined;
            auth_atom_id?: string | undefined;
            type_symbol?: string | undefined;
            atom_id?: number | undefined;
            atom_index?: number | undefined;
        }[]>;
    }>;
    color_from_uri: import("../generic/params-schema").AllRequired<{
        uri: RequiredField<string>;
        format: RequiredField<"json" | "cif" | "bcif">;
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        block_header: import("../generic/params-schema").OptionalField<string | null>;
        block_index: import("../generic/params-schema").OptionalField<number>;
        category_name: import("../generic/params-schema").OptionalField<string | null>;
        field_name: import("../generic/params-schema").OptionalField<string>;
    }>;
    color_from_source: import("../generic/params-schema").AllRequired<{
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        block_header: import("../generic/params-schema").OptionalField<string | null>;
        block_index: import("../generic/params-schema").OptionalField<number>;
        category_name: import("../generic/params-schema").OptionalField<string | null>;
        field_name: import("../generic/params-schema").OptionalField<string>;
    }>;
    label: import("../generic/params-schema").AllRequired<{
        text: RequiredField<string>;
    }>;
    label_from_uri: import("../generic/params-schema").AllRequired<{
        uri: RequiredField<string>;
        format: RequiredField<"json" | "cif" | "bcif">;
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        block_header: import("../generic/params-schema").OptionalField<string | null>;
        block_index: import("../generic/params-schema").OptionalField<number>;
        category_name: import("../generic/params-schema").OptionalField<string | null>;
        field_name: import("../generic/params-schema").OptionalField<string>;
    }>;
    label_from_source: import("../generic/params-schema").AllRequired<{
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        block_header: import("../generic/params-schema").OptionalField<string | null>;
        block_index: import("../generic/params-schema").OptionalField<number>;
        category_name: import("../generic/params-schema").OptionalField<string | null>;
        field_name: import("../generic/params-schema").OptionalField<string>;
    }>;
    tooltip: import("../generic/params-schema").AllRequired<{
        text: RequiredField<string>;
    }>;
    tooltip_from_uri: import("../generic/params-schema").AllRequired<{
        uri: RequiredField<string>;
        format: RequiredField<"json" | "cif" | "bcif">;
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        block_header: import("../generic/params-schema").OptionalField<string | null>;
        block_index: import("../generic/params-schema").OptionalField<number>;
        category_name: import("../generic/params-schema").OptionalField<string | null>;
        field_name: import("../generic/params-schema").OptionalField<string>;
    }>;
    tooltip_from_source: import("../generic/params-schema").AllRequired<{
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        block_header: import("../generic/params-schema").OptionalField<string | null>;
        block_index: import("../generic/params-schema").OptionalField<number>;
        category_name: import("../generic/params-schema").OptionalField<string | null>;
        field_name: import("../generic/params-schema").OptionalField<string>;
    }>;
    focus: import("../generic/params-schema").AllRequired<{
        direction: import("../generic/params-schema").OptionalField<[number, number, number]>;
        up: import("../generic/params-schema").OptionalField<[number, number, number]>;
    }>;
    camera: import("../generic/params-schema").AllRequired<{
        target: RequiredField<[number, number, number]>;
        position: RequiredField<[number, number, number]>;
        up: import("../generic/params-schema").OptionalField<[number, number, number]>;
    }>;
    canvas: import("../generic/params-schema").AllRequired<{
        background_color: RequiredField<"aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3" | `#${string}`>;
    }>;
}, "root">;
/** Node kind in a `MolstarTree` */
export type MolstarKind = keyof typeof MolstarTreeSchema.nodes;
/** Node in a `MolstarTree` */
export type MolstarNode<TKind extends MolstarKind = MolstarKind> = NodeFor<typeof MolstarTreeSchema, TKind>;
/** Intermediate tree representation between `MVSTree` and a real Molstar state */
export type MolstarTree = TreeFor<typeof MolstarTreeSchema>;
