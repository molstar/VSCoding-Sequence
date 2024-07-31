/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Bond, StructureElement, Unit } from '../../../mol-model/structure';
import { ColorTheme } from '../../../mol-theme/color';
import { Color } from '../../../mol-util/color';
import { getPalette, getPaletteParams } from '../../../mol-util/color/palette';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { SIFTSMapping } from '../sifts-mapping';
const DefaultColor = Color(0xFAFAFA);
const Description = 'Assigns a color based on SIFTS mapping.';
// same colors for same accessions
const globalAccessionMap = new Map();
export const SIFTSMappingColorThemeParams = {
    ...getPaletteParams({ type: 'colors', colorList: 'set-1' }),
};
export function getSIFTSMappingColorThemeParams(ctx) {
    return SIFTSMappingColorThemeParams; // TODO return copy
}
export function SIFTSMappingColorTheme(ctx, props) {
    let color;
    if (ctx.structure) {
        for (const m of ctx.structure.models) {
            const mapping = SIFTSMapping.Provider.get(m).value;
            if (!mapping)
                continue;
            for (const acc of mapping.accession) {
                if (!acc || globalAccessionMap.has(acc))
                    continue;
                globalAccessionMap.set(acc, globalAccessionMap.size);
            }
        }
        const l = StructureElement.Location.create(ctx.structure);
        const palette = getPalette(globalAccessionMap.size + 1, props, { valueLabel: i => `${i}` });
        const colorMap = new Map();
        const getColor = (location) => {
            const key = SIFTSMapping.getKey(location);
            if (!key)
                return DefaultColor;
            if (colorMap.has(key))
                return colorMap.get(key);
            const color = palette.color(globalAccessionMap.get(key));
            colorMap.set(key, color);
            return color;
        };
        color = (location) => {
            if (StructureElement.Location.is(location) && Unit.isAtomic(location.unit)) {
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
    else {
        color = () => DefaultColor;
    }
    return {
        factory: SIFTSMappingColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: Description,
    };
}
export const SIFTSMappingColorThemeProvider = {
    name: 'sifts-mapping',
    label: 'SIFTS Mapping',
    category: ColorTheme.Category.Residue,
    factory: SIFTSMappingColorTheme,
    getParams: getSIFTSMappingColorThemeParams,
    defaultValues: PD.getDefaultValues(SIFTSMappingColorThemeParams),
    isApplicable: (ctx) => { var _a; return !!((_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models.some(m => SIFTSMapping.Provider.isApplicable(m))); },
    ensureCustomProperties: {
        attach: async (ctx, data) => {
            if (!data.structure)
                return;
            for (const m of data.structure.models) {
                await SIFTSMapping.Provider.attach(ctx, m, void 0, true);
            }
        },
        detach: (data) => {
            if (!data.structure)
                return;
            for (const m of data.structure.models) {
                SIFTSMapping.Provider.ref(m, false);
            }
        }
    }
};
