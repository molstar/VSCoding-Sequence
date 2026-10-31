/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureProperties, StructureElement, Bond, Model } from '../../mol-model/structure';
import { Color } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { getPaletteParams, getPalette } from '../../mol-util/color/palette';
import { ColorThemeCategory } from './categories';
const DefaultList = 'many-distinct';
const DefaultColor = Color(0xFAFAFA);
const Description = 'Gives every chain a color based on its `asym_id` value.';
export const ChainIdColorThemeParams = {
    asymId: PD.Select('auth', PD.arrayToOptions(['auth', 'label'])),
    ...getPaletteParams({ type: 'colors', colorList: DefaultList }),
};
export function getChainIdColorThemeParams(ctx) {
    var _a;
    const params = PD.clone(ChainIdColorThemeParams);
    if ((_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models.some(m => m.coarseHierarchy.isDefined)) {
        params.asymId.defaultValue = 'label';
    }
    return params;
}
function getAsymId(unit, type) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            return type === 'auth'
                ? StructureProperties.chain.auth_asym_id
                : StructureProperties.chain.label_asym_id;
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            return StructureProperties.coarse.asym_id;
    }
}
function getAsymIdKey(location, type) {
    const asymId = getAsymId(location.unit, type)(location);
    return location.structure.root.models.length > 1
        ? getKey(location.unit.model, asymId)
        : asymId;
}
function getKey(model, asymId) {
    return `${asymId}|${(Model.Index.get(model).value || 0) + 1}`;
}
function getAsymIdSerialMap(structure, type) {
    const map = new Map();
    for (const m of structure.models) {
        const asymIdOffset = Model.AsymIdOffset.get(m).value;
        const offset = (type === 'auth' ? asymIdOffset === null || asymIdOffset === void 0 ? void 0 : asymIdOffset.auth : asymIdOffset === null || asymIdOffset === void 0 ? void 0 : asymIdOffset.label) || 0;
        let count = 0;
        m.properties.structAsymMap.forEach(({ auth_id }, label_id) => {
            const asymId = type === 'auth' ? auth_id : label_id;
            const k = structure.models.length > 1
                ? getKey(m, asymId)
                : asymId;
            if (!map.has(k)) {
                map.set(k, count + offset);
                ++count;
            }
        });
    }
    return map;
}
export function ChainIdColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const l = StructureElement.Location.create(ctx.structure.root);
        const asymIdSerialMap = getAsymIdSerialMap(ctx.structure.root, props.asymId);
        const labelTable = Array.from(asymIdSerialMap.keys());
        const valueLabel = (i) => labelTable[i];
        const palette = getPalette(asymIdSerialMap.size, props, { valueLabel });
        legend = palette.legend;
        color = (location) => {
            let serial = undefined;
            if (StructureElement.Location.is(location)) {
                const k = getAsymIdKey(location, props.asymId);
                serial = asymIdSerialMap.get(k);
            }
            else if (Bond.isLocation(location)) {
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                const k = getAsymIdKey(l, props.asymId);
                serial = asymIdSerialMap.get(k);
            }
            return serial === undefined ? DefaultColor : palette.color(serial);
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: ChainIdColorTheme,
        granularity: 'group',
        color,
        props,
        description: Description,
        legend
    };
}
export const ChainIdColorThemeProvider = {
    name: 'chain-id',
    label: 'Chain Id',
    category: ColorThemeCategory.Chain,
    factory: ChainIdColorTheme,
    getParams: getChainIdColorThemeParams,
    defaultValues: PD.getDefaultValues(ChainIdColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
