"use strict";
/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Backgrounds = void 0;
const tslib_1 = require("tslib");
const behavior_1 = require("../../mol-plugin/behavior/behavior");
const config_1 = require("../../mol-plugin/config");
const color_1 = require("../../mol-util/color/color");
// from https://visualsonline.cancer.gov/details.cfm?imageid=2304, public domain
const cells_jpg_1 = tslib_1.__importDefault(require("./images/cells.jpg"));
// created with http://alexcpeterson.com/spacescape/
const nebula_left2_jpg_1 = tslib_1.__importDefault(require("./skyboxes/nebula/nebula_left2.jpg"));
const nebula_bottom4_jpg_1 = tslib_1.__importDefault(require("./skyboxes/nebula/nebula_bottom4.jpg"));
const nebula_back6_jpg_1 = tslib_1.__importDefault(require("./skyboxes/nebula/nebula_back6.jpg"));
const nebula_right1_jpg_1 = tslib_1.__importDefault(require("./skyboxes/nebula/nebula_right1.jpg"));
const nebula_top3_jpg_1 = tslib_1.__importDefault(require("./skyboxes/nebula/nebula_top3.jpg"));
const nebula_front5_jpg_1 = tslib_1.__importDefault(require("./skyboxes/nebula/nebula_front5.jpg"));
exports.Backgrounds = behavior_1.PluginBehavior.create({
    name: 'extension-backgrounds',
    category: 'misc',
    display: {
        name: 'Backgrounds'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.ctx.config.set(config_1.PluginConfig.Background.Styles, [
                [{
                        variant: {
                            name: 'off',
                            params: {}
                        }
                    }, 'Off'],
                [{
                        variant: {
                            name: 'radialGradient',
                            params: {
                                centerColor: (0, color_1.Color)(0xFFFFFF),
                                edgeColor: (0, color_1.Color)(0x808080),
                                ratio: 0.2,
                                coverage: 'viewport',
                            }
                        }
                    }, 'Light Radial Gradient'],
                [{
                        variant: {
                            name: 'image',
                            params: {
                                source: {
                                    name: 'url',
                                    params: cells_jpg_1.default
                                },
                                lightness: 0,
                                saturation: 0,
                                opacity: 1,
                                blur: 0,
                                coverage: 'viewport',
                            }
                        }
                    }, 'Normal Cells Image'],
                [{
                        variant: {
                            name: 'skybox',
                            params: {
                                faces: {
                                    name: 'urls',
                                    params: {
                                        nx: nebula_left2_jpg_1.default,
                                        ny: nebula_bottom4_jpg_1.default,
                                        nz: nebula_back6_jpg_1.default,
                                        px: nebula_right1_jpg_1.default,
                                        py: nebula_top3_jpg_1.default,
                                        pz: nebula_front5_jpg_1.default,
                                    }
                                },
                                lightness: 0,
                                saturation: 0,
                                opacity: 1,
                                blur: 0.3,
                                rotation: { x: 0, y: 0, z: 0 },
                            }
                        }
                    }, 'Purple Nebula Skybox'],
            ]);
        }
        update() {
            return false;
        }
        unregister() {
            this.ctx.config.set(config_1.PluginConfig.Background.Styles, []);
        }
    },
    params: () => ({})
});
