/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { idFactory } from '../../mol-util/id-factory';
import { isWebGL2 } from './compat';
import { checkFramebufferStatus } from './framebuffer';
import { isDebugMode } from '../../mol-util/debug';
const getNextRenderbufferId = idFactory();
export function getFormat(gl, format) {
    switch (format) {
        case 'depth16': return gl.DEPTH_COMPONENT16;
        case 'stencil8': return gl.STENCIL_INDEX8;
        case 'rgba4': return gl.RGBA4;
        case 'depth-stencil': return gl.DEPTH_STENCIL;
        case 'depth24':
            if (isWebGL2(gl))
                return gl.DEPTH_COMPONENT24;
            else
                throw new Error('WebGL2 needed for `depth24` renderbuffer format');
        case 'depth32f':
            if (isWebGL2(gl))
                return gl.DEPTH_COMPONENT32F;
            else
                throw new Error('WebGL2 needed for `depth32f` renderbuffer format');
        case 'depth24-stencil8':
            if (isWebGL2(gl))
                return gl.DEPTH24_STENCIL8;
            else
                throw new Error('WebGL2 needed for `depth24-stencil8` renderbuffer format');
        case 'depth32f-stencil8':
            if (isWebGL2(gl))
                return gl.DEPTH32F_STENCIL8;
            else
                throw new Error('WebGL2 needed for `depth32f-stencil8` renderbuffer format');
    }
}
export function getAttachment(gl, attachment) {
    switch (attachment) {
        case 'depth': return gl.DEPTH_ATTACHMENT;
        case 'stencil': return gl.STENCIL_ATTACHMENT;
        case 'depth-stencil': return gl.DEPTH_STENCIL_ATTACHMENT;
        case 'color0': return gl.COLOR_ATTACHMENT0;
    }
}
function getRenderbuffer(gl) {
    const renderbuffer = gl.createRenderbuffer();
    if (renderbuffer === null) {
        throw new Error('Could not create WebGL renderbuffer');
    }
    return renderbuffer;
}
export function createRenderbuffer(gl, format, attachment, _width, _height) {
    let _renderbuffer = getRenderbuffer(gl);
    const bind = () => gl.bindRenderbuffer(gl.RENDERBUFFER, _renderbuffer);
    const _format = getFormat(gl, format);
    const _attachment = getAttachment(gl, attachment);
    function init() {
        bind();
        gl.renderbufferStorage(gl.RENDERBUFFER, _format, _width, _height);
    }
    init();
    let destroyed = false;
    return {
        id: getNextRenderbufferId(),
        bind,
        attachFramebuffer: (framebuffer) => {
            framebuffer.bind();
            bind();
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, _attachment, gl.RENDERBUFFER, _renderbuffer);
            if (isDebugMode)
                checkFramebufferStatus(gl);
        },
        detachFramebuffer: (framebuffer) => {
            framebuffer.bind();
            bind();
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, _attachment, gl.RENDERBUFFER, null);
            if (isDebugMode)
                checkFramebufferStatus(gl);
        },
        setSize: (width, height) => {
            _width = width;
            _height = height;
            init();
        },
        reset: () => {
            _renderbuffer = getRenderbuffer(gl);
            init();
        },
        destroy: () => {
            if (destroyed)
                return;
            gl.deleteRenderbuffer(_renderbuffer);
            destroyed = true;
        }
    };
}
