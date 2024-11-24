"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMarchingCubesMesh = computeMarchingCubesMesh;
exports.computeMarchingCubesLines = computeMarchingCubesLines;
const mol_task_1 = require("../../../mol-task");
const tables_1 = require("./tables");
const mol_util_1 = require("../../../mol-util");
const builder_1 = require("./builder");
function getInputParams(params) {
    return {
        ...params,
        bottomLeft: (0, mol_util_1.defaults)(params.bottomLeft, [0, 0, 0]),
        topRight: (0, mol_util_1.defaults)(params.topRight, params.scalarField.space.dimensions)
    };
}
function getExtent(inputParams) {
    return {
        dX: inputParams.topRight[0] - inputParams.bottomLeft[0],
        dY: inputParams.topRight[1] - inputParams.bottomLeft[1],
        dZ: inputParams.topRight[2] - inputParams.bottomLeft[2]
    };
}
function computeMarchingCubesMesh(params, mesh) {
    return mol_task_1.Task.create('Marching Cubes Mesh', async (ctx) => {
        const inputParams = getInputParams(params);
        const { dX, dY, dZ } = getExtent(inputParams);
        // TODO should it be configurable? Scalar fields can produce meshes with vastly different densities.
        const vertexChunkSize = Math.min(262144, Math.max(dX * dY * dZ / 32, 1024));
        const builder = (0, builder_1.MarchinCubesMeshBuilder)(vertexChunkSize, mesh);
        await (new MarchingCubesComputation(ctx, builder, inputParams)).run();
        return builder.get();
    });
}
function computeMarchingCubesLines(params, lines) {
    return mol_task_1.Task.create('Marching Cubes Lines', async (ctx) => {
        const inputParams = getInputParams(params);
        const { dX, dY, dZ } = getExtent(inputParams);
        // TODO should it be configurable? Scalar fields can produce meshes with vastly different densities.
        const vertexChunkSize = Math.min(262144, Math.max(dX * dY * dZ / 32, 1024));
        const builder = (0, builder_1.MarchinCubesLinesBuilder)(vertexChunkSize, lines);
        await (new MarchingCubesComputation(ctx, builder, inputParams)).run();
        return builder.get();
    });
}
class MarchingCubesComputation {
    async doSlices() {
        let done = 0;
        this.edgeFilter = 15;
        for (let k = this.minZ; k < this.maxZ; k++, this.edgeFilter &= ~4) {
            this.slice(k);
            done += this.sliceSize;
            if (this.ctx.shouldUpdate) {
                await this.ctx.update({ message: 'Computing surface...', current: done, max: this.size });
            }
        }
    }
    slice(k) {
        this.edgeFilter |= 2;
        for (let j = this.minY; j < this.maxY; j++, this.edgeFilter &= ~2) {
            this.edgeFilter |= 1;
            for (let i = this.minX; i < this.maxX; i++, this.edgeFilter &= ~1) {
                this.state.processCell(i, j, k, this.edgeFilter);
            }
        }
        this.state.clearEdgeVertexIndexSlice(k);
    }
    async run() {
        await this.doSlices();
    }
    constructor(ctx, builder, params) {
        this.ctx = ctx;
        this.minX = 0;
        this.minY = 0;
        this.minZ = 0;
        this.maxX = 0;
        this.maxY = 0;
        this.maxZ = 0;
        this.state = new MarchingCubesState(builder, params);
        this.minX = params.bottomLeft[0];
        this.minY = params.bottomLeft[1];
        this.minZ = params.bottomLeft[2];
        this.maxX = params.topRight[0] - 1;
        this.maxY = params.topRight[1] - 1;
        this.maxZ = params.topRight[2] - 1;
        this.size = (this.maxX - this.minX) * (this.maxY - this.minY) * (this.maxZ - this.minZ);
        this.sliceSize = (this.maxX - this.minX) * (this.maxY - this.minY);
    }
}
class MarchingCubesState {
    get3dOffsetFromEdgeInfo(index) {
        return (this.nX * (((this.k + index.k) % 2) * this.nY + this.j + index.j) + this.i + index.i);
    }
    /**
     * This clears the "vertex index buffer" for the slice that will not be accessed anymore.
     */
    clearEdgeVertexIndexSlice(k) {
        // clear either the top or bottom half of the buffer...
        const start = k % 2 === 0 ? 0 : 3 * this.nX * this.nY;
        const end = k % 2 === 0 ? 3 * this.nX * this.nY : this.verticesOnEdges.length;
        this.verticesOnEdges.fill(0, start, end);
    }
    interpolate(edgeNum) {
        const info = tables_1.EdgeIdInfo[edgeNum];
        const edgeId = 3 * this.get3dOffsetFromEdgeInfo(info) + info.e;
        const ret = this.verticesOnEdges[edgeId];
        if (ret > 0)
            return ret - 1;
        const sf = this.scalarField;
        const sfg = this.scalarFieldGet;
        const edge = tables_1.CubeEdges[edgeNum];
        const a = edge.a, b = edge.b;
        const li = a.i + this.i, lj = a.j + this.j, lk = a.k + this.k;
        const hi = b.i + this.i, hj = b.j + this.j, hk = b.k + this.k;
        const v0 = sfg(sf, li, lj, lk);
        const v1 = sfg(sf, hi, hj, hk);
        const t = (this.isoLevel - v0) / (v0 - v1);
        if (this.idField) {
            const u = this.idFieldGet(this.idField, li, lj, lk);
            const v = this.idFieldGet(this.idField, hi, hj, hk);
            let a = t < 0.5 ? u : v;
            // -1 means 'no id', check if the other cell has an id
            if (a === -1)
                a = t < 0.5 ? v : u;
            // -2 means 'ignore this cell'
            if (a === -2)
                return -1;
            this.builder.addGroup(a);
        }
        else {
            this.builder.addGroup(0);
        }
        const id = this.builder.addVertex(li + t * (li - hi), lj + t * (lj - hj), lk + t * (lk - hk));
        this.verticesOnEdges[edgeId] = id + 1;
        // TODO cache scalarField differences for slices
        // TODO make calculation optional
        const n0x = sfg(sf, Math.max(0, li - 1), lj, lk) - sfg(sf, Math.min(this.nX - 1, li + 1), lj, lk);
        const n0y = sfg(sf, li, Math.max(0, lj - 1), lk) - sfg(sf, li, Math.min(this.nY - 1, lj + 1), lk);
        const n0z = sfg(sf, li, lj, Math.max(0, lk - 1)) - sfg(sf, li, lj, Math.min(this.nZ, lk + 1));
        const n1x = sfg(sf, Math.max(0, hi - 1), hj, hk) - sfg(sf, Math.min(this.nX - 1, hi + 1), hj, hk);
        const n1y = sfg(sf, hi, Math.max(0, hj - 1), hk) - sfg(sf, hi, Math.min(this.nY - 1, hj + 1), hk);
        const n1z = sfg(sf, hi, hj, Math.max(0, hk - 1)) - sfg(sf, hi, hj, Math.min(this.nZ - 1, hk + 1));
        const nx = n0x + t * (n0x - n1x);
        const ny = n0y + t * (n0y - n1y);
        const nz = n0z + t * (n0z - n1z);
        // ensure normal-direction is the same for negative and positive iso-levels
        if (this.isoLevel >= 0) {
            this.builder.addNormal(nx, ny, nz);
        }
        else {
            this.builder.addNormal(-nx, -ny, -nz);
        }
        return id;
    }
    constructor(builder, params) {
        this.builder = builder;
        this.vertList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.i = 0;
        this.j = 0;
        this.k = 0;
        const dims = params.scalarField.space.dimensions;
        this.nX = dims[0];
        this.nY = dims[1];
        this.nZ = dims[2];
        this.isoLevel = params.isoLevel;
        this.scalarFieldGet = params.scalarField.space.get;
        this.scalarField = params.scalarField.data;
        if (params.idField) {
            this.idField = params.idField.data;
            this.idFieldGet = params.idField.space.get;
        }
        // two layers of vertex indices. Each vertex has 3 edges associated.
        this.verticesOnEdges = new Int32Array(3 * this.nX * this.nY * 2);
    }
    get(i, j, k) {
        return this.scalarFieldGet(this.scalarField, i, j, k);
    }
    processCell(i, j, k, edgeFilter) {
        let tableIndex = 0;
        if (this.get(i, j, k) < this.isoLevel)
            tableIndex |= 1;
        if (this.get(i + 1, j, k) < this.isoLevel)
            tableIndex |= 2;
        if (this.get(i + 1, j + 1, k) < this.isoLevel)
            tableIndex |= 4;
        if (this.get(i, j + 1, k) < this.isoLevel)
            tableIndex |= 8;
        if (this.get(i, j, k + 1) < this.isoLevel)
            tableIndex |= 16;
        if (this.get(i + 1, j, k + 1) < this.isoLevel)
            tableIndex |= 32;
        if (this.get(i + 1, j + 1, k + 1) < this.isoLevel)
            tableIndex |= 64;
        if (this.get(i, j + 1, k + 1) < this.isoLevel)
            tableIndex |= 128;
        if (tableIndex === 0 || tableIndex === 255)
            return;
        this.i = i;
        this.j = j;
        this.k = k;
        const edgeInfo = tables_1.EdgeTable[tableIndex];
        if ((edgeInfo & 1) > 0)
            this.vertList[0] = this.interpolate(0); // 0 1
        if ((edgeInfo & 2) > 0)
            this.vertList[1] = this.interpolate(1); // 1 2
        if ((edgeInfo & 4) > 0)
            this.vertList[2] = this.interpolate(2); // 2 3
        if ((edgeInfo & 8) > 0)
            this.vertList[3] = this.interpolate(3); // 0 3
        if ((edgeInfo & 16) > 0)
            this.vertList[4] = this.interpolate(4); // 4 5
        if ((edgeInfo & 32) > 0)
            this.vertList[5] = this.interpolate(5); // 5 6
        if ((edgeInfo & 64) > 0)
            this.vertList[6] = this.interpolate(6); // 6 7
        if ((edgeInfo & 128) > 0)
            this.vertList[7] = this.interpolate(7); // 4 7
        if ((edgeInfo & 256) > 0)
            this.vertList[8] = this.interpolate(8); // 0 4
        if ((edgeInfo & 512) > 0)
            this.vertList[9] = this.interpolate(9); // 1 5
        if ((edgeInfo & 1024) > 0)
            this.vertList[10] = this.interpolate(10); // 2 6
        if ((edgeInfo & 2048) > 0)
            this.vertList[11] = this.interpolate(11); // 3 7
        const triInfo = tables_1.TriTable[tableIndex];
        for (let t = 0; t < triInfo.length; t += 3) {
            const l = triInfo[t], m = triInfo[t + 1], n = triInfo[t + 2];
            // ensure winding-order is the same for negative and positive iso-levels
            if (this.isoLevel >= 0) {
                this.builder.addTriangle(this.vertList, l, m, n, edgeFilter);
            }
            else {
                this.builder.addTriangle(this.vertList, n, m, l, edgeFilter);
            }
        }
    }
}
