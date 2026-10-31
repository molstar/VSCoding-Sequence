"use strict";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureRepresentationRegistry = void 0;
const object_1 = require("../../mol-util/object");
const representation_1 = require("../representation");
const ball_and_stick_1 = require("./representation/ball-and-stick");
const carbohydrate_1 = require("./representation/carbohydrate");
const cartoon_1 = require("./representation/cartoon");
const ellipsoid_1 = require("./representation/ellipsoid");
const gaussian_surface_1 = require("./representation/gaussian-surface");
const label_1 = require("./representation/label");
const molecular_surface_1 = require("./representation/molecular-surface");
const orientation_1 = require("./representation/orientation");
const point_1 = require("./representation/point");
const putty_1 = require("./representation/putty");
const spacefill_1 = require("./representation/spacefill");
const line_1 = require("./representation/line");
const gaussian_volume_1 = require("./representation/gaussian-volume");
const backbone_1 = require("./representation/backbone");
class StructureRepresentationRegistry extends representation_1.RepresentationRegistry {
    constructor() {
        super();
        (0, object_1.objectForEach)(StructureRepresentationRegistry.BuiltIn, (p, k) => {
            if (p.name !== k)
                throw new Error(`Fix BuiltInStructureRepresentations to have matching names. ${p.name} ${k}`);
            this.add(p);
        });
    }
}
exports.StructureRepresentationRegistry = StructureRepresentationRegistry;
(function (StructureRepresentationRegistry) {
    StructureRepresentationRegistry.BuiltIn = {
        'cartoon': cartoon_1.CartoonRepresentationProvider,
        'backbone': backbone_1.BackboneRepresentationProvider,
        'ball-and-stick': ball_and_stick_1.BallAndStickRepresentationProvider,
        'carbohydrate': carbohydrate_1.CarbohydrateRepresentationProvider,
        'ellipsoid': ellipsoid_1.EllipsoidRepresentationProvider,
        'gaussian-surface': gaussian_surface_1.GaussianSurfaceRepresentationProvider,
        'gaussian-volume': gaussian_volume_1.GaussianVolumeRepresentationProvider,
        'label': label_1.LabelRepresentationProvider,
        'line': line_1.LineRepresentationProvider,
        'molecular-surface': molecular_surface_1.MolecularSurfaceRepresentationProvider,
        'orientation': orientation_1.OrientationRepresentationProvider,
        'point': point_1.PointRepresentationProvider,
        'putty': putty_1.PuttyRepresentationProvider,
        'spacefill': spacefill_1.SpacefillRepresentationProvider,
    };
})(StructureRepresentationRegistry || (exports.StructureRepresentationRegistry = StructureRepresentationRegistry = {}));
