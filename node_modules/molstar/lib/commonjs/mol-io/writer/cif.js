"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CifWriter = void 0;
const tslib_1 = require("tslib");
const text_1 = require("./cif/encoder/text");
const binary_1 = require("./cif/encoder/binary");
const _Encoder = tslib_1.__importStar(require("./cif/encoder"));
const binary_cif_1 = require("../common/binary-cif");
var CifWriter;
(function (CifWriter) {
    CifWriter.Encoder = _Encoder.Encoder;
    CifWriter.Category = _Encoder.Category;
    CifWriter.Field = _Encoder.Field;
    CifWriter.Encoding = binary_cif_1.ArrayEncoding;
    function createEncoder(params) {
        const { binary = false, encoderName = 'mol*' } = params || {};
        return binary ? new binary_1.BinaryEncoder(encoderName, params ? params.binaryEncodingPovider : void 0, params ? !!params.binaryAutoClassifyEncoding : false) : new text_1.TextEncoder();
    }
    CifWriter.createEncoder = createEncoder;
    function fields() {
        return CifWriter.Field.build();
    }
    CifWriter.fields = fields;
    var E = CifWriter.Encoding;
    CifWriter.Encodings = {
        deltaRLE: E.by(E.delta).and(E.runLength).and(E.integerPacking),
        fixedPoint2: E.by(E.fixedPoint(100)).and(E.delta).and(E.integerPacking),
        fixedPoint3: E.by(E.fixedPoint(1000)).and(E.delta).and(E.integerPacking),
    };
    function categoryInstance(fields, source) {
        return { fields, source: [source] };
    }
    CifWriter.categoryInstance = categoryInstance;
    function createEncodingProviderFromCifFrame(frame) {
        return {
            get(c, f) {
                const cat = frame.categories[c];
                if (!cat)
                    return void 0;
                const ff = cat.getField(f);
                return ff && ff.binaryEncoding ? binary_cif_1.ArrayEncoder.fromEncoding(ff.binaryEncoding) : void 0;
            }
        };
    }
    CifWriter.createEncodingProviderFromCifFrame = createEncodingProviderFromCifFrame;
    ;
    function createEncodingProviderFromJsonConfig(hints) {
        return {
            get(c, f) {
                for (let i = 0; i < hints.length; i++) {
                    const hint = hints[i];
                    if (hint.categoryName === c && hint.columnName === f) {
                        return resolveEncoding(hint);
                    }
                }
            }
        };
    }
    CifWriter.createEncodingProviderFromJsonConfig = createEncodingProviderFromJsonConfig;
    function resolveEncoding(hint) {
        const precision = hint.precision;
        if (precision !== void 0) {
            const multiplier = Math.pow(10, precision);
            const fixedPoint = E.by(E.fixedPoint(multiplier));
            switch (hint.encoding) {
                case 'pack':
                    return fixedPoint.and(E.integerPacking);
                case 'rle':
                    return fixedPoint.and(E.runLength).and(E.integerPacking);
                case 'delta':
                    return fixedPoint.and(E.delta).and(E.integerPacking);
                case 'delta-rle':
                    return fixedPoint.and(E.delta).and(E.runLength).and(E.integerPacking);
            }
            ;
        }
        else {
            switch (hint.encoding) {
                case 'pack':
                    return E.by(E.integerPacking);
                case 'rle':
                    return E.by(E.runLength).and(E.integerPacking);
                case 'delta':
                    return E.by(E.delta).and(E.integerPacking);
                case 'delta-rle':
                    return E.by(E.delta).and(E.runLength).and(E.integerPacking);
            }
        }
        throw new Error('cannot be reached');
    }
})(CifWriter || (exports.CifWriter = CifWriter = {}));
