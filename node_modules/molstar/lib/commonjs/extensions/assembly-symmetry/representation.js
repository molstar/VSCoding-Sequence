"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssemblySymmetryParams = void 0;
exports.AssemblySymmetryRepresentation = AssemblySymmetryRepresentation;
const param_definition_1 = require("../../mol-util/param-definition");
const prop_1 = require("./prop");
const mesh_builder_1 = require("../../mol-geo/geometry/mesh/mesh-builder");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const cylinder_1 = require("../../mol-geo/geometry/mesh/builder/cylinder");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const shape_1 = require("../../mol-model/shape");
const names_1 = require("../../mol-util/color/names");
const representation_1 = require("../../mol-repr/shape/representation");
const marker_action_1 = require("../../mol-util/marker-action");
const prism_1 = require("../../mol-geo/primitive/prism");
const wedge_1 = require("../../mol-geo/primitive/wedge");
const primitive_1 = require("../../mol-geo/primitive/primitive");
const memoize_1 = require("../../mol-util/memoize");
const polygon_1 = require("../../mol-geo/primitive/polygon");
const color_1 = require("../../mol-util/color");
const legend_1 = require("../../mol-util/legend");
const representation_2 = require("../../mol-repr/representation");
const cage_1 = require("../../mol-geo/primitive/cage");
const octahedron_1 = require("../../mol-geo/primitive/octahedron");
const tetrahedron_1 = require("../../mol-geo/primitive/tetrahedron");
const icosahedron_1 = require("../../mol-geo/primitive/icosahedron");
const misc_1 = require("../../mol-math/misc");
const common_1 = require("../../mol-math/linear-algebra/3d/common");
const number_1 = require("../../mol-util/number");
const geometry_1 = require("../../mol-math/geometry");
const OrderColors = (0, color_1.ColorMap)({
    '2': names_1.ColorNames.deepskyblue,
    '3': names_1.ColorNames.lime,
    'N': names_1.ColorNames.red,
});
const OrderColorsLegend = (0, legend_1.TableLegend)(Object.keys(OrderColors).map(name => {
    return [name, OrderColors[name]];
}));
function axesColorHelp(value) {
    return value.name === 'byOrder'
        ? { description: 'Color axes by their order', legend: OrderColorsLegend }
        : {};
}
const SharedParams = {
    ...mesh_1.Mesh.Params,
    scale: param_definition_1.ParamDefinition.Numeric(2, { min: 0.1, max: 5, step: 0.1 }),
};
const AxesParams = {
    ...SharedParams,
    axesColor: param_definition_1.ParamDefinition.MappedStatic('byOrder', {
        byOrder: param_definition_1.ParamDefinition.EmptyGroup(),
        uniform: param_definition_1.ParamDefinition.Group({
            colorValue: param_definition_1.ParamDefinition.Color(names_1.ColorNames.orange),
        }, { isFlat: true })
    }, { help: axesColorHelp }),
};
const CageParams = {
    ...SharedParams,
    cageColor: param_definition_1.ParamDefinition.Color(names_1.ColorNames.orange),
};
const AssemblySymmetryVisuals = {
    // cage should come before 'axes' so that the representative loci uses the cage shape
    'cage': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getCageShape, mesh_1.Mesh.Utils, { modifyState: s => ({ ...s, markerActions: marker_action_1.MarkerActions.Highlighting }) }),
    'axes': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getAxesShape, mesh_1.Mesh.Utils, { modifyState: s => ({ ...s, markerActions: marker_action_1.MarkerActions.Highlighting }) }),
};
exports.AssemblySymmetryParams = {
    ...AxesParams,
    ...CageParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['axes', 'cage'], param_definition_1.ParamDefinition.objectToOptions(AssemblySymmetryVisuals)),
};
//
function getAssemblyName(s) {
    var _a;
    const id = ((_a = s.units[0].conformation.operator.assembly) === null || _a === void 0 ? void 0 : _a.id) || '';
    return (0, number_1.isInteger)(id) ? `Assembly ${id}` : id;
}
const t = linear_algebra_1.Mat4.identity();
const tmpV = (0, linear_algebra_1.Vec3)();
const tmpCenter = (0, linear_algebra_1.Vec3)();
const tmpScale = (0, linear_algebra_1.Vec3)();
const getOrderPrimitive = (0, memoize_1.memoize1)((order) => {
    if (order < 2) {
        return (0, prism_1.Prism)((0, polygon_1.polygon)(48, false));
    }
    else if (order === 2) {
        const lens = (0, prism_1.Prism)((0, polygon_1.polygon)(48, false));
        const m = linear_algebra_1.Mat4.identity();
        linear_algebra_1.Mat4.scale(m, m, linear_algebra_1.Vec3.create(1, 0.35, 1));
        (0, primitive_1.transformPrimitive)(lens, m);
        return lens;
    }
    else if (order === 3) {
        return (0, wedge_1.Wedge)();
    }
    else {
        return (0, prism_1.Prism)((0, polygon_1.polygon)(order, false));
    }
});
function getAxesMesh(data, props, mesh) {
    const { scale } = props;
    const { rotation_axes } = data;
    if (!prop_1.AssemblySymmetryData.isRotationAxes(rotation_axes))
        return mesh_1.Mesh.createEmpty(mesh);
    const { start, end } = rotation_axes[0];
    const radius = (linear_algebra_1.Vec3.distance(start, end) / 500) * scale;
    linear_algebra_1.Vec3.set(tmpScale, radius * 7, radius * 7, radius * 0.4);
    const cylinderProps = { radiusTop: radius, radiusBottom: radius };
    const builderState = mesh_builder_1.MeshBuilder.createState(256, 128, mesh);
    builderState.currentGroup = 0;
    linear_algebra_1.Vec3.scale(tmpCenter, linear_algebra_1.Vec3.add(tmpCenter, start, end), 0.5);
    for (let i = 0, il = rotation_axes.length; i < il; ++i) {
        const { order, start, end } = rotation_axes[i];
        builderState.currentGroup = i;
        (0, cylinder_1.addCylinder)(builderState, start, end, 1, cylinderProps);
        const primitive = getOrderPrimitive(order);
        if (primitive) {
            linear_algebra_1.Vec3.scale(tmpCenter, linear_algebra_1.Vec3.add(tmpCenter, start, end), 0.5);
            if (linear_algebra_1.Vec3.dot(linear_algebra_1.Vec3.unitY, linear_algebra_1.Vec3.sub(tmpV, start, tmpCenter)) === 0) {
                linear_algebra_1.Mat4.targetTo(t, start, tmpCenter, linear_algebra_1.Vec3.unitY);
            }
            else {
                linear_algebra_1.Mat4.targetTo(t, start, tmpCenter, linear_algebra_1.Vec3.unitX);
            }
            linear_algebra_1.Mat4.scale(t, t, tmpScale);
            linear_algebra_1.Mat4.setTranslation(t, start);
            mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, primitive);
            linear_algebra_1.Mat4.setTranslation(t, end);
            mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, primitive);
        }
    }
    return mesh_builder_1.MeshBuilder.getMesh(builderState);
}
function getAxesShape(ctx, data, props, shape) {
    const assemblySymmetry = prop_1.AssemblySymmetryProvider.get(data).value;
    const geo = getAxesMesh(assemblySymmetry, props, shape && shape.geometry);
    const getColor = (groupId) => {
        var _a;
        if (props.axesColor.name === 'byOrder') {
            const { rotation_axes } = assemblySymmetry;
            const order = (_a = rotation_axes[groupId]) === null || _a === void 0 ? void 0 : _a.order;
            if (order === 2)
                return OrderColors[2];
            else if (order === 3)
                return OrderColors[3];
            else
                return OrderColors.N;
        }
        else {
            return props.axesColor.params.colorValue;
        }
    };
    const getLabel = (groupId) => {
        var _a;
        const { type, symbol, kind, rotation_axes } = assemblySymmetry;
        const order = (_a = rotation_axes[groupId]) === null || _a === void 0 ? void 0 : _a.order;
        return [
            `<small>${data.model.entryId}</small>`,
            `<small>${getAssemblyName(data)}</small>`,
            `Axis ${groupId + 1} with Order ${order} of ${type} ${kind} (${symbol})`
        ].join(' | ');
    };
    return shape_1.Shape.create('Axes', data, geo, getColor, () => 1, getLabel);
}
//
const getSymbolCage = (0, memoize_1.memoize1)((symbol) => {
    if (symbol.startsWith('D') || symbol.startsWith('C')) {
        // z axis is prism axis, x/y axes cut through edge midpoints
        const fold = parseInt(symbol.substr(1));
        let cage;
        if (fold === 2) {
            cage = (0, prism_1.PrismCage)((0, polygon_1.polygon)(4, false));
        }
        else if (fold === 3) {
            cage = (0, wedge_1.WedgeCage)();
        }
        else if (fold > 3) {
            cage = (0, prism_1.PrismCage)((0, polygon_1.polygon)(fold, false));
        }
        else {
            return;
        }
        if (fold % 2 === 0) {
            return cage;
        }
        else {
            const m = linear_algebra_1.Mat4.identity();
            linear_algebra_1.Mat4.rotate(m, m, 1 / fold * Math.PI / 2, linear_algebra_1.Vec3.unitZ);
            return (0, cage_1.transformCage)((0, cage_1.cloneCage)(cage), m);
        }
    }
    else if (symbol === 'O') {
        // x/y/z axes cut through order 4 vertices
        return (0, octahedron_1.OctahedronCage)();
    }
    else if (symbol === 'I') {
        // z axis cut through order 5 vertex
        // x axis cut through edge midpoint
        const cage = (0, icosahedron_1.IcosahedronCage)();
        const m = linear_algebra_1.Mat4.identity();
        linear_algebra_1.Mat4.rotate(m, m, (0, misc_1.degToRad)(31.7), linear_algebra_1.Vec3.unitX);
        return (0, cage_1.transformCage)((0, cage_1.cloneCage)(cage), m);
    }
    else if (symbol === 'T') {
        // x/y/z axes cut through edge midpoints
        return (0, tetrahedron_1.TetrahedronCage)();
    }
});
function getSymbolScale(symbol) {
    if (symbol.startsWith('D') || symbol.startsWith('C')) {
        return 0.75;
    }
    else if (symbol === 'O') {
        return 1.2;
    }
    else if (symbol === 'I') {
        return 0.25;
    }
    else if (symbol === 'T') {
        return 0.8;
    }
    return 1;
}
function setSymbolTransform(t, symbol, axes, size, structure) {
    const eye = (0, linear_algebra_1.Vec3)();
    const target = (0, linear_algebra_1.Vec3)();
    const dir = (0, linear_algebra_1.Vec3)();
    const up = (0, linear_algebra_1.Vec3)();
    let pair = undefined;
    if (symbol.startsWith('C')) {
        pair = [axes[0]];
    }
    else if (symbol.startsWith('D')) {
        const fold = parseInt(symbol.substr(1));
        if (fold === 2) {
            pair = axes.filter(a => a.order === 2);
        }
        else if (fold >= 3) {
            const aN = axes.filter(a => a.order === fold)[0];
            const a2 = axes.filter(a => a.order === 2)[1];
            pair = [aN, a2];
        }
    }
    else if (symbol === 'O') {
        pair = axes.filter(a => a.order === 4);
    }
    else if (symbol === 'I') {
        const a5 = axes.filter(a => a.order === 5)[0];
        const a5dir = linear_algebra_1.Vec3.sub((0, linear_algebra_1.Vec3)(), a5.end, a5.start);
        pair = [a5];
        for (const a of axes.filter(a => a.order === 3)) {
            const d = (0, misc_1.radToDeg)(linear_algebra_1.Vec3.angle(linear_algebra_1.Vec3.sub(up, a.end, a.start), a5dir));
            if (!pair[1] && ((0, common_1.equalEps)(d, 100.81, 0.1) || (0, common_1.equalEps)(d, 79.19, 0.1))) {
                pair[1] = a;
                break;
            }
        }
    }
    else if (symbol === 'T') {
        pair = axes.filter(a => a.order === 2);
    }
    linear_algebra_1.Mat4.setIdentity(t);
    if (pair) {
        const [aA, aB] = pair;
        linear_algebra_1.Vec3.scale(eye, linear_algebra_1.Vec3.add(eye, aA.end, aA.start), 0.5);
        linear_algebra_1.Vec3.copy(target, aA.end);
        if (aB) {
            linear_algebra_1.Vec3.sub(up, aB.end, aB.start);
            linear_algebra_1.Vec3.sub(dir, eye, target);
            if (linear_algebra_1.Vec3.dot(dir, up) < 0)
                linear_algebra_1.Vec3.negate(up, up);
            linear_algebra_1.Mat4.targetTo(t, eye, target, up);
            if (symbol.startsWith('D')) {
                const { sphere } = structure.lookup3d.boundary;
                let sizeXY = (sphere.radius * 2) * 0.8; // fallback for missing extrema
                if (geometry_1.Sphere3D.hasExtrema(sphere)) {
                    const n = linear_algebra_1.Mat3.directionTransform((0, linear_algebra_1.Mat3)(), t);
                    const dirs = unitCircleDirections.map(d => linear_algebra_1.Vec3.transformMat3((0, linear_algebra_1.Vec3)(), d, n));
                    sizeXY = getMaxProjectedDistance(sphere.extrema, dirs, sphere.center) * 1.6;
                }
                linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.create(sizeXY, sizeXY, linear_algebra_1.Vec3.distance(aA.start, aA.end) * 0.9));
            }
            else {
                linear_algebra_1.Mat4.scaleUniformly(t, t, size * getSymbolScale(symbol));
            }
        }
        else {
            if (linear_algebra_1.Vec3.dot(linear_algebra_1.Vec3.unitY, linear_algebra_1.Vec3.sub(tmpV, aA.end, aA.start)) === 0) {
                linear_algebra_1.Vec3.copy(up, linear_algebra_1.Vec3.unitY);
            }
            else {
                linear_algebra_1.Vec3.copy(up, linear_algebra_1.Vec3.unitX);
            }
            linear_algebra_1.Mat4.targetTo(t, eye, target, up);
            const { sphere } = structure.lookup3d.boundary;
            let sizeXY = (sphere.radius * 2) * 0.8; // fallback for missing extrema
            if (geometry_1.Sphere3D.hasExtrema(sphere)) {
                const n = linear_algebra_1.Mat3.directionTransform((0, linear_algebra_1.Mat3)(), t);
                const dirs = unitCircleDirections.map(d => linear_algebra_1.Vec3.transformMat3((0, linear_algebra_1.Vec3)(), d, n));
                sizeXY = getMaxProjectedDistance(sphere.extrema, dirs, sphere.center);
            }
            linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.create(sizeXY, sizeXY, size * 0.9));
        }
    }
}
const unitCircleDirections = (function () {
    const dirs = [];
    const circle = (0, polygon_1.polygon)(12, false, 1);
    for (let i = 0, il = circle.length; i < il; i += 3) {
        dirs.push(linear_algebra_1.Vec3.fromArray((0, linear_algebra_1.Vec3)(), circle, i));
    }
    return dirs;
})();
const tmpProj = (0, linear_algebra_1.Vec3)();
function getMaxProjectedDistance(points, directions, center) {
    let maxDist = 0;
    for (const p of points) {
        for (const d of directions) {
            linear_algebra_1.Vec3.projectPointOnVector(tmpProj, p, d, center);
            const dist = linear_algebra_1.Vec3.distance(tmpProj, center);
            if (dist > maxDist)
                maxDist = dist;
        }
    }
    return maxDist;
}
function getCageMesh(data, props, mesh) {
    const assemblySymmetry = prop_1.AssemblySymmetryProvider.get(data).value;
    const { scale } = props;
    const { rotation_axes, symbol } = assemblySymmetry;
    if (!prop_1.AssemblySymmetryData.isRotationAxes(rotation_axes))
        return mesh_1.Mesh.createEmpty(mesh);
    const structure = prop_1.AssemblySymmetryData.getStructure(data, assemblySymmetry);
    const cage = getSymbolCage(symbol);
    if (!cage)
        return mesh_1.Mesh.createEmpty(mesh);
    const { start, end } = rotation_axes[0];
    const size = linear_algebra_1.Vec3.distance(start, end);
    const radius = (size / 500) * scale;
    const builderState = mesh_builder_1.MeshBuilder.createState(256, 128, mesh);
    builderState.currentGroup = 0;
    setSymbolTransform(t, symbol, rotation_axes, size, structure);
    linear_algebra_1.Vec3.scale(tmpCenter, linear_algebra_1.Vec3.add(tmpCenter, start, end), 0.5);
    linear_algebra_1.Mat4.setTranslation(t, tmpCenter);
    mesh_builder_1.MeshBuilder.addCage(builderState, t, cage, radius, 1, 8);
    return mesh_builder_1.MeshBuilder.getMesh(builderState);
}
function getCageShape(ctx, data, props, shape) {
    const assemblySymmetry = prop_1.AssemblySymmetryProvider.get(data).value;
    const geo = getCageMesh(data, props, shape && shape.geometry);
    const getColor = (groupId) => {
        return props.cageColor;
    };
    const getLabel = (groupId) => {
        const { type, symbol, kind } = assemblySymmetry;
        data.model.entryId;
        return [
            `<small>${data.model.entryId}</small>`,
            `<small>${getAssemblyName(data)}</small>`,
            `Cage of ${type} ${kind} (${symbol})`
        ].join(' | ');
    };
    return shape_1.Shape.create('Cage', data, geo, getColor, () => 1, getLabel);
}
function AssemblySymmetryRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Assembly Symmetry', ctx, getParams, representation_2.Representation.StateBuilder, AssemblySymmetryVisuals);
}
