"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFramebufferStatus = checkFramebufferStatus;
exports.createFramebuffer = createFramebuffer;
exports.createNullFramebuffer = createNullFramebuffer;
const id_factory_1 = require("../../mol-util/id-factory");
const compat_1 = require("./compat");
const getNextFramebufferId = (0, id_factory_1.idFactory)();
function getFramebufferStatusDescription(gl, status) {
    switch (status) {
        case gl.FRAMEBUFFER_COMPLETE: return 'complete';
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT: return 'incomplete attachment';
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: return 'incomplete missing attachment';
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS: return 'incomplete dimensions';
        case gl.FRAMEBUFFER_UNSUPPORTED: return 'unsupported';
    }
    if ((0, compat_1.isWebGL2)(gl)) {
        switch (status) {
            case gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: return 'incomplete multisample';
            case gl.RENDERBUFFER_SAMPLES: return 'renderbuffer samples';
        }
    }
    return 'unknown error';
}
function checkFramebufferStatus(gl) {
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        const description = getFramebufferStatusDescription(gl, status);
        throw new Error(`Framebuffer status: ${description}`);
    }
}
function getFramebuffer(gl) {
    const framebuffer = gl.createFramebuffer();
    if (framebuffer === null) {
        throw new Error('Could not create WebGL framebuffer');
    }
    return framebuffer;
}
function createFramebuffer(gl) {
    let _framebuffer = getFramebuffer(gl);
    let destroyed = false;
    return {
        id: getNextFramebufferId(),
        bind: () => gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer),
        reset: () => {
            _framebuffer = getFramebuffer(gl);
        },
        destroy: () => {
            if (destroyed)
                return;
            gl.deleteFramebuffer(_framebuffer);
            destroyed = true;
        }
    };
}
//
function createNullFramebuffer() {
    return {
        id: getNextFramebufferId(),
        bind: () => { },
        reset: () => { },
        destroy: () => { }
    };
}
