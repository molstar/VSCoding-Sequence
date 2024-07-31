/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { TextBuilder } from '../../../../mol-geo/geometry/text/text-builder';
import { ComplexTextVisual } from '../../../../mol-repr/structure/complex-visual';
import * as Original from '../../../../mol-repr/structure/visual/label-text';
import { ElementIterator, eachSerialElement, getSerialElementLoci } from '../../../../mol-repr/structure/visual/util/element';
import { ColorNames } from '../../../../mol-util/color/names';
import { omitObjectKeys } from '../../../../mol-util/object';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { textPropsForSelection } from '../../helpers/label-text';
import { groupRows } from '../../helpers/selections';
import { getMVSAnnotationForStructure } from '../annotation-prop';
export const MVSAnnotationLabelTextParams = {
    annotationId: PD.Text('', { description: 'Reference to "Annotation" custom model property', isEssential: true }),
    fieldName: PD.Text('label', { description: 'Annotation field (column) from which to take label contents', isEssential: true }),
    ...omitObjectKeys(Original.LabelTextParams, ['level', 'chainScale', 'residueScale', 'elementScale']),
    borderColor: { ...Original.LabelTextParams.borderColor, defaultValue: ColorNames.black },
};
/** Create "label-text" visual for "MVS Annotation Label" representation */
export function MVSAnnotationLabelTextVisual(materialId) {
    return ComplexTextVisual({
        defaultProps: PD.getDefaultValues(MVSAnnotationLabelTextParams),
        createGeometry: createLabelText,
        createLocationIterator: ElementIterator.fromStructure,
        getLoci: getSerialElementLoci,
        eachLocation: eachSerialElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = newProps.annotationId !== currentProps.annotationId || newProps.fieldName !== currentProps.fieldName;
        }
    }, materialId);
}
function createLabelText(ctx, structure, theme, props, text) {
    var _a;
    const { annotation, model } = getMVSAnnotationForStructure(structure, props.annotationId);
    const rows = (_a = annotation === null || annotation === void 0 ? void 0 : annotation.getRows()) !== null && _a !== void 0 ? _a : [];
    const { count, offsets, grouped } = groupRows(rows);
    const builder = TextBuilder.create(props, count, count / 2, text);
    for (let iGroup = 0; iGroup < count; iGroup++) {
        const iFirstRowInGroup = grouped[offsets[iGroup]];
        const labelText = annotation.getValueForRow(iFirstRowInGroup, props.fieldName);
        if (!labelText)
            continue;
        const rowsInGroup = grouped.slice(offsets[iGroup], offsets[iGroup + 1]).map(j => rows[j]);
        const p = textPropsForSelection(structure, theme.size.size, rowsInGroup, model);
        if (!p)
            continue;
        builder.add(labelText, p.center[0], p.center[1], p.center[2], p.depth, p.scale, p.group);
    }
    return builder.getText();
}
