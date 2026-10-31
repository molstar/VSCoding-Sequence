/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const sum_frag = "\nprecision highp float;\nprecision highp int;\n\n#if __VERSION__ == 100\n    precision highp sampler2D;\n    uniform sampler2D tTexture;\n#else\n    precision highp isampler2D;\n    uniform isampler2D tTexture;\n#endif\n\nvoid main(void) {\n    #if __VERSION__ == 100\n        gl_FragColor = texture2D(tTexture, vec2(0.5));\n    #else\n        gl_FragColor = ivec4(texture2D(tTexture, vec2(0.5)).r);\n    #endif\n}\n";
