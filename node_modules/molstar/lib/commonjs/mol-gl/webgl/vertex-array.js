"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVertexArray = createVertexArray;
const id_factory_1 = require("../../mol-util/id-factory");
const getNextVertexArrayId = (0, id_factory_1.idFactory)();
function getVertexArray(extensions) {
    const { vertexArrayObject } = extensions;
    if (!vertexArrayObject) {
        throw new Error('VertexArrayObject not supported');
    }
    const vertexArray = vertexArrayObject.createVertexArray();
    if (!vertexArray) {
        throw new Error('Could not create WebGL vertex array');
    }
    return vertexArray;
}
function getVertexArrayObject(extensions) {
    const { vertexArrayObject } = extensions;
    if (vertexArrayObject === null) {
        throw new Error('VertexArrayObject not supported');
    }
    return vertexArrayObject;
}
function createVertexArray(gl, extensions, program, attributeBuffers, elementsBuffer) {
    const id = getNextVertexArrayId();
    let vertexArray = getVertexArray(extensions);
    let vertexArrayObject = getVertexArrayObject(extensions);
    function update() {
        vertexArrayObject.bindVertexArray(vertexArray);
        if (elementsBuffer)
            elementsBuffer.bind();
        program.bindAttributes(attributeBuffers);
        vertexArrayObject.bindVertexArray(null);
    }
    update();
    let destroyed = false;
    return {
        id,
        bind: () => {
            vertexArrayObject.bindVertexArray(vertexArray);
        },
        update,
        reset: () => {
            vertexArray = getVertexArray(extensions);
            vertexArrayObject = getVertexArrayObject(extensions);
            update();
        },
        destroy: () => {
            if (destroyed)
                return;
            if (elementsBuffer) {
                // workaround for ANGLE/Chromium bug
                // - https://bugs.chromium.org/p/angleproject/issues/detail?id=6599
                // - https://bugs.chromium.org/p/chromium/issues/detail?id=1272238
                vertexArrayObject.bindVertexArray(vertexArray);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            }
            vertexArrayObject.deleteVertexArray(vertexArray);
            destroyed = true;
        }
    };
}
