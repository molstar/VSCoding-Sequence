"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Cai Huiyu <szmun.caihy@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextureMesh = void 0;
const mol_util_1 = require("../../../mol-util");
const geometry_1 = require("../../../mol-math/geometry");
const param_definition_1 = require("../../../mol-util/param-definition");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const color_data_1 = require("../color-data");
const marker_data_1 = require("../marker-data");
const base_1 = require("../base");
const overpaint_data_1 = require("../overpaint-data");
const transparency_data_1 = require("../transparency-data");
const util_1 = require("../../../mol-gl/renderable/util");
const texture_1 = require("../../../mol-gl/webgl/texture");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const clipping_data_1 = require("../clipping-data");
const location_1 = require("../../../mol-model/location");
const substance_data_1 = require("../substance-data");
const emissive_data_1 = require("../emissive-data");
var TextureMesh;
(function (TextureMesh) {
    class DoubleBuffer {
        constructor() {
            this.index = 0;
            this.textures = [];
        }
        get() {
            return this.textures[this.index];
        }
        set(vertex, group, normal) {
            this.textures[this.index] = Object.assign(this.textures[this.index] || {}, {
                vertex, group, normal
            });
            this.index = (this.index + 1) % 2;
        }
        destroy() {
            for (const buffer of this.textures) {
                buffer.vertex.destroy();
                buffer.group.destroy();
                buffer.normal.destroy();
            }
        }
    }
    TextureMesh.DoubleBuffer = DoubleBuffer;
    function create(vertexCount, groupCount, vertexTexture, groupTexture, normalTexture, boundingSphere, textureMesh) {
        const width = vertexTexture.getWidth();
        const height = vertexTexture.getHeight();
        if (textureMesh) {
            textureMesh.vertexCount = vertexCount;
            textureMesh.groupCount = groupCount;
            mol_util_1.ValueCell.update(textureMesh.geoTextureDim, linear_algebra_1.Vec2.set(textureMesh.geoTextureDim.ref.value, width, height));
            mol_util_1.ValueCell.update(textureMesh.vertexTexture, vertexTexture);
            mol_util_1.ValueCell.update(textureMesh.groupTexture, groupTexture);
            mol_util_1.ValueCell.update(textureMesh.normalTexture, normalTexture);
            textureMesh.doubleBuffer.set(vertexTexture, groupTexture, normalTexture);
            geometry_1.Sphere3D.copy(textureMesh.boundingSphere, boundingSphere);
            return textureMesh;
        }
        else {
            return {
                kind: 'texture-mesh',
                vertexCount,
                groupCount,
                geoTextureDim: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(width, height)),
                vertexTexture: mol_util_1.ValueCell.create(vertexTexture),
                groupTexture: mol_util_1.ValueCell.create(groupTexture),
                normalTexture: mol_util_1.ValueCell.create(normalTexture),
                varyingGroup: mol_util_1.ValueCell.create(false),
                doubleBuffer: new DoubleBuffer(),
                boundingSphere: geometry_1.Sphere3D.clone(boundingSphere),
                meta: {}
            };
        }
    }
    TextureMesh.create = create;
    function createEmpty(textureMesh) {
        const vt = textureMesh ? textureMesh.vertexTexture.ref.value : (0, texture_1.createNullTexture)();
        const gt = textureMesh ? textureMesh.groupTexture.ref.value : (0, texture_1.createNullTexture)();
        const nt = textureMesh ? textureMesh.normalTexture.ref.value : (0, texture_1.createNullTexture)();
        const bs = textureMesh ? textureMesh.boundingSphere : (0, geometry_1.Sphere3D)();
        return create(0, 0, vt, gt, nt, bs, textureMesh);
    }
    TextureMesh.createEmpty = createEmpty;
    TextureMesh.Params = {
        ...base_1.BaseGeometry.Params,
        doubleSided: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.CustomQualityParamInfo),
        flipSided: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        flatShaded: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        ignoreLight: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        celShaded: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        xrayShaded: param_definition_1.ParamDefinition.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], base_1.BaseGeometry.ShadingCategory),
        transparentBackfaces: param_definition_1.ParamDefinition.Select('off', param_definition_1.ParamDefinition.arrayToOptions(['off', 'on', 'opaque']), base_1.BaseGeometry.ShadingCategory),
        bumpFrequency: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
        bumpAmplitude: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 5, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
    };
    TextureMesh.Utils = {
        Params: TextureMesh.Params,
        createEmpty,
        createValues,
        createValuesSimple,
        updateValues,
        updateBoundingSphere,
        createRenderableState,
        updateRenderableState,
        createPositionIterator,
    };
    const TextureMeshName = 'texture-mesh';
    function createPositionIterator(textureMesh, transform) {
        const webgl = textureMesh.meta.webgl;
        if (!webgl)
            return (0, location_iterator_1.LocationIterator)(1, 1, 1, () => location_1.NullLocation);
        if (!webgl.namedFramebuffers[TextureMeshName]) {
            webgl.namedFramebuffers[TextureMeshName] = webgl.resources.framebuffer();
        }
        const framebuffer = webgl.namedFramebuffers[TextureMeshName];
        const [width, height] = textureMesh.geoTextureDim.ref.value;
        const vertices = new Float32Array(width * height * 4);
        framebuffer.bind();
        textureMesh.vertexTexture.ref.value.attachFramebuffer(framebuffer, 0);
        webgl.readPixels(0, 0, width, height, vertices);
        const normals = new Float32Array(width * height * 4);
        framebuffer.bind();
        textureMesh.normalTexture.ref.value.attachFramebuffer(framebuffer, 0);
        webgl.readPixels(0, 0, width, height, normals);
        const groupCount = textureMesh.vertexCount;
        const instanceCount = transform.instanceCount.ref.value;
        const location = (0, location_iterator_1.PositionLocation)();
        const p = location.position;
        const n = location.normal;
        const m = transform.aTransform.ref.value;
        const getLocation = (groupIndex, instanceIndex) => {
            if (instanceIndex < 0) {
                linear_algebra_1.Vec3.fromArray(p, vertices, groupIndex * 4);
                linear_algebra_1.Vec3.fromArray(n, normals, groupIndex * 4);
            }
            else {
                linear_algebra_1.Vec3.transformMat4Offset(p, vertices, m, 0, groupIndex * 4, instanceIndex * 16);
                linear_algebra_1.Vec3.transformDirectionOffset(n, normals, m, 0, groupIndex * 4, instanceIndex * 16);
            }
            return location;
        };
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation);
    }
    function createValues(textureMesh, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = TextureMesh.Utils.createPositionIterator(textureMesh, transform);
        const color = (0, color_data_1.createColors)(locationIt, positionIt, theme.color);
        const marker = props.instanceGranularity
            ? (0, marker_data_1.createMarkers)(instanceCount, 'instance')
            : (0, marker_data_1.createMarkers)(instanceCount * groupCount, 'groupInstance');
        const overpaint = (0, overpaint_data_1.createEmptyOverpaint)();
        const transparency = (0, transparency_data_1.createEmptyTransparency)();
        const emissive = (0, emissive_data_1.createEmptyEmissive)();
        const substance = (0, substance_data_1.createEmptySubstance)();
        const clipping = (0, clipping_data_1.createEmptyClipping)();
        const counts = { drawCount: textureMesh.vertexCount, vertexCount: textureMesh.vertexCount, groupCount, instanceCount };
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(textureMesh.boundingSphere);
        const boundingSphere = (0, util_1.calculateTransformBoundingSphere)(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return {
            dGeometryType: mol_util_1.ValueCell.create('textureMesh'),
            uGeoTexDim: textureMesh.geoTextureDim,
            tPosition: textureMesh.vertexTexture,
            tGroup: textureMesh.groupTexture,
            tNormal: textureMesh.normalTexture,
            dVaryingGroup: textureMesh.varyingGroup,
            boundingSphere: mol_util_1.ValueCell.create(boundingSphere),
            invariantBoundingSphere: mol_util_1.ValueCell.create(invariantBoundingSphere),
            uInvariantBoundingSphere: mol_util_1.ValueCell.create(linear_algebra_1.Vec4.ofSphere(invariantBoundingSphere)),
            ...color,
            ...marker,
            ...overpaint,
            ...transparency,
            ...emissive,
            ...substance,
            ...clipping,
            ...transform,
            ...base_1.BaseGeometry.createValues(props, counts),
            uDoubleSided: mol_util_1.ValueCell.create(props.doubleSided),
            dFlatShaded: mol_util_1.ValueCell.create(props.flatShaded),
            dFlipSided: mol_util_1.ValueCell.create(props.flipSided),
            dIgnoreLight: mol_util_1.ValueCell.create(props.ignoreLight),
            dCelShaded: mol_util_1.ValueCell.create(props.celShaded),
            dXrayShaded: mol_util_1.ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off'),
            dTransparentBackfaces: mol_util_1.ValueCell.create(props.transparentBackfaces),
            uBumpFrequency: mol_util_1.ValueCell.create(props.bumpFrequency),
            uBumpAmplitude: mol_util_1.ValueCell.create(props.bumpAmplitude),
            meta: mol_util_1.ValueCell.create(textureMesh.meta),
        };
    }
    function createValuesSimple(textureMesh, props, colorValue, sizeValue, transform) {
        const s = base_1.BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(TextureMesh.Params), ...props };
        return createValues(textureMesh, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        base_1.BaseGeometry.updateValues(values, props);
        mol_util_1.ValueCell.updateIfChanged(values.uDoubleSided, props.doubleSided);
        mol_util_1.ValueCell.updateIfChanged(values.dFlatShaded, props.flatShaded);
        mol_util_1.ValueCell.updateIfChanged(values.dFlipSided, props.flipSided);
        mol_util_1.ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        mol_util_1.ValueCell.updateIfChanged(values.dCelShaded, props.celShaded);
        mol_util_1.ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        mol_util_1.ValueCell.updateIfChanged(values.dTransparentBackfaces, props.transparentBackfaces);
        mol_util_1.ValueCell.updateIfChanged(values.uBumpFrequency, props.bumpFrequency);
        mol_util_1.ValueCell.updateIfChanged(values.uBumpAmplitude, props.bumpAmplitude);
    }
    function updateBoundingSphere(values, textureMesh) {
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(textureMesh.boundingSphere);
        const boundingSphere = (0, util_1.calculateTransformBoundingSphere)(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!geometry_1.Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!geometry_1.Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            mol_util_1.ValueCell.update(values.uInvariantBoundingSphere, linear_algebra_1.Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
    }
    function createRenderableState(props) {
        const state = base_1.BaseGeometry.createRenderableState(props);
        updateRenderableState(state, props);
        return state;
    }
    function updateRenderableState(state, props) {
        base_1.BaseGeometry.updateRenderableState(state, props);
        state.opaque = state.opaque && !props.xrayShaded;
        state.writeDepth = state.opaque;
    }
})(TextureMesh || (exports.TextureMesh = TextureMesh = {}));
