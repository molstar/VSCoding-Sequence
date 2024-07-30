/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { OptionalField, RequiredField } from '../generic/params-schema';
import { NodeFor, TreeFor, TreeSchema, TreeSchemaWithAllRequired } from '../generic/tree-schema';
/** Schema for `MVSTree` (MolViewSpec tree) */
export declare const MVSTreeSchema: TreeSchema<{
    root: {};
    download: {
        /** URL of the data resource. */
        url: RequiredField<string>;
    };
    parse: {
        /** Format of the input data resource. */
        format: RequiredField<"pdb" | "bcif" | "mmcif">;
    };
    structure: {
        /** Type of structure to be created (`"model"` for original model coordinates, `"assembly"` for assembly structure, `"symmetry"` for a set of crystal unit cells based on Miller indices, `"symmetry_mates"` for a set of asymmetric units within a radius from the original model). */
        type: RequiredField<"assembly" | "symmetry" | "model" | "symmetry_mates">;
        /** Header of the CIF block to read coordinates from (only applies when the input data are from CIF or BinaryCIF). If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read coordinates from (only applies when the input data are from CIF or BinaryCIF and `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** 0-based index of model in case the input data contain multiple models. */
        model_index: OptionalField<number>;
        /** Assembly identifier (only applies when `kind` is `"assembly"`). If `null`, the first assembly is selected. */
        assembly_id: OptionalField<string | null>;
        /** Distance (in Angstroms) from the original model in which asymmetric units should be included (only applies when `kind` is `"symmetry_mates"`). */
        radius: OptionalField<number>;
        /** Miller indices of the bottom-left unit cell to be included (only applies when `kind` is `"symmetry"`). */
        ijk_min: OptionalField<[number, number, number]>;
        /** Miller indices of the top-right unit cell to be included (only applies when `kind` is `"symmetry"`). */
        ijk_max: OptionalField<[number, number, number]>;
    };
    transform: {
        /** Rotation matrix (3x3 matrix flattened in column major format (j*3+i indexing), this is equivalent to Fortran-order in numpy). This matrix will multiply the structure coordinates from the left. The default value is the identity matrix (corresponds to no rotation). */
        rotation: OptionalField<number[]>;
        /** Translation vector, applied to the structure coordinates after rotation. The default value is the zero vector (corresponds to no translation). */
        translation: OptionalField<[number, number, number]>;
    };
    component: {
        /** Defines what part of the parent structure should be included in this component. */
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
    };
    component_from_uri: {
        /** List of component identifiers (i.e. values in the field given by `field_name`) which should be included in this component. If `null`, component identifiers are ignored (all annotation rows are included), and `field_name` field can be dropped from the annotation. */
        field_values: OptionalField<string[] | null>;
        /** URL of the annotation resource. */
        uri: RequiredField<string>;
        /** Format of the annotation resource. */
        format: RequiredField<"json" | "cif" | "bcif">;
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"` and `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    component_from_source: {
        /** List of component identifiers (i.e. values in the field given by `field_name`) which should be included in this component. If `null`, component identifiers are ignored (all annotation rows are included), and `field_name` field can be dropped from the annotation. */
        field_values: OptionalField<string[] | null>;
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from. If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from. If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    representation: {
        /** Method of visual representation of the component. */
        type: RequiredField<"surface" | "cartoon" | "ball_and_stick">;
    };
    color: {
        /** Color to apply to the representation. Can be either an X11 color name (e.g. `"red"`) or a hexadecimal code (e.g. `"#FF0011"`). */
        color: RequiredField<"aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3" | `#${string}`>;
        /** Defines to what part of the representation this color should be applied. */
        selector: OptionalField<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "protein" | "nucleic" | {
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
    };
    color_from_uri: {
        /** URL of the annotation resource. */
        uri: RequiredField<string>;
        /** Format of the annotation resource. */
        format: RequiredField<"json" | "cif" | "bcif">;
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"` and `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    color_from_source: {
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from. If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from. If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    label: {
        /** Content of the shown label. */
        text: RequiredField<string>;
    };
    label_from_uri: {
        /** URL of the annotation resource. */
        uri: RequiredField<string>;
        /** Format of the annotation resource. */
        format: RequiredField<"json" | "cif" | "bcif">;
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"` and `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    label_from_source: {
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from. If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from. If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    tooltip: {
        /** Content of the shown tooltip. */
        text: RequiredField<string>;
    };
    tooltip_from_uri: {
        /** URL of the annotation resource. */
        uri: RequiredField<string>;
        /** Format of the annotation resource. */
        format: RequiredField<"json" | "cif" | "bcif">;
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"` and `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    tooltip_from_source: {
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from. If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from. If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    focus: {
        /** Vector describing the direction of the view (camera position -> focused target). */
        direction: OptionalField<[number, number, number]>;
        /** Vector which will be aligned with the screen Y axis. */
        up: OptionalField<[number, number, number]>;
    };
    camera: {
        /** Coordinates of the point in space at which the camera is pointing. */
        target: RequiredField<[number, number, number]>;
        /** Coordinates of the camera. */
        position: RequiredField<[number, number, number]>;
        /** Vector which will be aligned with the screen Y axis. */
        up: OptionalField<[number, number, number]>;
    };
    canvas: {
        /** Color of the canvas background. Can be either an X11 color name (e.g. `"red"`) or a hexadecimal code (e.g. `"#FF0011"`). */
        background_color: RequiredField<"aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3" | `#${string}`>;
    };
}, "root">;
/** Node kind in a `MVSTree` */
export type MVSKind = keyof typeof MVSTreeSchema.nodes;
/** Node in a `MVSTree` */
export type MVSNode<TKind extends MVSKind = MVSKind> = NodeFor<typeof MVSTreeSchema, TKind>;
/** MolViewSpec tree */
export type MVSTree = TreeFor<typeof MVSTreeSchema>;
/** Schema for `MVSTree` (MolViewSpec tree with all params provided) */
export declare const FullMVSTreeSchema: TreeSchemaWithAllRequired<TreeSchema<{
    root: {};
    download: {
        /** URL of the data resource. */
        url: RequiredField<string>;
    };
    parse: {
        /** Format of the input data resource. */
        format: RequiredField<"pdb" | "bcif" | "mmcif">;
    };
    structure: {
        /** Type of structure to be created (`"model"` for original model coordinates, `"assembly"` for assembly structure, `"symmetry"` for a set of crystal unit cells based on Miller indices, `"symmetry_mates"` for a set of asymmetric units within a radius from the original model). */
        type: RequiredField<"assembly" | "symmetry" | "model" | "symmetry_mates">;
        /** Header of the CIF block to read coordinates from (only applies when the input data are from CIF or BinaryCIF). If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read coordinates from (only applies when the input data are from CIF or BinaryCIF and `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** 0-based index of model in case the input data contain multiple models. */
        model_index: OptionalField<number>;
        /** Assembly identifier (only applies when `kind` is `"assembly"`). If `null`, the first assembly is selected. */
        assembly_id: OptionalField<string | null>;
        /** Distance (in Angstroms) from the original model in which asymmetric units should be included (only applies when `kind` is `"symmetry_mates"`). */
        radius: OptionalField<number>;
        /** Miller indices of the bottom-left unit cell to be included (only applies when `kind` is `"symmetry"`). */
        ijk_min: OptionalField<[number, number, number]>;
        /** Miller indices of the top-right unit cell to be included (only applies when `kind` is `"symmetry"`). */
        ijk_max: OptionalField<[number, number, number]>;
    };
    transform: {
        /** Rotation matrix (3x3 matrix flattened in column major format (j*3+i indexing), this is equivalent to Fortran-order in numpy). This matrix will multiply the structure coordinates from the left. The default value is the identity matrix (corresponds to no rotation). */
        rotation: OptionalField<number[]>;
        /** Translation vector, applied to the structure coordinates after rotation. The default value is the zero vector (corresponds to no translation). */
        translation: OptionalField<[number, number, number]>;
    };
    component: {
        /** Defines what part of the parent structure should be included in this component. */
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
    };
    component_from_uri: {
        /** List of component identifiers (i.e. values in the field given by `field_name`) which should be included in this component. If `null`, component identifiers are ignored (all annotation rows are included), and `field_name` field can be dropped from the annotation. */
        field_values: OptionalField<string[] | null>;
        /** URL of the annotation resource. */
        uri: RequiredField<string>;
        /** Format of the annotation resource. */
        format: RequiredField<"json" | "cif" | "bcif">;
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"` and `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    component_from_source: {
        /** List of component identifiers (i.e. values in the field given by `field_name`) which should be included in this component. If `null`, component identifiers are ignored (all annotation rows are included), and `field_name` field can be dropped from the annotation. */
        field_values: OptionalField<string[] | null>;
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from. If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from. If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    representation: {
        /** Method of visual representation of the component. */
        type: RequiredField<"surface" | "cartoon" | "ball_and_stick">;
    };
    color: {
        /** Color to apply to the representation. Can be either an X11 color name (e.g. `"red"`) or a hexadecimal code (e.g. `"#FF0011"`). */
        color: RequiredField<"aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3" | `#${string}`>;
        /** Defines to what part of the representation this color should be applied. */
        selector: OptionalField<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "protein" | "nucleic" | {
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
    };
    color_from_uri: {
        /** URL of the annotation resource. */
        uri: RequiredField<string>;
        /** Format of the annotation resource. */
        format: RequiredField<"json" | "cif" | "bcif">;
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"` and `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    color_from_source: {
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from. If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from. If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    label: {
        /** Content of the shown label. */
        text: RequiredField<string>;
    };
    label_from_uri: {
        /** URL of the annotation resource. */
        uri: RequiredField<string>;
        /** Format of the annotation resource. */
        format: RequiredField<"json" | "cif" | "bcif">;
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"` and `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    label_from_source: {
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from. If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from. If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    tooltip: {
        /** Content of the shown tooltip. */
        text: RequiredField<string>;
    };
    tooltip_from_uri: {
        /** URL of the annotation resource. */
        uri: RequiredField<string>;
        /** Format of the annotation resource. */
        format: RequiredField<"json" | "cif" | "bcif">;
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"` and `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    tooltip_from_source: {
        /** Annotation schema defines what fields in the annotation will be taken into account. */
        schema: RequiredField<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic">;
        /** Header of the CIF block to read annotation from. If `null`, block is selected based on `block_index`. */
        block_header: OptionalField<string | null>;
        /** 0-based index of the CIF block to read annotation from (only applies when `block_header` is `null`). */
        block_index: OptionalField<number>;
        /** Name of the CIF category to read annotation from. If `null`, the first category in the block is used. */
        category_name: OptionalField<string | null>;
        /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
        field_name: OptionalField<string>;
    };
    focus: {
        /** Vector describing the direction of the view (camera position -> focused target). */
        direction: OptionalField<[number, number, number]>;
        /** Vector which will be aligned with the screen Y axis. */
        up: OptionalField<[number, number, number]>;
    };
    camera: {
        /** Coordinates of the point in space at which the camera is pointing. */
        target: RequiredField<[number, number, number]>;
        /** Coordinates of the camera. */
        position: RequiredField<[number, number, number]>;
        /** Vector which will be aligned with the screen Y axis. */
        up: OptionalField<[number, number, number]>;
    };
    canvas: {
        /** Color of the canvas background. Can be either an X11 color name (e.g. `"red"`) or a hexadecimal code (e.g. `"#FF0011"`). */
        background_color: RequiredField<"aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3" | `#${string}`>;
    };
}, "root">>;
/** MolViewSpec tree with all params provided */
export type FullMVSTree = TreeFor<typeof FullMVSTreeSchema>;
