"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsageHint = getUsageHint;
exports.getDataType = getDataType;
exports.getBufferType = getBufferType;
exports.getBuffer = getBuffer;
exports.getAttribType = getAttribType;
exports.createAttributeBuffer = createAttributeBuffer;
exports.createAttributeBuffers = createAttributeBuffers;
exports.createElementsBuffer = createElementsBuffer;
const id_factory_1 = require("../../mol-util/id-factory");
const type_helpers_1 = require("../../mol-util/type-helpers");
const compat_1 = require("./compat");
const getNextBufferId = (0, id_factory_1.idFactory)();
function getUsageHint(gl, usageHint) {
    switch (usageHint) {
        case 'static': return gl.STATIC_DRAW;
        case 'dynamic': return gl.DYNAMIC_DRAW;
        case 'stream': return gl.STREAM_DRAW;
    }
}
function getDataType(gl, dataType) {
    switch (dataType) {
        case 'uint8': return gl.UNSIGNED_BYTE;
        case 'int8': return gl.BYTE;
        case 'uint16': return gl.UNSIGNED_SHORT;
        case 'int16': return gl.SHORT;
        case 'uint32': return gl.UNSIGNED_INT;
        case 'int32': return gl.INT;
        case 'float32': return gl.FLOAT;
        default: (0, type_helpers_1.assertUnreachable)(dataType);
    }
}
function dataTypeFromArray(gl, array) {
    if (array instanceof Uint8Array) {
        return gl.UNSIGNED_BYTE;
    }
    else if (array instanceof Int8Array) {
        return gl.BYTE;
    }
    else if (array instanceof Uint16Array) {
        return gl.UNSIGNED_SHORT;
    }
    else if (array instanceof Int16Array) {
        return gl.SHORT;
    }
    else if (array instanceof Uint32Array) {
        return gl.UNSIGNED_INT;
    }
    else if (array instanceof Int32Array) {
        return gl.INT;
    }
    else if (array instanceof Float32Array) {
        return gl.FLOAT;
    }
    (0, type_helpers_1.assertUnreachable)(array);
}
function getBufferType(gl, bufferType) {
    switch (bufferType) {
        case 'attribute': return gl.ARRAY_BUFFER;
        case 'elements': return gl.ELEMENT_ARRAY_BUFFER;
        case 'uniform':
            if ((0, compat_1.isWebGL2)(gl)) {
                return gl.UNIFORM_BUFFER;
            }
            else {
                throw new Error('WebGL2 is required for uniform buffers');
            }
    }
}
function getBuffer(gl) {
    const buffer = gl.createBuffer();
    if (buffer === null) {
        throw new Error('Could not create WebGL buffer');
    }
    return buffer;
}
function createBuffer(gl, array, usageHint, bufferType) {
    let _buffer = getBuffer(gl);
    const _usageHint = getUsageHint(gl, usageHint);
    const _bufferType = getBufferType(gl, bufferType);
    const _dataType = dataTypeFromArray(gl, array);
    const _bpe = array.BYTES_PER_ELEMENT;
    const _length = array.length;
    function updateData(array) {
        gl.bindBuffer(_bufferType, _buffer);
        gl.bufferData(_bufferType, array, _usageHint);
    }
    updateData(array);
    let destroyed = false;
    return {
        id: getNextBufferId(),
        _usageHint,
        _bufferType,
        _dataType,
        _bpe,
        length: _length,
        getBuffer: () => _buffer,
        updateData,
        updateSubData: (array, offset, count) => {
            gl.bindBuffer(_bufferType, _buffer);
            if (count - offset === array.length) {
                gl.bufferSubData(_bufferType, 0, array);
            }
            else {
                gl.bufferSubData(_bufferType, offset * _bpe, array.subarray(offset, offset + count));
            }
        },
        reset: () => {
            _buffer = getBuffer(gl);
            updateData(array);
        },
        destroy: () => {
            if (destroyed)
                return;
            gl.deleteBuffer(_buffer);
            destroyed = true;
        }
    };
}
function getAttribType(gl, kind, itemSize) {
    switch (kind) {
        case 'float32':
            switch (itemSize) {
                case 1: return gl.FLOAT;
                case 2: return gl.FLOAT_VEC2;
                case 3: return gl.FLOAT_VEC3;
                case 4: return gl.FLOAT_VEC4;
                case 16: return gl.FLOAT_MAT4;
            }
        default:
            (0, type_helpers_1.assertUnreachable)(kind);
    }
}
function createAttributeBuffer(gl, state, extensions, array, itemSize, divisor, usageHint = 'static') {
    const { instancedArrays } = extensions;
    const buffer = createBuffer(gl, array, usageHint, 'attribute');
    const { _bufferType, _dataType, _bpe } = buffer;
    return {
        ...buffer,
        divisor,
        bind: (location) => {
            gl.bindBuffer(_bufferType, buffer.getBuffer());
            if (itemSize === 16) {
                for (let i = 0; i < 4; ++i) {
                    state.enableVertexAttrib(location + i);
                    gl.vertexAttribPointer(location + i, 4, _dataType, false, 4 * 4 * _bpe, i * 4 * _bpe);
                    instancedArrays.vertexAttribDivisor(location + i, divisor);
                }
            }
            else {
                state.enableVertexAttrib(location);
                gl.vertexAttribPointer(location, itemSize, _dataType, false, 0, 0);
                instancedArrays.vertexAttribDivisor(location, divisor);
            }
        },
        changeOffset: (location, offset) => {
            const o = offset * _bpe * itemSize;
            gl.bindBuffer(_bufferType, buffer.getBuffer());
            if (itemSize === 16) {
                for (let i = 0; i < 4; ++i) {
                    gl.vertexAttribPointer(location + i, 4, _dataType, false, 4 * 4 * _bpe, (i * 4 * _bpe) + o);
                }
            }
            else {
                gl.vertexAttribPointer(location, itemSize, _dataType, false, 0, o);
            }
        }
    };
}
function createAttributeBuffers(ctx, schema, values) {
    const buffers = [];
    Object.keys(schema).forEach(k => {
        const spec = schema[k];
        if (spec.type === 'attribute') {
            buffers[buffers.length] = [k, ctx.resources.attribute(values[k].ref.value, spec.itemSize, spec.divisor)];
        }
    });
    return buffers;
}
function createElementsBuffer(gl, array, usageHint = 'static') {
    const buffer = createBuffer(gl, array, usageHint, 'elements');
    return {
        ...buffer,
        bind: () => {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.getBuffer());
        }
    };
}
