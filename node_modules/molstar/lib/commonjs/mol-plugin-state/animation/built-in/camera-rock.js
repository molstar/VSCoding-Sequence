"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimateCameraRock = void 0;
const interpolate_1 = require("../../../mol-math/interpolate");
const quat_1 = require("../../../mol-math/linear-algebra/3d/quat");
const vec3_1 = require("../../../mol-math/linear-algebra/3d/vec3");
const misc_1 = require("../../../mol-math/misc");
const param_definition_1 = require("../../../mol-util/param-definition");
const model_1 = require("../model");
const _dir = (0, vec3_1.Vec3)(), _axis = (0, vec3_1.Vec3)(), _rot = (0, quat_1.Quat)();
exports.AnimateCameraRock = model_1.PluginStateAnimation.create({
    name: 'built-in.animate-camera-rock',
    display: { name: 'Camera Rock', description: 'Rock the 3D scene around the x-axis in view space' },
    isExportable: true,
    params: () => ({
        durationInMs: param_definition_1.ParamDefinition.Numeric(4000, { min: 100, max: 20000, step: 100 }),
        speed: param_definition_1.ParamDefinition.Numeric(1, { min: 1, max: 10, step: 1 }, { description: 'How many times to rock from side to side.' }),
        angle: param_definition_1.ParamDefinition.Numeric(10, { min: 0, max: 180, step: 1 }, { description: 'How many degrees to rotate in each direction.' }),
    }),
    initialState: (p, ctx) => ({ snapshot: ctx.canvas3d.camera.getSnapshot() }),
    getDuration: p => ({ kind: 'fixed', durationMs: p.durationInMs }),
    teardown: (_, state, ctx) => {
        var _a;
        (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.requestCameraReset({ snapshot: state.snapshot, durationMs: 0 });
    },
    async apply(animState, t, ctx) {
        var _a, _b;
        if (t.current === 0) {
            return { kind: 'next', state: animState };
        }
        const snapshot = animState.snapshot;
        if (snapshot.radiusMax < 0.0001) {
            return { kind: 'finished' };
        }
        const phase = t.animation
            ? ((_a = t.animation) === null || _a === void 0 ? void 0 : _a.currentFrame) / (t.animation.frameCount + 1)
            : (0, interpolate_1.clamp)(t.current / ctx.params.durationInMs, 0, 1);
        const angle = Math.sin(phase * ctx.params.speed * Math.PI * 2) * (0, misc_1.degToRad)(ctx.params.angle);
        vec3_1.Vec3.sub(_dir, snapshot.position, snapshot.target);
        vec3_1.Vec3.normalize(_axis, snapshot.up);
        quat_1.Quat.setAxisAngle(_rot, _axis, angle);
        vec3_1.Vec3.transformQuat(_dir, _dir, _rot);
        const position = vec3_1.Vec3.add((0, vec3_1.Vec3)(), snapshot.target, _dir);
        (_b = ctx.plugin.canvas3d) === null || _b === void 0 ? void 0 : _b.requestCameraReset({ snapshot: { ...snapshot, position }, durationMs: 0 });
        if (phase >= 0.99999) {
            return { kind: 'finished' };
        }
        return { kind: 'next', state: animState };
    }
});
