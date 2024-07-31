"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MmcifStructure = exports.MmcifAssembly = void 0;
const int_1 = require("../../../../mol-data/int");
const geometry_1 = require("../../../../mol-math/geometry");
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const symmetry_1 = require("../../../../mol-model-formats/structure/property/symmetry");
const custom_structure_property_1 = require("../../../../mol-model-props/common/custom-structure-property");
const structure_1 = require("../../../../mol-model/structure");
const symmetry_2 = require("../../../../mol-model/structure/model/properties/symmetry");
const objects_1 = require("../../../../mol-plugin-state/objects");
const transformer_1 = require("../../../../mol-state/transformer");
const mol_task_1 = require("../../../../mol-task");
const mol_util_1 = require("../../../../mol-util");
const param_definition_1 = require("../../../../mol-util/param-definition");
const util_1 = require("../util");
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
    const coordinateSystem = geometry_1.SymmetryOperator.create(assembly.id, linear_algebra_1.Mat4.identity(), { assembly: { id: assembly.id, operId: 0, operList: [] } });
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
const MmcifAssembly = objects_1.PluginStateTransform.BuiltIn({
    name: 'mmcif-assembly',
    display: { name: 'Mmcif Assembly' },
    from: objects_1.PluginStateObject.Molecule.Model,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: {
        id: param_definition_1.ParamDefinition.Text('', { label: 'Asm Id', description: 'Assembly Id (use empty for the 1st assembly)' }),
    }
})({
    canAutoUpdate({ newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Build Structure', async (ctx) => {
            const model = a.data;
            let id = params.id;
            let asm = void 0;
            const symmetry = symmetry_1.ModelSymmetry.Provider.get(model);
            // if no id is specified, use the 1st assembly.
            if (!id && symmetry && symmetry.assemblies.length !== 0) {
                id = symmetry.assemblies[0].id;
            }
            if (!symmetry || symmetry.assemblies.length === 0) {
                plugin.log.warn(`Model '${model.entryId}' has no assembly, returning model structure.`);
            }
            else {
                asm = symmetry_2.Symmetry.findAssembly(model, id || '');
                if (!asm) {
                    plugin.log.warn(`Model '${model.entryId}' has no assembly called '${id}', returning model structure.`);
                }
            }
            const base = structure_1.Structure.ofModel(model);
            if (!asm) {
                const label = { label: 'Model', description: structure_1.Structure.elementDescription(base) };
                return new objects_1.PluginStateObject.Molecule.Structure(base, label);
            }
            const s = buildAssembly(model, asm);
            const objProps = { label: `Assembly ${id}`, description: structure_1.Structure.elementDescription(s) };
            return new objects_1.PluginStateObject.Molecule.Structure(s, objProps);
        });
    },
    update({ newParams, oldParams }) {
        return (0, mol_util_1.deepEqual)(newParams, oldParams)
            ? transformer_1.StateTransformer.UpdateResult.Unchanged
            : transformer_1.StateTransformer.UpdateResult.Recreate;
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.MmcifAssembly = MmcifAssembly;
const UnitsByEntity = custom_structure_property_1.CustomStructureProperty.createSimple('units_by_entity', 'root');
function getUnitsByEntity(structure) {
    if (UnitsByEntity.get(structure).value) {
        return UnitsByEntity.get(structure).value;
    }
    const atomicIndex = structure.model.atomicHierarchy.index;
    const spheresIndex = structure.model.coarseHierarchy.spheres;
    const map = new Map();
    for (const ug of structure.unitSymmetryGroups) {
        const u = ug.units[0];
        let e;
        if (structure_1.Unit.isAtomic(u)) {
            e = atomicIndex.getEntityFromChain(u.chainIndex[u.elements[0]]);
        }
        else if (structure_1.Unit.isSpheres(u)) {
            e = spheresIndex.getEntityFromChain(u.coarseElements.chainElementSegments.index[u.elements[0]]);
        }
        else {
            continue;
        }
        if (!map.has(e))
            map.set(e, []);
        const entityUnits = map.get(e);
        for (let i = 0, il = ug.units.length; i < il; ++i) {
            entityUnits.push(ug.units[i]);
        }
    }
    UnitsByEntity.set(structure, { value: map }, map);
    return map;
}
const MmcifStructure = objects_1.PluginStateTransform.BuiltIn({
    name: 'mmcif-structure',
    display: { name: 'Mmcif Structure' },
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: {
        structureRef: param_definition_1.ParamDefinition.Text(''),
        entityId: param_definition_1.ParamDefinition.Text(''),
        cellSize: param_definition_1.ParamDefinition.Numeric(500, { min: 0, max: 10000, step: 100 }),
    }
})({
    canAutoUpdate({ newParams }) {
        return true;
    },
    apply({ a, params, dependencies }) {
        return mol_task_1.Task.create('Build Structure', async (ctx) => {
            const parent = dependencies[params.structureRef].data;
            const { entities } = parent.model;
            const idx = entities.getEntityIndex(params.entityId);
            const unitsByEntity = getUnitsByEntity(parent);
            const units = unitsByEntity.get(idx) || [];
            const unitCount = units.length;
            let structure;
            if (unitCount > 1 && units.every(u => u.conformation.operator.isIdentity)) {
                const mergedUnits = (0, util_1.partitionUnits)(units, params.cellSize);
                structure = structure_1.Structure.create(mergedUnits);
            }
            else {
                structure = structure_1.Structure.create(units);
            }
            // could also use _struct_ref.pdbx_db_accession to point to uniprot with _struct_ref.db_name == UNP
            const label = entities.data.pdbx_description.value(idx).join(', ') || 'model';
            const description = `*Entity id* ${entities.data.id.value(idx)} *src_method* ${entities.data.src_method.value(idx)} *type* ${entities.data.type.value(idx)}`;
            return new objects_1.PluginStateObject.Molecule.Structure(structure, { label, description: description });
        });
    },
    update({ newParams, oldParams }) {
        return (0, mol_util_1.deepEqual)(newParams, oldParams)
            ? transformer_1.StateTransformer.UpdateResult.Unchanged
            : transformer_1.StateTransformer.UpdateResult.Recreate;
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.MmcifStructure = MmcifStructure;
