/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Vec3 } from '../../../../mol-math/linear-algebra';
export function checkStructureMinMaxDistance(ctx, a, b, minDist, maxDist, elementRadius) {
    if (a.elementCount === 0 || b.elementCount === 0)
        return true;
    if (a.elementCount <= b.elementCount)
        return MinMaxDist.check(ctx, a, b, minDist, maxDist, elementRadius);
    return MinMaxDist.check(ctx, b, a, minDist, maxDist, elementRadius);
}
export function checkStructureMaxRadiusDistance(ctx, a, b, maxDist, elementRadius) {
    if (a.elementCount === 0 || b.elementCount === 0)
        return true;
    if (a.elementCount <= b.elementCount)
        return MaxRadiusDist.check(ctx, a, b, maxDist, elementRadius);
    return MaxRadiusDist.check(ctx, b, a, maxDist, elementRadius);
}
var MinMaxDist;
(function (MinMaxDist) {
    const distVec = Vec3();
    function inUnit(ctx, unit, p, eRadius, minDist, maxDist, elementRadius) {
        const { elements, conformation: c } = unit, dV = distVec;
        ctx.element.unit = unit;
        let withinRange = false;
        for (let i = 0, _i = elements.length; i < _i; i++) {
            const e = elements[i];
            ctx.element.element = e;
            const d = Math.max(0, Vec3.distance(p, c.position(e, dV)) - eRadius - elementRadius(ctx));
            if (d < minDist)
                return 0 /* Result.BelowMin */;
            if (d < maxDist)
                withinRange = true;
        }
        return withinRange ? 1 /* Result.WithinMax */ : 2 /* Result.Miss */;
    }
    function toPoint(ctx, s, point, radius, minDist, maxDist, elementRadius) {
        const { units } = s;
        let withinRange = false;
        for (let i = 0, _i = units.length; i < _i; i++) {
            const iu = inUnit(ctx, units[i], point, radius, minDist, maxDist, elementRadius);
            if (iu === 0 /* Result.BelowMin */)
                return 0 /* Result.BelowMin */;
            if (iu === 1 /* Result.WithinMax */)
                withinRange = true;
        }
        return withinRange ? 1 /* Result.WithinMax */ : 2 /* Result.Miss */;
    }
    const distPivot = Vec3();
    function check(ctx, a, b, minDist, maxDist, elementRadius) {
        if (a.elementCount === 0 || b.elementCount === 0)
            return 0;
        const { units } = a;
        let withinRange = false;
        ctx.element.structure = a;
        for (let i = 0, _i = units.length; i < _i; i++) {
            const unit = units[i];
            const { elements, conformation: c } = unit;
            ctx.element.unit = unit;
            for (let i = 0, _i = elements.length; i < _i; i++) {
                const e = elements[i];
                ctx.element.element = e;
                const tp = toPoint(ctx, b, c.position(e, distPivot), elementRadius(ctx), minDist, maxDist, elementRadius);
                if (tp === 0 /* Result.BelowMin */)
                    return false;
                if (tp === 1 /* Result.WithinMax */)
                    withinRange = true;
            }
        }
        return withinRange;
    }
    MinMaxDist.check = check;
})(MinMaxDist || (MinMaxDist = {}));
var MaxRadiusDist;
(function (MaxRadiusDist) {
    const distVec = Vec3();
    function inUnit(ctx, unit, p, eRadius, maxDist, elementRadius) {
        const { elements, conformation: c } = unit, dV = distVec;
        ctx.element.unit = unit;
        for (let i = 0, _i = elements.length; i < _i; i++) {
            const e = elements[i];
            ctx.element.element = e;
            if (Math.max(0, Vec3.distance(p, c.position(e, dV)) - eRadius - elementRadius(ctx)) <= maxDist)
                return true;
        }
        return false;
    }
    function toPoint(ctx, s, point, radius, maxDist, elementRadius) {
        const { units } = s;
        for (let i = 0, _i = units.length; i < _i; i++) {
            if (inUnit(ctx, units[i], point, radius, maxDist, elementRadius))
                return true;
        }
        return false;
    }
    const distPivot = Vec3();
    function check(ctx, a, b, maxDist, elementRadius) {
        if (a.elementCount === 0 || b.elementCount === 0)
            return 0;
        const { units } = a;
        ctx.element.structure = a;
        for (let i = 0, _i = units.length; i < _i; i++) {
            const unit = units[i];
            ctx.element.unit = unit;
            const { elements, conformation: c } = unit;
            for (let i = 0, _i = elements.length; i < _i; i++) {
                const e = elements[i];
                ctx.element.element = e;
                if (toPoint(ctx, b, c.position(e, distPivot), elementRadius(ctx), maxDist, elementRadius))
                    return true;
            }
        }
        return false;
    }
    MaxRadiusDist.check = check;
})(MaxRadiusDist || (MaxRadiusDist = {}));
