/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ColorTheme } from '../../../../mol-theme/color';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { Color } from '../../../../mol-util/color';
import { Bond, StructureElement } from '../../../../mol-model/structure';
import { ValidationReportProvider, ValidationReport } from '../prop';
import { TableLegend } from '../../../../mol-util/legend';
import { SetUtils } from '../../../../mol-util/set';
const DefaultColor = Color(0x909090);
const NoIssuesColor = Color(0x2166ac);
const OneIssueColor = Color(0xfee08b);
const TwoIssuesColor = Color(0xf46d43);
const ThreeOrMoreIssuesColor = Color(0xa50026);
const ColorLegend = TableLegend([
    ['Data unavailable', DefaultColor],
    ['No issues', NoIssuesColor],
    ['One issue', OneIssueColor],
    ['Two issues', TwoIssuesColor],
    ['Three or more issues', ThreeOrMoreIssuesColor],
]);
export function getGeometricQualityColorThemeParams(ctx) {
    const validationReport = !!ctx.structure && ctx.structure.models.length > 0 && ValidationReportProvider.get(ctx.structure.models[0]).value;
    const options = [];
    if (validationReport) {
        const kinds = new Set();
        validationReport.geometryIssues.forEach(v => v.forEach(k => kinds.add(k)));
        kinds.forEach(k => options.push([k, k]));
    }
    return {
        ignore: PD.MultiSelect([], options)
    };
}
export function GeometryQualityColorTheme(ctx, props) {
    var _a;
    let color = () => DefaultColor;
    const validationReport = !!ctx.structure && ctx.structure.models.length > 0 ? ValidationReportProvider.get(ctx.structure.models[0]) : void 0;
    const contextHash = validationReport === null || validationReport === void 0 ? void 0 : validationReport.version;
    const value = validationReport === null || validationReport === void 0 ? void 0 : validationReport.value;
    const model = (_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models[0];
    if (value && model) {
        const { geometryIssues, clashes, bondOutliers, angleOutliers } = value;
        const residueIndex = model.atomicHierarchy.residueAtomSegments.index;
        const { polymerType } = model.atomicHierarchy.derived.residue;
        const ignore = new Set(props.ignore);
        const getColor = (element) => {
            const rI = residueIndex[element];
            const value = geometryIssues.get(rI);
            if (value === undefined)
                return DefaultColor;
            let count = SetUtils.differenceSize(value, ignore);
            if (count > 0 && polymerType[rI] === 0 /* PolymerType.NA */) {
                count = 0;
                if (!ignore.has('clash') && clashes.getVertexEdgeCount(element) > 0)
                    count += 1;
                if (!ignore.has('mog-bond-outlier') && bondOutliers.index.has(element))
                    count += 1;
                if (!ignore.has('mog-angle-outlier') && angleOutliers.index.has(element))
                    count += 1;
            }
            switch (count) {
                case undefined: return DefaultColor;
                case 0: return NoIssuesColor;
                case 1: return OneIssueColor;
                case 2: return TwoIssuesColor;
                default: return ThreeOrMoreIssuesColor;
            }
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
        factory: GeometryQualityColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        contextHash,
        description: 'Assigns residue colors according to the number of (filtered) geometry issues. Data from wwPDB Validation Report, obtained via RCSB PDB.',
        legend: ColorLegend
    };
}
export const GeometryQualityColorThemeProvider = {
    name: ValidationReport.Tag.GeometryQuality,
    label: 'Geometry Quality',
    category: ColorTheme.Category.Validation,
    factory: GeometryQualityColorTheme,
    getParams: getGeometricQualityColorThemeParams,
    defaultValues: PD.getDefaultValues(getGeometricQualityColorThemeParams({})),
    isApplicable: (ctx) => { var _a; return ValidationReport.isApplicable((_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models[0]); },
    ensureCustomProperties: {
        attach: (ctx, data) => data.structure ? ValidationReportProvider.attach(ctx, data.structure.models[0], void 0, true) : Promise.resolve(),
        detach: (data) => data.structure && ValidationReportProvider.ref(data.structure.models[0], false)
    }
};
