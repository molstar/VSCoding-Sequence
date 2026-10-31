"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolymerIdColorThemeProvider = exports.PolymerIdColorThemeParams = void 0;
exports.getPolymerIdColorThemeParams = getPolymerIdColorThemeParams;
exports.PolymerIdColorTheme = PolymerIdColorTheme;
const structure_1 = require("../../mol-model/structure");
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const int_1 = require("../../mol-data/int");
const lists_1 = require("../../mol-util/color/lists");
const categories_1 = require("./categories");
const DefaultList = 'dark-2';
const DefaultColor = (0, color_1.Color)(0xFAFAFA);
const Description = 'Gives every polymer chain a color based on its `asym_id` value.';
exports.PolymerIdColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: DefaultList }),
};
function getPolymerIdColorThemeParams(ctx) {
    const params = param_definition_1.ParamDefinition.clone(exports.PolymerIdColorThemeParams);
    if (ctx.structure) {
        if (getPolymerAsymIdSerialMap(ctx.structure.root).size > lists_1.ColorLists[DefaultList].list.length) {
            params.palette.defaultValue.name = 'colors';
            params.palette.defaultValue.params = {
                ...params.palette.defaultValue.params,
                list: { kind: 'interpolate', colors: (0, lists_1.getColorListFromName)(DefaultList).list }
            };
        }
    }
    return params;
}
function getAsymId(unit) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            return structure_1.StructureProperties.chain.label_asym_id;
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            return structure_1.StructureProperties.coarse.asym_id;
    }
}
function getPolymerAsymIdSerialMap(structure) {
    const map = new Map();
    for (let i = 0, il = structure.unitSymmetryGroups.length; i < il; ++i) {
        const unit = structure.unitSymmetryGroups[i].units[0];
        const { model } = unit;
        if (structure_1.Unit.isAtomic(unit)) {
            const { chainAtomSegments, chains } = model.atomicHierarchy;
            const chainIt = int_1.Segmentation.transientSegments(chainAtomSegments, unit.elements);
            while (chainIt.hasNext) {
                const { index: chainIndex } = chainIt.move();
                const entityId = chains.label_entity_id.value(chainIndex);
                const eI = model.entities.getEntityIndex(entityId);
                if (model.entities.data.type.value(eI) === 'polymer') {
                    const asymId = chains.label_asym_id.value(chainIndex);
                    if (!map.has(asymId))
                        map.set(asymId, map.size);
                }
            }
        }
        else if (structure_1.Unit.isCoarse(unit)) {
            const { chainElementSegments, asym_id, entity_id } = structure_1.Unit.isSpheres(unit)
                ? model.coarseHierarchy.spheres
                : model.coarseHierarchy.gaussians;
            const chainIt = int_1.Segmentation.transientSegments(chainElementSegments, unit.elements);
            while (chainIt.hasNext) {
                const { index: chainIndex } = chainIt.move();
                const elementIndex = chainElementSegments.offsets[chainIndex];
                const entityId = entity_id.value(elementIndex);
                const eI = model.entities.getEntityIndex(entityId);
                if (model.entities.data.type.value(eI) === 'polymer') {
                    const asymId = asym_id.value(elementIndex);
                    if (!map.has(asymId))
                        map.set(asymId, map.size);
                }
            }
        }
    }
    return map;
}
function PolymerIdColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const l = structure_1.StructureElement.Location.create(ctx.structure);
        const polymerAsymIdSerialMap = getPolymerAsymIdSerialMap(ctx.structure.root);
        const labelTable = Array.from(polymerAsymIdSerialMap.keys());
        const valueLabel = (i) => labelTable[i];
        const palette = (0, palette_1.getPalette)(polymerAsymIdSerialMap.size, props, { valueLabel });
        legend = palette.legend;
        color = (location) => {
            let serial = undefined;
            if (structure_1.StructureElement.Location.is(location)) {
                const asym_id = getAsymId(location.unit);
                serial = polymerAsymIdSerialMap.get(asym_id(location));
            }
            else if (structure_1.Bond.isLocation(location)) {
                const asym_id = getAsymId(location.aUnit);
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                serial = polymerAsymIdSerialMap.get(asym_id(l));
            }
            return serial === undefined ? DefaultColor : palette.color(serial);
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: PolymerIdColorTheme,
        granularity: 'group',
        color,
        props,
        description: Description,
        legend
    };
}
exports.PolymerIdColorThemeProvider = {
    name: 'polymer-id',
    label: 'Polymer Chain Id',
    category: categories_1.ColorThemeCategory.Chain,
    factory: PolymerIdColorTheme,
    getParams: getPolymerIdColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.PolymerIdColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
