"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorMapParams = getColorMapParams;
const param_definition_1 = require("../../mol-util/param-definition");
const object_1 = require("../object");
function getColorMapParams(map) {
    const colors = {};
    (0, object_1.objectForEach)(map, (_, k) => {
        colors[k] = param_definition_1.ParamDefinition.Color(map[k]);
    });
    return colors;
}
