"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtomsTests = getAtomsTests;
const structure_1 = require("../../../mol-model/structure");
const types_1 = require("../../../mol-model/structure/model/types");
function getAtomsTests(params) {
    if (!params)
        return [{}];
    if (Array.isArray(params)) {
        return params.map(p => atomsTest(p));
    }
    else {
        return [atomsTest(params)];
    }
}
function atomsTest(params) {
    return {
        entityTest: entityTest(params),
        chainTest: chainTest(params),
        residueTest: residueTest(params),
        atomTest: atomTest(params)
    };
}
function entityTest(params) {
    if (!params || typeof params.label_entity_id === 'undefined')
        return void 0;
    const p = structure_1.StructureProperties.entity.id, id = '' + params.label_entity_id;
    return ctx => p(ctx.element) === id;
}
function chainTest(params) {
    if (!params)
        return void 0;
    if (typeof params.label_asym_id !== 'undefined') {
        const p = structure_1.StructureProperties.chain.label_asym_id, id = '' + params.label_asym_id;
        return ctx => p(ctx.element) === id;
    }
    if (typeof params.auth_asym_id !== 'undefined') {
        const p = structure_1.StructureProperties.chain.auth_asym_id, id = '' + params.auth_asym_id;
        return ctx => p(ctx.element) === id;
    }
    return void 0;
}
function residueTest(params) {
    if (!params)
        return void 0;
    const props = [], values = [];
    if (typeof params.label_seq_id !== 'undefined') {
        props.push(structure_1.StructureProperties.residue.label_seq_id);
        values.push(+params.label_seq_id);
    }
    if (typeof params.auth_seq_id !== 'undefined') {
        props.push(structure_1.StructureProperties.residue.auth_seq_id);
        values.push(+params.auth_seq_id);
    }
    if (typeof params.pdbx_PDB_ins_code !== 'undefined') {
        props.push(structure_1.StructureProperties.residue.pdbx_PDB_ins_code);
        values.push(params.pdbx_PDB_ins_code);
    }
    return andEqual(props, values);
}
function atomTest(params) {
    if (!params)
        return void 0;
    const props = [], values = [];
    if (typeof params.label_atom_id !== 'undefined') {
        props.push(structure_1.StructureProperties.atom.label_atom_id);
        values.push(params.label_atom_id);
    }
    if (typeof params.auth_atom_id !== 'undefined') {
        props.push(structure_1.StructureProperties.atom.auth_atom_id);
        values.push(params.auth_atom_id);
    }
    if (typeof params.type_symbol !== 'undefined') {
        props.push(structure_1.StructureProperties.atom.type_symbol);
        values.push((0, types_1.ElementSymbol)(params.type_symbol));
    }
    if (typeof params.label_comp_id !== 'undefined') {
        props.push(structure_1.StructureProperties.atom.label_comp_id);
        values.push(params.label_comp_id);
    }
    if (typeof params.auth_comp_id !== 'undefined') {
        props.push(structure_1.StructureProperties.atom.auth_comp_id);
        values.push(params.auth_comp_id);
    }
    return andEqual(props, values);
}
function andEqual(props, values) {
    switch (props.length) {
        case 0: return void 0;
        case 1: return ctx => props[0](ctx.element) === values[0];
        case 2: return ctx => props[0](ctx.element) === values[0] && props[1](ctx.element) === values[1];
        case 3: return ctx => props[0](ctx.element) === values[0] && props[1](ctx.element) === values[1] && props[2](ctx.element) === values[2];
        default: {
            const len = props.length;
            return ctx => {
                for (let i = 0; i < len; i++)
                    if (!props[i](ctx.element) !== values[i])
                        return false;
                return true;
            };
        }
    }
}
