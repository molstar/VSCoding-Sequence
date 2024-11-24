/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const points_vert = "\nprecision highp float;\nprecision highp int;\n\n#include common\n#include read_from_texture\n#include common_vert_params\n#include color_vert_params\n#include size_vert_params\n#include common_clip\n\nuniform float uPixelRatio;\nuniform vec4 uViewport;\n\nattribute vec3 aPosition;\nattribute mat4 aTransform;\nattribute float aInstance;\nattribute float aGroup;\n\nvoid main(){\n    #include assign_group\n    #include assign_color_varying\n    #include assign_marker_varying\n    #include assign_clipping_varying\n    #include assign_position\n    #include assign_size\n\n    #ifdef dPointSizeAttenuation\n        gl_PointSize = size * uPixelRatio * ((uViewport.w / 2.0) / -mvPosition.z) * 5.0;\n    #else\n        gl_PointSize = size * uPixelRatio;\n    #endif\n    gl_PointSize = max(1.0, gl_PointSize);\n\n    gl_Position = uProjection * mvPosition;\n\n    #include clip_instance\n}\n";
