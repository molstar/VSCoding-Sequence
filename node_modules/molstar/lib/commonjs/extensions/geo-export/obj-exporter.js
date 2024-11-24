"use strict";
/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjExporter = void 0;
const ascii_1 = require("../../mol-io/common/ascii");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const mol_util_1 = require("../../mol-util");
const color_1 = require("../../mol-util/color/color");
const zip_1 = require("../../mol-util/zip/zip");
const mesh_exporter_1 = require("./mesh-exporter");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3fromArray = linear_algebra_1.Vec3.fromArray;
const v3transformMat4 = linear_algebra_1.Vec3.transformMat4;
const v3transformMat3 = linear_algebra_1.Vec3.transformMat3;
const mat3directionTransform = linear_algebra_1.Mat3.directionTransform;
class ObjExporter extends mesh_exporter_1.MeshExporter {
    updateMaterial(color, alpha) {
        if (this.currentColor === color && this.currentAlpha === alpha)
            return;
        this.currentColor = color;
        this.currentAlpha = alpha;
        const material = color_1.Color.toHexString(color) + alpha;
        mol_util_1.StringBuilder.writeSafe(this.obj, `usemtl ${material}`);
        mol_util_1.StringBuilder.newline(this.obj);
        if (!this.materialSet.has(material)) {
            this.materialSet.add(material);
            const [r, g, b] = color_1.Color.toRgbNormalized(color).map(v => Math.round(v * 1000) / 1000);
            const mtl = this.mtl;
            mol_util_1.StringBuilder.writeSafe(mtl, `newmtl ${material}\n`);
            mol_util_1.StringBuilder.writeSafe(mtl, 'illum 2\n'); // illumination model
            mol_util_1.StringBuilder.writeSafe(mtl, 'Ns 163\n'); // specular exponent
            mol_util_1.StringBuilder.writeSafe(mtl, 'Ni 0.001\n'); // optical density a.k.a. index of refraction
            mol_util_1.StringBuilder.writeSafe(mtl, 'Ka 0 0 0\n'); // ambient reflectivity
            mol_util_1.StringBuilder.writeSafe(mtl, 'Kd '); // diffuse reflectivity
            mol_util_1.StringBuilder.writeFloat(mtl, r, 1000);
            mol_util_1.StringBuilder.whitespace1(mtl);
            mol_util_1.StringBuilder.writeFloat(mtl, g, 1000);
            mol_util_1.StringBuilder.whitespace1(mtl);
            mol_util_1.StringBuilder.writeFloat(mtl, b, 1000);
            mol_util_1.StringBuilder.newline(mtl);
            mol_util_1.StringBuilder.writeSafe(mtl, 'Ks 0.25 0.25 0.25\n'); // specular reflectivity
            mol_util_1.StringBuilder.writeSafe(mtl, 'd '); // dissolve
            mol_util_1.StringBuilder.writeFloat(mtl, alpha, 1000);
            mol_util_1.StringBuilder.newline(mtl);
        }
    }
    async addMeshWithColors(input) {
        const { mesh, values, isGeoTexture, mode, webgl, ctx } = input;
        if (mode !== 'triangles')
            return;
        const obj = this.obj;
        const t = (0, linear_algebra_1.Mat4)();
        const n = (0, linear_algebra_1.Mat3)();
        const tmpV = (0, linear_algebra_1.Vec3)();
        const stride = isGeoTexture ? 4 : 3;
        const colorType = values.dColorType.ref.value;
        const overpaintType = values.dOverpaintType.ref.value;
        const transparencyType = values.dTransparencyType.ref.value;
        const uAlpha = values.uAlpha.ref.value;
        const aTransform = values.aTransform.ref.value;
        const instanceCount = values.uInstanceCount.ref.value;
        let interpolatedColors;
        if (webgl && mesh && (colorType === 'volume' || colorType === 'volumeInstance')) {
            interpolatedColors = ObjExporter.getInterpolatedColors(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values, stride, colorType });
        }
        let interpolatedOverpaint;
        if (webgl && mesh && overpaintType === 'volumeInstance') {
            interpolatedOverpaint = ObjExporter.getInterpolatedOverpaint(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values, stride, colorType: overpaintType });
        }
        let interpolatedTransparency;
        if (webgl && mesh && transparencyType === 'volumeInstance') {
            const stride = isGeoTexture ? 4 : 3;
            interpolatedTransparency = ObjExporter.getInterpolatedTransparency(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values, stride, colorType: transparencyType });
        }
        await ctx.update({ isIndeterminate: false, current: 0, max: instanceCount });
        for (let instanceIndex = 0; instanceIndex < instanceCount; ++instanceIndex) {
            if (ctx.shouldUpdate)
                await ctx.update({ current: instanceIndex + 1 });
            const { vertices, normals, indices, groups, vertexCount, drawCount } = ObjExporter.getInstance(input, instanceIndex);
            linear_algebra_1.Mat4.fromArray(t, aTransform, instanceIndex * 16);
            linear_algebra_1.Mat4.mul(t, this.centerTransform, t);
            mat3directionTransform(n, t);
            // position
            for (let i = 0; i < vertexCount; ++i) {
                v3transformMat4(tmpV, v3fromArray(tmpV, vertices, i * stride), t);
                mol_util_1.StringBuilder.writeSafe(obj, 'v ');
                mol_util_1.StringBuilder.writeFloat(obj, tmpV[0], 1000);
                mol_util_1.StringBuilder.whitespace1(obj);
                mol_util_1.StringBuilder.writeFloat(obj, tmpV[1], 1000);
                mol_util_1.StringBuilder.whitespace1(obj);
                mol_util_1.StringBuilder.writeFloat(obj, tmpV[2], 1000);
                mol_util_1.StringBuilder.newline(obj);
            }
            // normal
            for (let i = 0; i < vertexCount; ++i) {
                v3transformMat3(tmpV, v3fromArray(tmpV, normals, i * stride), n);
                mol_util_1.StringBuilder.writeSafe(obj, 'vn ');
                mol_util_1.StringBuilder.writeFloat(obj, tmpV[0], 100);
                mol_util_1.StringBuilder.whitespace1(obj);
                mol_util_1.StringBuilder.writeFloat(obj, tmpV[1], 100);
                mol_util_1.StringBuilder.whitespace1(obj);
                mol_util_1.StringBuilder.writeFloat(obj, tmpV[2], 100);
                mol_util_1.StringBuilder.newline(obj);
            }
            const geoData = { values, groups, vertexCount, instanceIndex, isGeoTexture, mode };
            // color
            const quantizedColors = new Uint8Array(drawCount * 3);
            for (let i = 0; i < drawCount; i += 3) {
                const v = isGeoTexture ? i : indices[i];
                const color = ObjExporter.getColor(v, geoData, interpolatedColors, interpolatedOverpaint);
                color_1.Color.toArray(color, quantizedColors, i);
            }
            ObjExporter.quantizeColors(quantizedColors, vertexCount);
            // face
            for (let i = 0; i < drawCount; i += 3) {
                const color = color_1.Color.fromArray(quantizedColors, i);
                const transparency = ObjExporter.getTransparency(i, geoData, interpolatedTransparency);
                const alpha = Math.round(uAlpha * (1 - transparency) * 10) / 10; // quantized
                this.updateMaterial(color, alpha);
                const v1 = this.vertexOffset + (isGeoTexture ? i : indices[i]) + 1;
                const v2 = this.vertexOffset + (isGeoTexture ? i + 1 : indices[i + 1]) + 1;
                const v3 = this.vertexOffset + (isGeoTexture ? i + 2 : indices[i + 2]) + 1;
                mol_util_1.StringBuilder.writeSafe(obj, 'f ');
                mol_util_1.StringBuilder.writeInteger(obj, v1);
                mol_util_1.StringBuilder.writeSafe(obj, '//');
                mol_util_1.StringBuilder.writeIntegerAndSpace(obj, v1);
                mol_util_1.StringBuilder.writeInteger(obj, v2);
                mol_util_1.StringBuilder.writeSafe(obj, '//');
                mol_util_1.StringBuilder.writeIntegerAndSpace(obj, v2);
                mol_util_1.StringBuilder.writeInteger(obj, v3);
                mol_util_1.StringBuilder.writeSafe(obj, '//');
                mol_util_1.StringBuilder.writeInteger(obj, v3);
                mol_util_1.StringBuilder.newline(obj);
            }
            this.vertexOffset += vertexCount;
        }
    }
    async getData() {
        return {
            obj: mol_util_1.StringBuilder.getString(this.obj),
            mtl: mol_util_1.StringBuilder.getString(this.mtl)
        };
    }
    async getBlob(ctx) {
        const { obj, mtl } = await this.getData();
        const objData = new Uint8Array(obj.length);
        (0, ascii_1.asciiWrite)(objData, obj);
        const mtlData = new Uint8Array(mtl.length);
        (0, ascii_1.asciiWrite)(mtlData, mtl);
        const zipDataObj = {
            [this.filename + '.obj']: objData,
            [this.filename + '.mtl']: mtlData
        };
        return new Blob([await (0, zip_1.zip)(ctx, zipDataObj)], { type: 'application/zip' });
    }
    constructor(filename, boundingBox) {
        super();
        this.filename = filename;
        this.fileExtension = 'zip';
        this.obj = mol_util_1.StringBuilder.create();
        this.mtl = mol_util_1.StringBuilder.create();
        this.vertexOffset = 0;
        this.materialSet = new Set();
        mol_util_1.StringBuilder.writeSafe(this.obj, `mtllib ${filename}.mtl\n`);
        const tmpV = (0, linear_algebra_1.Vec3)();
        linear_algebra_1.Vec3.add(tmpV, boundingBox.min, boundingBox.max);
        linear_algebra_1.Vec3.scale(tmpV, tmpV, -0.5);
        this.centerTransform = linear_algebra_1.Mat4.fromTranslation((0, linear_algebra_1.Mat4)(), tmpV);
    }
}
exports.ObjExporter = ObjExporter;
