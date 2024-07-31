"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVSAnnotationLabelTextParams = void 0;
exports.MVSAnnotationLabelTextVisual = MVSAnnotationLabelTextVisual;
const tslib_1 = require("tslib");
const text_builder_1 = require("../../../../mol-geo/geometry/text/text-builder");
const complex_visual_1 = require("../../../../mol-repr/structure/complex-visual");
const Original = tslib_1.__importStar(require("../../../../mol-repr/structure/visual/label-text"));
const element_1 = require("../../../../mol-repr/structure/visual/util/element");
const names_1 = require("../../../../mol-util/color/names");
const object_1 = require("../../../../mol-util/object");
const param_definition_1 = require("../../../../mol-util/param-definition");
const label_text_1 = require("../../helpers/label-text");
const selections_1 = require("../../helpers/selections");
const annotation_prop_1 = require("../annotation-prop");
exports.MVSAnnotationLabelTextParams = {
    annotationId: param_definition_1.ParamDefinition.Text('', { description: 'Reference to "Annotation" custom model property', isEssential: true }),
    fieldName: param_definition_1.ParamDefinition.Text('label', { description: 'Annotation field (column) from which to take label contents', isEssential: true }),
    ...(0, object_1.omitObjectKeys)(Original.LabelTextParams, ['level', 'chainScale', 'residueScale', 'elementScale']),
    borderColor: { ...Original.LabelTextParams.borderColor, defaultValue: names_1.ColorNames.black },
};
/** Create "label-text" visual for "MVS Annotation Label" representation */
function MVSAnnotationLabelTextVisual(materialId) {
    return (0, complex_visual_1.ComplexTextVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.MVSAnnotationLabelTextParams),
        createGeometry: createLabelText,
        createLocationIterator: element_1.ElementIterator.fromStructure,
        getLoci: element_1.getSerialElementLoci,
        eachLocation: element_1.eachSerialElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = newProps.annotationId !== currentProps.annotationId || newProps.fieldName !== currentProps.fieldName;
        }
    }, materialId);
}
function createLabelText(ctx, structure, theme, props, text) {
    var _a;
    const { annotation, model } = (0, annotation_prop_1.getMVSAnnotationForStructure)(structure, props.annotationId);
    const rows = (_a = annotation === null || annotation === void 0 ? void 0 : annotation.getRows()) !== null && _a !== void 0 ? _a : [];
    const { count, offsets, grouped } = (0, selections_1.groupRows)(rows);
    const builder = text_builder_1.TextBuilder.create(props, count, count / 2, text);
    for (let iGroup = 0; iGroup < count; iGroup++) {
        const iFirstRowInGroup = grouped[offsets[iGroup]];
        const labelText = annotation.getValueForRow(iFirstRowInGroup, props.fieldName);
        if (!labelText)
            continue;
        const rowsInGroup = grouped.slice(offsets[iGroup], offsets[iGroup + 1]).map(j => rows[j]);
        const p = (0, label_text_1.textPropsForSelection)(structure, theme.size.size, rowsInGroup, model);
        if (!p)
            continue;
        builder.add(labelText, p.center[0], p.center[1], p.center[2], p.depth, p.scale, p.group);
    }
    return builder.getText();
}
