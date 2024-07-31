/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { DSSPComputationParams, computeUnitDSSP } from './secondary-structure/dssp';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Unit } from '../../mol-model/structure/structure';
import { CustomStructureProperty } from '../common/custom-structure-property';
import { ModelSecondaryStructure } from '../../mol-model-formats/structure/property/secondary-structure';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
import { Model } from '../../mol-model/structure/model';
function getSecondaryStructureParams(data) {
    let defaultType = 'model';
    if (data) {
        defaultType = 'dssp';
        for (let i = 0, il = data.models.length; i < il; ++i) {
            const m = data.models[i];
            if (Model.isFromPdbArchive(m) || Model.hasSecondaryStructure(m)) {
                // if there is any secondary structure definition given or if there is
                // an archival model, don't calculate dssp by default
                defaultType = 'model';
                break;
            }
        }
    }
    return {
        type: PD.MappedStatic(defaultType, {
            'model': PD.EmptyGroup({ label: 'Model' }),
            'dssp': PD.Group(DSSPComputationParams, { label: 'DSSP', isFlat: true })
        }, { options: [['model', 'Model'], ['dssp', 'DSSP']] })
    };
}
export const SecondaryStructureParams = getSecondaryStructureParams();
export const SecondaryStructureProvider = CustomStructureProperty.createProvider({
    label: 'Secondary Structure',
    descriptor: CustomPropertyDescriptor({
        name: 'molstar_computed_secondary_structure',
        // TODO `cifExport` and `symbol`
    }),
    type: 'root',
    defaultParams: SecondaryStructureParams,
    getParams: getSecondaryStructureParams,
    isApplicable: (data) => true,
    obtain: async (ctx, data, props) => {
        const p = { ...PD.getDefaultValues(SecondaryStructureParams), ...props };
        switch (p.type.name) {
            case 'dssp': return { value: await computeDssp(data, p.type.params) };
            case 'model': return { value: await computeModel(data) };
        }
    }
});
async function computeDssp(structure, props) {
    // TODO take inter-unit hbonds into account for bridge, ladder, sheet assignment
    // TODO use Zhang-Skolnik for CA alpha only parts or for coarse parts with per-residue elements
    const map = new Map();
    for (let i = 0, il = structure.unitSymmetryGroups.length; i < il; ++i) {
        const u = structure.unitSymmetryGroups[i].units[0];
        if (Unit.isAtomic(u) && !Model.isCoarseGrained(u.model)) {
            const secondaryStructure = await computeUnitDSSP(u, props);
            map.set(u.invariantId, secondaryStructure);
        }
    }
    return map;
}
async function computeModel(structure) {
    const map = new Map();
    for (let i = 0, il = structure.unitSymmetryGroups.length; i < il; ++i) {
        const u = structure.unitSymmetryGroups[i].units[0];
        if (Unit.isAtomic(u)) {
            const secondaryStructure = ModelSecondaryStructure.Provider.get(u.model);
            if (secondaryStructure) {
                map.set(u.invariantId, secondaryStructure);
            }
        }
    }
    return map;
}
