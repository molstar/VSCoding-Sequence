/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
export declare const blendBackDpoit_frag = "\n    precision highp float;\n\n    uniform sampler2D tDpoitBackColor;\n    uniform vec2 uTexSize;\n\n    void main() {\n        vec2 coords = gl_FragCoord.xy / uTexSize;\n        gl_FragColor = texture2D(tDpoitBackColor, coords);\n        if (gl_FragColor.a == 0.0) {\n            discard;\n        }\n    }\n";
