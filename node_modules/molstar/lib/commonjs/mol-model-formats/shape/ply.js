"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Schäfer, Marco <marco.schaefer@uni-tuebingen.de>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlyShapeParams = void 0;
exports.shapeFromPly = shapeFromPly;
const mol_task_1 = require("../../mol-task");
const color_1 = require("../../mol-util/color");
const mesh_builder_1 = require("../../mol-geo/geometry/mesh/mesh-builder");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const shape_1 = require("../../mol-model/shape");
const util_1 = require("../../mol-data/util");
const array_1 = require("../../mol-util/array");
const db_1 = require("../../mol-data/db");
const param_definition_1 = require("../../mol-util/param-definition");
const names_1 = require("../../mol-util/color/names");
const object_1 = require("../../mol-util/object");
const string_1 = require("../../mol-util/string");
const value_cell_1 = require("../../mol-util/value-cell");
function createPlyShapeParams(plyFile) {
    const vertex = plyFile && plyFile.getElement('vertex');
    const material = plyFile && plyFile.getElement('material');
    const defaultValues = { group: '', vRed: '', vGreen: '', vBlue: '', mRed: '', mGreen: '', mBlue: '' };
    const groupOptions = [['', '']];
    const colorOptions = [['', '']];
    if (vertex) {
        for (let i = 0, il = vertex.propertyNames.length; i < il; ++i) {
            const name = vertex.propertyNames[i];
            const type = vertex.propertyTypes[i];
            if (type === 'uchar' || type === 'uint8' ||
                type === 'ushort' || type === 'uint16' ||
                type === 'uint' || type === 'uint32' ||
                type === 'int')
                groupOptions.push([name, name]);
            if (type === 'uchar' || type === 'uint8')
                colorOptions.push([name, name]);
        }
        // TODO hardcoded as convenience for data provided by MegaMol
        if (vertex.propertyNames.includes('atomid'))
            defaultValues.group = 'atomid';
        else if (vertex.propertyNames.includes('material_index'))
            defaultValues.group = 'material_index';
        if (vertex.propertyNames.includes('red'))
            defaultValues.vRed = 'red';
        if (vertex.propertyNames.includes('green'))
            defaultValues.vGreen = 'green';
        if (vertex.propertyNames.includes('blue'))
            defaultValues.vBlue = 'blue';
    }
    const materialOptions = [['', '']];
    if (material) {
        for (let i = 0, il = material.propertyNames.length; i < il; ++i) {
            const name = material.propertyNames[i];
            const type = material.propertyTypes[i];
            if (type === 'uchar' || type === 'uint8')
                materialOptions.push([name, name]);
        }
        if (material.propertyNames.includes('red'))
            defaultValues.mRed = 'red';
        if (material.propertyNames.includes('green'))
            defaultValues.mGreen = 'green';
        if (material.propertyNames.includes('blue'))
            defaultValues.mBlue = 'blue';
    }
    const defaultColoring = defaultValues.vRed && defaultValues.vGreen && defaultValues.vBlue ? 'vertex' :
        defaultValues.mRed && defaultValues.mGreen && defaultValues.mBlue ? 'material' : 'uniform';
    return {
        ...mesh_1.Mesh.Params,
        coloring: param_definition_1.ParamDefinition.MappedStatic(defaultColoring, {
            vertex: param_definition_1.ParamDefinition.Group({
                red: param_definition_1.ParamDefinition.Select(defaultValues.vRed, colorOptions, { label: 'Red Property' }),
                green: param_definition_1.ParamDefinition.Select(defaultValues.vGreen, colorOptions, { label: 'Green Property' }),
                blue: param_definition_1.ParamDefinition.Select(defaultValues.vBlue, colorOptions, { label: 'Blue Property' }),
            }, { isFlat: true }),
            material: param_definition_1.ParamDefinition.Group({
                red: param_definition_1.ParamDefinition.Select(defaultValues.mRed, materialOptions, { label: 'Red Property' }),
                green: param_definition_1.ParamDefinition.Select(defaultValues.mGreen, materialOptions, { label: 'Green Property' }),
                blue: param_definition_1.ParamDefinition.Select(defaultValues.mBlue, materialOptions, { label: 'Blue Property' }),
            }, { isFlat: true }),
            uniform: param_definition_1.ParamDefinition.Group({
                color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.grey),
                saturation: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
                lightness: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
            }, { isFlat: true })
        }),
        grouping: param_definition_1.ParamDefinition.MappedStatic(defaultValues.group ? 'vertex' : 'none', {
            vertex: param_definition_1.ParamDefinition.Group({
                group: param_definition_1.ParamDefinition.Select(defaultValues.group, groupOptions, { label: 'Group Property' }),
            }, { isFlat: true }),
            none: param_definition_1.ParamDefinition.Group({})
        }),
    };
}
exports.PlyShapeParams = createPlyShapeParams();
function addVerticesRange(begI, endI, state, vertex, groupIds) {
    const { vertices, normals, groups } = state;
    const x = vertex.getProperty('x');
    const y = vertex.getProperty('y');
    const z = vertex.getProperty('z');
    if (!x || !y || !z)
        throw new Error('missing coordinate properties');
    const nx = vertex.getProperty('nx');
    const ny = vertex.getProperty('ny');
    const nz = vertex.getProperty('nz');
    const hasNormals = !!nx && !!ny && !!nz;
    for (let i = begI; i < endI; ++i) {
        util_1.ChunkedArray.add3(vertices, x.value(i), y.value(i), z.value(i));
        if (hasNormals)
            util_1.ChunkedArray.add3(normals, nx.value(i), ny.value(i), nz.value(i));
        util_1.ChunkedArray.add(groups, groupIds[i]);
    }
}
function addFacesRange(begI, endI, state, face) {
    const { indices } = state;
    for (let i = begI; i < endI; ++i) {
        const { entries, count } = face.value(i);
        if (count === 3) {
            // triangle
            util_1.ChunkedArray.add3(indices, entries[0], entries[1], entries[2]);
        }
        else if (count === 4) {
            // quadrilateral
            util_1.ChunkedArray.add3(indices, entries[2], entries[1], entries[0]);
            util_1.ChunkedArray.add3(indices, entries[2], entries[0], entries[3]);
        }
    }
}
async function getMesh(ctx, vertex, face, groupIds, mesh) {
    const builderState = mesh_builder_1.MeshBuilder.createState(vertex.rowCount, vertex.rowCount / 4, mesh);
    const x = vertex.getProperty('x');
    const y = vertex.getProperty('y');
    const z = vertex.getProperty('z');
    if (!x || !y || !z)
        throw new Error('missing coordinate properties');
    const nx = vertex.getProperty('nx');
    const ny = vertex.getProperty('ny');
    const nz = vertex.getProperty('nz');
    const hasNormals = !!nx && !!ny && !!nz;
    const updateChunk = 100000;
    for (let i = 0, il = vertex.rowCount; i < il; i += updateChunk) {
        addVerticesRange(i, Math.min(i + updateChunk, il), builderState, vertex, groupIds);
        if (ctx.shouldUpdate) {
            await ctx.update({ message: 'adding ply mesh vertices', current: i, max: il });
        }
    }
    for (let i = 0, il = face.rowCount; i < il; i += updateChunk) {
        addFacesRange(i, Math.min(i + updateChunk, il), builderState, face);
        if (ctx.shouldUpdate) {
            await ctx.update({ message: 'adding ply mesh faces', current: i, max: il });
        }
    }
    const m = mesh_builder_1.MeshBuilder.getMesh(builderState);
    if (!hasNormals)
        mesh_1.Mesh.computeNormals(m);
    // TODO: check if needed
    value_cell_1.ValueCell.updateIfChanged(m.varyingGroup, true);
    return m;
}
const int = db_1.Column.Schema.int;
function getGrouping(vertex, props) {
    const { grouping } = props;
    const { rowCount } = vertex;
    const column = grouping.name === 'vertex' ? vertex.getProperty(grouping.params.group) : undefined;
    const label = grouping.name === 'vertex' ? (0, string_1.stringToWords)(grouping.params.group) : 'Vertex';
    const ids = column ? column.toArray({ array: Uint32Array }) : (0, array_1.fillSerial)(new Uint32Array(rowCount));
    const maxId = column ? (0, array_1.arrayMax)(ids) : rowCount - 1; // assumes uint ids
    const map = new Uint32Array(maxId + 1);
    for (let i = 0, il = ids.length; i < il; ++i)
        map[ids[i]] = i;
    return { ids, map, label };
}
function getColoring(vertex, material, props) {
    const { coloring } = props;
    const { rowCount } = vertex;
    let red, green, blue;
    if (coloring.name === 'vertex') {
        red = vertex.getProperty(coloring.params.red) || db_1.Column.ofConst(127, rowCount, int);
        green = vertex.getProperty(coloring.params.green) || db_1.Column.ofConst(127, rowCount, int);
        blue = vertex.getProperty(coloring.params.blue) || db_1.Column.ofConst(127, rowCount, int);
    }
    else if (coloring.name === 'material') {
        red = (material && material.getProperty(coloring.params.red)) || db_1.Column.ofConst(127, rowCount, int);
        green = (material && material.getProperty(coloring.params.green)) || db_1.Column.ofConst(127, rowCount, int);
        blue = (material && material.getProperty(coloring.params.blue)) || db_1.Column.ofConst(127, rowCount, int);
    }
    else {
        let color = coloring.params.color;
        color = color_1.Color.saturate(color, coloring.params.saturation);
        color = color_1.Color.lighten(color, coloring.params.lightness);
        const [r, g, b] = color_1.Color.toRgb(color);
        red = db_1.Column.ofConst(r, rowCount, int);
        green = db_1.Column.ofConst(g, rowCount, int);
        blue = db_1.Column.ofConst(b, rowCount, int);
    }
    return { kind: coloring.name, red, green, blue };
}
function createShape(plyData, mesh, coloring, grouping) {
    const { kind, red, green, blue } = coloring;
    const { ids, map, label } = grouping;
    const { source, transforms } = plyData;
    return shape_1.Shape.create('ply-mesh', source, mesh, (groupId) => {
        const idx = kind === 'material' ? groupId : map[groupId];
        return color_1.Color.fromRgb(red.value(idx), green.value(idx), blue.value(idx));
    }, () => 1, // size: constant
    (groupId) => {
        return `${label} ${ids[groupId]}`;
    }, transforms);
}
function makeShapeGetter() {
    let _plyData;
    let _props;
    let _shape;
    let _mesh;
    let _coloring;
    let _grouping;
    const getShape = async (ctx, plyData, props, shape) => {
        const vertex = plyData.source.getElement('vertex');
        if (!vertex)
            throw new Error('missing vertex element');
        const face = plyData.source.getElement('face');
        if (!face)
            throw new Error('missing face element');
        const material = plyData.source.getElement('material');
        let newMesh = false;
        let newColor = false;
        if (!_plyData || _plyData !== _plyData) {
            newMesh = true;
        }
        if (!_props || !param_definition_1.ParamDefinition.isParamEqual(exports.PlyShapeParams.grouping, _props.grouping, props.grouping)) {
            newMesh = true;
        }
        if (!_props || !param_definition_1.ParamDefinition.isParamEqual(exports.PlyShapeParams.coloring, _props.coloring, props.coloring)) {
            newColor = true;
        }
        if (newMesh) {
            _coloring = getColoring(vertex, material, props);
            _grouping = getGrouping(vertex, props);
            _mesh = await getMesh(ctx, vertex, face, _grouping.ids, shape && shape.geometry);
            _shape = createShape(plyData, _mesh, _coloring, _grouping);
        }
        else if (newColor) {
            _coloring = getColoring(vertex, material, props);
            _shape = createShape(plyData, _mesh, _coloring, _grouping);
        }
        _plyData = plyData;
        _props = (0, object_1.deepClone)(props);
        return _shape;
    };
    return getShape;
}
function shapeFromPly(source, params) {
    return mol_task_1.Task.create('Shape Provider', async (ctx) => {
        return {
            label: 'Mesh',
            data: { source, transforms: params === null || params === void 0 ? void 0 : params.transforms },
            params: createPlyShapeParams(source),
            getShape: makeShapeGetter(),
            geometryUtils: mesh_1.Mesh.Utils
        };
    });
}
