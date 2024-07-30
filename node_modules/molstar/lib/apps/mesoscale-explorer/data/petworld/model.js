/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { getMatrices, operatorGroupsProvider } from '../../../../mol-model-formats/structure/property/assembly';
import { Structure, StructureElement, StructureProperties, Unit } from '../../../../mol-model/structure';
import { Assembly } from '../../../../mol-model/structure/model/properties/symmetry';
import { PluginStateObject as SO, PluginStateTransform } from '../../../../mol-plugin-state/objects';
import { Task } from '../../../../mol-task';
import { MmcifFormat } from '../../../../mol-model-formats/structure/mmcif';
import { arrayFind } from '../../../../mol-data/util';
import { StateObject, StateTransformer } from '../../../../mol-state';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { mergeUnits } from '../util';
import { deepEqual } from '../../../../mol-util';
export { StructureFromPetworld };
const StructureFromPetworld = PluginStateTransform.BuiltIn({
    name: 'structure-from-petworld',
    display: { name: 'Structure from PetWorld', description: 'Create a molecular structure from PetWorld models.' },
    from: SO.Molecule.Trajectory,
    to: SO.Molecule.Structure,
    params: {
        modelIndex: PD.Numeric(0),
        entityIds: PD.Value([]),
    }
})({
    apply({ a, params }) {
        return Task.create('Build Structure', async (ctx) => {
            const s = await buildModelsAssembly(a.data, '1', params.modelIndex, params.entityIds).runInContext(ctx);
            if (!s || !MmcifFormat.is(s.model.sourceData))
                return StateObject.Null;
            const { frame } = s.model.sourceData.data;
            const pdbx_model = frame.categories.pdbx_model.getField('name');
            const pdbx_description = frame.categories.pdbx_model.getField('description');
            const description = pdbx_description ? pdbx_description.str(params.modelIndex) : Structure.elementDescription(s);
            const label = pdbx_model.str(params.modelIndex);
            const props = { label, description: description };
            return new SO.Molecule.Structure(s, props);
        });
    },
    update({ newParams, oldParams }) {
        return deepEqual(newParams, oldParams)
            ? StateTransformer.UpdateResult.Unchanged
            : StateTransformer.UpdateResult.Recreate;
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
function buildModelsAssembly(trajectory, asmName, modelIndex, entitiyIds) {
    return Task.create('Build Models Assembly', async (ctx) => {
        const model = await Task.resolveInContext(trajectory.getFrameAtIndex(modelIndex), ctx);
        if (!MmcifFormat.is(model.sourceData))
            return;
        const { db, frame } = model.sourceData.data;
        const PDB_model_num = frame.categories.pdbx_struct_assembly_gen.getField('PDB_model_num');
        // hack to cache models assemblies
        if (!trajectory.__modelsAssemblies) {
            trajectory.__modelsAssemblies = createModelsAssemblies(db.pdbx_struct_assembly, db.pdbx_struct_assembly_gen, db.pdbx_struct_oper_list, PDB_model_num);
        }
        const modelsAssemblies = trajectory.__modelsAssemblies;
        const modelsAssembly = arrayFind(modelsAssemblies, ma => ma.assembly.id.toLowerCase() === asmName);
        if (!modelsAssembly)
            throw new Error(`Models Assembly '${asmName}' is not defined.`);
        const { assembly } = modelsAssembly;
        const assembler = Structure.Builder();
        const g = assembly.operatorGroups[modelIndex];
        const structure = Structure.ofModel(model);
        const l = StructureElement.Location.create(structure);
        const units = structure.units.filter(u => {
            l.unit = u;
            l.element = u.elements[0];
            return entitiyIds.includes(StructureProperties.entity.id(l));
        });
        const unit = mergeUnits(units, 0);
        for (const oper of g.operators) {
            assembler.addUnit(unit.kind, unit.model, oper, unit.elements, unit.traits | Unit.Trait.FastBoundary, unit.invariantId);
        }
        return assembler.getStructure();
    });
}
function createModelsAssemblies(pdbx_struct_assembly, pdbx_struct_assembly_gen, pdbx_struct_oper_list, PDB_model_num) {
    if (!pdbx_struct_assembly._rowCount)
        return [];
    const matrices = getMatrices(pdbx_struct_oper_list);
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
    const assembly = Assembly.create(id, details, operatorGroupsProvider(generators, matrices));
    return { assembly, modelNums };
}
