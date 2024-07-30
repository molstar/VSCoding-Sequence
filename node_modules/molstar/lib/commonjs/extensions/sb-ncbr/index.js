"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dominik Tichý <tichydominik451@gmail.com>
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelShapeProvider = exports.TunnelFromRawData = exports.SelectTunnel = exports.TunnelsFromRawData = exports.SbNcbrTunnels = exports.SbNcbrPartialChargesPropertyProvider = exports.SbNcbrPartialChargesPreset = exports.SbNcbrPartialCharges = void 0;
var behavior_1 = require("./partial-charges/behavior");
Object.defineProperty(exports, "SbNcbrPartialCharges", { enumerable: true, get: function () { return behavior_1.SbNcbrPartialCharges; } });
var preset_1 = require("./partial-charges/preset");
Object.defineProperty(exports, "SbNcbrPartialChargesPreset", { enumerable: true, get: function () { return preset_1.SbNcbrPartialChargesPreset; } });
var property_1 = require("./partial-charges/property");
Object.defineProperty(exports, "SbNcbrPartialChargesPropertyProvider", { enumerable: true, get: function () { return property_1.SbNcbrPartialChargesPropertyProvider; } });
var behavior_2 = require("./tunnels/behavior");
Object.defineProperty(exports, "SbNcbrTunnels", { enumerable: true, get: function () { return behavior_2.SbNcbrTunnels; } });
var representation_1 = require("./tunnels/representation");
Object.defineProperty(exports, "TunnelsFromRawData", { enumerable: true, get: function () { return representation_1.TunnelsFromRawData; } });
Object.defineProperty(exports, "SelectTunnel", { enumerable: true, get: function () { return representation_1.SelectTunnel; } });
Object.defineProperty(exports, "TunnelFromRawData", { enumerable: true, get: function () { return representation_1.TunnelFromRawData; } });
Object.defineProperty(exports, "TunnelShapeProvider", { enumerable: true, get: function () { return representation_1.TunnelShapeProvider; } });
