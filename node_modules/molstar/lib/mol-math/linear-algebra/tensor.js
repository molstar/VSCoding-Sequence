import { Mat3 } from './3d/mat3';
/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4 } from './3d/mat4';
export var Tensor;
(function (Tensor) {
    function Layout(dimensions, axisOrderSlowToFast, ctor) {
        // need to reverse the axis order for better access.
        const axisOrderFastToSlow = [];
        for (let i = 0; i < axisOrderSlowToFast.length; i++)
            axisOrderFastToSlow[i] = axisOrderSlowToFast[axisOrderSlowToFast.length - i - 1];
        const accessDimensions = [1];
        for (let i = 1; i < dimensions.length; i++)
            accessDimensions[i] = dimensions[axisOrderFastToSlow[i - 1]];
        return { dimensions, axisOrderFastToSlow, axisOrderSlowToFast, accessDimensions, defaultCtor: ctor || Float64Array };
    }
    function create(space, data) { return { space, data }; }
    Tensor.create = create;
    function Space(dimensions, axisOrderSlowToFast, ctor) {
        const layout = Layout(dimensions, axisOrderSlowToFast, ctor);
        const { get, set, add, dataOffset, getCoords } = accessors(layout);
        return { rank: dimensions.length, dimensions, axisOrderSlowToFast, create: creator(layout), get, set, add, dataOffset, getCoords };
    }
    Tensor.Space = Space;
    function Data1(values) { return values; }
    Tensor.Data1 = Data1;
    function Vector(d, ctor) { return Space([d], [0], ctor); }
    Tensor.Vector = Vector;
    function ColumnMajorMatrix(rows, cols, ctor) { return Space([rows, cols], [1, 0], ctor); }
    Tensor.ColumnMajorMatrix = ColumnMajorMatrix;
    function RowMajorMatrix(rows, cols, ctor) { return Space([rows, cols], [0, 1], ctor); }
    Tensor.RowMajorMatrix = RowMajorMatrix;
    function toMat4(out, space, data) {
        if (space.rank !== 2)
            throw new Error('Invalid tensor rank');
        const d0 = Math.min(4, space.dimensions[0]), d1 = Math.min(4, space.dimensions[1]);
        for (let i = 0; i < d0; i++) {
            for (let j = 0; j < d1; j++)
                Mat4.setValue(out, i, j, space.get(data, i, j));
        }
        return out;
    }
    Tensor.toMat4 = toMat4;
    function toMat3(out, space, data) {
        if (space.rank !== 2)
            throw new Error('Invalid tensor rank');
        const d0 = Math.min(3, space.dimensions[0]), d1 = Math.min(3, space.dimensions[1]);
        for (let i = 0; i < d0; i++) {
            for (let j = 0; j < d1; j++)
                Mat3.setValue(out, i, j, space.get(data, i, j));
        }
        return out;
    }
    Tensor.toMat3 = toMat3;
    function toVec3(out, space, data) {
        if (space.rank !== 1)
            throw new Error('Invalid tensor rank');
        const d0 = Math.min(3, space.dimensions[0]);
        for (let i = 0; i < d0; i++)
            out[i] = data[i];
        return out;
    }
    Tensor.toVec3 = toVec3;
    function toVec4(out, space, data) {
        if (space.rank !== 1)
            throw new Error('Invalid tensor rank');
        const d0 = Math.min(4, space.dimensions[0]);
        for (let i = 0; i < d0; i++)
            out[i] = data[i];
        return out;
    }
    Tensor.toVec4 = toVec4;
    function areEqualExact(a, b) {
        const len = a.length;
        if (len !== b.length)
            return false;
        for (let i = 0; i < len; i++)
            if (a[i] !== b[i])
                return false;
        return true;
    }
    Tensor.areEqualExact = areEqualExact;
    function accessors(layout) {
        const { dimensions, axisOrderFastToSlow: ao } = layout;
        switch (dimensions.length) {
            case 1: return {
                get: (t, d) => t[d],
                set: (t, d, x) => t[d] = x,
                add: (t, d, x) => t[d] += x,
                dataOffset: (d) => d,
                getCoords: (o, c) => {
                    c[0] = o;
                    return c;
                }
            };
            case 2: {
                // column major
                if (ao[0] === 0 && ao[1] === 1) {
                    const rows = dimensions[0];
                    return {
                        get: (t, i, j) => t[j * rows + i],
                        set: (t, i, j, x) => t[j * rows + i] = x,
                        add: (t, i, j, x) => t[j * rows + i] += x,
                        dataOffset: (i, j) => j * rows + i,
                        getCoords: (o, c) => {
                            c[0] = o % rows;
                            c[1] = Math.floor(o / rows);
                            return c;
                        }
                    };
                }
                if (ao[0] === 1 && ao[1] === 0) {
                    const cols = dimensions[1];
                    return {
                        get: (t, i, j) => t[i * cols + j],
                        set: (t, i, j, x) => t[i * cols + j] = x,
                        add: (t, i, j, x) => t[i * cols + j] += x,
                        dataOffset: (i, j) => i * cols + j,
                        getCoords: (o, c) => {
                            c[0] = Math.floor(o / cols);
                            c[1] = o % cols;
                            return c;
                        }
                    };
                }
                throw new Error('bad axis order');
            }
            case 3: {
                if (ao[0] === 0 && ao[1] === 1 && ao[2] === 2) { // 012 ijk
                    const u = dimensions[0], v = dimensions[1], uv = u * v;
                    return {
                        get: (t, i, j, k) => t[i + j * u + k * uv],
                        set: (t, i, j, k, x) => t[i + j * u + k * uv] = x,
                        add: (t, i, j, k, x) => t[i + j * u + k * uv] += x,
                        dataOffset: (i, j, k) => i + j * u + k * uv,
                        getCoords: (o, c) => {
                            const p = Math.floor(o / u);
                            c[0] = o % u;
                            c[1] = p % v;
                            c[2] = Math.floor(p / v);
                            return c;
                        }
                    };
                }
                if (ao[0] === 0 && ao[1] === 2 && ao[2] === 1) { // 021 ikj
                    const u = dimensions[0], v = dimensions[2], uv = u * v;
                    return {
                        get: (t, i, j, k) => t[i + k * u + j * uv],
                        set: (t, i, j, k, x) => t[i + k * u + j * uv] = x,
                        add: (t, i, j, k, x) => t[i + k * u + j * uv] += x,
                        dataOffset: (i, j, k) => i + k * u + j * uv,
                        getCoords: (o, c) => {
                            const p = Math.floor(o / u);
                            c[0] = o % u;
                            c[1] = Math.floor(p / v);
                            c[2] = p % v;
                            return c;
                        }
                    };
                }
                if (ao[0] === 1 && ao[1] === 0 && ao[2] === 2) { // 102 jik
                    const u = dimensions[1], v = dimensions[0], uv = u * v;
                    return {
                        get: (t, i, j, k) => t[j + i * u + k * uv],
                        set: (t, i, j, k, x) => t[j + i * u + k * uv] = x,
                        add: (t, i, j, k, x) => t[j + i * u + k * uv] += x,
                        dataOffset: (i, j, k) => j + i * u + k * uv,
                        getCoords: (o, c) => {
                            const p = Math.floor(o / u);
                            c[0] = p % v;
                            c[1] = o % u;
                            c[2] = Math.floor(p / v);
                            return c;
                        }
                    };
                }
                if (ao[0] === 1 && ao[1] === 2 && ao[2] === 0) { // 120 jki
                    const u = dimensions[1], v = dimensions[2], uv = u * v;
                    return {
                        get: (t, i, j, k) => t[j + k * u + i * uv],
                        set: (t, i, j, k, x) => t[j + k * u + i * uv] = x,
                        add: (t, i, j, k, x) => t[j + k * u + i * uv] += x,
                        dataOffset: (i, j, k) => j + k * u + i * uv,
                        getCoords: (o, c) => {
                            const p = Math.floor(o / u);
                            c[0] = Math.floor(p / v);
                            c[1] = o % u;
                            c[2] = p % v;
                            return c;
                        }
                    };
                }
                if (ao[0] === 2 && ao[1] === 0 && ao[2] === 1) { // 201 kij
                    const u = dimensions[2], v = dimensions[0], uv = u * v;
                    return {
                        get: (t, i, j, k) => t[k + i * u + j * uv],
                        set: (t, i, j, k, x) => t[k + i * u + j * uv] = x,
                        add: (t, i, j, k, x) => t[k + i * u + j * uv] += x,
                        dataOffset: (i, j, k) => k + i * u + j * uv,
                        getCoords: (o, c) => {
                            const p = Math.floor(o / u);
                            c[0] = p % v;
                            c[1] = Math.floor(p / v);
                            c[2] = o % u;
                            return c;
                        }
                    };
                }
                if (ao[0] === 2 && ao[1] === 1 && ao[2] === 0) { // 210 kji
                    const u = dimensions[2], v = dimensions[1], uv = u * v;
                    return {
                        get: (t, i, j, k) => t[k + j * u + i * uv],
                        set: (t, i, j, k, x) => t[k + j * u + i * uv] = x,
                        add: (t, i, j, k, x) => t[k + j * u + i * uv] += x,
                        dataOffset: (i, j, k) => k + j * u + i * uv,
                        getCoords: (o, c) => {
                            const p = Math.floor(o / u);
                            c[0] = Math.floor(p / v);
                            c[1] = p % v;
                            c[2] = o % u;
                            return c;
                        }
                    };
                }
                throw new Error('bad axis order');
            }
            default: return {
                get: (t, ...c) => t[dataOffset(layout, c)],
                set: (t, ...c) => t[dataOffset(layout, c)] = c[c.length - 1],
                add: (t, ...c) => t[dataOffset(layout, c)] += c[c.length - 1],
                dataOffset: (...c) => dataOffset(layout, c),
                getCoords: (o, c) => getCoords(layout, o, c),
            };
        }
    }
    function creator(layout) {
        const { dimensions: ds } = layout;
        let size = 1;
        for (let i = 0, _i = ds.length; i < _i; i++)
            size *= ds[i];
        return ctor => new (ctor || layout.defaultCtor)(size);
    }
    function dataOffset(layout, coord) {
        const { accessDimensions: acc, axisOrderFastToSlow: ao } = layout;
        const d = acc.length - 1;
        let o = acc[d] * coord[ao[d]];
        for (let i = d - 1; i >= 0; i--) {
            o = (o + coord[ao[i]]) * acc[i];
        }
        return o;
    }
    function getCoords(layout, o, coords) {
        const { dimensions: dim, axisOrderFastToSlow: ao } = layout;
        const d = dim.length;
        let c = o;
        for (let i = 0; i < d; i++) {
            const d = dim[ao[i]];
            coords[ao[i]] = c % d;
            c = Math.floor(c / d);
        }
        coords[ao[d + 1]] = c;
        return coords;
    }
    // Convers "slow to fast" axis order to "fast to slow" and vice versa.
    function invertAxisOrder(v) {
        const ret = [];
        for (let i = 0; i < v.length; i++) {
            ret[i] = v[v.length - i - 1];
        }
        return ret;
    }
    Tensor.invertAxisOrder = invertAxisOrder;
    function reorder(xs, indices) {
        const ret = [];
        for (let i = 0; i < xs.length; i++)
            ret[i] = xs[indices[i]];
        return ret;
    }
    function convertToCanonicalAxisIndicesFastToSlow(order) {
        const indices = new Int32Array(order.length);
        for (let i = 0; i < order.length; i++)
            indices[order[i]] = i;
        return (xs) => reorder(xs, indices);
    }
    Tensor.convertToCanonicalAxisIndicesFastToSlow = convertToCanonicalAxisIndicesFastToSlow;
    function convertToCanonicalAxisIndicesSlowToFast(order) {
        const indices = new Int32Array(order.length);
        for (let i = 0; i < order.length; i++)
            indices[order[order.length - i - 1]] = i;
        return (xs) => reorder(xs, indices);
    }
    Tensor.convertToCanonicalAxisIndicesSlowToFast = convertToCanonicalAxisIndicesSlowToFast;
})(Tensor || (Tensor = {}));
