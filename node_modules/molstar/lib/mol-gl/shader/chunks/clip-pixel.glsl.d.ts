export declare const clip_pixel = "\n#if defined(dClipVariant_pixel) && dClipObjectCount != 0\n    if (clipTest(vec4(vModelPosition, 0.0)))\n        discard;\n#endif\n";
