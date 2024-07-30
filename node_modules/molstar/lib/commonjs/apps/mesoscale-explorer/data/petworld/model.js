"use strict";
/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureFromPetworld = void 0;
const assembly_1 = require("../../../../mol-model-formats/structure/property/assembly");
const structure_1 = require("../../../../mol-model/structure");
const symmetry_1 = require("../../../../mol-model/structure/model/properties/symmetry");
const objects_1 = require("../../../../mol-plugin-state/objects");
const mol_task_1 = require("../../../../mol-task");
const mmcif_1 = require("../../../../mol-model-formats/structure/mmcif");
const util_1 = require("../../../../mol-data/util");
const mol_state_1 = require("../../../../mol-state");
const param_definition_1 = require("../../../../mol-util/param-definition");
const util_2 = require("../util");
const mol_util_1 = require("../../../../mol-util");
const StructureFromPetworld = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-from-petworld',
    display: { name: 'Structure from PetWorld', description: 'Create a molecular structure from PetWorld models.' },
    from: objects_1.PluginStateObject.Molecule.Trajectory,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: {
        modelIndex: param_definition_1.ParamDefinition.Numeric(0),
        entityIds: param_definition_1.ParamDefinition.Value([]),
    }
})({
    apply({ a, params }) {
        return mol_task_1.Task.create('Build Structure', async (ctx) => {
            const s = await buildModelsAssembly(a.data, '1', params.modelIndex, params.entityIds).runInContext(ctx);
            if (!s || !mmcif_1.MmcifFormat.is(s.model.sourceData))
                return mol_state_1.StateObject.Null;
            const { frame } = s.model.sourceData.data;
            const pdbx_model = frame.categories.pdbx_model.getField('name');
            const pdbx_description = frame.categories.pdbx_model.getField('description');
            const description = pdbx_description ? pdbx_description.str(params.modelIndex) : structure_1.Structure.elementDescription(s);
            const label = pdbx_model.str(params.modelIndex);
            const props = { label, description: description };
            return new objects_1.PluginStateObject.Molecule.Structure(s, props);
        });
    },
    update({ newParams, oldParams }) {
        return (0, mol_util_1.deepEqual)(newParams, oldParams)
            ? mol_state_1.StateTransformer.UpdateResult.Unchanged
            : mol_state_1.StateTransformer.UpdateResult.Recreate;
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.StructureFromPetworld = StructureFromPetworld;
function buildModelsAssembly(trajectory, asmName, modelIndex, entitiyIds) {
    return mol_task_1.Task.create('Build Models Assembly', async (ctx) => {
        const model = await mol_task_1.Task.resolveInContext(trajectory.getFrameAtIndex(modelIndex), ctx);
        if (!mmcif_1.MmcifFormat.is(model.sourceData))
            return;
        const { db, frame } = model.sourceData.data;
        const PDB_model_num = frame.categories.pdbx_struct_assembly_gen.getField('PDB_model_num');
        // hack to cache models assemblies
        if (!trajectory.__modelsAssemblies) {
            trajectory.__modelsAssemblies = createModelsAssemblies(db.pdbx_struct_assembly, db.pdbx_struct_assembly_gen, db.pdbx_struct_oper_list, PDB_model_num);
        }
        const modelsAssemblies = trajectory.__modelsAssemblies;
        const modelsAssembly = (0, util_1.arrayFind)(modelsAssemblies, ma => ma.assembly.id.toLowerCase() === asmName);
        if (!modelsAssembly)
            throw new Error(`Models Assembly '${asmName}' is not defined.`);
        const { assembly } = modelsAssembly;
        const assembler = structure_1.Structure.Builder();
        const g = assembly.operatorGroups[modelIndex];
        const structure = structure_1.Structure.ofModel(model);
        const l = structure_1.StructureElement.Location.create(structure);
        const units = structure.units.filter(u => {
            l.unit = u;
            l.element = u.elements[0];
            return entitiyIds.includes(structure_1.StructureProperties.entity.id(l));
        });
        const unit = (0, util_2.mergeUnits)(units, 0);
        for (const oper of g.operators) {
            assembler.addUnit(unit.kind, unit.model, oper, unit.elements, unit.traits | structure_1.Unit.Trait.FastBoundary, unit.invariantId);
        }
        return assembler.getStructure();
    });
}
function createModelsAssemblies(pdbx_struct_assembly, pdbx_struct_assembly_gen, pdbx_struct_oper_list, PDB_model_num) {
    if (!pdbx_struct_assembly._rowCount)
        return [];
    const matrices = (0, assembly_1.getMatrices)(pdbx_struct_oper_list);
    const assemblies = [];
    for (let i = 0; i < pdbx_struct_assembly._rowCount; i++) {
        assemblies[assemblies.length] = createModelsAssembly(pdbx_struct_assembly, pdbx_struct_assembly_gen, i, matrices, PDB_model_num);
    }
    return assemblies;
}
function createModelsAssembly(pdbx_struct_assembly, pdbx_struct_assembly_gen, index, matrices, PDB_model_num) {
    const id = pdbx_struct_assembly.id.value(index);
    const details = pdbx_struct_assembly.details.value(index);
    const generators = [];
    const modelNums = [];
    const { assembly_id, oper_expression, asym_id_list } = pdbx_struct_assembly_gen;
    for (let i = 0, _i = pdbx_struct_assembly_gen._rowCount; i < _i; i++) {
        if (assembly_id.value(i) !== id)
            continue;
        generators[generators.length] = {
            assemblyId: id,
            expression: oper_expression.value(i),
            asymIds: asym_id_list.value(i)
        };
        modelNums[modelNums.length] = PDB_model_num.int(i);
    }
    const assembly = symmetry_1.Assembly.create(id, details, (0, assembly_1.operatorGroupsProvider)(generators, matrices));
    return { assembly, modelNums };
}
