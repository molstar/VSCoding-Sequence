"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullMVSTreeSchema = exports.MVSTreeSchema = void 0;
const params_schema_1 = require("../generic/params-schema");
const tree_schema_1 = require("../generic/tree-schema");
const param_types_1 = require("./param-types");
const _DataFromUriParams = {
    /** URL of the annotation resource. */
    uri: (0, params_schema_1.RequiredField)(params_schema_1.str, 'URL of the annotation resource.'),
    /** Format of the annotation resource. */
    format: (0, params_schema_1.RequiredField)(param_types_1.SchemaFormatT, 'Format of the annotation resource.'),
    /** Annotation schema defines what fields in the annotation will be taken into account. */
    schema: (0, params_schema_1.RequiredField)(param_types_1.SchemaT, 'Annotation schema defines what fields in the annotation will be taken into account.'),
    /** Header of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, block is selected based on `block_index`. */
    block_header: (0, params_schema_1.OptionalField)((0, params_schema_1.nullable)(params_schema_1.str), 'Header of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, block is selected based on `block_index`.'),
    /** 0-based index of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"` and `block_header` is `null`). */
    block_index: (0, params_schema_1.OptionalField)(params_schema_1.int, '0-based index of the CIF block to read annotation from (only applies when `format` is `"cif"` or `"bcif"` and `block_header` is `null`).'),
    /** Name of the CIF category to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, the first category in the block is used. */
    category_name: (0, params_schema_1.OptionalField)((0, params_schema_1.nullable)(params_schema_1.str), 'Name of the CIF category to read annotation from (only applies when `format` is `"cif"` or `"bcif"`). If `null`, the first category in the block is used.'),
    /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
    field_name: (0, params_schema_1.OptionalField)(params_schema_1.str, 'Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...).'),
};
const _DataFromSourceParams = {
    /** Annotation schema defines what fields in the annotation will be taken into account. */
    schema: (0, params_schema_1.RequiredField)(param_types_1.SchemaT, 'Annotation schema defines what fields in the annotation will be taken into account.'),
    /** Header of the CIF block to read annotation from. If `null`, block is selected based on `block_index`. */
    block_header: (0, params_schema_1.OptionalField)((0, params_schema_1.nullable)(params_schema_1.str), 'Header of the CIF block to read annotation from. If `null`, block is selected based on `block_index`.'),
    /** 0-based index of the CIF block to read annotation from (only applies when `block_header` is `null`). */
    block_index: (0, params_schema_1.OptionalField)(params_schema_1.int, '0-based index of the CIF block to read annotation from (only applies when `block_header` is `null`).'),
    /** Name of the CIF category to read annotation from. If `null`, the first category in the block is used. */
    category_name: (0, params_schema_1.OptionalField)((0, params_schema_1.nullable)(params_schema_1.str), 'Name of the CIF category to read annotation from. If `null`, the first category in the block is used.'),
    /** Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...). The default value is 'color'/'label'/'tooltip'/'component' depending on the node type */
    field_name: (0, params_schema_1.OptionalField)(params_schema_1.str, 'Name of the column in CIF or field name (key) in JSON that contains the dependent variable (color/label/tooltip/component_id...).'),
};
/** Schema for `MVSTree` (MolViewSpec tree) */
exports.MVSTreeSchema = (0, tree_schema_1.TreeSchema)({
    rootKind: 'root',
    nodes: {
        /** Auxiliary node kind that only appears as the tree root. */
        root: {
            description: 'Auxiliary node kind that only appears as the tree root.',
            parent: [],
            params: {},
        },
        /** This node instructs to retrieve a data resource. */
        download: {
            description: 'This node instructs to retrieve a data resource.',
            parent: ['root'],
            params: {
                /** URL of the data resource. */
                url: (0, params_schema_1.RequiredField)(params_schema_1.str, 'URL of the data resource.'),
            },
        },
        /** This node instructs to parse a data resource. */
        parse: {
            description: 'This node instructs to parse a data resource.',
            parent: ['download'],
            params: {
                /** Format of the input data resource. */
                format: (0, params_schema_1.RequiredField)(param_types_1.ParseFormatT, 'Format of the input data resource.'),
            },
        },
        /** This node instructs to create a structure from a parsed data resource. "Structure" refers to an internal representation of molecular coordinates without any visual representation. */
        structure: {
            description: 'This node instructs to create a structure from a parsed data resource. "Structure" refers to an internal representation of molecular coordinates without any visual representation.',
            parent: ['parse'],
            params: {
                /** Type of structure to be created (`"model"` for original model coordinates, `"assembly"` for assembly structure, `"symmetry"` for a set of crystal unit cells based on Miller indices, `"symmetry_mates"` for a set of asymmetric units within a radius from the original model). */
                type: (0, params_schema_1.RequiredField)(param_types_1.StructureTypeT, 'Type of structure to be created (`"model"` for original model coordinates, `"assembly"` for assembly structure, `"symmetry"` for a set of crystal unit cells based on Miller indices, `"symmetry_mates"` for a set of asymmetric units within a radius from the original model).'),
                /** Header of the CIF block to read coordinates from (only applies when the input data are from CIF or BinaryCIF). If `null`, block is selected based on `block_index`. */
                block_header: (0, params_schema_1.OptionalField)((0, params_schema_1.nullable)(params_schema_1.str), 'Header of the CIF block to read coordinates from (only applies when the input data are from CIF or BinaryCIF). If `null`, block is selected based on `block_index`.'),
                /** 0-based index of the CIF block to read coordinates from (only applies when the input data are from CIF or BinaryCIF and `block_header` is `null`). */
                block_index: (0, params_schema_1.OptionalField)(params_schema_1.int, '0-based index of the CIF block to read coordinates from (only applies when the input data are from CIF or BinaryCIF and `block_header` is `null`).'),
                /** 0-based index of model in case the input data contain multiple models. */
                model_index: (0, params_schema_1.OptionalField)(params_schema_1.int, '0-based index of model in case the input data contain multiple models.'),
                /** Assembly identifier (only applies when `kind` is `"assembly"`). If `null`, the first assembly is selected. */
                assembly_id: (0, params_schema_1.OptionalField)((0, params_schema_1.nullable)(params_schema_1.str), 'Assembly identifier (only applies when `kind` is `"assembly"`). If `null`, the first assembly is selected.'),
                /** Distance (in Angstroms) from the original model in which asymmetric units should be included (only applies when `kind` is `"symmetry_mates"`). */
                radius: (0, params_schema_1.OptionalField)(params_schema_1.float, 'Distance (in Angstroms) from the original model in which asymmetric units should be included (only applies when `kind` is `"symmetry_mates"`).'),
                /** Miller indices of the bottom-left unit cell to be included (only applies when `kind` is `"symmetry"`). */
                ijk_min: (0, params_schema_1.OptionalField)((0, params_schema_1.tuple)([params_schema_1.int, params_schema_1.int, params_schema_1.int]), 'Miller indices of the bottom-left unit cell to be included (only applies when `kind` is `"symmetry"`).'),
                /** Miller indices of the top-right unit cell to be included (only applies when `kind` is `"symmetry"`). */
                ijk_max: (0, params_schema_1.OptionalField)((0, params_schema_1.tuple)([params_schema_1.int, params_schema_1.int, params_schema_1.int]), 'Miller indices of the top-right unit cell to be included (only applies when `kind` is `"symmetry"`).'),
            },
        },
        /** This node instructs to rotate and/or translate structure coordinates. */
        transform: {
            description: 'This node instructs to rotate and/or translate structure coordinates.',
            parent: ['structure'],
            params: {
                /** Rotation matrix (3x3 matrix flattened in column major format (j*3+i indexing), this is equivalent to Fortran-order in numpy). This matrix will multiply the structure coordinates from the left. The default value is the identity matrix (corresponds to no rotation). */
                rotation: (0, params_schema_1.OptionalField)(param_types_1.Matrix, 'Rotation matrix (3x3 matrix flattened in column major format (j*3+i indexing), this is equivalent to Fortran-order in numpy). This matrix will multiply the structure coordinates from the left. The default value is the identity matrix (corresponds to no rotation).'),
                /** Translation vector, applied to the structure coordinates after rotation. The default value is the zero vector (corresponds to no translation). */
                translation: (0, params_schema_1.OptionalField)(param_types_1.Vector3, 'Translation vector, applied to the structure coordinates after rotation. The default value is the zero vector (corresponds to no translation).'),
            },
        },
        /** This node instructs to create a component (i.e. a subset of the parent structure). */
        component: {
            description: 'This node instructs to create a component (i.e. a subset of the parent structure).',
            parent: ['structure'],
            params: {
                /** Defines what part of the parent structure should be included in this component. */
                selector: (0, params_schema_1.RequiredField)((0, params_schema_1.union)([param_types_1.ComponentSelectorT, param_types_1.ComponentExpressionT, (0, params_schema_1.list)(param_types_1.ComponentExpressionT)]), 'Defines what part of the parent structure should be included in this component.'),
            },
        },
        /** This node instructs to create a component defined by an external annotation resource. */
        component_from_uri: {
            description: 'This node instructs to create a component defined by an external annotation resource.',
            parent: ['structure'],
            params: {
                ..._DataFromUriParams,
                /** List of component identifiers (i.e. values in the field given by `field_name`) which should be included in this component. If `null`, component identifiers are ignored (all annotation rows are included), and `field_name` field can be dropped from the annotation. */
                field_values: (0, params_schema_1.OptionalField)((0, params_schema_1.nullable)((0, params_schema_1.list)(params_schema_1.str)), 'List of component identifiers (i.e. values in the field given by `field_name`) which should be included in this component. If `null`, component identifiers are ignored (all annotation rows are included), and `field_name` field can be dropped from the annotation.'),
            },
        },
        /** This node instructs to create a component defined by an annotation resource included in the same file this structure was loaded from. Only applicable if the structure was loaded from an mmCIF or BinaryCIF file. */
        component_from_source: {
            description: 'This node instructs to create a component defined by an annotation resource included in the same file this structure was loaded from. Only applicable if the structure was loaded from an mmCIF or BinaryCIF file.',
            parent: ['structure'],
            params: {
                ..._DataFromSourceParams,
                /** List of component identifiers (i.e. values in the field given by `field_name`) which should be included in this component. If `null`, component identifiers are ignored (all annotation rows are included), and `field_name` field can be dropped from the annotation. */
                field_values: (0, params_schema_1.OptionalField)((0, params_schema_1.nullable)((0, params_schema_1.list)(params_schema_1.str)), 'List of component identifiers (i.e. values in the field given by `field_name`) which should be included in this component. If `null`, component identifiers are ignored (all annotation rows are included), and `field_name` field can be dropped from the annotation.'),
            },
        },
        /** This node instructs to create a visual representation of a component. */
        representation: {
            description: 'This node instructs to create a visual representation of a component.',
            parent: ['component', 'component_from_uri', 'component_from_source'],
            params: {
                /** Method of visual representation of the component. */
                type: (0, params_schema_1.RequiredField)(param_types_1.RepresentationTypeT, 'Method of visual representation of the component.'),
            },
        },
        /** This node instructs to apply color to a visual representation. */
        color: {
            description: 'This node instructs to apply color to a visual representation.',
            parent: ['representation'],
            params: {
                /** Color to apply to the representation. Can be either an X11 color name (e.g. `"red"`) or a hexadecimal code (e.g. `"#FF0011"`). */
                color: (0, params_schema_1.RequiredField)(param_types_1.ColorT, 'Color to apply to the representation. Can be either an X11 color name (e.g. `"red"`) or a hexadecimal code (e.g. `"#FF0011"`).'),
                /** Defines to what part of the representation this color should be applied. */
                selector: (0, params_schema_1.OptionalField)((0, params_schema_1.union)([param_types_1.ComponentSelectorT, param_types_1.ComponentExpressionT, (0, params_schema_1.list)(param_types_1.ComponentExpressionT)]), 'Defines to what part of the representation this color should be applied.'),
            },
        },
        /** This node instructs to apply colors to a visual representation. The colors are defined by an external annotation resource. */
        color_from_uri: {
            description: 'This node instructs to apply colors to a visual representation. The colors are defined by an external annotation resource.',
            parent: ['representation'],
            params: {
                ..._DataFromUriParams,
            },
        },
        /** This node instructs to apply colors to a visual representation. The colors are defined by an annotation resource included in the same file this structure was loaded from. Only applicable if the structure was loaded from an mmCIF or BinaryCIF file. */
        color_from_source: {
            description: 'This node instructs to apply colors to a visual representation. The colors are defined by an annotation resource included in the same file this structure was loaded from. Only applicable if the structure was loaded from an mmCIF or BinaryCIF file.',
            parent: ['representation'],
            params: {
                ..._DataFromSourceParams,
            },
        },
        /** This node instructs to add a label (textual visual representation) to a component. */
        label: {
            description: 'This node instructs to add a label (textual visual representation) to a component.',
            parent: ['component', 'component_from_uri', 'component_from_source'],
            params: {
                /** Content of the shown label. */
                text: (0, params_schema_1.RequiredField)(params_schema_1.str, 'Content of the shown label.'),
            },
        },
        /** This node instructs to add labels (textual visual representations) to parts of a structure. The labels are defined by an external annotation resource. */
        label_from_uri: {
            description: 'This node instructs to add labels (textual visual representations) to parts of a structure. The labels are defined by an external annotation resource.',
            parent: ['structure'],
            params: {
                ..._DataFromUriParams,
            },
        },
        /** This node instructs to add labels (textual visual representations) to parts of a structure. The labels are defined by an annotation resource included in the same file this structure was loaded from. Only applicable if the structure was loaded from an mmCIF or BinaryCIF file. */
        label_from_source: {
            description: 'This node instructs to add labels (textual visual representations) to parts of a structure. The labels are defined by an annotation resource included in the same file this structure was loaded from. Only applicable if the structure was loaded from an mmCIF or BinaryCIF file.',
            parent: ['structure'],
            params: {
                ..._DataFromSourceParams,
            },
        },
        /** This node instructs to add a tooltip to a component. "Tooltip" is a text which is not a part of the visualization but should be presented to the users when they interact with the component (typically, the tooltip will be shown somewhere on the screen when the user hovers over a visual representation of the component). */
        tooltip: {
            description: 'This node instructs to add a tooltip to a component. "Tooltip" is a text which is not a part of the visualization but should be presented to the users when they interact with the component (typically, the tooltip will be shown somewhere on the screen when the user hovers over a visual representation of the component).',
            parent: ['component', 'component_from_uri', 'component_from_source'],
            params: {
                /** Content of the shown tooltip. */
                text: (0, params_schema_1.RequiredField)(params_schema_1.str, 'Content of the shown tooltip.'),
            },
        },
        /** This node instructs to add tooltips to parts of a structure. The tooltips are defined by an external annotation resource. */
        tooltip_from_uri: {
            description: 'This node instructs to add tooltips to parts of a structure. The tooltips are defined by an external annotation resource.',
            parent: ['structure'],
            params: {
                ..._DataFromUriParams,
            },
        },
        /** This node instructs to add tooltips to parts of a structure. The tooltips are defined by an annotation resource included in the same file this structure was loaded from. Only applicable if the structure was loaded from an mmCIF or BinaryCIF file. */
        tooltip_from_source: {
            description: 'This node instructs to add tooltips to parts of a structure. The tooltips are defined by an annotation resource included in the same file this structure was loaded from. Only applicable if the structure was loaded from an mmCIF or BinaryCIF file.',
            parent: ['structure'],
            params: {
                ..._DataFromSourceParams,
            },
        },
        /** This node instructs to set the camera focus to a component (zoom in). */
        focus: {
            description: 'This node instructs to set the camera focus to a component (zoom in).',
            parent: ['component', 'component_from_uri', 'component_from_source'],
            params: {
                /** Vector describing the direction of the view (camera position -> focused target). */
                direction: (0, params_schema_1.OptionalField)(param_types_1.Vector3, 'Vector describing the direction of the view (camera position -> focused target).'),
                /** Vector which will be aligned with the screen Y axis. */
                up: (0, params_schema_1.OptionalField)(param_types_1.Vector3, 'Vector which will be aligned with the screen Y axis.'),
            },
        },
        /** This node instructs to set the camera position and orientation. */
        camera: {
            description: 'This node instructs to set the camera position and orientation.',
            parent: ['root'],
            params: {
                /** Coordinates of the point in space at which the camera is pointing. */
                target: (0, params_schema_1.RequiredField)(param_types_1.Vector3, 'Coordinates of the point in space at which the camera is pointing.'),
                /** Coordinates of the camera. */
                position: (0, params_schema_1.RequiredField)(param_types_1.Vector3, 'Coordinates of the camera.'),
                /** Vector which will be aligned with the screen Y axis. */
                up: (0, params_schema_1.OptionalField)(param_types_1.Vector3, 'Vector which will be aligned with the screen Y axis.'),
            },
        },
        /** This node sets canvas properties. */
        canvas: {
            description: 'This node sets canvas properties.',
            parent: ['root'],
            params: {
                /** Color of the canvas background. Can be either an X11 color name (e.g. `"red"`) or a hexadecimal code (e.g. `"#FF0011"`). */
                background_color: (0, params_schema_1.RequiredField)(param_types_1.ColorT, 'Color of the canvas background. Can be either an X11 color name (e.g. `"red"`) or a hexadecimal code (e.g. `"#FF0011"`).'),
            },
        },
    }
});
/** Schema for `MVSTree` (MolViewSpec tree with all params provided) */
exports.FullMVSTreeSchema = (0, tree_schema_1.TreeSchemaWithAllRequired)(exports.MVSTreeSchema);
