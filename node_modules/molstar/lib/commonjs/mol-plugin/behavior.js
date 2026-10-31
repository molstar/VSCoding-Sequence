"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginBehaviors = exports.BuiltInPluginBehaviors = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./behavior/behavior"), exports);
const StaticState = tslib_1.__importStar(require("./behavior/static/state"));
const StaticRepresentation = tslib_1.__importStar(require("./behavior/static/representation"));
const StaticCamera = tslib_1.__importStar(require("./behavior/static/camera"));
const StaticMisc = tslib_1.__importStar(require("./behavior/static/misc"));
const DynamicRepresentation = tslib_1.__importStar(require("./behavior/dynamic/representation"));
const DynamicCamera = tslib_1.__importStar(require("./behavior/dynamic/camera"));
const DynamicCustomProps = tslib_1.__importStar(require("./behavior/dynamic/custom-props"));
exports.BuiltInPluginBehaviors = {
    State: StaticState,
    Representation: StaticRepresentation,
    Camera: StaticCamera,
    Misc: StaticMisc
};
exports.PluginBehaviors = {
    Representation: DynamicRepresentation,
    Camera: DynamicCamera,
    CustomProps: DynamicCustomProps
};
