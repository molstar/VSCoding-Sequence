"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Canvas3dInteractionHelper = exports.Canvas3dInteractionHelperParams = void 0;
const representation_1 = require("../../mol-repr/representation");
const input_observer_1 = require("../../mol-util/input/input-observer");
const rx_event_helper_1 = require("../../mol-util/rx-event-helper");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const param_definition_1 = require("../../mol-util/param-definition");
const structure_1 = require("../../mol-model/structure");
var InputEvent;
(function (InputEvent) {
    InputEvent[InputEvent["Move"] = 0] = "Move";
    InputEvent[InputEvent["Click"] = 1] = "Click";
    InputEvent[InputEvent["Drag"] = 2] = "Drag";
})(InputEvent || (InputEvent = {}));
const tmpPosA = (0, linear_algebra_1.Vec3)();
const tmpPos = (0, linear_algebra_1.Vec3)();
const tmpNorm = (0, linear_algebra_1.Vec3)();
exports.Canvas3dInteractionHelperParams = {
    maxFps: param_definition_1.ParamDefinition.Numeric(30, { min: 10, max: 60, step: 10 }),
    preferAtomPixelPadding: param_definition_1.ParamDefinition.Numeric(3, { min: 0, max: 20, step: 1 }, { description: 'Number of extra pixels at which to prefer atoms over bonds.' }),
};
class Canvas3dInteractionHelper {
    setProps(props) {
        Object.assign(this.props, props);
    }
    identify(e, t) {
        const xyChanged = this.startX !== this.endX || this.startY !== this.endY || (this.input.pointerLock && !this.controls.isMoving);
        if (e === InputEvent.Drag) {
            if (xyChanged && !this.outsideViewport(this.startX, this.startY)) {
                this.events.drag.next({ current: this.prevLoci, buttons: this.buttons, button: this.button, modifiers: this.modifiers, pageStart: linear_algebra_1.Vec2.create(this.startX, this.startY), pageEnd: linear_algebra_1.Vec2.create(this.endX, this.endY) });
                this.startX = this.endX;
                this.startY = this.endY;
            }
            return;
        }
        if (xyChanged) {
            const pickData = this.canvasIdentify(this.endX, this.endY);
            this.id = pickData === null || pickData === void 0 ? void 0 : pickData.id;
            this.position = pickData === null || pickData === void 0 ? void 0 : pickData.position;
            this.startX = this.endX;
            this.startY = this.endY;
        }
        if (e === InputEvent.Click) {
            const loci = this.getLoci(this.id, this.position);
            this.events.click.next({ current: loci, buttons: this.buttons, button: this.button, modifiers: this.modifiers, page: linear_algebra_1.Vec2.create(this.endX, this.endY), position: this.position });
            this.prevLoci = loci;
            return;
        }
        if (!this.inside || this.currentIdentifyT !== t || !xyChanged || this.outsideViewport(this.endX, this.endY))
            return;
        const loci = this.getLoci(this.id, this.position);
        this.events.hover.next({ current: loci, buttons: this.buttons, button: this.button, modifiers: this.modifiers, page: linear_algebra_1.Vec2.create(this.endX, this.endY), position: this.position });
        this.prevLoci = loci;
    }
    tick(t) {
        if (this.inside && t - this.prevT > 1000 / this.props.maxFps) {
            this.prevT = t;
            this.currentIdentifyT = t;
            this.identify(this.isInteracting ? InputEvent.Drag : InputEvent.Move, t);
        }
    }
    leave() {
        this.inside = false;
        if (!representation_1.Representation.Loci.isEmpty(this.prevLoci)) {
            this.prevLoci = representation_1.Representation.Loci.Empty;
            this.events.hover.next({ current: this.prevLoci, buttons: this.buttons, button: this.button, modifiers: this.modifiers });
        }
    }
    move(x, y, buttons, button, modifiers) {
        this.inside = true;
        this.buttons = buttons;
        this.button = button;
        this.modifiers = modifiers;
        this.endX = x;
        this.endY = y;
    }
    click(x, y, buttons, button, modifiers) {
        this.endX = x;
        this.endY = y;
        this.buttons = buttons;
        this.button = button;
        this.modifiers = modifiers;
        this.identify(InputEvent.Click, 0);
    }
    drag(x, y, buttons, button, modifiers) {
        this.endX = x;
        this.endY = y;
        this.buttons = buttons;
        this.button = button;
        this.modifiers = modifiers;
        this.identify(InputEvent.Drag, 0);
    }
    modify(modifiers) {
        if (input_observer_1.ModifiersKeys.areEqual(modifiers, this.modifiers))
            return;
        this.modifiers = modifiers;
        this.events.hover.next({ current: this.prevLoci, buttons: this.buttons, button: this.button, modifiers: this.modifiers, page: linear_algebra_1.Vec2.create(this.endX, this.endY), position: this.position });
    }
    outsideViewport(x, y) {
        const { input, camera: { viewport } } = this;
        x *= input.pixelRatio;
        y *= input.pixelRatio;
        return (x > viewport.x + viewport.width ||
            input.height - y > viewport.y + viewport.height ||
            x < viewport.x ||
            input.height - y < viewport.y);
    }
    getLoci(pickingId, position) {
        var _a;
        const { repr, loci } = this.lociGetter(pickingId);
        if (position && repr && structure_1.Bond.isLoci(loci) && loci.bonds.length === 2) {
            const { aUnit, aIndex } = loci.bonds[0];
            aUnit.conformation.position(aUnit.elements[aIndex], tmpPosA);
            linear_algebra_1.Vec3.sub(tmpNorm, this.camera.state.position, this.camera.state.target);
            linear_algebra_1.Vec3.projectPointOnPlane(tmpPos, position, tmpNorm, tmpPosA);
            const pixelSize = this.camera.getPixelSize(tmpPos);
            let radius = repr.theme.size.size(loci.bonds[0]) * ((_a = repr.props.sizeFactor) !== null && _a !== void 0 ? _a : 1);
            if (repr.props.lineSizeAttenuation === false) {
                // divide by two to get radius
                radius *= pixelSize / 2;
            }
            radius += this.props.preferAtomPixelPadding * pixelSize;
            if (linear_algebra_1.Vec3.distance(tmpPos, tmpPosA) < radius) {
                return { repr, loci: structure_1.Bond.toFirstStructureElementLoci(loci) };
            }
        }
        return { repr, loci };
    }
    dispose() {
        this.ev.dispose();
    }
    constructor(canvasIdentify, lociGetter, input, camera, controls, props = {}) {
        this.canvasIdentify = canvasIdentify;
        this.lociGetter = lociGetter;
        this.input = input;
        this.camera = camera;
        this.controls = controls;
        this.ev = rx_event_helper_1.RxEventHelper.create();
        this.events = {
            hover: this.ev(),
            drag: this.ev(),
            click: this.ev(),
        };
        this.startX = -1;
        this.startY = -1;
        this.endX = -1;
        this.endY = -1;
        this.id = void 0;
        this.position = void 0;
        this.currentIdentifyT = 0;
        this.isInteracting = false;
        this.prevLoci = representation_1.Representation.Loci.Empty;
        this.prevT = 0;
        this.inside = false;
        this.buttons = input_observer_1.ButtonsType.create(0);
        this.button = input_observer_1.ButtonsType.create(0);
        this.modifiers = input_observer_1.ModifiersKeys.None;
        this.props = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.Canvas3dInteractionHelperParams), ...props };
        input.drag.subscribe(({ x, y, buttons, button, modifiers }) => {
            this.isInteracting = true;
            // console.log('drag');
            this.drag(x, y, buttons, button, modifiers);
        });
        input.move.subscribe(({ x, y, inside, buttons, button, modifiers, onElement }) => {
            if (!inside || this.isInteracting)
                return;
            if (!onElement) {
                this.leave();
                return;
            }
            // console.log('move');
            this.move(x, y, buttons, button, modifiers);
        });
        input.leave.subscribe(() => {
            // console.log('leave');
            this.leave();
        });
        input.click.subscribe(({ x, y, buttons, button, modifiers }) => {
            if (this.outsideViewport(x, y))
                return;
            // console.log('click');
            this.click(x, y, buttons, button, modifiers);
        });
        input.interactionEnd.subscribe(() => {
            // console.log('interactionEnd');
            this.isInteracting = false;
        });
        input.modifiers.subscribe(modifiers => {
            // console.log('modifiers');
            this.modify(modifiers);
        });
    }
}
exports.Canvas3dInteractionHelper = Canvas3dInteractionHelper;
