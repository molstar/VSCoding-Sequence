"use strict";
/**
 * Copyright (c) 2021-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlbExporter = void 0;
const ascii_1 = require("../../mol-io/common/ascii");
const binary_1 = require("../../mol-io/common/binary");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const version_1 = require("../../mol-plugin/version");
const color_1 = require("../../mol-util/color/color");
const array_1 = require("../../mol-util/array");
const type_helpers_1 = require("../../mol-util/type-helpers");
const mesh_exporter_1 = require("./mesh-exporter");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3fromArray = linear_algebra_1.Vec3.fromArray;
const v3normalize = linear_algebra_1.Vec3.normalize;
const v3toArray = linear_algebra_1.Vec3.toArray;
// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0
const UNSIGNED_BYTE = 5121;
const UNSIGNED_INT = 5125;
const FLOAT = 5126;
const ARRAY_BUFFER = 34962;
const ELEMENT_ARRAY_BUFFER = 34963;
const GLTF_MAGIC_BYTE = 0x46546C67;
const JSON_CHUNK_TYPE = 0x4E4F534A;
const BIN_CHUNK_TYPE = 0x004E4942;
const JSON_PAD_CHAR = 0x20;
const BIN_PAD_CHAR = 0x00;
function getPrimitiveMode(mode) {
    switch (mode) {
        case 'points': return 0;
        case 'lines': return 1;
        case 'triangles': return 4;
        default: (0, type_helpers_1.assertUnreachable)(mode);
    }
}
class GlbExporter extends mesh_exporter_1.MeshExporter {
    static vec3MinMax(a) {
        const min = [Infinity, Infinity, Infinity];
        const max = [-Infinity, -Infinity, -Infinity];
        for (let i = 0, il = a.length; i < il; i += 3) {
            for (let j = 0; j < 3; ++j) {
                min[j] = Math.min(a[i + j], min[j]);
                max[j] = Math.max(a[i + j], max[j]);
            }
        }
        return [min, max];
    }
    addBuffer(buffer, componentType, type, count, target, min, max, normalized) {
        this.binaryBuffer.push(buffer);
        const bufferViewOffset = this.bufferViews.length;
        this.bufferViews.push({
            buffer: 0,
            byteOffset: this.byteOffset,
            byteLength: buffer.byteLength,
            target
        });
        this.byteOffset += buffer.byteLength;
        const accessorOffset = this.accessors.length;
        this.accessors.push({
            bufferView: bufferViewOffset,
            byteOffset: 0,
            componentType,
            count,
            type,
            min,
            max,
            normalized
        });
        return accessorOffset;
    }
    addGeometryBuffers(vertices, normals, indices, vertexCount, drawCount, isGeoTexture) {
        const tmpV = (0, linear_algebra_1.Vec3)();
        const stride = isGeoTexture ? 4 : 3;
        const vertexArray = new Float32Array(vertexCount * 3);
        let normalArray;
        let indexArray;
        // position
        for (let i = 0; i < vertexCount; ++i) {
            v3fromArray(tmpV, vertices, i * stride);
            v3toArray(tmpV, vertexArray, i * 3);
        }
        // normal
        if (normals) {
            normalArray = new Float32Array(vertexCount * 3);
            for (let i = 0; i < vertexCount; ++i) {
                v3fromArray(tmpV, normals, i * stride);
                v3normalize(tmpV, tmpV);
                v3toArray(tmpV, normalArray, i * 3);
            }
        }
        // face
        if (!isGeoTexture && indices) {
            indexArray = indices.slice(0, drawCount);
        }
        const [vertexMin, vertexMax] = GlbExporter.vec3MinMax(vertexArray);
        let vertexBuffer = vertexArray.buffer;
        let normalBuffer = normalArray === null || normalArray === void 0 ? void 0 : normalArray.buffer;
        let indexBuffer = (isGeoTexture || !indexArray) ? undefined : indexArray.buffer;
        if (!binary_1.IsNativeEndianLittle) {
            vertexBuffer = (0, binary_1.flipByteOrder)(new Uint8Array(vertexBuffer), 4);
            if (normalBuffer)
                normalBuffer = (0, binary_1.flipByteOrder)(new Uint8Array(normalBuffer), 4);
            if (!isGeoTexture)
                indexBuffer = (0, binary_1.flipByteOrder)(new Uint8Array(indexBuffer), 4);
        }
        return {
            vertexAccessorIndex: this.addBuffer(vertexBuffer, FLOAT, 'VEC3', vertexCount, ARRAY_BUFFER, vertexMin, vertexMax),
            normalAccessorIndex: normalBuffer ? this.addBuffer(normalBuffer, FLOAT, 'VEC3', vertexCount, ARRAY_BUFFER) : undefined,
            indexAccessorIndex: (isGeoTexture || !indexBuffer) ? undefined : this.addBuffer(indexBuffer, UNSIGNED_INT, 'SCALAR', drawCount, ELEMENT_ARRAY_BUFFER)
        };
    }
    addColorBuffer(geoData, interpolatedColors, interpolatedOverpaint, interpolatedTransparency) {
        const { values, vertexCount } = geoData;
        const uAlpha = values.uAlpha.ref.value;
        const colorArray = new Uint8Array(vertexCount * 4);
        for (let i = 0; i < vertexCount; ++i) {
            let color = GlbExporter.getColor(i, geoData, interpolatedColors, interpolatedOverpaint);
            const transparency = GlbExporter.getTransparency(i, geoData, interpolatedTransparency);
            const alpha = uAlpha * (1 - transparency);
            color = color_1.Color.sRGBToLinear(color);
            color_1.Color.toArray(color, colorArray, i * 4);
            colorArray[i * 4 + 3] = Math.round(alpha * 255);
        }
        let colorBuffer = colorArray.buffer;
        if (!binary_1.IsNativeEndianLittle) {
            colorBuffer = (0, binary_1.flipByteOrder)(new Uint8Array(colorBuffer), 4);
        }
        return this.addBuffer(colorBuffer, UNSIGNED_BYTE, 'VEC4', vertexCount, ARRAY_BUFFER, undefined, undefined, true);
    }
    addMaterial(metalness, roughness, emissive, doubleSided, alpha) {
        const hash = `${metalness}|${roughness}|${emissive}|${doubleSided}`;
        if (!this.materialMap.has(hash)) {
            this.materialMap.set(hash, this.materials.length);
            this.materials.push({
                pbrMetallicRoughness: {
                    baseColorFactor: [1, 1, 1, 1],
                    metallicFactor: metalness,
                    roughnessFactor: roughness
                },
                emissiveFactor: [emissive, emissive, emissive],
                doubleSided,
                alphaMode: alpha ? 'BLEND' : 'OPAQUE',
            });
        }
        return this.materialMap.get(hash);
    }
    async addMeshWithColors(input) {
        var _a;
        const { mesh, values, isGeoTexture, mode, webgl, ctx } = input;
        const t = (0, linear_algebra_1.Mat4)();
        const colorType = values.dColorType.ref.value;
        const overpaintType = values.dOverpaintType.ref.value;
        const transparencyType = values.dTransparencyType.ref.value;
        const dTransparency = values.dTransparency.ref.value;
        const aTransform = values.aTransform.ref.value;
        const instanceCount = values.uInstanceCount.ref.value;
        const metalness = values.uMetalness.ref.value;
        const roughness = values.uRoughness.ref.value;
        const emissive = values.uEmissive.ref.value;
        const doubleSided = ((_a = values.uDoubleSided) === null || _a === void 0 ? void 0 : _a.ref.value) || values.hasReflection.ref.value;
        const alpha = values.uAlpha.ref.value < 1;
        const material = this.addMaterial(metalness, roughness, emissive, doubleSided, alpha);
        let interpolatedColors;
        if (webgl && mesh && (colorType === 'volume' || colorType === 'volumeInstance')) {
            const stride = isGeoTexture ? 4 : 3;
            interpolatedColors = GlbExporter.getInterpolatedColors(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values, stride, colorType });
        }
        let interpolatedOverpaint;
        if (webgl && mesh && overpaintType === 'volumeInstance') {
            const stride = isGeoTexture ? 4 : 3;
            interpolatedOverpaint = GlbExporter.getInterpolatedOverpaint(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values, stride, colorType: overpaintType });
        }
        let interpolatedTransparency;
        if (webgl && mesh && transparencyType === 'volumeInstance') {
            const stride = isGeoTexture ? 4 : 3;
            interpolatedTransparency = GlbExporter.getInterpolatedTransparency(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values, stride, colorType: transparencyType });
        }
        // instancing
        const sameGeometryBuffers = mesh !== undefined;
        const sameColorBuffer = sameGeometryBuffers && colorType !== 'instance' && !colorType.endsWith('Instance') && !dTransparency;
        let vertexAccessorIndex;
        let normalAccessorIndex;
        let indexAccessorIndex;
        let colorAccessorIndex;
        let meshIndex;
        await ctx.update({ isIndeterminate: false, current: 0, max: instanceCount });
        for (let instanceIndex = 0; instanceIndex < instanceCount; ++instanceIndex) {
            if (ctx.shouldUpdate)
                await ctx.update({ current: instanceIndex + 1 });
            // create a glTF mesh if needed
            if (instanceIndex === 0 || !sameGeometryBuffers || !sameColorBuffer) {
                const { vertices, normals, indices, groups, vertexCount, drawCount } = GlbExporter.getInstance(input, instanceIndex);
                // create geometry buffers if needed
                if (instanceIndex === 0 || !sameGeometryBuffers) {
                    const accessorIndices = this.addGeometryBuffers(vertices, normals, indices, vertexCount, drawCount, isGeoTexture);
                    vertexAccessorIndex = accessorIndices.vertexAccessorIndex;
                    normalAccessorIndex = accessorIndices.normalAccessorIndex;
                    indexAccessorIndex = accessorIndices.indexAccessorIndex;
                }
                // create a color buffer if needed
                if (instanceIndex === 0 || !sameColorBuffer) {
                    colorAccessorIndex = this.addColorBuffer({ values, groups, vertexCount, instanceIndex, isGeoTexture, mode }, interpolatedColors, interpolatedOverpaint, interpolatedTransparency);
                }
                // glTF mesh
                meshIndex = this.meshes.length;
                this.meshes.push({
                    primitives: [{
                            attributes: {
                                POSITION: vertexAccessorIndex,
                                NORMAL: normalAccessorIndex,
                                COLOR_0: colorAccessorIndex
                            },
                            indices: indexAccessorIndex,
                            material,
                            mode: getPrimitiveMode(mode),
                        }]
                });
            }
            // node
            linear_algebra_1.Mat4.fromArray(t, aTransform, instanceIndex * 16);
            linear_algebra_1.Mat4.mul(t, this.centerTransform, t);
            const node = {
                mesh: meshIndex,
                matrix: t.slice()
            };
            this.nodes.push(node);
        }
    }
    async getData() {
        const binaryBufferLength = this.byteOffset;
        const gltf = {
            asset: {
                version: '2.0',
                generator: `Mol* ${version_1.PLUGIN_VERSION}`
            },
            scenes: [{
                    nodes: (0, array_1.fillSerial)(new Array(this.nodes.length))
                }],
            nodes: this.nodes,
            meshes: this.meshes,
            buffers: [{
                    byteLength: binaryBufferLength,
                }],
            bufferViews: this.bufferViews,
            accessors: this.accessors,
            materials: this.materials
        };
        const createChunk = (chunkType, data, byteLength, padChar) => {
            let padding = null;
            if (byteLength % 4 !== 0) {
                const pad = 4 - (byteLength % 4);
                byteLength += pad;
                padding = new Uint8Array(pad);
                padding.fill(padChar);
            }
            const preamble = new ArrayBuffer(8);
            const preambleDataView = new DataView(preamble);
            preambleDataView.setUint32(0, byteLength, true);
            preambleDataView.setUint32(4, chunkType, true);
            const chunk = [preamble, ...data];
            if (padding) {
                chunk.push(padding.buffer);
            }
            return [chunk, 8 + byteLength];
        };
        const jsonString = JSON.stringify(gltf);
        const jsonBuffer = new Uint8Array(jsonString.length);
        (0, ascii_1.asciiWrite)(jsonBuffer, jsonString);
        const [jsonChunk, jsonChunkLength] = createChunk(JSON_CHUNK_TYPE, [jsonBuffer.buffer], jsonBuffer.length, JSON_PAD_CHAR);
        const [binaryChunk, binaryChunkLength] = createChunk(BIN_CHUNK_TYPE, this.binaryBuffer, binaryBufferLength, BIN_PAD_CHAR);
        const glbBufferLength = 12 + jsonChunkLength + binaryChunkLength;
        const header = new ArrayBuffer(12);
        const headerDataView = new DataView(header);
        headerDataView.setUint32(0, GLTF_MAGIC_BYTE, true); // magic number "glTF"
        headerDataView.setUint32(4, 2, true); // version
        headerDataView.setUint32(8, glbBufferLength, true); // length
        const glbBuffer = [header, ...jsonChunk, ...binaryChunk];
        const glb = new Uint8Array(glbBufferLength);
        let offset = 0;
        for (const buffer of glbBuffer) {
            glb.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        }
        return { glb };
    }
    async getBlob(ctx) {
        return new Blob([(await this.getData()).glb], { type: 'model/gltf-binary' });
    }
    constructor(boundingBox) {
        super();
        this.fileExtension = 'glb';
        this.nodes = [];
        this.meshes = [];
        this.materials = [];
        this.materialMap = new Map();
        this.accessors = [];
        this.bufferViews = [];
        this.binaryBuffer = [];
        this.byteOffset = 0;
        const tmpV = (0, linear_algebra_1.Vec3)();
        linear_algebra_1.Vec3.add(tmpV, boundingBox.min, boundingBox.max);
        linear_algebra_1.Vec3.scale(tmpV, tmpV, -0.5);
        this.centerTransform = linear_algebra_1.Mat4.fromTranslation((0, linear_algebra_1.Mat4)(), tmpV);
    }
}
exports.GlbExporter = GlbExporter;
