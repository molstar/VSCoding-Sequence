/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ColorTheme } from '../../mol-theme/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { AssemblySymmetryProvider, AssemblySymmetryData } from './prop';
import { Color } from '../../mol-util/color';
import { StructureElement, StructureProperties, Bond } from '../../mol-model/structure';
import { getPalette, getPaletteParams } from '../../mol-util/color/palette';
const DefaultColor = Color(0xCCCCCC);
function getAsymId(unit) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            return StructureProperties.chain.label_asym_id;
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            return StructureProperties.coarse.asym_id;
    }
}
function clusterMemberKey(asymId, operList) {
    return `${asymId}-${operList.join('|')}`;
}
export const AssemblySymmetryClusterColorThemeParams = {
    ...getPaletteParams({ colorList: 'red-yellow-blue' }),
};
export function getAssemblySymmetryClusterColorThemeParams(ctx) {
    const params = PD.clone(AssemblySymmetryClusterColorThemeParams);
    return params;
}
export function AssemblySymmetryClusterColorTheme(ctx, props) {
    var _a;
    let color = () => DefaultColor;
    let legend;
    const assemblySymmetry = ctx.structure && AssemblySymmetryProvider.get(ctx.structure);
    const contextHash = assemblySymmetry === null || assemblySymmetry === void 0 ? void 0 : assemblySymmetry.version;
    const clusters = (_a = assemblySymmetry === null || assemblySymmetry === void 0 ? void 0 : assemblySymmetry.value) === null || _a === void 0 ? void 0 : _a.clusters;
    if ((clusters === null || clusters === void 0 ? void 0 : clusters.length) && ctx.structure) {
        const l = StructureElement.Location.create(ctx.structure);
        const clusterByMember = new Map();
        for (let i = 0, il = clusters.length; i < il; ++i) {
            const { members } = clusters[i];
            for (let j = 0, jl = members.length; j < jl; ++j) {
                const asymId = members[j].asym_id;
                const operList = [...members[j].pdbx_struct_oper_list_ids || []];
                clusterByMember.set(clusterMemberKey(asymId, operList), i);
                if (operList.length === 0) {
                    operList.push('1'); // TODO hack assuming '1' is the id of the identity operator
                    clusterByMember.set(clusterMemberKey(asymId, operList), i);
                }
            }
        }
        const palette = getPalette(clusters.length, props);
        legend = palette.legend;
        const _emptyList = [];
        const getColor = (location) => {
            const { assembly } = location.unit.conformation.operator;
            const asymId = getAsymId(location.unit)(location);
            const cluster = clusterByMember.get(clusterMemberKey(asymId, (assembly === null || assembly === void 0 ? void 0 : assembly.operList) || _emptyList));
            return cluster !== undefined ? palette.color(cluster) : DefaultColor;
        };
        color = (location) => {
            if (StructureElement.Location.is(location)) {
                return getColor(location);
            }
            else if (Bond.isLocation(location)) {
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                return getColor(l);
            }
            return DefaultColor;
        };
    }
    return {
        factory: AssemblySymmetryClusterColorTheme,
        granularity: 'instance',
        color,
        props,
        contextHash,
        description: 'Assigns chain colors according to assembly symmetry cluster membership data provided by RCSB PDB (calculated with BioJava) or by PDBe.',
        legend
    };
}
export const AssemblySymmetryClusterColorThemeProvider = {
    name: AssemblySymmetryData.Tag.Cluster,
    label: 'Assembly Symmetry Cluster',
    category: ColorTheme.Category.Symmetry,
    factory: AssemblySymmetryClusterColorTheme,
    getParams: getAssemblySymmetryClusterColorThemeParams,
    defaultValues: PD.getDefaultValues(AssemblySymmetryClusterColorThemeParams),
    isApplicable: (ctx) => AssemblySymmetryData.isApplicable(ctx.structure),
    ensureCustomProperties: {
        attach: (ctx, data) => data.structure ? AssemblySymmetryProvider.attach(ctx, data.structure, void 0, true) : Promise.resolve(),
        detach: (data) => data.structure && AssemblySymmetryProvider.ref(data.structure, false)
    }
};
