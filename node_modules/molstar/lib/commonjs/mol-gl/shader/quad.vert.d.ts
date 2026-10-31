/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const quad_vert = "\nprecision highp float;\n\nattribute vec2 aPosition;\nuniform vec2 uQuadScale;\n\nvoid main(void) {\n    vec2 position = aPosition * uQuadScale - vec2(1.0, 1.0) + uQuadScale;\n    gl_Position = vec4(position, 0.0, 1.0);\n}\n";
