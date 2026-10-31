/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const read_from_texture = "\nvec4 readFromTexture(const in sampler2D tex, const in float i, const in vec2 dim) {\n    float x = intMod(i, dim.x);\n    float y = floor(intDiv(i, dim.x));\n    vec2 uv = (vec2(x, y) + 0.5) / dim;\n    return texture2D(tex, uv);\n}\n\nvec4 readFromTexture(const in sampler2D tex, const in int i, const in vec2 dim) {\n    int x = imod(i, int(dim.x));\n    int y = i / int(dim.x);\n    vec2 uv = (vec2(x, y) + 0.5) / dim;\n    return texture2D(tex, uv);\n}\n";
