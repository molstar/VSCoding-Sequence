"use strict";
/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPSILON = exports.Quat = exports.Vec4 = exports.Vec3 = exports.Vec2 = exports.Mat3 = exports.Mat4 = void 0;
/*
 * This code has been modified from https://github.com/toji/gl-matrix/,
 * copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 */
const mat4_1 = require("./3d/mat4");
Object.defineProperty(exports, "Mat4", { enumerable: true, get: function () { return mat4_1.Mat4; } });
const mat3_1 = require("./3d/mat3");
Object.defineProperty(exports, "Mat3", { enumerable: true, get: function () { return mat3_1.Mat3; } });
const vec2_1 = require("./3d/vec2");
Object.defineProperty(exports, "Vec2", { enumerable: true, get: function () { return vec2_1.Vec2; } });
const vec3_1 = require("./3d/vec3");
Object.defineProperty(exports, "Vec3", { enumerable: true, get: function () { return vec3_1.Vec3; } });
const vec4_1 = require("./3d/vec4");
Object.defineProperty(exports, "Vec4", { enumerable: true, get: function () { return vec4_1.Vec4; } });
const quat_1 = require("./3d/quat");
Object.defineProperty(exports, "Quat", { enumerable: true, get: function () { return quat_1.Quat; } });
const common_1 = require("./3d/common");
Object.defineProperty(exports, "EPSILON", { enumerable: true, get: function () { return common_1.EPSILON; } });
