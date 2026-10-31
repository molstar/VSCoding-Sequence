"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgram = getProgram;
exports.createProgram = createProgram;
const shader_code_1 = require("../shader-code");
const uniform_1 = require("./uniform");
const buffer_1 = require("./buffer");
const id_factory_1 = require("../../mol-util/id-factory");
const debug_1 = require("../../mol-util/debug");
const compat_1 = require("./compat");
const getNextProgramId = (0, id_factory_1.idFactory)();
function getLocations(gl, program, schema) {
    const locations = {};
    Object.keys(schema).forEach(k => {
        const spec = schema[k];
        if (spec.type === 'attribute') {
            const loc = gl.getAttribLocation(program, k);
            // unused attributes will result in a `-1` location which is usually fine
            // if (loc === -1) console.info(`Could not get attribute location for '${k}'`);
            locations[k] = loc;
        }
        else if (spec.type === 'uniform') {
            let loc = gl.getUniformLocation(program, k);
            // headless-gl requires a '[0]' suffix for array uniforms (https://github.com/stackgl/headless-gl/issues/170)
            if (loc === null && (0, uniform_1.isArrayUniform)(spec.kind))
                loc = gl.getUniformLocation(program, k + '[0]');
            // unused uniforms will result in a `null` location which is usually fine
            // if (loc === null) console.info(`Could not get uniform location for '${k}'`);
            locations[k] = loc;
        }
        else if (spec.type === 'texture') {
            const loc = gl.getUniformLocation(program, k);
            // unused uniforms will result in a `null` location which is usually fine
            // if (loc === null) console.info(`Could not get uniform location for '${k}'`);
            locations[k] = loc;
        }
    });
    return locations;
}
function checkActiveAttributes(gl, program, schema) {
    const attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < attribCount; ++i) {
        const info = gl.getActiveAttrib(program, i);
        if (info) {
            const { name, type } = info;
            if (name.startsWith('__activeAttribute')) {
                // name assigned by `gl.shim.ts`, ignore for checks
                continue;
            }
            if (name === 'gl_InstanceID')
                continue; // WebGL2 built-in
            if (name === 'gl_VertexID')
                continue; // WebGL2 built-in
            if (name === 'gl_DrawID')
                continue; // WEBGL_multi_draw built-in
            const spec = schema[name];
            if (spec === undefined) {
                throw new Error(`missing 'uniform' or 'texture' with name '${name}' in schema`);
            }
            if (spec.type !== 'attribute') {
                throw new Error(`'${name}' must be of type 'attribute' but is '${spec.type}'`);
            }
            const attribType = (0, buffer_1.getAttribType)(gl, spec.kind, spec.itemSize);
            if (attribType !== type) {
                throw new Error(`unexpected attribute type '${attribType}' for ${name}, expected '${type}'`);
            }
        }
    }
}
function checkActiveUniforms(gl, program, schema) {
    const attribCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < attribCount; ++i) {
        const info = gl.getActiveUniform(program, i);
        if (info) {
            const { name, type } = info;
            if (name.startsWith('__activeUniform')) {
                // name assigned by `gl.shim.ts`, ignore for checks
                continue;
            }
            if (name === 'gl_InstanceID')
                continue; // WebGL2 built-in
            if (name === 'gl_VertexID')
                continue; // WebGL2 built-in
            if (name === 'gl_DrawID')
                continue; // WEBGL_multi_draw built-in
            const baseName = name.replace(/[[0-9]+\]$/, ''); // 'array' uniforms
            const spec = schema[baseName];
            if (spec === undefined) {
                throw new Error(`missing 'uniform' or 'texture' with name '${name}' in schema`);
            }
            if (spec.type === 'uniform') {
                const uniformType = (0, uniform_1.getUniformType)(gl, spec.kind);
                if (uniformType !== type) {
                    throw new Error(`unexpected uniform type for ${name}`);
                }
            }
            else if (spec.type === 'texture') {
                if (spec.kind === 'image-float32' || spec.kind === 'image-uint8') {
                    if (type !== gl.SAMPLER_2D) {
                        throw new Error(`unexpected sampler type for '${name}'`);
                    }
                }
                else if (spec.kind === 'volume-float32' || spec.kind === 'volume-uint8') {
                    if ((0, compat_1.isWebGL2)(gl)) {
                        if (type !== gl.SAMPLER_3D) {
                            throw new Error(`unexpected sampler type for '${name}'`);
                        }
                    }
                    else {
                        throw new Error(`WebGL2 is required to use SAMPLER_3D`);
                    }
                }
                else {
                    // TODO
                }
            }
            else {
                throw new Error(`'${name}' must be of type 'uniform' or 'texture' but is '${spec.type}'`);
            }
        }
    }
}
function checkProgram(gl, program) {
    // no-op in FF on Mac, see https://bugzilla.mozilla.org/show_bug.cgi?id=1284425
    // gl.validateProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Could not compile WebGL program. \n\n${gl.getProgramInfoLog(program)}`);
    }
}
function getProgram(gl) {
    const program = gl.createProgram();
    if (program === null) {
        throw new Error('Could not create WebGL program');
    }
    return program;
}
function createProgram(gl, state, extensions, getShader, props) {
    const { defineValues, shaderCode: _shaderCode, schema } = props;
    let program = getProgram(gl);
    const programId = getNextProgramId();
    const shaderCode = (0, shader_code_1.addShaderDefines)(gl, extensions, defineValues, _shaderCode);
    const vertShader = getShader('vert', shaderCode.vert);
    const fragShader = getShader('frag', shaderCode.frag);
    let locations;
    let uniformSetters;
    function init() {
        vertShader.attach(program);
        fragShader.attach(program);
        gl.linkProgram(program);
        if (debug_1.isDebugMode) {
            checkProgram(gl, program);
        }
        locations = getLocations(gl, program, schema);
        uniformSetters = (0, uniform_1.getUniformSetters)(schema);
        if (debug_1.isDebugMode) {
            checkActiveAttributes(gl, program, schema);
            checkActiveUniforms(gl, program, schema);
        }
    }
    init();
    let destroyed = false;
    return {
        id: programId,
        use: () => {
            // console.log('use', programId)
            state.currentProgramId = programId;
            gl.useProgram(program);
        },
        setUniforms: (uniformValues) => {
            for (let i = 0, il = uniformValues.length; i < il; ++i) {
                const [k, v] = uniformValues[i];
                if (v) {
                    const l = locations[k];
                    if (l !== null)
                        uniformSetters[k](gl, l, v.ref.value);
                }
            }
        },
        uniform: (k, v) => {
            const l = locations[k];
            if (l !== null)
                uniformSetters[k](gl, l, v);
        },
        bindAttributes: (attributeBuffers) => {
            state.clearVertexAttribsState();
            for (let i = 0, il = attributeBuffers.length; i < il; ++i) {
                const [k, buffer] = attributeBuffers[i];
                const l = locations[k];
                if (l !== -1)
                    buffer.bind(l);
            }
            state.disableUnusedVertexAttribs();
        },
        offsetAttributes: (attributeBuffers, offset) => {
            for (let i = 0, il = attributeBuffers.length; i < il; ++i) {
                const [k, buffer] = attributeBuffers[i];
                const l = locations[k];
                if (l !== -1)
                    buffer.changeOffset(l, offset);
            }
        },
        bindTextures: (textures, startingTargetUnit) => {
            for (let i = 0, il = textures.length; i < il; ++i) {
                const [k, texture] = textures[i];
                const l = locations[k];
                if (l !== null && l !== undefined) {
                    texture.bind((i + startingTargetUnit));
                    uniformSetters[k](gl, l, (i + startingTargetUnit));
                }
            }
        },
        reset: () => {
            program = getProgram(gl);
            init();
        },
        destroy: () => {
            if (destroyed)
                return;
            vertShader.destroy();
            fragShader.destroy();
            gl.deleteProgram(program);
            destroyed = true;
        }
    };
}
