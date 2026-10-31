/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Michael Krone <michael.krone@uni-tuebingen.de>
 */
export declare const texture3d_from_2d_nearest = "\nvec4 texture3dFrom2dNearest(sampler2D tex, vec3 pos, vec3 gridDim, vec2 texDim) {\n    float zSlice = floor(pos.z * gridDim.z + 0.5); // round to nearest z-slice\n    float column = intMod(zSlice * gridDim.x, texDim.x) / gridDim.x;\n    float row = floor(intDiv(zSlice * gridDim.x, texDim.x));\n    vec2 coord = (vec2(column * gridDim.x, row * gridDim.y) + (pos.xy * gridDim.xy)) / texDim;\n    return texture2D(tex, coord);\n}\n";
