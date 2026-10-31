"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRenderTarget = createRenderTarget;
exports.createNullRenderTarget = createNullRenderTarget;
const id_factory_1 = require("../../mol-util/id-factory");
const texture_1 = require("./texture");
const framebuffer_1 = require("./framebuffer");
const compat_1 = require("./compat");
const getNextRenderTargetId = (0, id_factory_1.idFactory)();
function createRenderTarget(gl, resources, _width, _height, depth = true, type = 'uint8', filter = 'nearest', format = 'rgba') {
    if (format === 'alpha' && !(0, compat_1.isWebGL2)(gl)) {
        throw new Error('cannot render to alpha format in webgl1');
    }
    const framebuffer = resources.framebuffer();
    const targetTexture = type === 'fp16'
        ? resources.texture('image-float16', format, 'fp16', filter)
        : type === 'float32'
            ? resources.texture('image-float32', format, 'float', filter)
            : resources.texture('image-uint8', format, 'ubyte', filter);
    // make a depth renderbuffer of the same size as the targetTexture
    const depthRenderbuffer = !depth
        ? null
        : (0, compat_1.isWebGL2)(gl)
            ? resources.renderbuffer('depth32f', 'depth', _width, _height)
            : resources.renderbuffer('depth16', 'depth', _width, _height);
    function init() {
        targetTexture.define(_width, _height);
        targetTexture.attachFramebuffer(framebuffer, 'color0');
        if (depthRenderbuffer)
            depthRenderbuffer.attachFramebuffer(framebuffer);
    }
    init();
    let destroyed = false;
    return {
        id: getNextRenderTargetId(),
        texture: targetTexture,
        framebuffer,
        depthRenderbuffer,
        getWidth: () => _width,
        getHeight: () => _height,
        bind: () => {
            framebuffer.bind();
        },
        setSize: (width, height) => {
            if (_width === width && _height === height) {
                return;
            }
            _width = width;
            _height = height;
            targetTexture.define(_width, _height);
            if (depthRenderbuffer)
                depthRenderbuffer.setSize(_width, _height);
        },
        reset: () => {
            init();
        },
        destroy: () => {
            if (destroyed)
                return;
            targetTexture.destroy();
            framebuffer.destroy();
            if (depthRenderbuffer)
                depthRenderbuffer.destroy();
            destroyed = true;
        }
    };
}
//
function createNullRenderTarget(gl) {
    return {
        id: getNextRenderTargetId(),
        texture: (0, texture_1.createNullTexture)(gl),
        framebuffer: (0, framebuffer_1.createNullFramebuffer)(),
        depthRenderbuffer: null,
        getWidth: () => 0,
        getHeight: () => 0,
        bind: () => {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        },
        setSize: () => { },
        reset: () => { },
        destroy: () => { }
    };
}
