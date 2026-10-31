/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createProgram } from './program';
import { createShader } from './shader';
import { createFramebuffer } from './framebuffer';
import { createAttributeBuffer, createElementsBuffer } from './buffer';
import { createReferenceCache } from '../../mol-util/reference-cache';
import { hashString, hashFnv32a } from '../../mol-data/util';
import { createRenderbuffer } from './renderbuffer';
import { createTexture, createCubeTexture } from './texture';
import { createVertexArray } from './vertex-array';
function defineValueHash(v) {
    return typeof v === 'boolean' ? (v ? 1 : 0) :
        typeof v === 'number' ? (v * 10000) : hashString(v);
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
export function createResources(gl, state, stats, extensions) {
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
    const shaderCache = createReferenceCache((props) => JSON.stringify(props), (props) => wrap('shader', createShader(gl, props)), (shader) => { shader.destroy(); });
    function getShader(type, source) {
        return wrapCached(shaderCache.get({ type, source }));
    }
    const programCache = createReferenceCache((props) => {
        var _a;
        const array = [props.shaderCode.id];
        const variant = (((_a = props.defineValues.dRenderVariant) === null || _a === void 0 ? void 0 : _a.ref.value) || '');
        Object.keys(props.defineValues).forEach(k => {
            var _a, _b;
            if (!((_b = (_a = props.shaderCode).ignoreDefine) === null || _b === void 0 ? void 0 : _b.call(_a, k, variant, props.defineValues))) {
                array.push(hashString(k), defineValueHash(props.defineValues[k].ref.value));
            }
        });
        return hashFnv32a(array).toString();
    }, (props) => wrap('program', createProgram(gl, state, extensions, getShader, props)), (program) => { program.destroy(); });
    return {
        attribute: (array, itemSize, divisor, usageHint) => {
            return wrap('attribute', createAttributeBuffer(gl, state, extensions, array, itemSize, divisor, usageHint));
        },
        elements: (array, usageHint) => {
            return wrap('elements', createElementsBuffer(gl, array, usageHint));
        },
        framebuffer: () => {
            return wrap('framebuffer', createFramebuffer(gl));
        },
        program: (defineValues, shaderCode, schema) => {
            return wrapCached(programCache.get({ defineValues, shaderCode, schema }));
        },
        renderbuffer: (format, attachment, width, height) => {
            return wrap('renderbuffer', createRenderbuffer(gl, format, attachment, width, height));
        },
        shader: getShader,
        texture: (kind, format, type, filter) => {
            return wrap('texture', createTexture(gl, extensions, kind, format, type, filter));
        },
        cubeTexture: (faces, mipmaps, onload) => {
            return wrap('cubeTexture', createCubeTexture(gl, faces, mipmaps, onload));
        },
        vertexArray: (program, attributeBuffers, elementsBuffer) => {
            return wrap('vertexArray', createVertexArray(gl, extensions, program, attributeBuffers, elementsBuffer));
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
