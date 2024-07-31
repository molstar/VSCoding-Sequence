/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Michael Krone <michael.krone@uni-tuebingen.de>
 */
export declare const directVolume_vert = "\nprecision highp float;\n\nattribute vec3 aPosition;\nattribute mat4 aTransform;\nattribute float aInstance;\n\nuniform mat4 uModelView;\nuniform mat4 uProjection;\nuniform vec4 uInvariantBoundingSphere;\n\nvarying vec3 vOrigPos;\nvarying float vInstance;\nvarying vec4 vBoundingSphere;\nvarying mat4 vTransform;\n\nuniform vec3 uBboxSize;\nuniform vec3 uBboxMin;\nuniform vec3 uBboxMax;\nuniform vec3 uGridDim;\nuniform mat4 uTransform;\n\nuniform mat4 uUnitToCartn;\n\nvoid main() {\n    vec4 unitCoord = vec4(aPosition + vec3(0.5), 1.0);\n    vec4 mvPosition = uModelView * aTransform * uUnitToCartn * unitCoord;\n\n    vOrigPos = (aTransform * uUnitToCartn * unitCoord).xyz;\n    vInstance = aInstance;\n    vBoundingSphere = vec4(\n        (aTransform * vec4(uInvariantBoundingSphere.xyz, 1.0)).xyz,\n        uInvariantBoundingSphere.w\n    );\n    vTransform = aTransform;\n\n    gl_Position = uProjection * mvPosition;\n\n    // move z position to near clip plane (but not too close to get precision issues)\n    gl_Position.z = gl_Position.w - 0.01;\n}\n";
