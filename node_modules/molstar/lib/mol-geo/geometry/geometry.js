/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mesh } from './mesh/mesh';
import { Points } from './points/points';
import { Text } from './text/text';
import { Lines } from './lines/lines';
import { DirectVolume } from './direct-volume/direct-volume';
import { Spheres } from './spheres/spheres';
import { arrayMax } from '../../mol-util/array';
import { TextureMesh } from './texture-mesh/texture-mesh';
import { Image } from './image/image';
import { Cylinders } from './cylinders/cylinders';
export var Geometry;
(function (Geometry) {
    function getDrawCount(geometry) {
        switch (geometry.kind) {
            case 'mesh': return geometry.triangleCount * 3;
            case 'points': return geometry.pointCount;
            case 'spheres': return geometry.sphereCount * 2 * 3;
            case 'cylinders': return geometry.cylinderCount * 4 * 3;
            case 'text': return geometry.charCount * 2 * 3;
            case 'lines': return geometry.lineCount * 2 * 3;
            case 'direct-volume': return 12 * 3;
            case 'image': return 2 * 3;
            case 'texture-mesh': return geometry.vertexCount;
        }
    }
    Geometry.getDrawCount = getDrawCount;
    function getVertexCount(geometry) {
        switch (geometry.kind) {
            case 'mesh': return geometry.vertexCount;
            case 'points': return geometry.pointCount;
            case 'spheres': return geometry.sphereCount * 6;
            case 'cylinders': return geometry.cylinderCount * 6;
            case 'text': return geometry.charCount * 4;
            case 'lines': return geometry.lineCount * 4;
            case 'direct-volume':
                const [x, y, z] = geometry.gridDimension.ref.value;
                return x * y * z;
            case 'image': return 4;
            case 'texture-mesh': return geometry.vertexCount;
        }
    }
    Geometry.getVertexCount = getVertexCount;
    function getGroupCount(geometry) {
        switch (geometry.kind) {
            case 'mesh':
            case 'points':
            case 'spheres':
            case 'cylinders':
            case 'text':
            case 'lines':
                return getDrawCount(geometry) === 0 ? 0 : (arrayMax(geometry.groupBuffer.ref.value) + 1);
            case 'direct-volume':
                return 1;
            case 'image':
                return arrayMax(geometry.groupTexture.ref.value.array) + 1;
            case 'texture-mesh':
                return geometry.groupCount;
        }
    }
    Geometry.getGroupCount = getGroupCount;
    function getUtils(geometry) {
        // TODO avoid casting
        switch (geometry.kind) {
            case 'mesh': return Mesh.Utils;
            case 'points': return Points.Utils;
            case 'spheres': return Spheres.Utils;
            case 'cylinders': return Cylinders.Utils;
            case 'text': return Text.Utils;
            case 'lines': return Lines.Utils;
            case 'direct-volume': return DirectVolume.Utils;
            case 'image': return Image.Utils;
            case 'texture-mesh': return TextureMesh.Utils;
        }
    }
    Geometry.getUtils = getUtils;
    function getGranularity(locationIt, granularity) {
        return granularity === 'instance' && locationIt.nonInstanceable ? 'group' : granularity;
    }
    Geometry.getGranularity = getGranularity;
})(Geometry || (Geometry = {}));
