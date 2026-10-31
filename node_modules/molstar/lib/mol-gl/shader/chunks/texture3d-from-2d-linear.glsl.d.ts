/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Michael Krone <michael.krone@uni-tuebingen.de>
 */
export declare const texture3d_from_2d_linear = "\nvec4 texture3dFrom2dLinear(sampler2D tex, vec3 pos, vec3 gridDim, vec2 texDim) {\n    float zSlice0 = floor(pos.z * gridDim.z);\n    float column0 = intMod(zSlice0 * gridDim.x, texDim.x) / gridDim.x;\n    float row0 = floor(intDiv(zSlice0 * gridDim.x, texDim.x));\n    vec2 coord0 = (vec2(column0 * gridDim.x, row0 * gridDim.y) + (pos.xy * gridDim.xy)) / texDim;\n    vec4 color0 = texture2D(tex, coord0);\n\n    float zSlice1 = zSlice0 + 1.0;\n    float column1 = intMod(zSlice1 * gridDim.x, texDim.x) / gridDim.x;\n    float row1 = floor(intDiv(zSlice1 * gridDim.x, texDim.x));\n    vec2 coord1 = (vec2(column1 * gridDim.x, row1 * gridDim.y) + (pos.xy * gridDim.xy)) / texDim;\n    vec4 color1 = texture2D(tex, coord1);\n\n    float delta0 = abs((pos.z * gridDim.z) - zSlice0);\n    return mix(color0, color1, delta0);\n}\n";
