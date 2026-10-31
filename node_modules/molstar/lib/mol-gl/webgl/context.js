/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { isWebGL2 } from './compat';
import { checkFramebufferStatus } from './framebuffer';
import { Scheduler } from '../../mol-task';
import { isDebugMode } from '../../mol-util/debug';
import { createExtensions } from './extensions';
import { createState } from './state';
import { PixelData } from '../../mol-util/image';
import { createResources } from './resources';
import { createRenderTarget } from './render-target';
import { BehaviorSubject } from 'rxjs';
import { now } from '../../mol-util/now';
import { createTimer } from './timer';
export function getGLContext(canvas, attribs) {
    function get(id) {
        try {
            return canvas.getContext(id, attribs);
        }
        catch (e) {
            return null;
        }
    }
    const gl = ((attribs === null || attribs === void 0 ? void 0 : attribs.preferWebGl1) ? null : get('webgl2')) || get('webgl') || get('experimental-webgl');
    if (isDebugMode)
        console.log(`isWebgl2: ${isWebGL2(gl)}`);
    return gl;
}
export function getErrorDescription(gl, error) {
    switch (error) {
        case gl.NO_ERROR: return 'no error';
        case gl.INVALID_ENUM: return 'invalid enum';
        case gl.INVALID_VALUE: return 'invalid value';
        case gl.INVALID_OPERATION: return 'invalid operation';
        case gl.INVALID_FRAMEBUFFER_OPERATION: return 'invalid framebuffer operation';
        case gl.OUT_OF_MEMORY: return 'out of memory';
        case gl.CONTEXT_LOST_WEBGL: return 'context lost';
    }
    return 'unknown error';
}
export function checkError(gl) {
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        throw new Error(`WebGL error: '${getErrorDescription(gl, error)}'`);
    }
}
export function glEnumToString(gl, value) {
    const keys = [];
    for (const key in gl) {
        if (gl[key] === value) {
            keys.push(key);
        }
    }
    return keys.length ? keys.join(' | ') : `0x${value.toString(16)}`;
}
function unbindResources(gl) {
    // bind null to all texture units
    const maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    for (let i = 0; i < maxTextureImageUnits; ++i) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        if (isWebGL2(gl)) {
            gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
            gl.bindTexture(gl.TEXTURE_3D, null);
        }
    }
    // assign the smallest possible buffer to all attributes
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    for (let i = 0; i < maxVertexAttribs; ++i) {
        gl.vertexAttribPointer(i, 1, gl.FLOAT, false, 0, 0);
    }
    // bind null to all buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    unbindFramebuffer(gl);
}
function unbindFramebuffer(gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
const tmpPixel = new Uint8Array(1 * 4);
function checkSync(gl, sync, resolve) {
    if (gl.getSyncParameter(sync, gl.SYNC_STATUS) === gl.SIGNALED) {
        gl.deleteSync(sync);
        resolve();
    }
    else {
        Scheduler.setImmediate(checkSync, gl, sync, resolve);
    }
}
function fence(gl, resolve) {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) {
        console.warn('Could not create a WebGLSync object');
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, tmpPixel);
        resolve();
    }
    else {
        Scheduler.setImmediate(checkSync, gl, sync, resolve);
    }
}
let SentWebglSyncObjectNotSupportedInWebglMessage = false;
function waitForGpuCommandsComplete(gl) {
    return new Promise(resolve => {
        if (isWebGL2(gl)) {
            fence(gl, resolve);
        }
        else {
            if (!SentWebglSyncObjectNotSupportedInWebglMessage) {
                console.info('Sync object not supported in WebGL');
                SentWebglSyncObjectNotSupportedInWebglMessage = true;
            }
            waitForGpuCommandsCompleteSync(gl);
            resolve();
        }
    });
}
function waitForGpuCommandsCompleteSync(gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, tmpPixel);
}
export function readPixels(gl, x, y, width, height, buffer) {
    if (isDebugMode)
        checkFramebufferStatus(gl);
    if (buffer instanceof Uint8Array) {
        gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
    }
    else if (buffer instanceof Float32Array) {
        gl.readPixels(x, y, width, height, gl.RGBA, gl.FLOAT, buffer);
    }
    else if (buffer instanceof Int32Array && isWebGL2(gl)) {
        gl.readPixels(x, y, width, height, gl.RGBA_INTEGER, gl.INT, buffer);
    }
    else {
        throw new Error('unsupported readPixels buffer type');
    }
    if (isDebugMode)
        checkError(gl);
}
function getDrawingBufferPixelData(gl, state) {
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    const buffer = new Uint8Array(w * h * 4);
    unbindFramebuffer(gl);
    state.viewport(0, 0, w, h);
    readPixels(gl, 0, 0, w, h, buffer);
    return PixelData.flipY(PixelData.create(buffer, w, h));
}
function getShaderPrecisionFormat(gl, shader, precision, type) {
    const glShader = shader === 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
    const glPrecisionType = gl[`${precision.toUpperCase()}_${type.toUpperCase()}`];
    return gl.getShaderPrecisionFormat(glShader, glPrecisionType);
}
function getShaderPrecisionFormats(gl, shader) {
    return {
        lowFloat: getShaderPrecisionFormat(gl, shader, 'low', 'float'),
        mediumFloat: getShaderPrecisionFormat(gl, shader, 'medium', 'float'),
        highFloat: getShaderPrecisionFormat(gl, shader, 'high', 'float'),
        lowInt: getShaderPrecisionFormat(gl, shader, 'low', 'int'),
        mediumInt: getShaderPrecisionFormat(gl, shader, 'medium', 'int'),
        highInt: getShaderPrecisionFormat(gl, shader, 'high', 'int'),
    };
}
//
function createStats() {
    const stats = {
        resourceCounts: {
            attribute: 0,
            elements: 0,
            framebuffer: 0,
            program: 0,
            renderbuffer: 0,
            shader: 0,
            texture: 0,
            cubeTexture: 0,
            vertexArray: 0,
        },
        drawCount: 0,
        instanceCount: 0,
        instancedDrawCount: 0,
        calls: {
            drawInstanced: 0,
            drawInstancedBase: 0,
            multiDrawInstancedBase: 0,
            counts: 0,
        },
        culled: {
            lod: 0,
            frustum: 0,
            occlusion: 0,
        },
    };
    return stats;
}
export function createContext(gl, props = {}) {
    const extensions = createExtensions(gl);
    const state = createState(gl, extensions);
    const stats = createStats();
    const resources = createResources(gl, state, stats, extensions);
    const timer = createTimer(gl, extensions, stats);
    const parameters = {
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        max3dTextureSize: isWebGL2(gl) ? gl.getParameter(gl.MAX_3D_TEXTURE_SIZE) : 0,
        maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        maxDrawBuffers: extensions.drawBuffers ? gl.getParameter(extensions.drawBuffers.MAX_DRAW_BUFFERS) : 0,
        maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    };
    if (parameters.maxVertexTextureImageUnits < 8) {
        throw new Error('Need "MAX_VERTEX_TEXTURE_IMAGE_UNITS" >= 8');
    }
    const shaderPrecisionFormats = {
        vertex: getShaderPrecisionFormats(gl, 'vertex'),
        fragment: getShaderPrecisionFormats(gl, 'fragment'),
    };
    if (isDebugMode) {
        console.log({ parameters, shaderPrecisionFormats });
    }
    // optimize assuming flats first and last data are same or differences don't matter
    // extension is only available when `FIRST_VERTEX_CONVENTION` is more efficient
    const epv = extensions.provokingVertex;
    epv === null || epv === void 0 ? void 0 : epv.provokingVertex(epv.FIRST_VERTEX_CONVENTION);
    let isContextLost = false;
    const contextRestored = new BehaviorSubject(0);
    let pixelScale = props.pixelScale || 1;
    let readPixelsAsync;
    if (isWebGL2(gl)) {
        const pbo = gl.createBuffer();
        let _buffer = void 0;
        let _resolve = void 0;
        let _reading = false;
        const bindPBO = () => {
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
            gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, _buffer);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
            _reading = false;
            _resolve();
            _resolve = void 0;
            _buffer = void 0;
        };
        readPixelsAsync = (x, y, width, height, buffer) => new Promise((resolve, reject) => {
            if (_reading) {
                reject('Can not call multiple readPixelsAsync at the same time');
                return;
            }
            _reading = true;
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
            gl.bufferData(gl.PIXEL_PACK_BUFFER, width * height * 4, gl.STREAM_READ);
            gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, 0);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
            // need to unbind/bind PBO before/after async awaiting the fence
            _resolve = resolve;
            _buffer = buffer;
            fence(gl, bindPBO);
        });
    }
    else {
        readPixelsAsync = async (x, y, width, height, buffer) => {
            readPixels(gl, x, y, width, height, buffer);
        };
    }
    const renderTargets = new Set();
    return {
        gl,
        isWebGL2: isWebGL2(gl),
        get pixelRatio() {
            const dpr = (typeof window !== 'undefined') ? (window.devicePixelRatio || 1) : 1;
            return dpr * (pixelScale || 1);
        },
        extensions,
        state,
        stats,
        resources,
        timer,
        get maxTextureSize() { return parameters.maxTextureSize; },
        get max3dTextureSize() { return parameters.max3dTextureSize; },
        get maxRenderbufferSize() { return parameters.maxRenderbufferSize; },
        get maxDrawBuffers() { return parameters.maxDrawBuffers; },
        get maxTextureImageUnits() { return parameters.maxTextureImageUnits; },
        get shaderPrecisionFormats() { return shaderPrecisionFormats; },
        namedComputeRenderables: Object.create(null),
        namedFramebuffers: Object.create(null),
        namedTextures: Object.create(null),
        get isContextLost() {
            return isContextLost || gl.isContextLost();
        },
        contextRestored,
        setContextLost: () => {
            isContextLost = true;
            timer.clear();
        },
        handleContextRestored: (extraResets) => {
            Object.assign(extensions, createExtensions(gl));
            state.reset();
            state.currentMaterialId = -1;
            state.currentProgramId = -1;
            state.currentRenderItemId = -1;
            resources.reset();
            renderTargets.forEach(rt => rt.reset());
            extraResets === null || extraResets === void 0 ? void 0 : extraResets();
            isContextLost = false;
            contextRestored.next(now());
        },
        setPixelScale: (value) => {
            pixelScale = value;
        },
        createRenderTarget: (width, height, depth, type, filter, format) => {
            const renderTarget = createRenderTarget(gl, resources, width, height, depth, type, filter, format);
            renderTargets.add(renderTarget);
            return {
                ...renderTarget,
                destroy: () => {
                    renderTarget.destroy();
                    renderTargets.delete(renderTarget);
                }
            };
        },
        unbindFramebuffer: () => unbindFramebuffer(gl),
        readPixels: (x, y, width, height, buffer) => {
            readPixels(gl, x, y, width, height, buffer);
        },
        readPixelsAsync,
        waitForGpuCommandsComplete: () => waitForGpuCommandsComplete(gl),
        waitForGpuCommandsCompleteSync: () => waitForGpuCommandsCompleteSync(gl),
        getFenceSync: () => {
            return isWebGL2(gl) ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
        },
        checkSyncStatus: (sync) => {
            if (!isWebGL2(gl))
                return true;
            if (gl.getSyncParameter(sync, gl.SYNC_STATUS) === gl.SIGNALED) {
                gl.deleteSync(sync);
                return true;
            }
            else {
                return false;
            }
        },
        deleteSync: (sync) => {
            if (isWebGL2(gl))
                gl.deleteSync(sync);
        },
        getDrawingBufferPixelData: () => getDrawingBufferPixelData(gl, state),
        clear: (red, green, blue, alpha) => {
            unbindFramebuffer(gl);
            state.enable(gl.SCISSOR_TEST);
            state.depthMask(true);
            state.colorMask(true, true, true, true);
            state.clearColor(red, green, blue, alpha);
            state.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            state.scissor(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        },
        destroy: (options) => {
            var _a, _b;
            resources.destroy();
            unbindResources(gl);
            // to aid GC
            if (!(options === null || options === void 0 ? void 0 : options.doNotForceWebGLContextLoss)) {
                (_a = gl.getExtension('WEBGL_lose_context')) === null || _a === void 0 ? void 0 : _a.loseContext();
                (_b = gl.getExtension('STACKGL_destroy_context')) === null || _b === void 0 ? void 0 : _b.destroy();
            }
        }
    };
}
