/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ColorTheme } from '../../../../mol-theme/color';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { Color, ColorScale } from '../../../../mol-util/color';
import { StructureElement, Model, Bond } from '../../../../mol-model/structure';
import { ValidationReportProvider, ValidationReport } from '../prop';
const DefaultColor = Color(0xCCCCCC);
export function DensityFitColorTheme(ctx, props) {
    var _a;
    let color = () => DefaultColor;
    const scaleRsrz = ColorScale.create({
        minLabel: 'Poor',
        maxLabel: 'Better',
        domain: [2, 0],
        listOrName: 'red-yellow-blue',
    });
    const scaleRscc = ColorScale.create({
        minLabel: 'Poor',
        maxLabel: 'Better',
        domain: [0.678, 1.0],
        listOrName: 'red-yellow-blue',
    });
    const validationReport = ctx.structure && ValidationReportProvider.get(ctx.structure.models[0]);
    const contextHash = validationReport === null || validationReport === void 0 ? void 0 : validationReport.version;
    const model = (_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models[0];
    if ((validationReport === null || validationReport === void 0 ? void 0 : validationReport.value) && model) {
        const { rsrz, rscc } = validationReport.value;
        const residueIndex = model.atomicHierarchy.residueAtomSegments.index;
        const getColor = (element) => {
            const rsrzValue = rsrz.get(residueIndex[element]);
            if (rsrzValue !== undefined)
                return scaleRsrz.color(rsrzValue);
            const rsccValue = rscc.get(residueIndex[element]);
            if (rsccValue !== undefined)
                return scaleRscc.color(rsccValue);
            return DefaultColor;
        };
        color = (location) => {
            if (StructureElement.Location.is(location) && location.unit.model === model) {
                return getColor(location.element);
            }
            else if (Bond.isLocation(location) && location.aUnit.model === model) {
                return getColor(location.aUnit.elements[location.aIndex]);
            }
            return DefaultColor;
        };
    }
    return {
        factory: DensityFitColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        contextHash,
        description: 'Assigns residue colors according to the density fit using normalized Real Space R (RSRZ) for polymer residues and real space correlation coefficient (RSCC) for ligands. Colors range from poor (RSRZ = 2 or RSCC = 0.678) - to better (RSRZ = 0 or RSCC = 1.0). Data from wwPDB Validation Report, obtained via RCSB PDB.',
        legend: scaleRsrz.legend
    };
}
export const DensityFitColorThemeProvider = {
    name: ValidationReport.Tag.DensityFit,
    label: 'Density Fit',
    category: ColorTheme.Category.Validation,
    factory: DensityFitColorTheme,
    getParams: () => ({}),
    defaultValues: PD.getDefaultValues({}),
    isApplicable: (ctx) => !!ctx.structure && ValidationReport.isApplicable(ctx.structure.models[0]) && Model.isFromXray(ctx.structure.models[0]) && Model.probablyHasDensityMap(ctx.structure.models[0]),
    ensureCustomProperties: {
        attach: (ctx, data) => data.structure ? ValidationReportProvider.attach(ctx, data.structure.models[0], void 0, true) : Promise.resolve(),
        detach: (data) => data.structure && ValidationReportProvider.ref(data.structure.models[0], false)
    }
};
