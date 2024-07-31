/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StateObjectRef, StateTransform } from '../../../mol-state';
import { StateTransforms } from '../../../mol-plugin-state/transforms';
import { StructureRepresentationPresetProvider, presetStaticComponent } from '../../../mol-plugin-state/builder/structure/representation-preset';
import { CCDFormat } from '../../../mol-model-formats/structure/mmcif';
import { MinimizeRmsd } from '../../../mol-math/linear-algebra/3d/minimize-rmsd';
import { SetUtils } from '../../../mol-util/set';
import { TrajectoryHierarchyPresetProvider } from '../../../mol-plugin-state/builder/structure/hierarchy-preset';
import { capitalize } from '../../../mol-util/string';
const CCDParams = (a, plugin) => ({
    representationPresetParams: PD.Optional(PD.Group(StructureRepresentationPresetProvider.CommonParams)),
    showOriginalCoordinates: PD.Optional(PD.Boolean(true, { description: `Show original coordinates for 'model' and 'ideal' structure and do not align them.` })),
    shownCoordinateType: PD.Select('ideal', PD.arrayToOptions(['ideal', 'model', 'both']), { description: `What coordinate sets are visible.` }),
    aromaticBonds: PD.Boolean(false, { description: 'Display aromatic bonds with dashes' }),
    ...TrajectoryHierarchyPresetProvider.CommonParams(a, plugin)
});
export const ChemicalCompontentTrajectoryHierarchyPreset = TrajectoryHierarchyPresetProvider({
    id: 'preset-trajectory-ccd',
    display: {
        name: 'Chemical Component', group: 'Preset',
        description: 'Shows molecules from the Chemical Component Dictionary.'
    },
    isApplicable: o => {
        return CCDFormat.is(o.data.representative.sourceData);
    },
    params: CCDParams,
    async apply(trajectory, params, plugin) {
        var _a, _b;
        const tr = (_b = (_a = StateObjectRef.resolveAndCheck(plugin.state.data, trajectory)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!tr)
            return {};
        const builder = plugin.builders.structure;
        const idealModel = await builder.createModel(trajectory, { modelIndex: 0 });
        const idealModelProperties = await builder.insertModelProperties(idealModel, params.modelProperties, { isCollapsed: true });
        const idealStructure = await builder.createStructure(idealModelProperties || idealModel, { name: 'model', params: {} });
        const idealStructureProperties = await builder.insertStructureProperties(idealStructure, params.structureProperties);
        const representationPreset = params.representationPreset || ChemicalComponentPreset.id;
        const representationPresetParams = params.representationPresetParams || {};
        if (representationPresetParams.ignoreHydrogens === undefined)
            representationPresetParams.ignoreHydrogens = true;
        // degenerate case where either model or ideal coordinates are missing
        if (tr.frameCount !== 2) {
            const coordinateType = CCDFormat.CoordinateType.get(idealModel.obj.data);
            await builder.representation.applyPreset(idealStructureProperties, representationPreset, { ...representationPresetParams, coordinateType });
            return { models: [idealModel], structures: [idealStructure] };
        }
        const modelModel = await builder.createModel(trajectory, { modelIndex: 1 });
        const modelModelProperties = await builder.insertModelProperties(modelModel, params.modelProperties, { isCollapsed: true });
        const modelStructure = await builder.createStructure(modelModelProperties || modelModel, { name: 'model', params: {} });
        const modelStructureProperties = await builder.insertStructureProperties(modelStructure, params.structureProperties);
        // align ideal and model coordinates
        if (!params.showOriginalCoordinates) {
            const [a, b] = getPositionTables(idealStructure.obj.data, modelStructure.obj.data);
            if (!a) {
                plugin.log.warn(`Cannot align chemical components whose atom sets are disjoint.`);
            }
            else {
                const { bTransform, rmsd } = MinimizeRmsd.compute({ a, b });
                await transform(plugin, modelStructure.cell, bTransform);
                plugin.log.info(`Superposed [model] and [ideal] with RMSD ${rmsd.toFixed(2)}.`);
            }
        }
        await builder.representation.applyPreset(idealStructureProperties, representationPreset, { ...representationPresetParams, aromaticBonds: params.aromaticBonds, coordinateType: 'ideal', isHidden: params.shownCoordinateType === 'model' });
        await builder.representation.applyPreset(modelStructureProperties, representationPreset, { ...representationPresetParams, aromaticBonds: params.aromaticBonds, coordinateType: 'model', isHidden: params.shownCoordinateType === 'ideal' });
        return { models: [idealModel, modelModel], structures: [idealStructure, modelStructure] };
    }
});
function getPositionTables(s1, s2) {
    const m1 = getAtomIdSerialMap(s1);
    const m2 = getAtomIdSerialMap(s2);
    const intersecting = SetUtils.intersection(new Set(m1.keys()), new Set(m2.keys()));
    const ret = [
        MinimizeRmsd.Positions.empty(intersecting.size),
        MinimizeRmsd.Positions.empty(intersecting.size)
    ];
    let o = 0;
    intersecting.forEach(k => {
        ret[0].x[o] = s1.model.atomicConformation.x[m1.get(k)];
        ret[0].y[o] = s1.model.atomicConformation.y[m1.get(k)];
        ret[0].z[o] = s1.model.atomicConformation.z[m1.get(k)];
        ret[1].x[o] = s2.model.atomicConformation.x[m2.get(k)];
        ret[1].y[o] = s2.model.atomicConformation.y[m2.get(k)];
        ret[1].z[o] = s2.model.atomicConformation.z[m2.get(k)];
        o++;
    });
    return ret;
}
function getAtomIdSerialMap(structure) {
    const map = new Map();
    const { label_atom_id } = structure.model.atomicHierarchy.atoms;
    for (let i = 0, il = label_atom_id.rowCount; i < il; ++i) {
        const id = label_atom_id.value(i);
        if (!map.has(id))
            map.set(id, map.size);
    }
    return map;
}
function transform(plugin, s, matrix) {
    const b = plugin.state.data.build().to(s)
        .insert(StateTransforms.Model.TransformStructureConformation, { transform: { name: 'matrix', params: { data: matrix, transpose: false } } });
    return plugin.runTask(plugin.state.data.updateTree(b));
}
export const ChemicalComponentPreset = StructureRepresentationPresetProvider({
    id: 'preset-structure-representation-chemical-component',
    display: {
        name: 'Chemical Component', group: 'Miscellaneous',
        description: `Show 'Ideal' and 'Model' coordinates of chemical components.`
    },
    isApplicable: o => {
        return CCDFormat.is(o.data.model.sourceData);
    },
    params: () => ({
        ...StructureRepresentationPresetProvider.CommonParams,
        aromaticBonds: PD.Boolean(true),
        coordinateType: PD.Select('ideal', PD.arrayToOptions(['ideal', 'model'])),
        isHidden: PD.Boolean(false),
    }),
    async apply(ref, params, plugin) {
        var _a, _b, _c, _d, _e, _f;
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        if (!structureCell)
            return {};
        const { aromaticBonds, coordinateType, isHidden } = params;
        const components = {
            [coordinateType]: await presetStaticComponent(plugin, structureCell, 'all', { label: capitalize(coordinateType), tags: [coordinateType] })
        };
        const structure = structureCell.obj.data;
        const { update, builder, typeParams } = StructureRepresentationPresetProvider.reprBuilder(plugin, params);
        const representations = {
            [coordinateType]: builder.buildRepresentation(update, components[coordinateType], { type: 'ball-and-stick', typeParams: { ...typeParams, aromaticBonds } }, { initialState: { isHidden } }),
        };
        // sync UI state
        if (((_b = (_a = components[coordinateType]) === null || _a === void 0 ? void 0 : _a.cell) === null || _b === void 0 ? void 0 : _b.state) && isHidden) {
            StateTransform.assignState(components[coordinateType].cell.state, { isHidden });
        }
        await update.commit({ revertOnError: true });
        await StructureRepresentationPresetProvider.updateFocusRepr(plugin, structure, (_d = (_c = params.theme) === null || _c === void 0 ? void 0 : _c.focus) === null || _d === void 0 ? void 0 : _d.name, (_f = (_e = params.theme) === null || _e === void 0 ? void 0 : _e.focus) === null || _f === void 0 ? void 0 : _f.params);
        return { components, representations };
    }
});
