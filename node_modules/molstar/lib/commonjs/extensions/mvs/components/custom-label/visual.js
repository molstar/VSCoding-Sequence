"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLabelTextParams = void 0;
exports.CustomLabelTextVisual = CustomLabelTextVisual;
const tslib_1 = require("tslib");
const int_1 = require("../../../../mol-data/int");
const text_builder_1 = require("../../../../mol-geo/geometry/text/text-builder");
const complex_visual_1 = require("../../../../mol-repr/structure/complex-visual");
const Original = tslib_1.__importStar(require("../../../../mol-repr/structure/visual/label-text"));
const element_1 = require("../../../../mol-repr/structure/visual/util/element");
const mol_util_1 = require("../../../../mol-util");
const names_1 = require("../../../../mol-util/color/names");
const object_1 = require("../../../../mol-util/object");
const param_definition_1 = require("../../../../mol-util/param-definition");
const label_text_1 = require("../../helpers/label-text");
const selector_1 = require("../selector");
exports.CustomLabelTextParams = {
    items: param_definition_1.ParamDefinition.ObjectList({
        text: param_definition_1.ParamDefinition.Text('¯\\_(ツ)_/¯'),
        position: param_definition_1.ParamDefinition.MappedStatic('selection', {
            x_y_z: param_definition_1.ParamDefinition.Group({
                x: param_definition_1.ParamDefinition.Numeric(0),
                y: param_definition_1.ParamDefinition.Numeric(0),
                z: param_definition_1.ParamDefinition.Numeric(0),
                scale: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 20, step: 0.1 })
            }),
            selection: param_definition_1.ParamDefinition.Group({
                selector: selector_1.SelectorParams,
            }),
        }),
    }, obj => obj.text, { isEssential: true }),
    ...(0, object_1.omitObjectKeys)(Original.LabelTextParams, ['level', 'chainScale', 'residueScale', 'elementScale']),
    borderColor: { ...Original.LabelTextParams.borderColor, defaultValue: names_1.ColorNames.black },
};
/** Create "label-text" visual for "Custom Label" representation */
function CustomLabelTextVisual(materialId) {
    return (0, complex_visual_1.ComplexTextVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.CustomLabelTextParams),
        createGeometry: createLabelText,
        createLocationIterator: element_1.ElementIterator.fromStructure,
        getLoci: element_1.getSerialElementLoci,
        eachLocation: element_1.eachSerialElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = !(0, mol_util_1.deepEqual)(newProps.items, currentProps.items);
        }
    }, materialId);
}
function createLabelText(ctx, structure, theme, props, text) {
    var _a;
    const count = props.items.length;
    const builder = text_builder_1.TextBuilder.create(props, count, count / 2, text);
    for (const item of props.items) {
        switch (item.position.name) {
            case 'x_y_z':
                const scale = item.position.params.scale;
                builder.add(item.text, item.position.params.x, item.position.params.y, item.position.params.z, scale, scale, 0);
                break;
            case 'selection':
                const substructure = (0, selector_1.substructureFromSelector)(structure, item.position.params.selector);
                const p = (0, label_text_1.textPropsForSelection)(substructure, theme.size.size, {});
                const group = (_a = serialIndexOfSubstructure(structure, substructure)) !== null && _a !== void 0 ? _a : 0;
                if (p)
                    builder.add(item.text, p.center[0], p.center[1], p.center[2], p.depth, p.scale, group);
                break;
        }
    }
    return builder.getText();
}
/** Return the serial index within `structure` of the first element of `substructure` (or `undefined` in that element is not in `structure`)  */
function serialIndexOfSubstructure(structure, substructure) {
    if (substructure.isEmpty)
        return undefined;
    const theUnit = substructure.units[0];
    const theElement = theUnit.elements[0];
    for (const unit of structure.units) {
        if (unit.model.id === theUnit.model.id && int_1.SortedArray.has(unit.elements, theElement)) {
            return structure.serialMapping.getSerialIndex(unit, theElement);
        }
    }
    return undefined;
}
