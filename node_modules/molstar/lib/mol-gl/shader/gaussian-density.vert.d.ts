/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Michael Krone <michael.krone@uni-tuebingen.de>
 */
export declare const gaussianDensity_vert = "\nprecision highp float;\n\nattribute vec3 aPosition;\nattribute float aRadius;\n\nvarying vec3 vPosition;\nvarying float vRadiusSqInv;\n\n#if defined(dCalcType_groupId)\n    attribute float aGroup;\n    varying float vGroup;\n#endif\n\nuniform vec3 uBboxSize;\nuniform vec3 uBboxMin;\nuniform float uResolution;\n\nvoid main() {\n    vRadiusSqInv = 1.0 / (aRadius * aRadius);\n    #if defined(dCalcType_groupId)\n        vGroup = aGroup;\n    #endif\n    gl_PointSize = ceil(((aRadius * 3.0) / uResolution) + uResolution);\n    vPosition = (aPosition - uBboxMin) / uResolution;\n    gl_Position = vec4(((aPosition - uBboxMin) / uBboxSize) * 2.0 - 1.0, 1.0);\n}\n";
