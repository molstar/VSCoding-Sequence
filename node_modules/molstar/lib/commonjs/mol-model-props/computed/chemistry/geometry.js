"use strict";
/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomGeometryAngles = exports.AtomGeometry = void 0;
exports.geometryLabel = geometryLabel;
exports.assignGeometry = assignGeometry;
exports.calcAngles = calcAngles;
exports.calcPlaneAngle = calcPlaneAngle;
exports.closestHydrogenIndex = closestHydrogenIndex;
const misc_1 = require("../../../mol-math/misc");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const util_1 = require("./util");
/**
 * Numbering mostly inline with coordination number from VSEPR,
 * breaks with `SquarePlanar = 7`
 */
var AtomGeometry;
(function (AtomGeometry) {
    AtomGeometry[AtomGeometry["Spherical"] = 0] = "Spherical";
    AtomGeometry[AtomGeometry["Terminal"] = 1] = "Terminal";
    AtomGeometry[AtomGeometry["Linear"] = 2] = "Linear";
    AtomGeometry[AtomGeometry["Trigonal"] = 3] = "Trigonal";
    AtomGeometry[AtomGeometry["Tetrahedral"] = 4] = "Tetrahedral";
    AtomGeometry[AtomGeometry["TrigonalBiPyramidal"] = 5] = "TrigonalBiPyramidal";
    AtomGeometry[AtomGeometry["Octahedral"] = 6] = "Octahedral";
    AtomGeometry[AtomGeometry["SquarePlanar"] = 7] = "SquarePlanar";
    AtomGeometry[AtomGeometry["Unknown"] = 8] = "Unknown";
})(AtomGeometry || (exports.AtomGeometry = AtomGeometry = {}));
function geometryLabel(geometry) {
    switch (geometry) {
        case AtomGeometry.Spherical:
            return 'Spherical';
        case AtomGeometry.Terminal:
            return 'Terminal';
        case AtomGeometry.Linear:
            return 'Linear';
        case AtomGeometry.Trigonal:
            return 'Trigonal';
        case AtomGeometry.Tetrahedral:
            return 'Tetrahedral';
        case AtomGeometry.TrigonalBiPyramidal:
            return 'Trigonal Bi-Pyramidal';
        case AtomGeometry.Octahedral:
            return 'Octahedral';
        case AtomGeometry.SquarePlanar:
            return 'Square Planar';
        case AtomGeometry.Unknown:
            return 'Unknown';
    }
}
function assignGeometry(totalCoordination) {
    switch (totalCoordination) {
        case 0: return AtomGeometry.Spherical;
        case 1: return AtomGeometry.Terminal;
        case 2: return AtomGeometry.Linear;
        case 3: return AtomGeometry.Trigonal;
        case 4: return AtomGeometry.Tetrahedral;
        default: return AtomGeometry.Unknown;
    }
}
exports.AtomGeometryAngles = new Map([
    [AtomGeometry.Linear, (0, misc_1.degToRad)(180)],
    [AtomGeometry.Trigonal, (0, misc_1.degToRad)(120)],
    [AtomGeometry.Tetrahedral, (0, misc_1.degToRad)(109.4721)],
    [AtomGeometry.Octahedral, (0, misc_1.degToRad)(90)]
]);
// tmp objects for `calcAngles` and `calcPlaneAngle`
const tmpDir1 = (0, linear_algebra_1.Vec3)();
const tmpDir2 = (0, linear_algebra_1.Vec3)();
const tmpPosA = (0, linear_algebra_1.Vec3)();
const tmpPosB = (0, linear_algebra_1.Vec3)();
const tmpPosX = (0, linear_algebra_1.Vec3)();
/**
 * Calculate the angles x-a1-a2 for all x where x is a heavy atom (not H) bonded to ap1.
 */
function calcAngles(structure, unitA, indexA, unitB, indexB, ignoreHydrogens = true) {
    const angles = [];
    const anglesH = [];
    unitA.conformation.position(unitA.elements[indexA], tmpPosA);
    unitB.conformation.position(unitB.elements[indexB], tmpPosB);
    linear_algebra_1.Vec3.sub(tmpDir1, tmpPosB, tmpPosA);
    (0, util_1.eachBondedAtom)(structure, unitA, indexA, (unitX, indexX) => {
        if ((0, util_1.typeSymbol)(unitX, indexX) !== "H" /* Elements.H */) {
            unitX.conformation.position(unitX.elements[indexX], tmpPosX);
            linear_algebra_1.Vec3.sub(tmpDir2, tmpPosX, tmpPosA);
            angles.push(linear_algebra_1.Vec3.angle(tmpDir1, tmpDir2));
        }
        else if (!ignoreHydrogens) {
            unitX.conformation.position(unitX.elements[indexX], tmpPosX);
            linear_algebra_1.Vec3.sub(tmpDir2, tmpPosX, tmpPosA);
            anglesH.push(linear_algebra_1.Vec3.angle(tmpDir1, tmpDir2));
        }
    });
    return [angles, anglesH];
}
/**
 * Find two neighbours of ap1 to define a plane (if possible) and
 * measure angle out of plane to ap2
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom (out-of-plane)
 * @return {number}        Angle from plane to second atom
 */
function calcPlaneAngle(structure, unitA, indexA, unitB, indexB) {
    unitA.conformation.position(unitA.elements[indexA], tmpPosA);
    unitB.conformation.position(unitB.elements[indexB], tmpPosB);
    linear_algebra_1.Vec3.sub(tmpDir1, tmpPosB, tmpPosA);
    const neighbours = [(0, linear_algebra_1.Vec3)(), (0, linear_algebra_1.Vec3)()];
    let ni = 0;
    let unitX1;
    let indexX1;
    (0, util_1.eachBondedAtom)(structure, unitA, indexA, (unitX, indexX) => {
        if (ni > 1)
            return;
        if ((0, util_1.typeSymbol)(unitX, indexX) !== "H" /* Elements.H */) {
            unitX1 = unitX;
            indexX1 = indexX;
            unitX.conformation.position(unitX.elements[indexX], tmpPosX);
            linear_algebra_1.Vec3.sub(neighbours[ni++], tmpPosX, tmpPosA);
        }
    });
    if (ni === 1 && unitX1 && indexX1) {
        (0, util_1.eachBondedAtom)(structure, unitX1, indexX1, (unitX, indexX) => {
            if (ni > 1)
                return;
            if (unitX === unitA && indexX === indexA)
                return;
            if ((0, util_1.typeSymbol)(unitX, indexX) !== "H" /* Elements.H */) {
                unitX.conformation.position(unitX.elements[indexX], tmpPosX);
                linear_algebra_1.Vec3.sub(neighbours[ni++], tmpPosX, tmpPosA);
            }
        });
    }
    if (ni !== 2) {
        return;
    }
    linear_algebra_1.Vec3.cross(tmpDir2, neighbours[0], neighbours[1]);
    return Math.abs((Math.PI / 2) - linear_algebra_1.Vec3.angle(tmpDir2, tmpDir1));
}
function closestHydrogenIndex(structure, unitA, indexA, unitB, indexB) {
    let hIndex = indexA;
    unitA.conformation.position(unitA.elements[indexA], tmpPosA);
    unitB.conformation.position(unitB.elements[indexB], tmpPosB);
    linear_algebra_1.Vec3.sub(tmpDir1, tmpPosB, tmpPosA);
    let minDistSq = linear_algebra_1.Vec3.squaredDistance(tmpPosA, tmpPosB);
    (0, util_1.eachBondedAtom)(structure, unitA, indexA, (unitX, indexX) => {
        if ((0, util_1.typeSymbol)(unitX, indexX) === "H" /* Elements.H */) {
            unitX.conformation.position(unitX.elements[indexX], tmpPosX);
            const dist = linear_algebra_1.Vec3.squaredDistance(tmpPosX, tmpPosB);
            if (dist < minDistSq) {
                minDistSq = dist;
                hIndex = indexX;
            }
        }
    });
    return hIndex;
}
