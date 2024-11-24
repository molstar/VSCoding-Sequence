/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 */
export declare const wboit_write = "\n#if defined(dRenderVariant_colorWboit)\n    if (uRenderMask == MaskOpaque) {\n        if (preFogAlpha < 1.0) {\n            discard;\n        }\n    } else if (uRenderMask == MaskTransparent) {\n        if (preFogAlpha != 1.0 && fragmentDepth < getDepth(gl_FragCoord.xy / uDrawingBufferSize)) {\n            #ifdef dTransparentBackfaces_off\n                if (interior) discard;\n            #endif\n            float alpha = gl_FragColor.a;\n            float wboitWeight = alpha * clamp(pow(1.0 - fragmentDepth, 2.0), 0.01, 1.0);\n            gl_FragColor = vec4(gl_FragColor.rgb * alpha * wboitWeight, alpha);\n            // extra alpha is to handle pre-multiplied alpha\n            #ifndef dGeometryType_directVolume\n                gl_FragData[1] = vec4((uTransparentBackground ? alpha : 1.0) * alpha * wboitWeight);\n            #else\n                gl_FragData[1] = vec4(alpha * alpha * wboitWeight);\n            #endif\n        } else {\n            discard;\n        }\n    }\n#endif\n";
