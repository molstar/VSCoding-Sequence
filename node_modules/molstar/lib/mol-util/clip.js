/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Quat, Vec3 } from '../mol-math/linear-algebra';
import { degToRad } from '../mol-math/misc';
import { ParamDefinition as PD } from './param-definition';
import { stringToWords } from './string';
export function Clip() {
}
(function (Clip) {
    /** Clip object types */
    Clip.Type = {
        none: 0, // to switch clipping off
        plane: 1,
        sphere: 2,
        cube: 3,
        cylinder: 4,
        infiniteCone: 5,
    };
    Clip.Params = {
        variant: PD.Select('pixel', PD.arrayToOptions(['instance', 'pixel'])),
        objects: PD.ObjectList({
            type: PD.Select('plane', PD.objectToOptions(Clip.Type, t => stringToWords(t))),
            invert: PD.Boolean(false),
            position: PD.Vec3(Vec3()),
            rotation: PD.Group({
                axis: PD.Vec3(Vec3.create(1, 0, 0)),
                angle: PD.Numeric(0, { min: -180, max: 180, step: 1 }, { description: 'Angle in Degrees' }),
            }, { isExpanded: true }),
            scale: PD.Vec3(Vec3.create(1, 1, 1)),
        }, o => stringToWords(o.type))
    };
    function createClipObjects(count) {
        return {
            count: 0,
            type: (new Array(count)).fill(1),
            invert: (new Array(count)).fill(false),
            position: (new Array(count * 3)).fill(0),
            rotation: (new Array(count * 4)).fill(0),
            scale: (new Array(count * 3)).fill(1),
        };
    }
    const qA = Quat();
    const qB = Quat();
    const vA = Vec3();
    const vB = Vec3();
    function getClip(props, clip) {
        const count = props.objects.length;
        const { type, invert, position, rotation, scale } = (clip === null || clip === void 0 ? void 0 : clip.objects) || createClipObjects(count);
        for (let i = 0; i < count; ++i) {
            const p = props.objects[i];
            type[i] = Clip.Type[p.type];
            invert[i] = p.invert;
            Vec3.toArray(p.position, position, i * 3);
            Quat.toArray(Quat.setAxisAngle(qA, p.rotation.axis, degToRad(p.rotation.angle)), rotation, i * 4);
            Vec3.toArray(p.scale, scale, i * 3);
        }
        return {
            variant: props.variant,
            objects: { count, type, invert, position, rotation, scale }
        };
    }
    Clip.getClip = getClip;
    function areEqual(cA, cB) {
        if (cA.variant !== cB.variant)
            return false;
        if (cA.objects.count !== cB.objects.count)
            return false;
        const oA = cA.objects, oB = cB.objects;
        for (let i = 0, il = oA.count; i < il; ++i) {
            if (oA.invert[i] !== oB.invert[i])
                return false;
            if (oA.type[i] !== oB.type[i])
                return false;
            Vec3.fromArray(vA, oA.position, i * 3);
            Vec3.fromArray(vB, oB.position, i * 3);
            if (!Vec3.equals(vA, vB))
                return false;
            Vec3.fromArray(vA, oA.scale, i * 3);
            Vec3.fromArray(vB, oB.scale, i * 3);
            if (!Vec3.equals(vA, vB))
                return false;
            Quat.fromArray(qA, oA.rotation, i * 4);
            Quat.fromArray(qB, oB.rotation, i * 4);
            if (!Quat.equals(qA, qB))
                return false;
        }
        return true;
    }
    Clip.areEqual = areEqual;
})(Clip || (Clip = {}));
