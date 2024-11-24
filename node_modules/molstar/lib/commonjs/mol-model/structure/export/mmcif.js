"use strict";
/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mmCIF_Export_Filters = exports.CifExportContext = void 0;
exports.encode_mmCIF_categories = encode_mmCIF_categories;
exports.to_mmCIF = to_mmCIF;
const cif_1 = require("../../../mol-io/writer/cif");
const atom_site_1 = require("./categories/atom_site");
var CifCategory = cif_1.CifWriter.Category;
const secondary_structure_1 = require("./categories/secondary-structure");
const misc_1 = require("./categories/misc");
const utils_1 = require("./categories/utils");
const sequence_1 = require("./categories/sequence");
const custom_property_1 = require("../../custom-property");
const atom_site_operator_mapping_1 = require("./categories/atom_site_operator_mapping");
const mmcif_1 = require("../../../mol-model-formats/structure/mmcif");
var CifExportContext;
(function (CifExportContext) {
    function create(structures) {
        const structureArray = Array.isArray(structures) ? structures : [structures];
        return {
            structures: structureArray,
            firstModel: structureArray[0].model,
            cache: Object.create(null)
        };
    }
    CifExportContext.create = create;
})(CifExportContext || (exports.CifExportContext = CifExportContext = {}));
const _entity = {
    name: 'entity',
    instance({ structures }) {
        const indices = (0, utils_1.getUniqueEntityIndicesFromStructures)(structures);
        return CifCategory.ofTable(structures[0].model.entities.data, indices);
    }
};
function isWithoutSymmetry(structure) {
    return structure.units.every(u => u.conformation.operator.isIdentity);
}
function isWithoutOperator(structure) {
    return isWithoutSymmetry(structure) && structure.units.every(u => !u.conformation.operator.assembly && !u.conformation.operator.suffix);
}
const Categories = [
    // Basics
    (0, utils_1.copy_mmCif_category)('entry'),
    (0, utils_1.copy_mmCif_category)('exptl'),
    _entity,
    // Symmetry
    (0, utils_1.copy_mmCif_category)('cell', isWithoutSymmetry),
    (0, utils_1.copy_mmCif_category)('symmetry', isWithoutSymmetry),
    // Assemblies
    (0, utils_1.copy_mmCif_category)('pdbx_struct_assembly', isWithoutOperator),
    (0, utils_1.copy_mmCif_category)('pdbx_struct_assembly_gen', isWithoutOperator),
    (0, utils_1.copy_mmCif_category)('pdbx_struct_oper_list', isWithoutOperator),
    // Secondary structure
    secondary_structure_1._struct_conf,
    secondary_structure_1._struct_sheet_range,
    // Sequence
    sequence_1._struct_asym,
    sequence_1._entity_poly,
    sequence_1._entity_poly_seq,
    // Branch
    (0, utils_1.copy_mmCif_category)('pdbx_entity_branch'),
    (0, utils_1.copy_mmCif_category)('pdbx_entity_branch_link'),
    (0, utils_1.copy_mmCif_category)('pdbx_branch_scheme'),
    // Struct conn
    (0, utils_1.copy_mmCif_category)('struct_conn'),
    // Misc
    misc_1._chem_comp,
    misc_1._chem_comp_bond,
    misc_1._pdbx_chem_comp_identifier,
    (0, utils_1.copy_mmCif_category)('atom_sites'),
    misc_1._pdbx_nonpoly_scheme,
    // Atoms
    atom_site_1._atom_site
];
var _Filters;
(function (_Filters) {
    _Filters.AtomSitePositionsFieldNames = new Set(['id', 'Cartn_x', 'Cartn_y', 'Cartn_z']);
})(_Filters || (_Filters = {}));
exports.mmCIF_Export_Filters = {
    onlyPositions: {
        includeCategory(name) { return name === 'atom_site'; },
        includeField(cat, field) { return _Filters.AtomSitePositionsFieldNames.has(field); }
    }
};
function getCustomPropCategories(customProp, ctx, params) {
    var _a;
    if (!customProp.cifExport || customProp.cifExport.categories.length === 0)
        return [];
    const prefix = customProp.cifExport.prefix;
    const cats = customProp.cifExport.categories;
    let propCtx = ctx;
    if (customProp.cifExport.context) {
        const propId = custom_property_1.CustomPropertyDescriptor.getUUID(customProp);
        if (ctx.cache[propId + '__ctx'])
            propCtx = ctx.cache[propId + '__ctx'];
        else {
            propCtx = customProp.cifExport.context(ctx) || ctx;
            ctx.cache[propId + '__ctx'] = propCtx;
        }
    }
    const ret = [];
    for (const cat of cats) {
        if ((_a = params === null || params === void 0 ? void 0 : params.skipCategoryNames) === null || _a === void 0 ? void 0 : _a.has(cat.name))
            continue;
        if (cat.name.indexOf(prefix) !== 0)
            throw new Error(`Custom category '${cat.name}' name must start with prefix '${prefix}.'`);
        ret.push([cat, propCtx]);
    }
    return ret;
}
/** Doesn't start a data block */
function encode_mmCIF_categories(encoder, structures, params) {
    const first = Array.isArray(structures) ? structures[0] : structures;
    const models = first.models;
    if (models.length !== 1)
        throw new Error('Can\'t export stucture composed from multiple models.');
    const ctx = (params === null || params === void 0 ? void 0 : params.exportCtx) || CifExportContext.create(structures);
    if ((params === null || params === void 0 ? void 0 : params.copyAllCategories) && mmcif_1.MmcifFormat.is(models[0].sourceData)) {
        encode_mmCIF_categories_copyAll(encoder, ctx, params);
    }
    else {
        encode_mmCIF_categories_default(encoder, ctx, params);
    }
}
function encode_mmCIF_categories_default(encoder, ctx, params) {
    var _a;
    for (const cat of Categories) {
        if ((params === null || params === void 0 ? void 0 : params.skipCategoryNames) && (params === null || params === void 0 ? void 0 : params.skipCategoryNames.has(cat.name)))
            continue;
        encoder.writeCategory(cat, ctx);
    }
    if (!((_a = params === null || params === void 0 ? void 0 : params.skipCategoryNames) === null || _a === void 0 ? void 0 : _a.has('atom_site')) && encoder.isCategoryIncluded('atom_site')) {
        const info = (0, atom_site_operator_mapping_1.atom_site_operator_mapping)(ctx);
        if (info)
            encoder.writeCategory(info[0], info[1], info[2]);
    }
    const _params = params || {};
    for (const customProp of ctx.firstModel.customProperties.all) {
        for (const [cat, propCtx] of getCustomPropCategories(customProp, ctx, _params)) {
            encoder.writeCategory(cat, propCtx);
        }
    }
    if (params === null || params === void 0 ? void 0 : params.customProperties) {
        for (const customProp of params === null || params === void 0 ? void 0 : params.customProperties) {
            for (const [cat, propCtx] of getCustomPropCategories(customProp, ctx, _params)) {
                encoder.writeCategory(cat, propCtx);
            }
        }
    }
    for (const s of ctx.structures) {
        if (!s.hasCustomProperties)
            continue;
        for (const customProp of s.customPropertyDescriptors.all) {
            for (const [cat, propCtx] of getCustomPropCategories(customProp, ctx, _params)) {
                encoder.writeCategory(cat, propCtx);
            }
        }
    }
}
function encode_mmCIF_categories_copyAll(encoder, ctx, params) {
    const providedCategories = new Map();
    for (const cat of Categories) {
        providedCategories.set(cat.name, [cat, ctx]);
    }
    const mapping = (0, atom_site_operator_mapping_1.atom_site_operator_mapping)(ctx);
    if (mapping)
        providedCategories.set(mapping[0].name, mapping);
    const _params = params || {};
    for (const customProp of ctx.firstModel.customProperties.all) {
        for (const info of getCustomPropCategories(customProp, ctx, _params)) {
            providedCategories.set(info[0].name, info);
        }
    }
    if (params === null || params === void 0 ? void 0 : params.customProperties) {
        for (const customProp of params === null || params === void 0 ? void 0 : params.customProperties) {
            for (const info of getCustomPropCategories(customProp, ctx, _params)) {
                providedCategories.set(info[0].name, info);
            }
        }
    }
    for (const s of ctx.structures) {
        if (!s.hasCustomProperties)
            continue;
        for (const customProp of s.customPropertyDescriptors.all) {
            for (const info of getCustomPropCategories(customProp, ctx)) {
                providedCategories.set(info[0].name, info);
            }
        }
    }
    const handled = new Set();
    const data = ctx.firstModel.sourceData.data;
    for (const catName of data.frame.categoryNames) {
        handled.add(catName);
        if (providedCategories.has(catName)) {
            const info = providedCategories.get(catName);
            encoder.writeCategory(info[0], info[1], info[2]);
        }
        else {
            if (data.db[catName]) {
                const cat = (0, utils_1.copy_mmCif_category)(catName);
                encoder.writeCategory(cat, ctx);
            }
            else {
                const cat = (0, utils_1.copy_source_mmCifCategory)(encoder, ctx, data.frame.categories[catName]);
                if (cat)
                    encoder.writeCategory(cat);
            }
        }
    }
    providedCategories.forEach((info, name) => {
        if (!handled.has(name))
            encoder.writeCategory(info[0], info[1], info[2]);
    });
}
function to_mmCIF(name, structure, asBinary = false, params) {
    const enc = cif_1.CifWriter.createEncoder({ binary: asBinary });
    enc.startDataBlock(name);
    encode_mmCIF_categories(enc, structure, params);
    return enc.getData();
}
