"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShader = getShader;
exports.createShader = createShader;
const id_factory_1 = require("../../mol-util/id-factory");
const debug_1 = require("../../mol-util/debug");
const getNextShaderId = (0, id_factory_1.idFactory)();
function addLineNumbers(source) {
    const lines = source.split('\n');
    for (let i = 0; i < lines.length; ++i) {
        lines[i] = (i + 1) + ': ' + lines[i];
    }
    return lines.join('\n');
}
function getShader(gl, props) {
    const { type, source } = props;
    const shader = gl.createShader(type === 'vert' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
    if (shader === null) {
        throw new Error(`Error creating ${type} shader`);
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (debug_1.isDebugMode && gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
        console.warn(`'${type}' shader info log '${gl.getShaderInfoLog(shader)}'\n${addLineNumbers(source)}`);
        throw new Error(`Error compiling ${type} shader`);
    }
    return shader;
}
function createShader(gl, props) {
    let shader = getShader(gl, props);
    return {
        id: getNextShaderId(),
        attach: (program) => {
            gl.attachShader(program, shader);
        },
        reset: () => {
            shader = getShader(gl, props);
        },
        destroy: () => {
            gl.deleteShader(shader);
        }
    };
}
