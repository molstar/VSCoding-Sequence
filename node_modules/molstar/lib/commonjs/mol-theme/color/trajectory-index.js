"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrajectoryIndexColorThemeProvider = exports.TrajectoryIndexColorThemeParams = void 0;
exports.getTrajectoryIndexColorThemeParams = getTrajectoryIndexColorThemeParams;
exports.TrajectoryIndexColorTheme = TrajectoryIndexColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const categories_1 = require("./categories");
const util_1 = require("../../mol-data/util");
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = 'Gives every model (frame) a unique color based on the index in its trajectory.';
exports.TrajectoryIndexColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: 'purples' }),
};
function getTrajectoryIndexColorThemeParams(ctx) {
    return param_definition_1.ParamDefinition.clone(exports.TrajectoryIndexColorThemeParams);
}
function TrajectoryIndexColorTheme(ctx, props) {
    var _a, _b;
    let color;
    let legend;
    let contextHash = -1;
    if (ctx.structure) {
        const { models } = ctx.structure.root;
        let size = 0;
        for (const m of models)
            size = Math.max(size, ((_a = structure_1.Model.TrajectoryInfo.get(m)) === null || _a === void 0 ? void 0 : _a.size) || 0);
        const hash = [size];
        const palette = (0, palette_1.getPalette)(size, props);
        legend = palette.legend;
        const modelColor = new Map();
        for (let i = 0, il = models.length; i < il; ++i) {
            const idx = ((_b = structure_1.Model.TrajectoryInfo.get(models[i])) === null || _b === void 0 ? void 0 : _b.index) || 0;
            modelColor.set(idx, palette.color(idx));
            hash.push(idx);
        }
        contextHash = (0, util_1.hashFnv32a)(hash);
        color = (location) => {
            if (structure_1.StructureElement.Location.is(location)) {
                return modelColor.get(structure_1.Model.TrajectoryInfo.get(location.unit.model).index);
            }
            else if (structure_1.Bond.isLocation(location)) {
                return modelColor.get(structure_1.Model.TrajectoryInfo.get(location.aUnit.model).index);
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: TrajectoryIndexColorTheme,
        granularity: 'instance',
        color,
        props,
        contextHash,
        description: Description,
        legend
    };
}
exports.TrajectoryIndexColorThemeProvider = {
    name: 'trajectory-index',
    label: 'Trajectory Index',
    category: categories_1.ColorThemeCategory.Chain,
    factory: TrajectoryIndexColorTheme,
    getParams: getTrajectoryIndexColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.TrajectoryIndexColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.elementCount > 0 && structure_1.Model.TrajectoryInfo.get(ctx.structure.models[0]).size > 1
};
