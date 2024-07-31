"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MesoFocusLoci = exports.MesoFocusLociParams = void 0;
const loci_1 = require("../../../mol-model/loci");
const param_definition_1 = require("../../../mol-util/param-definition");
const behavior_1 = require("../../../mol-plugin/behavior");
const input_observer_1 = require("../../../mol-util/input/input-observer");
const binding_1 = require("../../../mol-util/binding");
const commands_1 = require("../../../mol-plugin/commands");
const geometry_1 = require("../../../mol-math/geometry");
const structure_1 = require("../../../mol-model/structure");
const B = input_observer_1.ButtonsType;
const M = input_observer_1.ModifiersKeys;
const Trigger = binding_1.Binding.Trigger;
const Key = binding_1.Binding.TriggerKey;
const DefaultMesoFocusLociBindings = {
    clickCenter: (0, binding_1.Binding)([
        Trigger(B.Flag.Primary, M.create()),
    ], 'Camera center', 'Click element using ${triggers}'),
    clickCenterFocus: (0, binding_1.Binding)([
        Trigger(B.Flag.Secondary, M.create()),
    ], 'Camera center and focus', 'Click element using ${triggers}'),
    keyCenterOnly: (0, binding_1.Binding)([Key('C')], 'Center Only Toggle', 'Press ${triggers}'),
};
exports.MesoFocusLociParams = {
    minRadius: param_definition_1.ParamDefinition.Numeric(8, { min: 1, max: 50, step: 1 }),
    extraRadius: param_definition_1.ParamDefinition.Numeric(4, { min: 1, max: 50, step: 1 }, { description: 'Value added to the bounding-sphere radius of the Loci' }),
    durationMs: param_definition_1.ParamDefinition.Numeric(250, { min: 0, max: 1000, step: 1 }, { description: 'Camera transition duration' }),
    centerOnly: param_definition_1.ParamDefinition.Boolean(true, { description: 'Keep current camera distance' }),
    bindings: param_definition_1.ParamDefinition.Value(DefaultMesoFocusLociBindings, { isHidden: true }),
};
exports.MesoFocusLoci = behavior_1.PluginBehavior.create({
    name: 'camera-meso-focus-loci',
    category: 'interaction',
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.subscribeObservable(this.ctx.behaviors.interaction.click, ({ current, button, modifiers }) => {
                const { canvas3d } = this.ctx;
                if (!canvas3d)
                    return;
                const loci = loci_1.Loci.normalize(current.loci, this.ctx.managers.interactivity.props.granularity);
                const sphere = loci_1.Loci.getBoundingSphere(loci) || (0, geometry_1.Sphere3D)();
                const { clickCenter, clickCenterFocus } = this.params.bindings;
                const { durationMs, extraRadius, minRadius, centerOnly } = this.params;
                const radius = Math.max(sphere.radius + extraRadius, minRadius);
                if (binding_1.Binding.match(clickCenter, button, modifiers)) {
                    // left mouse button
                    if (loci_1.Loci.isEmpty(current.loci)) {
                        commands_1.PluginCommands.Camera.Reset(this.ctx, {});
                        return;
                    }
                    if (structure_1.StructureElement.Loci.is(current.loci)) {
                        if (centerOnly) {
                            const snapshot = canvas3d.camera.getCenter(sphere.center);
                            canvas3d.requestCameraReset({ durationMs, snapshot });
                        }
                        else {
                            this.ctx.managers.camera.focusSphere(sphere, this.params);
                        }
                    }
                }
                else if (binding_1.Binding.match(clickCenterFocus, button, modifiers)) {
                    // right mouse button
                    if (loci_1.Loci.isEmpty(current.loci)) {
                        commands_1.PluginCommands.Camera.Reset(this.ctx, {});
                        return;
                    }
                    if (centerOnly) {
                        const snapshot = canvas3d.camera.getCenter(sphere.center, radius);
                        canvas3d.requestCameraReset({ durationMs, snapshot });
                    }
                    else {
                        this.ctx.managers.camera.focusSphere(sphere, this.params);
                    }
                }
            });
            this.subscribeObservable(this.ctx.behaviors.interaction.key, ({ code, key, modifiers }) => {
                if (!this.ctx.canvas3d)
                    return;
                const b = { ...DefaultMesoFocusLociBindings, ...this.params.bindings };
                const { centerOnly } = this.params;
                if (binding_1.Binding.matchKey(b.keyCenterOnly, code, modifiers, key)) {
                    this.params.centerOnly = !centerOnly;
                }
            });
        }
    },
    params: () => exports.MesoFocusLociParams,
    display: { name: 'Camera Meso Focus Loci on Canvas' }
});
