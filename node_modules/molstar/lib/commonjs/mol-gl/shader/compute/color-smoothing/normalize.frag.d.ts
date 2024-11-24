/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const normalize_frag = "\nprecision highp float;\nprecision highp sampler2D;\n\nuniform sampler2D tColor;\nuniform sampler2D tCount;\nuniform vec2 uTexSize;\n\nvoid main(void) {\n    vec2 coords = gl_FragCoord.xy / uTexSize;\n    vec4 color = texture2D(tColor, coords);\n    float count = texture2D(tCount, coords).r;\n\n    gl_FragColor = color / count;\n}\n";
