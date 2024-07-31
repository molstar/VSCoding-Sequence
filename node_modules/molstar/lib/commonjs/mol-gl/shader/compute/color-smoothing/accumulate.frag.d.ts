/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const accumulate_frag = "\nprecision highp float;\n\nvarying vec3 vPosition;\nvarying vec4 vColor;\n\nuniform float uCurrentSlice;\nuniform float uCurrentX;\nuniform float uCurrentY;\nuniform float uResolution;\n\nconst float p = 2.0;\n\nvoid main() {\n    vec2 v = gl_FragCoord.xy - vec2(uCurrentX, uCurrentY) - 0.5;\n    vec3 fragPos = vec3(v.x, v.y, uCurrentSlice);\n    float dist = distance(fragPos, vPosition);\n    if (dist > p) discard;\n\n    float f = p - dist;\n    gl_FragColor = vColor * f;\n    gl_FragData[1] = vec4(f);\n}\n";
