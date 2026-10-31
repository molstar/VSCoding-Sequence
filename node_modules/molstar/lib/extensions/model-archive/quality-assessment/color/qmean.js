/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { QualityAssessment, QualityAssessmentProvider } from '../prop';
import { Bond, StructureElement, Unit } from '../../../../mol-model/structure';
import { ColorTheme } from '../../../../mol-theme/color';
import { Color, ColorScale } from '../../../../mol-util/color';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
const DefaultColor = Color(0xaaaaaa);
export function getQmeanScoreColorThemeParams(ctx) {
    return {};
}
export function QmeanScoreColorTheme(ctx, props) {
    let color = () => DefaultColor;
    const scale = ColorScale.create({
        domain: [0, 1],
        listOrName: [
            [Color(0xFF5000), 0.5], [Color(0x025AFD), 1.0]
        ]
    });
    if (ctx.structure) {
        const l = StructureElement.Location.create(ctx.structure.root);
        const getColor = (location) => {
            var _a, _b;
            const { unit, element } = location;
            if (!Unit.isAtomic(unit))
                return DefaultColor;
            const qualityAssessment = QualityAssessmentProvider.get(unit.model).value;
            const score = (_b = (_a = qualityAssessment === null || qualityAssessment === void 0 ? void 0 : qualityAssessment.qmean) === null || _a === void 0 ? void 0 : _a.get(unit.model.atomicHierarchy.residueAtomSegments.index[element])) !== null && _b !== void 0 ? _b : -1;
            if (score < 0) {
                return DefaultColor;
            }
            else {
                return scale.color(score);
            }
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
        factory: QmeanScoreColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: 'Assigns residue colors according to the QMEAN score.',
        legend: scale.legend
    };
}
export const QmeanScoreColorThemeProvider = {
    name: 'qmean-score',
    label: 'QMEAN Score',
    category: ColorTheme.Category.Validation,
    factory: QmeanScoreColorTheme,
    getParams: getQmeanScoreColorThemeParams,
    defaultValues: PD.getDefaultValues(getQmeanScoreColorThemeParams({})),
    isApplicable: (ctx) => { var _a; return !!((_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models.some(m => QualityAssessment.isApplicable(m, 'qmean'))); },
    ensureCustomProperties: {
        attach: async (ctx, data) => {
            if (data.structure) {
                for (const m of data.structure.models) {
                    await QualityAssessmentProvider.attach(ctx, m, void 0, true);
                }
            }
        },
        detach: async (data) => {
            if (data.structure) {
                for (const m of data.structure.models) {
                    QualityAssessmentProvider.ref(m, false);
                }
            }
        }
    }
};
