"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResources = createResources;
const program_1 = require("./program");
const shader_1 = require("./shader");
const framebuffer_1 = require("./framebuffer");
const buffer_1 = require("./buffer");
const reference_cache_1 = require("../../mol-util/reference-cache");
const util_1 = require("../../mol-data/util");
const renderbuffer_1 = require("./renderbuffer");
const texture_1 = require("./texture");
const vertex_array_1 = require("./vertex-array");
function defineValueHash(v) {
    return typeof v === 'boolean' ? (v ? 1 : 0) :
        typeof v === 'number' ? (v * 10000) : (0, util_1.hashString)(v);
}
function wrapCached(resourceItem) {
    const wrapped = {
        ...resourceItem.value,
        destroy: () => {
            resourceItem.free();
        }
    };
    return wrapped;
}
function createResources(gl, state, stats, extensions) {
    const sets = {
        attribute: new Set(),
        elements: new Set(),
        framebuffer: new Set(),
        program: new Set(),
        renderbuffer: new Set(),
        shader: new Set(),
        texture: new Set(),
        cubeTexture: new Set(),
        vertexArray: new Set(),
    };
    function wrap(name, resource) {
        sets[name].add(resource);
        stats.resourceCounts[name] += 1;
        return {
            ...resource,
            destroy: () => {
                resource.destroy();
                sets[name].delete(resource);
                stats.resourceCounts[name] -= 1;
            }
        };
    }
    const shaderCache = (0, reference_cache_1.createReferenceCache)((props) => JSON.stringify(props), (props) => wrap('shader', (0, shader_1.createShader)(gl, props)), (shader) => { shader.destroy(); });
    function getShader(type, source) {
        return wrapCached(shaderCache.get({ type, source }));
    }
    const programCache = (0, reference_cache_1.createReferenceCache)((props) => {
        var _a;
        const array = [props.shaderCode.id];
        const variant = (((_a = props.defineValues.dRenderVariant) === null || _a === void 0 ? void 0 : _a.ref.value) || '');
        Object.keys(props.defineValues).forEach(k => {
            var _a, _b;
            if (!((_b = (_a = props.shaderCode).ignoreDefine) === null || _b === void 0 ? void 0 : _b.call(_a, k, variant, props.defineValues))) {
                array.push((0, util_1.hashString)(k), defineValueHash(props.defineValues[k].ref.value));
            }
        });
        return (0, util_1.hashFnv32a)(array).toString();
    }, (props) => wrap('program', (0, program_1.createProgram)(gl, state, extensions, getShader, props)), (program) => { program.destroy(); });
    return {
        attribute: (array, itemSize, divisor, usageHint) => {
            return wrap('attribute', (0, buffer_1.createAttributeBuffer)(gl, state, extensions, array, itemSize, divisor, usageHint));
        },
        elements: (array, usageHint) => {
            return wrap('elements', (0, buffer_1.createElementsBuffer)(gl, array, usageHint));
        },
        framebuffer: () => {
            return wrap('framebuffer', (0, framebuffer_1.createFramebuffer)(gl));
        },
        program: (defineValues, shaderCode, schema) => {
            return wrapCached(programCache.get({ defineValues, shaderCode, schema }));
        },
        renderbuffer: (format, attachment, width, height) => {
            return wrap('renderbuffer', (0, renderbuffer_1.createRenderbuffer)(gl, format, attachment, width, height));
        },
        shader: getShader,
        texture: (kind, format, type, filter) => {
            return wrap('texture', (0, texture_1.createTexture)(gl, extensions, kind, format, type, filter));
        },
        cubeTexture: (faces, mipmaps, onload) => {
            return wrap('cubeTexture', (0, texture_1.createCubeTexture)(gl, faces, mipmaps, onload));
        },
        vertexArray: (program, attributeBuffers, elementsBuffer) => {
            return wrap('vertexArray', (0, vertex_array_1.createVertexArray)(gl, extensions, program, attributeBuffers, elementsBuffer));
        },
        getByteCounts: () => {
            let texture = 0;
            sets.texture.forEach(r => {
                texture += r.getByteCount();
            });
            sets.cubeTexture.forEach(r => {
                texture += r.getByteCount();
            });
            let attribute = 0;
            sets.attribute.forEach(r => {
                attribute += r.length * 4;
            });
            let elements = 0;
            sets.elements.forEach(r => {
                elements += r.length * 4;
            });
            return { texture, attribute, elements };
        },
        reset: () => {
            sets.attribute.forEach(r => r.reset());
            sets.elements.forEach(r => r.reset());
            sets.framebuffer.forEach(r => r.reset());
            sets.renderbuffer.forEach(r => r.reset());
            sets.shader.forEach(r => r.reset());
            sets.program.forEach(r => r.reset());
            sets.vertexArray.forEach(r => r.reset());
            sets.texture.forEach(r => r.reset());
        },
        destroy: () => {
            sets.attribute.forEach(r => r.destroy());
            sets.elements.forEach(r => r.destroy());
            sets.framebuffer.forEach(r => r.destroy());
            sets.renderbuffer.forEach(r => r.destroy());
            sets.shader.forEach(r => r.destroy());
            sets.program.forEach(r => r.destroy());
            sets.vertexArray.forEach(r => r.destroy());
            sets.texture.forEach(r => r.destroy());
            shaderCache.clear();
            programCache.clear();
        }
    };
}
