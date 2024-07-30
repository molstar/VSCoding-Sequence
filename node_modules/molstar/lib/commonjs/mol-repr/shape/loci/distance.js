"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistanceParams = void 0;
exports.DistanceRepresentation = DistanceRepresentation;
const loci_1 = require("../../../mol-model/loci");
const lines_1 = require("../../../mol-geo/geometry/lines/lines");
const text_1 = require("../../../mol-geo/geometry/text/text");
const param_definition_1 = require("../../../mol-util/param-definition");
const names_1 = require("../../../mol-util/color/names");
const representation_1 = require("../representation");
const representation_2 = require("../../representation");
const shape_1 = require("../../../mol-model/shape");
const lines_builder_1 = require("../../../mol-geo/geometry/lines/lines-builder");
const text_builder_1 = require("../../../mol-geo/geometry/text/text-builder");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const marker_action_1 = require("../../../mol-util/marker-action");
const label_1 = require("../../../mol-theme/label");
const common_1 = require("./common");
const geometry_1 = require("../../../mol-math/geometry");
const SharedParams = {
    unitLabel: param_definition_1.ParamDefinition.Text('\u212B', { isEssential: true })
};
const LineParams = {
    ...lines_1.Lines.Params,
    ...SharedParams,
    lineSizeAttenuation: param_definition_1.ParamDefinition.Boolean(true),
    linesColor: param_definition_1.ParamDefinition.Color(names_1.ColorNames.lightgreen, { isEssential: true }),
    linesSize: param_definition_1.ParamDefinition.Numeric(0.075, { min: 0.01, max: 5, step: 0.01 }),
    dashLength: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0.01, max: 0.2, step: 0.01 }),
};
const TextParams = {
    ...common_1.LociLabelTextParams,
    ...SharedParams,
};
const DistanceVisuals = {
    'lines': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getLinesShape, lines_1.Lines.Utils, { modifyState: s => ({ ...s, markerActions: marker_action_1.MarkerActions.Highlighting }) }),
    'text': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getTextShape, text_1.Text.Utils, { modifyState: s => ({ ...s, markerActions: marker_action_1.MarkerAction.None }) }),
};
exports.DistanceParams = {
    ...LineParams,
    ...TextParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['lines', 'text'], param_definition_1.ParamDefinition.objectToOptions(DistanceVisuals)),
};
//
function getDistanceState() {
    return {
        sphereA: (0, geometry_1.Sphere3D)(),
        sphereB: (0, geometry_1.Sphere3D)(),
        center: (0, linear_algebra_1.Vec3)(),
        distance: 0,
    };
}
function setDistanceState(pair, state) {
    const { sphereA, sphereB, center } = state;
    const [lociA, lociB] = pair.loci;
    loci_1.Loci.getBoundingSphere(lociA, sphereA);
    loci_1.Loci.getBoundingSphere(lociB, sphereB);
    linear_algebra_1.Vec3.add(center, sphereA.center, sphereB.center);
    linear_algebra_1.Vec3.scale(center, center, 0.5);
    state.distance = linear_algebra_1.Vec3.distance(sphereA.center, sphereB.center);
    return state;
}
const tmpState = getDistanceState();
function getDistanceName(data, unitLabel) {
    return data.pairs.length === 1 ? `Distance ${(0, label_1.distanceLabel)(data.pairs[0], { unitLabel, measureOnly: true })}` : `${data.pairs.length} Distances`;
}
//
function buildLines(data, props, lines) {
    const builder = lines_builder_1.LinesBuilder.create(128, 64, lines);
    for (let i = 0, il = data.pairs.length; i < il; ++i) {
        setDistanceState(data.pairs[i], tmpState);
        builder.addFixedLengthDashes(tmpState.sphereA.center, tmpState.sphereB.center, props.dashLength, i);
    }
    return builder.getLines();
}
function getLinesShape(ctx, data, props, shape) {
    const lines = buildLines(data, props, shape && shape.geometry);
    const name = getDistanceName(data, props.unitLabel);
    const getLabel = (groupId) => (0, label_1.distanceLabel)(data.pairs[groupId], props);
    return shape_1.Shape.create(name, data, lines, () => props.linesColor, () => props.linesSize, getLabel);
}
//
function buildText(data, props, text) {
    const builder = text_builder_1.TextBuilder.create(props, 128, 64, text);
    for (let i = 0, il = data.pairs.length; i < il; ++i) {
        setDistanceState(data.pairs[i], tmpState);
        const { center, distance, sphereA, sphereB } = tmpState;
        const label = props.customText || `${distance.toFixed(2)} ${props.unitLabel}`;
        const radius = Math.max(2, sphereA.radius, sphereB.radius);
        const scale = radius / 2;
        builder.add(label, center[0], center[1], center[2], 1, scale, i);
    }
    return builder.getText();
}
function getTextShape(ctx, data, props, shape) {
    const text = buildText(data, props, shape && shape.geometry);
    const name = getDistanceName(data, props.unitLabel);
    const getLabel = (groupId) => (0, label_1.distanceLabel)(data.pairs[groupId], props);
    return shape_1.Shape.create(name, data, text, () => props.textColor, () => props.textSize, getLabel);
}
function DistanceRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Distance', ctx, getParams, representation_2.Representation.StateBuilder, DistanceVisuals);
}
