"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorT = exports.ColorNamesT = exports.HexColorT = exports.Matrix = exports.Vector3 = exports.SchemaFormatT = exports.SchemaT = exports.RepresentationTypeT = exports.ComponentExpressionT = exports.ComponentSelectorT = exports.StructureTypeT = exports.MolstarParseFormatT = exports.ParseFormatT = void 0;
const tslib_1 = require("tslib");
const iots = tslib_1.__importStar(require("io-ts"));
const utils_1 = require("../../helpers/utils");
const params_schema_1 = require("../generic/params-schema");
const names_1 = require("../../../../mol-util/color/names");
/** `format` parameter values for `parse` node in MVS tree */
exports.ParseFormatT = (0, params_schema_1.literal)('mmcif', 'bcif', 'pdb');
/** `format` parameter values for `parse` node in Molstar tree */
exports.MolstarParseFormatT = (0, params_schema_1.literal)('cif', 'pdb');
/** `kind` parameter values for `structure` node in MVS tree */
exports.StructureTypeT = (0, params_schema_1.literal)('model', 'assembly', 'symmetry', 'symmetry_mates');
/** `selector` parameter values for `component` node in MVS tree */
exports.ComponentSelectorT = (0, params_schema_1.literal)('all', 'polymer', 'protein', 'nucleic', 'branched', 'ligand', 'ion', 'water');
/** `selector` parameter values for `component` node in MVS tree */
exports.ComponentExpressionT = iots.partial({
    label_entity_id: params_schema_1.str,
    label_asym_id: params_schema_1.str,
    auth_asym_id: params_schema_1.str,
    label_seq_id: params_schema_1.int,
    auth_seq_id: params_schema_1.int,
    pdbx_PDB_ins_code: params_schema_1.str,
    beg_label_seq_id: params_schema_1.int,
    end_label_seq_id: params_schema_1.int,
    beg_auth_seq_id: params_schema_1.int,
    end_auth_seq_id: params_schema_1.int,
    label_atom_id: params_schema_1.str,
    auth_atom_id: params_schema_1.str,
    type_symbol: params_schema_1.str,
    atom_id: params_schema_1.int,
    atom_index: params_schema_1.int,
});
/** `type` parameter values for `representation` node in MVS tree */
exports.RepresentationTypeT = (0, params_schema_1.literal)('ball_and_stick', 'cartoon', 'surface');
/** `schema` parameter values for `*_from_uri` and `*_from_source` nodes in MVS tree */
exports.SchemaT = (0, params_schema_1.literal)('whole_structure', 'entity', 'chain', 'auth_chain', 'residue', 'auth_residue', 'residue_range', 'auth_residue_range', 'atom', 'auth_atom', 'all_atomic');
/** `format` parameter values for `*_from_uri` nodes in MVS tree */
exports.SchemaFormatT = (0, params_schema_1.literal)('cif', 'bcif', 'json');
/** Parameter values for vector params, e.g. `position` */
exports.Vector3 = (0, params_schema_1.tuple)([params_schema_1.float, params_schema_1.float, params_schema_1.float]);
/** Parameter values for matrix params, e.g. `rotation` */
exports.Matrix = (0, params_schema_1.list)(params_schema_1.float);
/** `color` parameter values for `color` node in MVS tree */
exports.HexColorT = new iots.Type('HexColor', ((value) => typeof value === 'string'), (value, ctx) => utils_1.HexColor.is(value) ? { _tag: 'Right', right: value } : { _tag: 'Left', left: [{ value: value, context: ctx, message: `"${value}" is not a valid hex color string` }] }, value => value);
/** `color` parameter values for `color` node in MVS tree */
exports.ColorNamesT = (0, params_schema_1.literal)(...Object.keys(names_1.ColorNames));
/** `color` parameter values for `color` node in MVS tree */
exports.ColorT = (0, params_schema_1.union)([exports.HexColorT, exports.ColorNamesT]);
