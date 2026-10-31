"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextMaterialId = void 0;
exports.createRenderObject = createRenderObject;
exports.createRenderable = createRenderable;
const id_factory_1 = require("../mol-util/id-factory");
const direct_volume_1 = require("./renderable/direct-volume");
const mesh_1 = require("./renderable/mesh");
const points_1 = require("./renderable/points");
const lines_1 = require("./renderable/lines");
const spheres_1 = require("./renderable/spheres");
const text_1 = require("./renderable/text");
const texture_mesh_1 = require("./renderable/texture-mesh");
const image_1 = require("./renderable/image");
const cylinders_1 = require("./renderable/cylinders");
const getNextId = (0, id_factory_1.idFactory)(0, 0x7FFFFFFF);
exports.getNextMaterialId = (0, id_factory_1.idFactory)(0, 0x7FFFFFFF);
//
function createRenderObject(type, values, state, materialId) {
    return { id: getNextId(), type, values, state, materialId };
}
function createRenderable(ctx, o, transparency) {
    switch (o.type) {
        case 'mesh': return (0, mesh_1.MeshRenderable)(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'points': return (0, points_1.PointsRenderable)(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'spheres': return (0, spheres_1.SpheresRenderable)(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'cylinders': return (0, cylinders_1.CylindersRenderable)(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'text': return (0, text_1.TextRenderable)(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'lines': return (0, lines_1.LinesRenderable)(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'direct-volume': return (0, direct_volume_1.DirectVolumeRenderable)(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'image': return (0, image_1.ImageRenderable)(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'texture-mesh': return (0, texture_mesh_1.TextureMeshRenderable)(ctx, o.id, o.values, o.state, o.materialId, transparency);
    }
    throw new Error('unsupported type');
}
