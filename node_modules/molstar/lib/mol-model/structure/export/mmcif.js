/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CifWriter } from '../../../mol-io/writer/cif';
import { _atom_site } from './categories/atom_site';
var CifCategory = CifWriter.Category;
import { _struct_conf, _struct_sheet_range } from './categories/secondary-structure';
import { _chem_comp, _chem_comp_bond, _pdbx_chem_comp_identifier, _pdbx_nonpoly_scheme } from './categories/misc';
import { getUniqueEntityIndicesFromStructures, copy_mmCif_category, copy_source_mmCifCategory } from './categories/utils';
import { _struct_asym, _entity_poly, _entity_poly_seq } from './categories/sequence';
import { CustomPropertyDescriptor } from '../../custom-property';
import { atom_site_operator_mapping } from './categories/atom_site_operator_mapping';
import { MmcifFormat } from '../../../mol-model-formats/structure/mmcif';
export var CifExportContext;
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
})(CifExportContext || (CifExportContext = {}));
const _entity = {
    name: 'entity',
    instance({ structures }) {
        const indices = getUniqueEntityIndicesFromStructures(structures);
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
    copy_mmCif_category('entry'),
    copy_mmCif_category('exptl'),
    _entity,
    // Symmetry
    copy_mmCif_category('cell', isWithoutSymmetry),
    copy_mmCif_category('symmetry', isWithoutSymmetry),
    // Assemblies
    copy_mmCif_category('pdbx_struct_assembly', isWithoutOperator),
    copy_mmCif_category('pdbx_struct_assembly_gen', isWithoutOperator),
    copy_mmCif_category('pdbx_struct_oper_list', isWithoutOperator),
    // Secondary structure
    _struct_conf,
    _struct_sheet_range,
    // Sequence
    _struct_asym,
    _entity_poly,
    _entity_poly_seq,
    // Branch
    copy_mmCif_category('pdbx_entity_branch'),
    copy_mmCif_category('pdbx_entity_branch_link'),
    copy_mmCif_category('pdbx_branch_scheme'),
    // Struct conn
    copy_mmCif_category('struct_conn'),
    // Misc
    _chem_comp,
    _chem_comp_bond,
    _pdbx_chem_comp_identifier,
    copy_mmCif_category('atom_sites'),
    _pdbx_nonpoly_scheme,
    // Atoms
    _atom_site
];
var _Filters;
(function (_Filters) {
    _Filters.AtomSitePositionsFieldNames = new Set(['id', 'Cartn_x', 'Cartn_y', 'Cartn_z']);
})(_Filters || (_Filters = {}));
export const mmCIF_Export_Filters = {
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
        const propId = CustomPropertyDescriptor.getUUID(customProp);
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
export function encode_mmCIF_categories(encoder, structures, params) {
    const first = Array.isArray(structures) ? structures[0] : structures;
    const models = first.models;
    if (models.length !== 1)
        throw new Error('Can\'t export stucture composed from multiple models.');
    const ctx = (params === null || params === void 0 ? void 0 : params.exportCtx) || CifExportContext.create(structures);
    if ((params === null || params === void 0 ? void 0 : params.copyAllCategories) && MmcifFormat.is(models[0].sourceData)) {
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
        const info = atom_site_operator_mapping(ctx);
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
    const mapping = atom_site_operator_mapping(ctx);
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
                const cat = copy_mmCif_category(catName);
                encoder.writeCategory(cat, ctx);
            }
            else {
                const cat = copy_source_mmCifCategory(encoder, ctx, data.frame.categories[catName]);
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
    const enc = CifWriter.createEncoder({ binary: asBinary });
    enc.startDataBlock(name);
    encode_mmCIF_categories(enc, structure, params);
    return enc.getData();
}
export { to_mmCIF };
