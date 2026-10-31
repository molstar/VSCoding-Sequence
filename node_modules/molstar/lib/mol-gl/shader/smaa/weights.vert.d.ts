/**
 * Slightly adapted from https://github.com/mrdoob/three.js
 * MIT License Copyright (c) 2010-2020 three.js authors
 *
 * WebGL port of Subpixel Morphological Antialiasing (SMAA) v2.8
 * Preset: SMAA 1x Medium (with color edge detection)
 * https://github.com/iryoku/smaa/releases/tag/v2.8
 */
export declare const weights_vert = "\nprecision highp float;\n\nattribute vec2 aPosition;\nuniform vec2 uQuadScale;\n\nuniform vec2 uTexSizeInv;\nuniform vec4 uViewport;\n\nvarying vec2 vUv;\nvarying vec4 vOffset[3];\nvarying vec2 vPixCoord;\n\nvoid SMAABlendingWeightCalculationVS(vec2 texCoord) {\n    vPixCoord = texCoord / uTexSizeInv;\n\n    // We will use these offsets for the searches later on (see @PSEUDO_GATHER4):\n    vOffset[0] = texCoord.xyxy + uTexSizeInv.xyxy * vec4(-0.25, 0.125, 1.25, 0.125); // WebGL port note: Changed sign in Y and W components\n    vOffset[1] = texCoord.xyxy + uTexSizeInv.xyxy * vec4(-0.125, 0.25, -0.125, -1.25); // WebGL port note: Changed sign in Y and W components\n\n    // And these for the searches, they indicate the ends of the loops:\n    vOffset[2] = vec4(vOffset[0].xz, vOffset[1].yw) + vec4(-2.0, 2.0, -2.0, 2.0) * uTexSizeInv.xxyy * float(dMaxSearchSteps);\n}\n\nvoid main() {\n    vec2 scale = uViewport.zw * uTexSizeInv;\n    vec2 shift = uViewport.xy * uTexSizeInv;\n    vUv = (aPosition + 1.0) * 0.5 * scale + shift;\n    SMAABlendingWeightCalculationVS(vUv);\n    vec2 position = aPosition * uQuadScale - vec2(1.0, 1.0) + uQuadScale;\n    gl_Position = vec4(position, 0.0, 1.0);\n}\n";
