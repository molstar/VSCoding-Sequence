/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { SortedArray } from '../../../../mol-data/int';
import { TextBuilder } from '../../../../mol-geo/geometry/text/text-builder';
import { ComplexTextVisual } from '../../../../mol-repr/structure/complex-visual';
import * as Original from '../../../../mol-repr/structure/visual/label-text';
import { ElementIterator, eachSerialElement, getSerialElementLoci } from '../../../../mol-repr/structure/visual/util/element';
import { deepEqual } from '../../../../mol-util';
import { ColorNames } from '../../../../mol-util/color/names';
import { omitObjectKeys } from '../../../../mol-util/object';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { textPropsForSelection } from '../../helpers/label-text';
import { SelectorParams, substructureFromSelector } from '../selector';
export const CustomLabelTextParams = {
    items: PD.ObjectList({
        text: PD.Text('¯\\_(ツ)_/¯'),
        position: PD.MappedStatic('selection', {
            x_y_z: PD.Group({
                x: PD.Numeric(0),
                y: PD.Numeric(0),
                z: PD.Numeric(0),
                scale: PD.Numeric(1, { min: 0, max: 20, step: 0.1 })
            }),
            selection: PD.Group({
                selector: SelectorParams,
            }),
        }),
    }, obj => obj.text, { isEssential: true }),
    ...omitObjectKeys(Original.LabelTextParams, ['level', 'chainScale', 'residueScale', 'elementScale']),
    borderColor: { ...Original.LabelTextParams.borderColor, defaultValue: ColorNames.black },
};
/** Create "label-text" visual for "Custom Label" representation */
export function CustomLabelTextVisual(materialId) {
    return ComplexTextVisual({
        defaultProps: PD.getDefaultValues(CustomLabelTextParams),
        createGeometry: createLabelText,
        createLocationIterator: ElementIterator.fromStructure,
        getLoci: getSerialElementLoci,
        eachLocation: eachSerialElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = !deepEqual(newProps.items, currentProps.items);
        }
    }, materialId);
}
function createLabelText(ctx, structure, theme, props, text) {
    var _a;
    const count = props.items.length;
    const builder = TextBuilder.create(props, count, count / 2, text);
    for (const item of props.items) {
        switch (item.position.name) {
            case 'x_y_z':
                const scale = item.position.params.scale;
                builder.add(item.text, item.position.params.x, item.position.params.y, item.position.params.z, scale, scale, 0);
                break;
            case 'selection':
                const substructure = substructureFromSelector(structure, item.position.params.selector);
                const p = textPropsForSelection(substructure, theme.size.size, {});
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
        if (unit.model.id === theUnit.model.id && SortedArray.has(unit.elements, theElement)) {
            return structure.serialMapping.getSerialIndex(unit, theElement);
        }
    }
    return undefined;
}
