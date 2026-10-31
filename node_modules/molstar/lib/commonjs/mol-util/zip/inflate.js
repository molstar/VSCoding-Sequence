"use strict";
/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * ported from https://github.com/photopea/UZIP.js/blob/master/UZIP.js
 * MIT License, Copyright (c) 2018 Photopea
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._inflate = _inflate;
const util_1 = require("./util");
function InflateContext(data, buf) {
    const noBuf = buf === undefined;
    if (buf === undefined)
        buf = new Uint8Array((data.length >>> 2) << 3);
    return {
        data,
        buf,
        noBuf,
        BFINAL: 0,
        off: 0,
        pos: 0
    };
}
function inflateBlocks(ctx, count) {
    const { data, noBuf } = ctx;
    let { buf, BFINAL, off, pos } = ctx;
    let iBlock = 0;
    while (BFINAL === 0 && iBlock < count) {
        let lmap, dmap;
        let ML = 0, MD = 0;
        BFINAL = _bitsF(data, pos, 1);
        iBlock += 1;
        const BTYPE = _bitsF(data, pos + 1, 2);
        pos += 3;
        if (BTYPE === 0) {
            // uncompressed block
            if ((pos & 7) !== 0)
                pos += 8 - (pos & 7);
            const p8 = (pos >>> 3) + 4;
            const len = data[p8 - 4] | (data[p8 - 3] << 8);
            if (noBuf)
                buf = _check(buf, off + len);
            buf.set(new Uint8Array(data.buffer, data.byteOffset + p8, len), off);
            pos = ((p8 + len) << 3);
            off += len;
            continue;
        }
        // grow output buffer if not provided
        if (noBuf)
            buf = _check(buf, off + (1 << 17));
        if (BTYPE === 1) {
            // block compressed with fixed Huffman codes
            lmap = util_1.U.flmap;
            dmap = util_1.U.fdmap;
            ML = (1 << 9) - 1;
            MD = (1 << 5) - 1;
        }
        else if (BTYPE === 2) {
            // block compressed with dynamic Huffman codes
            const HLIT = _bitsE(data, pos, 5) + 257;
            const HDIST = _bitsE(data, pos + 5, 5) + 1;
            const HCLEN = _bitsE(data, pos + 10, 4) + 4;
            pos += 14;
            for (let i = 0; i < 38; i += 2) {
                util_1.U.itree[i] = 0;
                util_1.U.itree[i + 1] = 0;
            }
            let tl = 1;
            for (let i = 0; i < HCLEN; i++) {
                const l = _bitsE(data, pos + i * 3, 3);
                util_1.U.itree[(util_1.U.ordr[i] << 1) + 1] = l;
                if (l > tl)
                    tl = l;
            }
            pos += 3 * HCLEN;
            (0, util_1.makeCodes)(util_1.U.itree, tl);
            (0, util_1.codes2map)(util_1.U.itree, tl, util_1.U.imap);
            lmap = util_1.U.lmap;
            dmap = util_1.U.dmap;
            pos = _decodeTiny(util_1.U.imap, (1 << tl) - 1, HLIT + HDIST, data, pos, util_1.U.ttree);
            const mx0 = _copyOut(util_1.U.ttree, 0, HLIT, util_1.U.ltree);
            ML = (1 << mx0) - 1;
            const mx1 = _copyOut(util_1.U.ttree, HLIT, HDIST, util_1.U.dtree);
            MD = (1 << mx1) - 1;
            (0, util_1.makeCodes)(util_1.U.ltree, mx0);
            (0, util_1.codes2map)(util_1.U.ltree, mx0, lmap);
            (0, util_1.makeCodes)(util_1.U.dtree, mx1);
            (0, util_1.codes2map)(util_1.U.dtree, mx1, dmap);
        }
        else {
            throw new Error(`unknown BTYPE ${BTYPE}`);
        }
        while (true) {
            const code = lmap[_get17(data, pos) & ML];
            pos += code & 15;
            const lit = code >>> 4;
            if ((lit >>> 8) === 0) {
                buf[off++] = lit;
            }
            else if (lit === 256) {
                break;
            }
            else {
                let end = off + lit - 254;
                if (lit > 264) {
                    const ebs = util_1.U.ldef[lit - 257];
                    end = off + (ebs >>> 3) + _bitsE(data, pos, ebs & 7);
                    pos += ebs & 7;
                }
                const dcode = dmap[_get17(data, pos) & MD];
                pos += dcode & 15;
                const dlit = dcode >>> 4;
                const dbs = util_1.U.ddef[dlit];
                const dst = (dbs >>> 4) + _bitsF(data, pos, dbs & 15);
                pos += dbs & 15;
                if (noBuf)
                    buf = _check(buf, off + (1 << 17));
                while (off < end) {
                    buf[off] = buf[off++ - dst];
                    buf[off] = buf[off++ - dst];
                    buf[off] = buf[off++ - dst];
                    buf[off] = buf[off++ - dst];
                }
                off = end;
            }
        }
    }
    ctx.buf = buf;
    ctx.BFINAL = BFINAL;
    ctx.off = off;
    ctx.pos = pos;
}
// inflating a 44 MB gzip file to 225 MB.
// Using JS
// inflate: 570.8759765625 ms
// inflate: 562.950927734375 ms
// inflate: 595.06591796875 ms
// inflate: 584.8740234375 ms
// inflate: 583.31396484375 ms
// Using DecompressionStream
// inflate: 502.001953125 ms
// inflate: 476.818115234375 ms
// inflate: 476.68701171875 ms
// inflate: 422.319091796875 ms
// inflate: 428.925048828125 ms
// https://tools.ietf.org/html/rfc1951
async function _inflate(runtime, data, buf) {
    if (data[0] === 3 && data[1] === 0)
        return (buf ? buf : new Uint8Array(0));
    if ((0, util_1.checkCompressionStreamSupport)('deflate-raw')) {
        const ds = new DecompressionStream('deflate-raw');
        const blob = new Blob([data]);
        const decompressedStream = blob.stream().pipeThrough(ds);
        let offset = 0;
        const chunks = [];
        const reader = decompressedStream.getReader();
        const readChunk = async () => {
            const { done, value } = await reader.read();
            if (done)
                return;
            if (runtime.shouldUpdate) {
                await runtime.update({ message: 'Inflating blocks...', current: offset, max: buf === null || buf === void 0 ? void 0 : buf.length });
            }
            if (buf) {
                buf.set(value, offset);
            }
            else {
                chunks.push(value);
            }
            offset += value.length;
            return readChunk();
        };
        await readChunk();
        if (!buf) {
            buf = new Uint8Array(offset);
            for (let i = 0, j = 0; i < chunks.length; i++) {
                buf.set(chunks[i], j);
                j += chunks[i].length;
            }
        }
        return buf;
    }
    const ctx = InflateContext(data, buf);
    while (ctx.BFINAL === 0) {
        if (runtime.shouldUpdate) {
            await runtime.update({ message: 'Inflating blocks...', current: ctx.pos, max: data.length });
        }
        inflateBlocks(ctx, 100);
    }
    return ctx.buf.length === ctx.off ? ctx.buf : ctx.buf.slice(0, ctx.off);
}
function _check(buf, len) {
    const bl = buf.length;
    if (len <= bl)
        return buf;
    const nbuf = new Uint8Array(Math.max(bl << 1, len));
    nbuf.set(buf, 0);
    return nbuf;
}
function _decodeTiny(lmap, LL, len, data, pos, tree) {
    let i = 0;
    while (i < len) {
        const code = lmap[_get17(data, pos) & LL];
        pos += code & 15;
        const lit = code >>> 4;
        if (lit <= 15) {
            tree[i] = lit;
            i++;
        }
        else {
            let ll = 0, n = 0;
            if (lit === 16) {
                n = (3 + _bitsE(data, pos, 2));
                pos += 2;
                ll = tree[i - 1];
            }
            else if (lit === 17) {
                n = (3 + _bitsE(data, pos, 3));
                pos += 3;
            }
            else if (lit === 18) {
                n = (11 + _bitsE(data, pos, 7));
                pos += 7;
            }
            const ni = i + n;
            while (i < ni) {
                tree[i] = ll;
                i++;
            }
        }
    }
    return pos;
}
function _copyOut(src, off, len, tree) {
    let mx = 0, i = 0;
    const tl = tree.length >>> 1;
    while (i < len) {
        const v = src[i + off];
        tree[(i << 1)] = 0;
        tree[(i << 1) + 1] = v;
        if (v > mx)
            mx = v;
        i++;
    }
    while (i < tl) {
        tree[(i << 1)] = 0;
        tree[(i << 1) + 1] = 0;
        i++;
    }
    return mx;
}
function _bitsE(dt, pos, length) {
    return ((dt[pos >>> 3] | (dt[(pos >>> 3) + 1] << 8)) >>> (pos & 7)) & ((1 << length) - 1);
}
function _bitsF(dt, pos, length) {
    return ((dt[pos >>> 3] | (dt[(pos >>> 3) + 1] << 8) | (dt[(pos >>> 3) + 2] << 16)) >>> (pos & 7)) & ((1 << length) - 1);
}
function _get17(dt, pos) {
    return (dt[pos >>> 3] | (dt[(pos >>> 3) + 1] << 8) | (dt[(pos >>> 3) + 2] << 16)) >>> (pos & 7);
}
