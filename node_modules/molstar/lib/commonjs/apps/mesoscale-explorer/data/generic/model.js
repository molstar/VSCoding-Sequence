"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureFromGeneric = void 0;
const mat4_1 = require("../../../../mol-math/linear-algebra/3d/mat4");
const structure_1 = require("../../../../mol-model/structure");
const objects_1 = require("../../../../mol-plugin-state/objects");
const mol_task_1 = require("../../../../mol-task");
const mol_state_1 = require("../../../../mol-state");
const param_definition_1 = require("../../../../mol-util/param-definition");
const geometry_1 = require("../../../../mol-math/geometry");
const util_1 = require("../util");
const symmetry_1 = require("../../../../mol-model/structure/model/properties/symmetry");
const symmetry_2 = require("../../../../mol-model-formats/structure/property/symmetry");
const int_1 = require("../../../../mol-data/int");
const preset_1 = require("./preset");
const mol_util_1 = require("../../../../mol-util");
function createModelChainMap(model) {
    const builder = new structure_1.Structure.StructureBuilder();
    const units = new Map();
    const { label_asym_id, _rowCount } = model.atomicHierarchy.chains;
    const { offsets } = model.atomicHierarchy.chainAtomSegments;
    for (let i = 0; i < _rowCount; i++) {
        const elements = int_1.SortedArray.ofBounds(offsets[i], offsets[i + 1]);
        const unit = builder.addUnit(0 /* Unit.Kind.Atomic */, model, geometry_1.SymmetryOperator.Default, elements, structure_1.Unit.Trait.FastBoundary);
        units.set(label_asym_id.value(i), unit);
    }
    return units;
}
function buildAssembly(model, assembly) {
    const coordinateSystem = geometry_1.SymmetryOperator.create(assembly.id, mat4_1.Mat4.identity(), { assembly: { id: assembly.id, operId: 0, operList: [] } });
    const assembler = structure_1.Structure.Builder({
        coordinateSystem,
        label: model.label,
    });
    const units = createModelChainMap(model);
    for (const g of assembly.operatorGroups) {
        for (const oper of g.operators) {
            for (const id of g.asymIds) {
                const u = units.get(id);
                if (u) {
                    assembler.addWithOperator(u, oper);
                }
                else {
                    console.log(`missing asymId '${id}'`);
                }
            }
        }
    }
    return assembler.getStructure();
}
const EmptyInstances = {
    positions: { data: [] },
    rotations: { variant: 'euler', data: [] }
};
const StructureFromGeneric = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-from-generic',
    display: { name: 'Structure from Generic', description: 'Create a molecular structure from Generic models.' },
    from: objects_1.PluginStateObject.Molecule.Model,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: {
        instances: param_definition_1.ParamDefinition.Value(EmptyInstances),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text('')),
        description: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text('')),
        cellSize: param_definition_1.ParamDefinition.Numeric(500, { min: 0, max: 10000, step: 100 }),
    }
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Build Structure', async (ctx) => {
            var _a;
            const transforms = await (0, preset_1.getTransforms)(plugin, params.instances);
            if (transforms.length === 0)
                return mol_state_1.StateObject.Null;
            const model = a.data;
            const label = params.label || model.label;
            const base = structure_1.Structure.ofModel(a.data);
            let structure;
            if (transforms.length === 1 && mat4_1.Mat4.isIdentity(transforms[0])) {
                const symmetry = symmetry_2.ModelSymmetry.Provider.get(model);
                const id = (_a = symmetry === null || symmetry === void 0 ? void 0 : symmetry.assemblies[0]) === null || _a === void 0 ? void 0 : _a.id;
                const asm = symmetry_1.Symmetry.findAssembly(model, id || '');
                if (asm) {
                    structure = buildAssembly(model, asm);
                }
                else {
                    const mergedUnits = (0, util_1.partitionUnits)(base.units, params.cellSize);
                    structure = structure_1.Structure.create(mergedUnits, { label });
                }
            }
            else {
                const assembler = structure_1.Structure.Builder({ label });
                const unit = (0, util_1.mergeUnits)(base.units, 0);
                for (let i = 0, il = transforms.length; i < il; ++i) {
                    const t = transforms[i];
                    const op = geometry_1.SymmetryOperator.create(`op-${i}`, t);
                    assembler.addWithOperator(unit, op);
                }
                structure = assembler.getStructure();
            }
            const props = { label, description: params.description || structure_1.Structure.elementDescription(structure) };
            return new objects_1.PluginStateObject.Molecule.Structure(structure, props);
        });
    },
    update({ newParams, oldParams }, plugin) {
        if ((0, mol_util_1.deepEqual)(newParams, oldParams)) {
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        }
        if (oldParams.instances)
            releaseInstances(plugin, oldParams.instances);
        return mol_state_1.StateTransformer.UpdateResult.Recreate;
    },
    dispose({ b, params }, plugin) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
        if (params === null || params === void 0 ? void 0 : params.instances)
            releaseInstances(plugin, params.instances);
    }
});
exports.StructureFromGeneric = StructureFromGeneric;
function releaseInstances(plugin, instances) {
    if (!Array.isArray(instances.positions.data)) {
        plugin.managers.asset.release(instances.positions.data.file);
    }
    if (!Array.isArray(instances.rotations.data)) {
        plugin.managers.asset.release(instances.rotations.data.file);
    }
}
