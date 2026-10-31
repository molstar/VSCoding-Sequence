/**
 * Slightly adapted from https://github.com/mrdoob/three.js
 * MIT License Copyright (c) 2010-2020 three.js authors
 *
 * WebGL port of Subpixel Morphological Antialiasing (SMAA) v2.8
 * Preset: SMAA 1x Medium (with color edge detection)
 * https://github.com/iryoku/smaa/releases/tag/v2.8
 */
export declare const edges_vert = "\nprecision highp float;\n\nattribute vec2 aPosition;\nuniform vec2 uQuadScale;\n\nuniform vec2 uTexSizeInv;\nuniform vec4 uViewport;\n\nvarying vec2 vUv;\nvarying vec4 vOffset[3];\n\nvoid SMAAEdgeDetectionVS(vec2 texCoord) {\n    vOffset[0] = texCoord.xyxy + uTexSizeInv.xyxy * vec4(-1.0, 0.0, 0.0, 1.0); // WebGL port note: Changed sign in W component\n    vOffset[1] = texCoord.xyxy + uTexSizeInv.xyxy * vec4(1.0, 0.0, 0.0, -1.0); // WebGL port note: Changed sign in W component\n    vOffset[2] = texCoord.xyxy + uTexSizeInv.xyxy * vec4(-2.0, 0.0, 0.0, 2.0); // WebGL port note: Changed sign in W component\n}\n\nvoid main() {\n    vec2 scale = uViewport.zw * uTexSizeInv;\n    vec2 shift = uViewport.xy * uTexSizeInv;\n    vUv = (aPosition + 1.0) * 0.5 * scale + shift;\n    SMAAEdgeDetectionVS(vUv);\n    vec2 position = aPosition * uQuadScale - vec2(1.0, 1.0) + uQuadScale;\n    gl_Position = vec4(position, 0.0, 1.0);\n}\n";
