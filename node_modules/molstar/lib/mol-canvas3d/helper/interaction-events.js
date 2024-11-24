/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Representation } from '../../mol-repr/representation';
import { ModifiersKeys, ButtonsType } from '../../mol-util/input/input-observer';
import { RxEventHelper } from '../../mol-util/rx-event-helper';
import { Vec2, Vec3 } from '../../mol-math/linear-algebra';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Bond } from '../../mol-model/structure';
var InputEvent;
(function (InputEvent) {
    InputEvent[InputEvent["Move"] = 0] = "Move";
    InputEvent[InputEvent["Click"] = 1] = "Click";
    InputEvent[InputEvent["Drag"] = 2] = "Drag";
})(InputEvent || (InputEvent = {}));
const tmpPosA = Vec3();
const tmpPos = Vec3();
const tmpNorm = Vec3();
export const Canvas3dInteractionHelperParams = {
    maxFps: PD.Numeric(30, { min: 10, max: 60, step: 10 }),
    preferAtomPixelPadding: PD.Numeric(3, { min: 0, max: 20, step: 1 }, { description: 'Number of extra pixels at which to prefer atoms over bonds.' }),
};
export class Canvas3dInteractionHelper {
    setProps(props) {
        Object.assign(this.props, props);
    }
    identify(e, t) {
        const xyChanged = this.startX !== this.endX || this.startY !== this.endY || (this.input.pointerLock && !this.controls.isMoving);
        if (e === InputEvent.Drag) {
            if (xyChanged && !this.outsideViewport(this.startX, this.startY)) {
                this.events.drag.next({ current: this.prevLoci, buttons: this.buttons, button: this.button, modifiers: this.modifiers, pageStart: Vec2.create(this.startX, this.startY), pageEnd: Vec2.create(this.endX, this.endY) });
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
            this.events.click.next({ current: loci, buttons: this.buttons, button: this.button, modifiers: this.modifiers, page: Vec2.create(this.endX, this.endY), position: this.position });
            this.prevLoci = loci;
            return;
        }
        if (!this.inside || this.currentIdentifyT !== t || !xyChanged || this.outsideViewport(this.endX, this.endY))
            return;
        const loci = this.getLoci(this.id, this.position);
        this.events.hover.next({ current: loci, buttons: this.buttons, button: this.button, modifiers: this.modifiers, page: Vec2.create(this.endX, this.endY), position: this.position });
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
        if (!Representation.Loci.isEmpty(this.prevLoci)) {
            this.prevLoci = Representation.Loci.Empty;
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
        if (ModifiersKeys.areEqual(modifiers, this.modifiers))
            return;
        this.modifiers = modifiers;
        this.events.hover.next({ current: this.prevLoci, buttons: this.buttons, button: this.button, modifiers: this.modifiers, page: Vec2.create(this.endX, this.endY), position: this.position });
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
        if (position && repr && Bond.isLoci(loci) && loci.bonds.length === 2) {
            const { aUnit, aIndex } = loci.bonds[0];
            aUnit.conformation.position(aUnit.elements[aIndex], tmpPosA);
            Vec3.sub(tmpNorm, this.camera.state.position, this.camera.state.target);
            Vec3.projectPointOnPlane(tmpPos, position, tmpNorm, tmpPosA);
            const pixelSize = this.camera.getPixelSize(tmpPos);
            let radius = repr.theme.size.size(loci.bonds[0]) * ((_a = repr.props.sizeFactor) !== null && _a !== void 0 ? _a : 1);
            if (repr.props.lineSizeAttenuation === false) {
                // divide by two to get radius
                radius *= pixelSize / 2;
            }
            radius += this.props.preferAtomPixelPadding * pixelSize;
            if (Vec3.distance(tmpPos, tmpPosA) < radius) {
                return { repr, loci: Bond.toFirstStructureElementLoci(loci) };
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
        this.ev = RxEventHelper.create();
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
        this.prevLoci = Representation.Loci.Empty;
        this.prevT = 0;
        this.inside = false;
        this.buttons = ButtonsType.create(0);
        this.button = ButtonsType.create(0);
        this.modifiers = ModifiersKeys.None;
        this.props = { ...PD.getDefaultValues(Canvas3dInteractionHelperParams), ...props };
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
