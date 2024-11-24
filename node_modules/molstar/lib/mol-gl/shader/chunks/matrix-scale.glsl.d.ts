/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const matrix_scale = "\nfloat matrixScale(in mat4 m){\n    vec4 r = m[0];\n    return sqrt(r[0] * r[0] + r[1] * r[1] + r[2] * r[2]);\n}\n";
