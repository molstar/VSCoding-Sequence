"use strict";
/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundPass = exports.BackgroundParams = void 0;
const util_1 = require("../../mol-gl/compute/util");
const renderable_1 = require("../../mol-gl/renderable");
const schema_1 = require("../../mol-gl/renderable/schema");
const shader_code_1 = require("../../mol-gl/shader-code");
const background_frag_1 = require("../../mol-gl/shader/background.frag");
const background_vert_1 = require("../../mol-gl/shader/background.vert");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const texture_1 = require("../../mol-gl/webgl/texture");
const mat4_1 = require("../../mol-math/linear-algebra/3d/mat4");
const value_cell_1 = require("../../mol-util/value-cell");
const param_definition_1 = require("../../mol-util/param-definition");
const debug_1 = require("../../mol-util/debug");
const camera_1 = require("../camera");
const vec3_1 = require("../../mol-math/linear-algebra/3d/vec3");
const vec2_1 = require("../../mol-math/linear-algebra/3d/vec2");
const color_1 = require("../../mol-util/color");
const assets_1 = require("../../mol-util/assets");
const vec4_1 = require("../../mol-math/linear-algebra/3d/vec4");
const misc_1 = require("../../mol-math/misc");
const mat3_1 = require("../../mol-math/linear-algebra/3d/mat3");
const euler_1 = require("../../mol-math/linear-algebra/3d/euler");
const SharedParams = {
    opacity: param_definition_1.ParamDefinition.Numeric(1, { min: 0.0, max: 1.0, step: 0.01 }),
    saturation: param_definition_1.ParamDefinition.Numeric(0, { min: -1, max: 1, step: 0.01 }),
    lightness: param_definition_1.ParamDefinition.Numeric(0, { min: -1, max: 1, step: 0.01 }),
};
const SkyboxParams = {
    faces: param_definition_1.ParamDefinition.MappedStatic('urls', {
        urls: param_definition_1.ParamDefinition.Group({
            nx: param_definition_1.ParamDefinition.Text('', { label: 'Negative X / Left' }),
            ny: param_definition_1.ParamDefinition.Text('', { label: 'Negative Y / Bottom' }),
            nz: param_definition_1.ParamDefinition.Text('', { label: 'Negative Z / Back' }),
            px: param_definition_1.ParamDefinition.Text('', { label: 'Positive X / Right' }),
            py: param_definition_1.ParamDefinition.Text('', { label: 'Positive Y / Top' }),
            pz: param_definition_1.ParamDefinition.Text('', { label: 'Positive Z / Front' }),
        }, { isExpanded: true, label: 'URLs' }),
        files: param_definition_1.ParamDefinition.Group({
            nx: param_definition_1.ParamDefinition.File({ label: 'Negative X / Left', accept: 'image/*' }),
            ny: param_definition_1.ParamDefinition.File({ label: 'Negative Y / Bottom', accept: 'image/*' }),
            nz: param_definition_1.ParamDefinition.File({ label: 'Negative Z / Back', accept: 'image/*' }),
            px: param_definition_1.ParamDefinition.File({ label: 'Positive X / Right', accept: 'image/*' }),
            py: param_definition_1.ParamDefinition.File({ label: 'Positive Y / Top', accept: 'image/*' }),
            pz: param_definition_1.ParamDefinition.File({ label: 'Positive Z / Front', accept: 'image/*' }),
        }, { isExpanded: true, label: 'Files' }),
    }),
    blur: param_definition_1.ParamDefinition.Numeric(0, { min: 0.0, max: 1.0, step: 0.01 }, { description: 'Note, this only works in WebGL2 or when "EXT_shader_texture_lod" is available.' }),
    rotation: param_definition_1.ParamDefinition.Group({
        x: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 360, step: 1 }, { immediateUpdate: true }),
        y: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 360, step: 1 }, { immediateUpdate: true }),
        z: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 360, step: 1 }, { immediateUpdate: true }),
    }),
    ...SharedParams,
};
const ImageParams = {
    source: param_definition_1.ParamDefinition.MappedStatic('url', {
        url: param_definition_1.ParamDefinition.Text(''),
        file: param_definition_1.ParamDefinition.File({ accept: 'image/*' }),
    }),
    blur: param_definition_1.ParamDefinition.Numeric(0, { min: 0.0, max: 1.0, step: 0.01 }, { description: 'Note, this only works in WebGL2 or with power-of-two images and when "EXT_shader_texture_lod" is available.' }),
    ...SharedParams,
    coverage: param_definition_1.ParamDefinition.Select('viewport', param_definition_1.ParamDefinition.arrayToOptions(['viewport', 'canvas'])),
};
const HorizontalGradientParams = {
    topColor: param_definition_1.ParamDefinition.Color((0, color_1.Color)(0xDDDDDD)),
    bottomColor: param_definition_1.ParamDefinition.Color((0, color_1.Color)(0xEEEEEE)),
    ratio: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0.0, max: 1.0, step: 0.01 }),
    coverage: param_definition_1.ParamDefinition.Select('viewport', param_definition_1.ParamDefinition.arrayToOptions(['viewport', 'canvas'])),
};
const RadialGradientParams = {
    centerColor: param_definition_1.ParamDefinition.Color((0, color_1.Color)(0xDDDDDD)),
    edgeColor: param_definition_1.ParamDefinition.Color((0, color_1.Color)(0xEEEEEE)),
    ratio: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0.0, max: 1.0, step: 0.01 }),
    coverage: param_definition_1.ParamDefinition.Select('viewport', param_definition_1.ParamDefinition.arrayToOptions(['viewport', 'canvas'])),
};
exports.BackgroundParams = {
    variant: param_definition_1.ParamDefinition.MappedStatic('off', {
        off: param_definition_1.ParamDefinition.EmptyGroup(),
        skybox: param_definition_1.ParamDefinition.Group(SkyboxParams, { isExpanded: true }),
        image: param_definition_1.ParamDefinition.Group(ImageParams, { isExpanded: true }),
        horizontalGradient: param_definition_1.ParamDefinition.Group(HorizontalGradientParams, { isExpanded: true }),
        radialGradient: param_definition_1.ParamDefinition.Group(RadialGradientParams, { isExpanded: true }),
    }, { label: 'Environment' }),
};
class BackgroundPass {
    constructor(webgl, assetManager, width, height) {
        this.webgl = webgl;
        this.assetManager = assetManager;
        this.camera = new camera_1.Camera();
        this.target = (0, vec3_1.Vec3)();
        this.position = (0, vec3_1.Vec3)();
        this.dir = (0, vec3_1.Vec3)();
        this.renderable = getBackgroundRenderable(webgl, width, height);
    }
    setSize(width, height) {
        const [w, h] = this.renderable.values.uTexSize.ref.value;
        if (width !== w || height !== h) {
            value_cell_1.ValueCell.update(this.renderable.values.uTexSize, vec2_1.Vec2.set(this.renderable.values.uTexSize.ref.value, width, height));
        }
    }
    clearSkybox() {
        if (this.skybox !== undefined) {
            this.skybox.texture.destroy();
            this.skybox.assets.forEach(a => this.assetManager.release(a));
            this.skybox = undefined;
        }
    }
    updateSkybox(camera, props, onload) {
        var _a;
        const tf = (_a = this.skybox) === null || _a === void 0 ? void 0 : _a.props.faces;
        const f = props.faces.params;
        if (!f.nx || !f.ny || !f.nz || !f.px || !f.py || !f.pz) {
            this.clearSkybox();
            onload === null || onload === void 0 ? void 0 : onload(false);
            return;
        }
        if (!this.skybox || !tf || !areSkyboxTexturePropsEqual(props.faces, this.skybox.props.faces)) {
            this.clearSkybox();
            const { texture, assets } = getSkyboxTexture(this.webgl, this.assetManager, props.faces, errored => {
                if (this.skybox)
                    this.skybox.loaded = !errored;
                onload === null || onload === void 0 ? void 0 : onload(true);
            });
            this.skybox = { texture, props: { ...props }, assets, loaded: false };
            value_cell_1.ValueCell.update(this.renderable.values.tSkybox, texture);
            this.renderable.update();
        }
        else {
            onload === null || onload === void 0 ? void 0 : onload(false);
        }
        if (!this.skybox)
            return;
        let cam = camera;
        if (camera.state.mode === 'orthographic') {
            this.camera.setState({ ...camera.state, mode: 'perspective' });
            this.camera.update();
            cam = this.camera;
        }
        const m = this.renderable.values.uViewDirectionProjectionInverse.ref.value;
        vec3_1.Vec3.sub(this.dir, cam.state.position, cam.state.target);
        vec3_1.Vec3.setMagnitude(this.dir, this.dir, 0.1);
        vec3_1.Vec3.copy(this.position, this.dir);
        mat4_1.Mat4.lookAt(m, this.position, this.target, cam.state.up);
        mat4_1.Mat4.mul(m, cam.projection, m);
        mat4_1.Mat4.invert(m, m);
        value_cell_1.ValueCell.update(this.renderable.values.uViewDirectionProjectionInverse, m);
        const r = this.renderable.values.uRotation.ref.value;
        mat3_1.Mat3.fromEuler(r, euler_1.Euler.create((0, misc_1.degToRad)(props.rotation.x), (0, misc_1.degToRad)(props.rotation.y), (0, misc_1.degToRad)(props.rotation.z)), 'XYZ');
        value_cell_1.ValueCell.update(this.renderable.values.uRotation, r);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uBlur, props.blur);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uOpacity, props.opacity);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uSaturation, props.saturation);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uLightness, props.lightness);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.dVariant, 'skybox');
        this.renderable.update();
    }
    clearImage() {
        if (this.image !== undefined) {
            this.image.texture.destroy();
            this.assetManager.release(this.image.asset);
            this.image = undefined;
        }
    }
    updateImage(props, onload) {
        if (!props.source.params) {
            this.clearImage();
            onload === null || onload === void 0 ? void 0 : onload(false);
            return;
        }
        if (!this.image || !this.image.props.source.params || !areImageTexturePropsEqual(props.source, this.image.props.source)) {
            this.clearImage();
            const { texture, asset } = getImageTexture(this.webgl, this.assetManager, props.source, errored => {
                if (this.image)
                    this.image.loaded = !errored;
                onload === null || onload === void 0 ? void 0 : onload(true);
            });
            this.image = { texture, props: { ...props }, asset, loaded: false };
            value_cell_1.ValueCell.update(this.renderable.values.tImage, texture);
            this.renderable.update();
        }
        else {
            onload === null || onload === void 0 ? void 0 : onload(false);
        }
        if (!this.image)
            return;
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uBlur, props.blur);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uOpacity, props.opacity);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uSaturation, props.saturation);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uLightness, props.lightness);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uViewportAdjusted, props.coverage === 'viewport' ? true : false);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.dVariant, 'image');
        this.renderable.update();
    }
    updateImageScaling() {
        var _a, _b;
        const v = this.renderable.values;
        const [w, h] = v.uTexSize.ref.value;
        const iw = ((_a = this.image) === null || _a === void 0 ? void 0 : _a.texture.getWidth()) || 0;
        const ih = ((_b = this.image) === null || _b === void 0 ? void 0 : _b.texture.getHeight()) || 0;
        const r = w / h;
        const ir = iw / ih;
        // responsive scaling with offset
        if (r < ir) {
            value_cell_1.ValueCell.update(v.uImageScale, vec2_1.Vec2.set(v.uImageScale.ref.value, iw * h / ih, h));
        }
        else {
            value_cell_1.ValueCell.update(v.uImageScale, vec2_1.Vec2.set(v.uImageScale.ref.value, w, ih * w / iw));
        }
        const [rw, rh] = v.uImageScale.ref.value;
        const sr = rw / rh;
        if (sr > r) {
            value_cell_1.ValueCell.update(v.uImageOffset, vec2_1.Vec2.set(v.uImageOffset.ref.value, (1 - r / sr) / 2, 0));
        }
        else {
            value_cell_1.ValueCell.update(v.uImageOffset, vec2_1.Vec2.set(v.uImageOffset.ref.value, 0, (1 - sr / r) / 2));
        }
    }
    updateGradient(colorA, colorB, ratio, variant, viewportAdjusted) {
        value_cell_1.ValueCell.update(this.renderable.values.uGradientColorA, color_1.Color.toVec3Normalized(this.renderable.values.uGradientColorA.ref.value, colorA));
        value_cell_1.ValueCell.update(this.renderable.values.uGradientColorB, color_1.Color.toVec3Normalized(this.renderable.values.uGradientColorB.ref.value, colorB));
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uGradientRatio, ratio);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.uViewportAdjusted, viewportAdjusted);
        value_cell_1.ValueCell.updateIfChanged(this.renderable.values.dVariant, variant);
        this.renderable.update();
    }
    update(camera, props, onload) {
        if (props.variant.name === 'off') {
            this.clearSkybox();
            this.clearImage();
            onload === null || onload === void 0 ? void 0 : onload(false);
            return;
        }
        else if (props.variant.name === 'skybox') {
            this.clearImage();
            this.updateSkybox(camera, props.variant.params, onload);
        }
        else if (props.variant.name === 'image') {
            this.clearSkybox();
            this.updateImage(props.variant.params, onload);
        }
        else if (props.variant.name === 'horizontalGradient') {
            this.clearSkybox();
            this.clearImage();
            this.updateGradient(props.variant.params.topColor, props.variant.params.bottomColor, props.variant.params.ratio, props.variant.name, props.variant.params.coverage === 'viewport' ? true : false);
            onload === null || onload === void 0 ? void 0 : onload(false);
        }
        else if (props.variant.name === 'radialGradient') {
            this.clearSkybox();
            this.clearImage();
            this.updateGradient(props.variant.params.centerColor, props.variant.params.edgeColor, props.variant.params.ratio, props.variant.name, props.variant.params.coverage === 'viewport' ? true : false);
            onload === null || onload === void 0 ? void 0 : onload(false);
        }
        const { x, y, width, height } = camera.viewport;
        value_cell_1.ValueCell.update(this.renderable.values.uViewport, vec4_1.Vec4.set(this.renderable.values.uViewport.ref.value, x, y, width, height));
    }
    isEnabled(props) {
        return !!((this.skybox && this.skybox.loaded) ||
            (this.image && this.image.loaded) ||
            props.variant.name === 'horizontalGradient' ||
            props.variant.name === 'radialGradient');
    }
    isReady() {
        return !!((this.skybox && this.skybox.loaded) ||
            (this.image && this.image.loaded) ||
            this.renderable.values.dVariant.ref.value === 'horizontalGradient' ||
            this.renderable.values.dVariant.ref.value === 'radialGradient');
    }
    render() {
        if (!this.isReady())
            return;
        if (this.renderable.values.dVariant.ref.value === 'image') {
            this.updateImageScaling();
        }
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('BackgroundPass.render');
        this.renderable.render();
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('BackgroundPass.render');
    }
    dispose() {
        this.clearSkybox();
        this.clearImage();
    }
}
exports.BackgroundPass = BackgroundPass;
//
const SkyboxName = 'background-skybox';
function getCubeAssets(assetManager, faces) {
    if (faces.name === 'urls') {
        return {
            nx: assets_1.Asset.getUrlAsset(assetManager, faces.params.nx),
            ny: assets_1.Asset.getUrlAsset(assetManager, faces.params.ny),
            nz: assets_1.Asset.getUrlAsset(assetManager, faces.params.nz),
            px: assets_1.Asset.getUrlAsset(assetManager, faces.params.px),
            py: assets_1.Asset.getUrlAsset(assetManager, faces.params.py),
            pz: assets_1.Asset.getUrlAsset(assetManager, faces.params.pz),
        };
    }
    else {
        return {
            nx: faces.params.nx,
            ny: faces.params.ny,
            nz: faces.params.nz,
            px: faces.params.px,
            py: faces.params.py,
            pz: faces.params.pz,
        };
    }
}
function getCubeFaces(assetManager, cubeAssets) {
    const resolve = (asset) => {
        return assetManager.resolve(asset, 'binary').run().then(a => new Blob([a.data]));
    };
    return {
        nx: resolve(cubeAssets.nx),
        ny: resolve(cubeAssets.ny),
        nz: resolve(cubeAssets.nz),
        px: resolve(cubeAssets.px),
        py: resolve(cubeAssets.py),
        pz: resolve(cubeAssets.pz),
    };
}
function getSkyboxHash(faces) {
    var _a, _b, _c, _d, _e, _f;
    if (faces.name === 'urls') {
        return `${SkyboxName}_${faces.params.nx}|${faces.params.ny}|${faces.params.nz}|${faces.params.px}|${faces.params.py}|${faces.params.pz}`;
    }
    else {
        return `${SkyboxName}_${(_a = faces.params.nx) === null || _a === void 0 ? void 0 : _a.id}|${(_b = faces.params.ny) === null || _b === void 0 ? void 0 : _b.id}|${(_c = faces.params.nz) === null || _c === void 0 ? void 0 : _c.id}|${(_d = faces.params.px) === null || _d === void 0 ? void 0 : _d.id}|${(_e = faces.params.py) === null || _e === void 0 ? void 0 : _e.id}|${(_f = faces.params.pz) === null || _f === void 0 ? void 0 : _f.id}`;
    }
}
function areSkyboxTexturePropsEqual(facesA, facesB) {
    return getSkyboxHash(facesA) === getSkyboxHash(facesB);
}
function getSkyboxTexture(ctx, assetManager, faces, onload) {
    const cubeAssets = getCubeAssets(assetManager, faces);
    const cubeFaces = getCubeFaces(assetManager, cubeAssets);
    const assets = [cubeAssets.nx, cubeAssets.ny, cubeAssets.nz, cubeAssets.px, cubeAssets.py, cubeAssets.pz];
    if (typeof HTMLImageElement === 'undefined') {
        console.error(`Missing "HTMLImageElement" required for background skybox`);
        onload === null || onload === void 0 ? void 0 : onload(true);
        return { texture: (0, texture_1.createNullTexture)(), assets };
    }
    const texture = ctx.resources.cubeTexture(cubeFaces, true, onload);
    return { texture, assets };
}
//
const ImageName = 'background-image';
function getImageHash(source) {
    var _a;
    if (source.name === 'url') {
        return `${ImageName}_${source.params}`;
    }
    else {
        return `${ImageName}_${(_a = source.params) === null || _a === void 0 ? void 0 : _a.id}`;
    }
}
function areImageTexturePropsEqual(sourceA, sourceB) {
    return getImageHash(sourceA) === getImageHash(sourceB);
}
function getImageTexture(ctx, assetManager, source, onload) {
    const asset = source.name === 'url'
        ? assets_1.Asset.getUrlAsset(assetManager, source.params)
        : source.params;
    if (typeof HTMLImageElement === 'undefined') {
        console.error(`Missing "HTMLImageElement" required for background image`);
        onload === null || onload === void 0 ? void 0 : onload(true);
        return { texture: (0, texture_1.createNullTexture)(), asset };
    }
    const texture = ctx.resources.texture('image-uint8', 'rgba', 'ubyte', 'linear');
    const img = new Image();
    img.onload = () => {
        texture.load(img);
        if (ctx.isWebGL2 || ((0, misc_1.isPowerOfTwo)(img.width) && (0, misc_1.isPowerOfTwo)(img.height))) {
            texture.mipmap();
        }
        onload === null || onload === void 0 ? void 0 : onload();
    };
    img.onerror = () => {
        onload === null || onload === void 0 ? void 0 : onload(true);
    };
    assetManager.resolve(asset, 'binary').run().then(a => {
        const blob = new Blob([a.data]);
        img.src = URL.createObjectURL(blob);
    });
    return { texture, asset };
}
//
const BackgroundSchema = {
    drawCount: (0, schema_1.ValueSpec)('number'),
    instanceCount: (0, schema_1.ValueSpec)('number'),
    aPosition: (0, schema_1.AttributeSpec)('float32', 2, 0),
    tSkybox: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    tImage: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'linear'),
    uImageScale: (0, schema_1.UniformSpec)('v2'),
    uImageOffset: (0, schema_1.UniformSpec)('v2'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
    uViewport: (0, schema_1.UniformSpec)('v4'),
    uViewportAdjusted: (0, schema_1.UniformSpec)('b'),
    uViewDirectionProjectionInverse: (0, schema_1.UniformSpec)('m4'),
    uGradientColorA: (0, schema_1.UniformSpec)('v3'),
    uGradientColorB: (0, schema_1.UniformSpec)('v3'),
    uGradientRatio: (0, schema_1.UniformSpec)('f'),
    uBlur: (0, schema_1.UniformSpec)('f'),
    uOpacity: (0, schema_1.UniformSpec)('f'),
    uSaturation: (0, schema_1.UniformSpec)('f'),
    uLightness: (0, schema_1.UniformSpec)('f'),
    uRotation: (0, schema_1.UniformSpec)('m3'),
    dVariant: (0, schema_1.DefineSpec)('string', ['skybox', 'image', 'verticalGradient', 'horizontalGradient', 'radialGradient']),
};
const SkyboxShaderCode = (0, shader_code_1.ShaderCode)('background', background_vert_1.background_vert, background_frag_1.background_frag, {
    shaderTextureLod: 'optional'
});
function getBackgroundRenderable(ctx, width, height) {
    const values = {
        drawCount: value_cell_1.ValueCell.create(6),
        instanceCount: value_cell_1.ValueCell.create(1),
        aPosition: value_cell_1.ValueCell.create(util_1.QuadPositions),
        tSkybox: value_cell_1.ValueCell.create((0, texture_1.createNullTexture)()),
        tImage: value_cell_1.ValueCell.create((0, texture_1.createNullTexture)()),
        uImageScale: value_cell_1.ValueCell.create((0, vec2_1.Vec2)()),
        uImageOffset: value_cell_1.ValueCell.create((0, vec2_1.Vec2)()),
        uTexSize: value_cell_1.ValueCell.create(vec2_1.Vec2.create(width, height)),
        uViewport: value_cell_1.ValueCell.create((0, vec4_1.Vec4)()),
        uViewportAdjusted: value_cell_1.ValueCell.create(true),
        uViewDirectionProjectionInverse: value_cell_1.ValueCell.create((0, mat4_1.Mat4)()),
        uGradientColorA: value_cell_1.ValueCell.create((0, vec3_1.Vec3)()),
        uGradientColorB: value_cell_1.ValueCell.create((0, vec3_1.Vec3)()),
        uGradientRatio: value_cell_1.ValueCell.create(0.5),
        uBlur: value_cell_1.ValueCell.create(0),
        uOpacity: value_cell_1.ValueCell.create(1),
        uSaturation: value_cell_1.ValueCell.create(0),
        uLightness: value_cell_1.ValueCell.create(0),
        uRotation: value_cell_1.ValueCell.create(mat3_1.Mat3.identity()),
        dVariant: value_cell_1.ValueCell.create('skybox'),
    };
    const schema = { ...BackgroundSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', SkyboxShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
