/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 */
import { degToRad } from '../../../mol-math/misc';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { eachBondedAtom, typeSymbol } from './util';
/**
 * Numbering mostly inline with coordination number from VSEPR,
 * breaks with `SquarePlanar = 7`
 */
export var AtomGeometry;
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
})(AtomGeometry || (AtomGeometry = {}));
export function geometryLabel(geometry) {
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
export function assignGeometry(totalCoordination) {
    switch (totalCoordination) {
        case 0: return AtomGeometry.Spherical;
        case 1: return AtomGeometry.Terminal;
        case 2: return AtomGeometry.Linear;
        case 3: return AtomGeometry.Trigonal;
        case 4: return AtomGeometry.Tetrahedral;
        default: return AtomGeometry.Unknown;
    }
}
export const AtomGeometryAngles = new Map([
    [AtomGeometry.Linear, degToRad(180)],
    [AtomGeometry.Trigonal, degToRad(120)],
    [AtomGeometry.Tetrahedral, degToRad(109.4721)],
    [AtomGeometry.Octahedral, degToRad(90)]
]);
// tmp objects for `calcAngles` and `calcPlaneAngle`
const tmpDir1 = Vec3();
const tmpDir2 = Vec3();
const tmpPosA = Vec3();
const tmpPosB = Vec3();
const tmpPosX = Vec3();
/**
 * Calculate the angles x-a1-a2 for all x where x is a heavy atom (not H) bonded to ap1.
 */
export function calcAngles(structure, unitA, indexA, unitB, indexB, ignoreHydrogens = true) {
    const angles = [];
    const anglesH = [];
    unitA.conformation.position(unitA.elements[indexA], tmpPosA);
    unitB.conformation.position(unitB.elements[indexB], tmpPosB);
    Vec3.sub(tmpDir1, tmpPosB, tmpPosA);
    eachBondedAtom(structure, unitA, indexA, (unitX, indexX) => {
        if (typeSymbol(unitX, indexX) !== "H" /* Elements.H */) {
            unitX.conformation.position(unitX.elements[indexX], tmpPosX);
            Vec3.sub(tmpDir2, tmpPosX, tmpPosA);
            angles.push(Vec3.angle(tmpDir1, tmpDir2));
        }
        else if (!ignoreHydrogens) {
            unitX.conformation.position(unitX.elements[indexX], tmpPosX);
            Vec3.sub(tmpDir2, tmpPosX, tmpPosA);
            anglesH.push(Vec3.angle(tmpDir1, tmpDir2));
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
export function calcPlaneAngle(structure, unitA, indexA, unitB, indexB) {
    unitA.conformation.position(unitA.elements[indexA], tmpPosA);
    unitB.conformation.position(unitB.elements[indexB], tmpPosB);
    Vec3.sub(tmpDir1, tmpPosB, tmpPosA);
    const neighbours = [Vec3(), Vec3()];
    let ni = 0;
    let unitX1;
    let indexX1;
    eachBondedAtom(structure, unitA, indexA, (unitX, indexX) => {
        if (ni > 1)
            return;
        if (typeSymbol(unitX, indexX) !== "H" /* Elements.H */) {
            unitX1 = unitX;
            indexX1 = indexX;
            unitX.conformation.position(unitX.elements[indexX], tmpPosX);
            Vec3.sub(neighbours[ni++], tmpPosX, tmpPosA);
        }
    });
    if (ni === 1 && unitX1 && indexX1) {
        eachBondedAtom(structure, unitX1, indexX1, (unitX, indexX) => {
            if (ni > 1)
                return;
            if (unitX === unitA && indexX === indexA)
                return;
            if (typeSymbol(unitX, indexX) !== "H" /* Elements.H */) {
                unitX.conformation.position(unitX.elements[indexX], tmpPosX);
                Vec3.sub(neighbours[ni++], tmpPosX, tmpPosA);
            }
        });
    }
    if (ni !== 2) {
        return;
    }
    Vec3.cross(tmpDir2, neighbours[0], neighbours[1]);
    return Math.abs((Math.PI / 2) - Vec3.angle(tmpDir2, tmpDir1));
}
export function closestHydrogenIndex(structure, unitA, indexA, unitB, indexB) {
    let hIndex = indexA;
    unitA.conformation.position(unitA.elements[indexA], tmpPosA);
    unitB.conformation.position(unitB.elements[indexB], tmpPosB);
    Vec3.sub(tmpDir1, tmpPosB, tmpPosA);
    let minDistSq = Vec3.squaredDistance(tmpPosA, tmpPosB);
    eachBondedAtom(structure, unitA, indexA, (unitX, indexX) => {
        if (typeSymbol(unitX, indexX) === "H" /* Elements.H */) {
            unitX.conformation.position(unitX.elements[indexX], tmpPosX);
            const dist = Vec3.squaredDistance(tmpPosX, tmpPosB);
            if (dist < minDistSq) {
                minDistSq = dist;
                hIndex = indexX;
            }
        }
    });
    return hIndex;
}
