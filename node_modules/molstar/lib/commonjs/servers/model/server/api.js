"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryList = exports.AtomSiteTestRestParams = exports.AtomSiteSchemaElement = exports.CommonQueryParamsInfo = exports.QueryParamType = void 0;
exports.getQueryByName = getQueryByName;
exports.normalizeRestQueryParams = normalizeRestQueryParams;
exports.normalizeRestCommonParams = normalizeRestCommonParams;
const structure_1 = require("../../../mol-model/structure");
const atoms_1 = require("../query/atoms");
const schemas_1 = require("../query/schemas");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
var QueryParamType;
(function (QueryParamType) {
    QueryParamType[QueryParamType["JSON"] = 0] = "JSON";
    QueryParamType[QueryParamType["String"] = 1] = "String";
    QueryParamType[QueryParamType["Integer"] = 2] = "Integer";
    QueryParamType[QueryParamType["Boolean"] = 3] = "Boolean";
    QueryParamType[QueryParamType["Float"] = 4] = "Float";
})(QueryParamType || (exports.QueryParamType = QueryParamType = {}));
exports.CommonQueryParamsInfo = [
    { name: 'model_nums', type: QueryParamType.String, description: `A comma-separated list of model ids (i.e. 1,2). If set, only include atoms with the corresponding '_atom_site.pdbx_PDB_model_num' field.` },
    { name: 'encoding', type: QueryParamType.String, defaultValue: 'cif', description: `Determines the output encoding (text based 'CIF' or binary 'BCIF'). Ligands can also be exported as 'SDF', 'MOL', or 'MOL2'.`, supportedValues: ['cif', 'bcif', 'sdf', 'mol', 'mol2'] },
    { name: 'copy_all_categories', type: QueryParamType.Boolean, defaultValue: false, description: 'If true, copy all categories from the input file.' },
    { name: 'data_source', type: QueryParamType.String, defaultValue: '', description: 'Allows to control how the provided data source ID maps to input file (as specified by the server instance config).' },
    { name: 'transform', type: QueryParamType.String, description: `Transformation to apply to coordinates in '_atom_site'. Accepts a 4x4 transformation matrix, provided as array of 16 float values.` },
    { name: 'download', type: QueryParamType.Boolean, defaultValue: false, description: 'If true, browser will download text files.' },
    { name: 'filename', type: QueryParamType.String, defaultValue: '', description: `Controls the filename for downloaded files. Will force download if specified.` }
];
exports.AtomSiteSchemaElement = {
    label_entity_id: { type: QueryParamType.String, groupName: 'atom_site' },
    label_asym_id: { type: QueryParamType.String, groupName: 'atom_site' },
    auth_asym_id: { type: QueryParamType.String, groupName: 'atom_site' },
    label_comp_id: { type: QueryParamType.String, groupName: 'atom_site' },
    auth_comp_id: { type: QueryParamType.String, groupName: 'atom_site' },
    label_seq_id: { type: QueryParamType.Integer, groupName: 'atom_site' },
    auth_seq_id: { type: QueryParamType.Integer, groupName: 'atom_site' },
    pdbx_PDB_ins_code: { type: QueryParamType.String, groupName: 'atom_site' },
    label_atom_id: { type: QueryParamType.String, groupName: 'atom_site' },
    auth_atom_id: { type: QueryParamType.String, groupName: 'atom_site' },
    type_symbol: { type: QueryParamType.String, groupName: 'atom_site' }
};
const AtomSiteTestJsonParam = {
    name: 'atom_site',
    type: QueryParamType.JSON,
    description: 'Object or array of objects describing atom properties. Names are same as in wwPDB mmCIF dictionary of the atom_site category.',
    exampleValues: [[{ label_seq_id: 30, label_asym_id: 'A' }, { label_seq_id: 31, label_asym_id: 'A' }], { label_comp_id: 'ALA' }]
};
exports.AtomSiteTestRestParams = (function () {
    const params = [];
    for (const k of Object.keys(exports.AtomSiteSchemaElement)) {
        const p = exports.AtomSiteSchemaElement[k];
        p.name = k;
        params.push(p);
    }
    return params;
})();
const RadiusParam = {
    name: 'radius',
    type: QueryParamType.Float,
    defaultValue: 5,
    exampleValues: [5],
    description: 'Value in Angstroms.',
    validation(v) {
        if (v < 1 || v > 10) {
            throw new Error('Invalid radius for residue interaction query (must be a value between 1 and 10).');
        }
    }
};
const AssemblyNameParam = {
    name: 'assembly_name',
    type: QueryParamType.String,
    description: 'Assembly name. If none is provided, crystal symmetry (where available) or deposited model is used.'
};
const OmitWaterParam = {
    name: 'omit_water',
    type: QueryParamType.Boolean,
    required: false,
    defaultValue: false
};
function Q(definition) {
    return definition;
}
const QueryMap = {
    'full': Q({ niceName: 'Full Structure', query: () => structure_1.Queries.generators.all, description: 'The full structure.' }),
    'ligand': Q({
        niceName: 'Ligand',
        description: 'Coordinates of the first group satisfying the given criteria.',
        query: (p, _s, numModels) => {
            const tests = (0, atoms_1.getAtomsTests)(p.atom_site);
            const ligands = structure_1.Queries.combinators.merge(tests.map(test => structure_1.Queries.generators.atoms({
                ...test,
                unitTest: ctx => structure_1.StructureProperties.unit.model_num(ctx.element) === numModels[0],
                groupBy: ctx => structure_1.StructureProperties.residue.key(ctx.element)
            })));
            return structure_1.Queries.filters.first(ligands);
        },
        jsonParams: [AtomSiteTestJsonParam],
        restParams: exports.AtomSiteTestRestParams
    }),
    'atoms': Q({
        niceName: 'Atoms',
        description: 'Atoms satisfying the given criteria.',
        query: p => {
            return structure_1.Queries.combinators.merge((0, atoms_1.getAtomsTests)(p.atom_site).map(test => structure_1.Queries.generators.atoms(test)));
        },
        jsonParams: [AtomSiteTestJsonParam],
        restParams: exports.AtomSiteTestRestParams
    }),
    'symmetryMates': Q({
        niceName: 'Symmetry Mates',
        description: 'Computes crystal symmetry mates within the specified radius.',
        query: () => structure_1.Queries.generators.all,
        structureTransform(p, s) {
            return structure_1.StructureSymmetry.builderSymmetryMates(s, p.radius).run();
        },
        jsonParams: [RadiusParam],
        filter: schemas_1.QuerySchemas.assembly
    }),
    'assembly': Q({
        niceName: 'Assembly',
        description: 'Computes structural assembly.',
        query: () => structure_1.Queries.generators.all,
        structureTransform(p, s) {
            return structure_1.StructureSymmetry.buildAssembly(s, '' + (p.name || '1')).run();
        },
        jsonParams: [{
                name: 'name',
                type: QueryParamType.String,
                defaultValue: '1',
                exampleValues: ['1'],
                description: 'Assembly name.'
            }],
        filter: schemas_1.QuerySchemas.assembly
    }),
    'residueInteraction': Q({
        niceName: 'Residue Interaction',
        description: 'Identifies all residues within the given radius from the source residue. Takes crystal symmetry into account.',
        query(p) {
            const tests = (0, atoms_1.getAtomsTests)(p.atom_site);
            const center = structure_1.Queries.combinators.merge(tests.map(test => structure_1.Queries.generators.atoms({
                ...test,
                entityTest: test.entityTest
                    ? ctx => test.entityTest(ctx) && ctx.element.unit.conformation.operator.isIdentity
                    : ctx => ctx.element.unit.conformation.operator.isIdentity
            })));
            return structure_1.Queries.modifiers.includeSurroundings(center, { radius: p.radius !== void 0 ? p.radius : 5, wholeResidues: true });
        },
        structureTransform(p, s) {
            if (p.assembly_name)
                return structure_1.StructureSymmetry.buildAssembly(s, '' + p.assembly_name).run();
            return structure_1.StructureSymmetry.builderSymmetryMates(s, p.radius !== void 0 ? p.radius : 5).run();
        },
        jsonParams: [AtomSiteTestJsonParam, RadiusParam, AssemblyNameParam],
        restParams: [...exports.AtomSiteTestRestParams, RadiusParam, AssemblyNameParam],
        filter: schemas_1.QuerySchemas.interaction
    }),
    'residueSurroundings': Q({
        niceName: 'Residue Surroundings',
        description: 'Identifies all residues within the given radius from the source residue.',
        query(p) {
            const center = structure_1.Queries.combinators.merge((0, atoms_1.getAtomsTests)(p.atom_site).map(test => structure_1.Queries.generators.atoms(test)));
            return structure_1.Queries.modifiers.includeSurroundings(center, { radius: p.radius, wholeResidues: true });
        },
        jsonParams: [AtomSiteTestJsonParam, RadiusParam],
        restParams: [...exports.AtomSiteTestRestParams, RadiusParam],
        filter: schemas_1.QuerySchemas.interaction
    }),
    'surroundingLigands': Q({
        niceName: 'Surrounding Ligands',
        description: 'Identifies (complete) ligands within the given radius from the source atom set. Takes crystal symmetry into account.',
        query(p) {
            const tests = (0, atoms_1.getAtomsTests)(p.atom_site);
            const center = structure_1.Queries.combinators.merge(tests.map(test => structure_1.Queries.generators.atoms({
                ...test,
                entityTest: test.entityTest
                    ? ctx => test.entityTest(ctx) && ctx.element.unit.conformation.operator.isIdentity
                    : ctx => ctx.element.unit.conformation.operator.isIdentity
            })));
            return structure_1.Queries.modifiers.surroundingLigands({ query: center, radius: p.radius !== void 0 ? p.radius : 5, includeWater: !p.omit_water });
        },
        structureTransform(p, s) {
            if (p.assembly_name)
                return structure_1.StructureSymmetry.buildAssembly(s, '' + p.assembly_name).run();
            return structure_1.StructureSymmetry.builderSymmetryMates(s, p.radius !== void 0 ? p.radius : 5).run();
        },
        jsonParams: [AtomSiteTestJsonParam, RadiusParam, OmitWaterParam, AssemblyNameParam],
        restParams: [...exports.AtomSiteTestRestParams, RadiusParam, OmitWaterParam, AssemblyNameParam],
        filter: schemas_1.QuerySchemas.interaction
    }),
};
function getQueryByName(name) {
    return QueryMap[name];
}
exports.QueryList = (function () {
    const list = [];
    for (const k of Object.keys(QueryMap))
        list.push({ name: k, definition: QueryMap[k] });
    list.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
    return list;
})();
// normalize the queries
(function () {
    for (const q of exports.QueryList) {
        const m = q.definition;
        m.name = q.name;
        m.jsonParams = m.jsonParams || [];
        m.restParams = m.restParams || m.jsonParams;
    }
})();
function _normalizeQueryParams(params, paramList) {
    const ret = {};
    for (const p of paramList) {
        const key = p.name;
        const value = params[key];
        let el;
        if (typeof value === 'undefined' || (typeof value !== 'undefined' && value !== null && value['length'] === 0)) {
            if (p.required) {
                throw new Error(`The parameter '${key}' is required.`);
            }
            if (typeof p.defaultValue !== 'undefined')
                el = p.defaultValue;
        }
        else {
            switch (p.type) {
                case QueryParamType.JSON:
                    el = JSON.parse(value);
                    break;
                case QueryParamType.String:
                    el = value;
                    break;
                case QueryParamType.Integer:
                    el = parseInt(value);
                    break;
                case QueryParamType.Float:
                    el = parseFloat(value);
                    break;
                case QueryParamType.Boolean:
                    el = Boolean(+value);
                    break;
            }
            if (p.validation)
                p.validation(el);
        }
        if (typeof el === 'undefined')
            continue;
        if (p.groupName) {
            if (typeof ret[p.groupName] === 'undefined')
                ret[p.groupName] = {};
            ret[p.groupName][key] = el;
        }
        else {
            ret[key] = el;
        }
    }
    return ret;
}
function normalizeRestQueryParams(query, params) {
    // return params;
    return _normalizeQueryParams(params, query.restParams);
}
function normalizeRestCommonParams(params) {
    return {
        model_nums: params.model_nums ? ('' + params.model_nums).split(',').map(n => n.trim()).filter(n => !!n).map(n => +n) : void 0,
        data_source: params.data_source,
        copy_all_categories: isTrue(params.copy_all_categories),
        encoding: mapEncoding(('' + params.encoding).toLocaleLowerCase()),
        transform: params.transform ? ('' + params.transform).split(',').map(n => n.trim()).map(n => +n) : linear_algebra_1.Mat4.identity(),
        download: isTrue(params.download) || !!params.filename,
        filename: params.filename
    };
}
function isTrue(val) {
    const b = Boolean(val);
    if (!b)
        return false;
    if (typeof val === 'string')
        return val !== '0' && val.toLowerCase() !== 'false';
    return b;
}
function mapEncoding(value) {
    switch (value) {
        case 'bcif':
            return 'bcif';
        case 'mol':
            return 'mol';
        case 'mol2':
            return 'mol2';
        case 'sdf':
            return 'sdf';
        default:
            return 'cif';
    }
}
