/**
 * Copyright (c) 2019-24 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Loci } from '../../../mol-model/loci';
import { Text } from '../../../mol-geo/geometry/text/text';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ShapeRepresentation } from '../representation';
import { Representation } from '../../representation';
import { Shape } from '../../../mol-model/shape';
import { TextBuilder } from '../../../mol-geo/geometry/text/text-builder';
import { Sphere3D } from '../../../mol-math/geometry';
import { lociLabel } from '../../../mol-theme/label';
import { LociLabelTextParams } from './common';
const TextParams = {
    ...LociLabelTextParams,
};
const LabelVisuals = {
    'text': (ctx, getParams) => ShapeRepresentation(getTextShape, Text.Utils),
};
export const LabelParams = {
    ...TextParams,
    scaleByRadius: PD.Boolean(true),
    visuals: PD.MultiSelect(['text'], PD.objectToOptions(LabelVisuals)),
    snapshotKey: PD.Text('', { isEssential: true, disableInteractiveUpdates: true, description: 'Activate the snapshot with the provided key when clicking on the label' }),
    tooltip: PD.Text('', { isEssential: true, multiline: true, disableInteractiveUpdates: true, placeholder: 'Tooltip', description: 'Tooltip text to be displayed when hovering over the label' }),
};
//
const tmpSphere = Sphere3D();
function label(info, condensed = false) {
    return info.label || lociLabel(info.loci, { hidePrefix: true, htmlStyling: false, condensed });
}
function getLabelName(data) {
    return data.infos.length === 1 ? label(data.infos[0]) : `${data.infos.length} Labels`;
}
//
function buildText(data, props, text) {
    const builder = TextBuilder.create(props, 128, 64, text);
    const customLabel = props.customText.trim();
    for (let i = 0, il = data.infos.length; i < il; ++i) {
        const info = data.infos[i];
        const sphere = Loci.getBoundingSphere(info.loci, tmpSphere);
        if (!sphere)
            continue;
        const { center, radius } = sphere;
        const text = customLabel || label(info, true);
        builder.add(text, center[0], center[1], center[2], props.scaleByRadius ? radius / 0.9 : 0, props.scaleByRadius ? Math.max(1, radius) : 1, i);
    }
    return builder.getText();
}
function getTextShape(ctx, data, props, shape) {
    var _a, _b;
    const text = buildText(data, props, shape && shape.geometry);
    const name = getLabelName(data);
    const tooltip = (_b = (_a = props.tooltip) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
    const customLabel = props.customText.trim();
    let getLabel;
    if (tooltip) {
        getLabel = (_) => tooltip;
    }
    else if (customLabel) {
        getLabel = (_) => customLabel;
    }
    else {
        getLabel = (groupId) => label(data.infos[groupId]);
    }
    return Shape.create(name, data, text, () => props.textColor, () => props.textSize, getLabel);
}
export function LabelRepresentation(ctx, getParams) {
    return Representation.createMulti('Label', ctx, getParams, Representation.StateBuilder, LabelVisuals);
}
