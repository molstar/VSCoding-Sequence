"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCryst1 = parseCryst1;
exports.parseRemark350 = parseRemark350;
exports.parseMtrix = parseMtrix;
const cif_1 = require("../../../mol-io/reader/cif");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
function parseCryst1(id, record) {
    // COLUMNS       DATA TYPE      CONTENTS
    // --------------------------------------------------------------------------------
    //  1 -  6       Record name    "CRYST1"
    //  7 - 15       Real(9.3)      a (Angstroms)
    // 16 - 24       Real(9.3)      b (Angstroms)
    // 25 - 33       Real(9.3)      c (Angstroms)
    // 34 - 40       Real(7.2)      alpha (degrees)
    // 41 - 47       Real(7.2)      beta (degrees)
    // 48 - 54       Real(7.2)      gamma (degrees)
    // 56 - 66       LString        Space group
    // 67 - 70       Integer        Z value
    const get = (s, l) => (record.substr(s, l) || '').trim();
    const cell = {
        entry_id: cif_1.CifField.ofString(id),
        length_a: cif_1.CifField.ofString(get(6, 9)),
        length_b: cif_1.CifField.ofString(get(15, 9)),
        length_c: cif_1.CifField.ofString(get(24, 9)),
        angle_alpha: cif_1.CifField.ofString(get(33, 7)),
        angle_beta: cif_1.CifField.ofString(get(40, 7)),
        angle_gamma: cif_1.CifField.ofString(get(47, 7)),
        Z_PDB: cif_1.CifField.ofString(get(66, 4)),
        pdbx_unique_axis: cif_1.CifField.ofString('?')
    };
    const symmetry = {
        entry_id: cif_1.CifField.ofString(id),
        'space_group_name_H-M': cif_1.CifField.ofString(get(55, 11)),
        Int_Tables_number: cif_1.CifField.ofString('?'),
        cell_setting: cif_1.CifField.ofString('?'),
        space_group_name_Hall: cif_1.CifField.ofString('?')
    };
    return [cif_1.CifCategory.ofFields('cell', cell), cif_1.CifCategory.ofFields('symmetry', symmetry)];
}
function PdbAssembly(id, details) {
    return { id, details, groups: [] };
}
function parseRemark350(lines, lineStart, lineEnd) {
    const assemblies = [];
    // Read the assemblies
    let current, group, matrix, operId = 1, asmId = 1;
    const getLine = (n) => lines.data.substring(lines.indices[2 * n], lines.indices[2 * n + 1]);
    for (let i = lineStart; i < lineEnd; i++) {
        let line = getLine(i);
        if (line.substr(11, 12) === 'BIOMOLECULE:') {
            const id = line.substr(23).trim();
            let details = `Biomolecule ${id}`;
            line = getLine(i + 1);
            if (line.substr(11, 30) !== 'APPLY THE FOLLOWING TO CHAINS:') {
                i++;
                details = line.substr(11).trim();
            }
            current = PdbAssembly(id, details);
            assemblies.push(current);
        }
        else if (line.substr(13, 5) === 'BIOMT') {
            const biomt = line.split(/\s+/);
            const row = parseInt(line[18]) - 1;
            if (row === 0) {
                matrix = linear_algebra_1.Mat4.identity();
                group.operators.push({ id: operId++, matrix });
            }
            linear_algebra_1.Mat4.setValue(matrix, row, 0, parseFloat(biomt[4]));
            linear_algebra_1.Mat4.setValue(matrix, row, 1, parseFloat(biomt[5]));
            linear_algebra_1.Mat4.setValue(matrix, row, 2, parseFloat(biomt[6]));
            linear_algebra_1.Mat4.setValue(matrix, row, 3, parseFloat(biomt[7]));
        }
        else if (line.substr(11, 30) === 'APPLY THE FOLLOWING TO CHAINS:' ||
            line.substr(11, 30) === '                   AND CHAINS:') {
            if (line.substr(11, 5) === 'APPLY') {
                group = { chains: [], operators: [] };
                current.groups.push(group);
            }
            const chainList = line.substr(41, 30).split(',');
            for (let j = 0, jl = chainList.length; j < jl; ++j) {
                const c = chainList[j].trim();
                if (c)
                    group.chains.push(c);
            }
        }
        else if (line.substr(11, 33) === 'APPLYING THE FOLLOWING TO CHAINS:') {
            // variant in older PDB format version
            current = PdbAssembly(`${asmId}`, `Biomolecule ${asmId}`);
            assemblies.push(current);
            asmId += 1;
            group = { chains: [], operators: [] };
            current.groups.push(group);
            i++;
            line = getLine(i);
            const chainList = line.substr(11, 69).split(',');
            for (let j = 0, jl = chainList.length; j < jl; ++j) {
                const c = chainList[j].trim();
                if (c)
                    group.chains.push(c);
            }
        }
    }
    if (assemblies.length === 0)
        return [];
    // Generate CIF
    // pdbx_struct_assembly
    const pdbx_struct_assembly = {
        id: cif_1.CifField.ofStrings(assemblies.map(a => a.id)),
        details: cif_1.CifField.ofStrings(assemblies.map(a => a.details))
    };
    // pdbx_struct_assembly_gen
    const pdbx_struct_assembly_gen_rows = [];
    for (const asm of assemblies) {
        for (const group of asm.groups) {
            pdbx_struct_assembly_gen_rows.push({
                assembly_id: asm.id,
                oper_expression: group.operators.map(o => o.id).join(','),
                asym_id_list: group.chains.join(',')
            });
        }
    }
    const pdbx_struct_assembly_gen = {
        assembly_id: cif_1.CifField.ofStrings(pdbx_struct_assembly_gen_rows.map(r => r.assembly_id)),
        oper_expression: cif_1.CifField.ofStrings(pdbx_struct_assembly_gen_rows.map(r => r.oper_expression)),
        asym_id_list: cif_1.CifField.ofStrings(pdbx_struct_assembly_gen_rows.map(r => r.asym_id_list))
    };
    // pdbx_struct_oper_list
    const pdbx_struct_oper_list_rows = [];
    for (const asm of assemblies) {
        for (const group of asm.groups) {
            for (const oper of group.operators) {
                const row = {
                    id: '' + oper.id,
                    type: '?',
                    name: '?',
                    symmetry_operation: '?'
                };
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        row[`matrix[${i + 1}][${j + 1}]`] = '' + linear_algebra_1.Mat4.getValue(oper.matrix, i, j);
                    }
                    row[`vector[${i + 1}]`] = '' + linear_algebra_1.Mat4.getValue(oper.matrix, i, 3);
                }
                pdbx_struct_oper_list_rows.push(row);
            }
        }
    }
    const pdbx_struct_oper_list = {
        id: cif_1.CifField.ofStrings(pdbx_struct_oper_list_rows.map(r => r.id)),
        type: cif_1.CifField.ofStrings(pdbx_struct_oper_list_rows.map(r => r.type)),
        name: cif_1.CifField.ofStrings(pdbx_struct_oper_list_rows.map(r => r.name)),
        symmetry_operation: cif_1.CifField.ofStrings(pdbx_struct_oper_list_rows.map(r => r.symmetry_operation))
    };
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const k = `matrix[${i + 1}][${j + 1}]`;
            pdbx_struct_oper_list[k] = cif_1.CifField.ofStrings(pdbx_struct_oper_list_rows.map(r => r[k]));
        }
        const k = `vector[${i + 1}]`;
        pdbx_struct_oper_list[k] = cif_1.CifField.ofStrings(pdbx_struct_oper_list_rows.map(r => r[k]));
    }
    return [
        cif_1.CifCategory.ofFields('pdbx_struct_assembly', pdbx_struct_assembly),
        cif_1.CifCategory.ofFields('pdbx_struct_assembly_gen', pdbx_struct_assembly_gen),
        cif_1.CifCategory.ofFields('pdbx_struct_oper_list', pdbx_struct_oper_list)
    ];
}
function parseMtrix(lines, lineStart, lineEnd) {
    const matrices = [];
    let matrix;
    const getLine = (n) => lines.data.substring(lines.indices[2 * n], lines.indices[2 * n + 1]);
    for (let i = lineStart; i < lineEnd; i++) {
        const line = getLine(i);
        const ncs = line.split(/\s+/);
        const row = parseInt(line[5]) - 1;
        if (row === 0) {
            matrix = linear_algebra_1.Mat4.identity();
            matrices.push(matrix);
        }
        linear_algebra_1.Mat4.setValue(matrix, row, 0, parseFloat(ncs[2]));
        linear_algebra_1.Mat4.setValue(matrix, row, 1, parseFloat(ncs[3]));
        linear_algebra_1.Mat4.setValue(matrix, row, 2, parseFloat(ncs[4]));
        linear_algebra_1.Mat4.setValue(matrix, row, 3, parseFloat(ncs[5]));
    }
    if (matrices.length === 0)
        return [];
    const struct_ncs_oper_rows = [];
    let id = 1;
    for (const oper of matrices) {
        const row = {
            id: 'ncsop' + (id++),
            code: '.',
            details: '.'
        };
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                row[`matrix[${i + 1}][${j + 1}]`] = '' + linear_algebra_1.Mat4.getValue(oper, i, j);
            }
            row[`vector[${i + 1}]`] = '' + linear_algebra_1.Mat4.getValue(oper, i, 3);
        }
        struct_ncs_oper_rows.push(row);
    }
    const struct_ncs_oper = {
        id: cif_1.CifField.ofStrings(struct_ncs_oper_rows.map(r => r.id)),
        code: cif_1.CifField.ofStrings(struct_ncs_oper_rows.map(r => r.code)),
        details: cif_1.CifField.ofStrings(struct_ncs_oper_rows.map(r => r.details)),
    };
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const k = `matrix[${i + 1}][${j + 1}]`;
            struct_ncs_oper[k] = cif_1.CifField.ofStrings(struct_ncs_oper_rows.map(r => r[k]));
        }
        const k = `vector[${i + 1}]`;
        struct_ncs_oper[k] = cif_1.CifField.ofStrings(struct_ncs_oper_rows.map(r => r[k]));
    }
    return [cif_1.CifCategory.ofFields('struct_ncs_oper', struct_ncs_oper)];
}
