"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lines = void 0;
const mol_util_1 = require("../../../mol-util");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const util_1 = require("../../util");
const color_data_1 = require("../color-data");
const marker_data_1 = require("../marker-data");
const size_data_1 = require("../size-data");
const location_iterator_1 = require("../../util/location-iterator");
const lines_builder_1 = require("./lines-builder");
const param_definition_1 = require("../../../mol-util/param-definition");
const util_2 = require("../../../mol-gl/renderable/util");
const geometry_1 = require("../../../mol-math/geometry");
const base_1 = require("../base");
const overpaint_data_1 = require("../overpaint-data");
const transparency_data_1 = require("../transparency-data");
const util_3 = require("../../../mol-data/util");
const clipping_data_1 = require("../clipping-data");
const substance_data_1 = require("../substance-data");
const emissive_data_1 = require("../emissive-data");
var Lines;
(function (Lines) {
    function create(mappings, indices, groups, starts, ends, lineCount, lines) {
        return lines ?
            update(mappings, indices, groups, starts, ends, lineCount, lines) :
            fromArrays(mappings, indices, groups, starts, ends, lineCount);
    }
    Lines.create = create;
    function createEmpty(lines) {
        const mb = lines ? lines.mappingBuffer.ref.value : new Float32Array(0);
        const ib = lines ? lines.indexBuffer.ref.value : new Uint32Array(0);
        const gb = lines ? lines.groupBuffer.ref.value : new Float32Array(0);
        const sb = lines ? lines.startBuffer.ref.value : new Float32Array(0);
        const eb = lines ? lines.endBuffer.ref.value : new Float32Array(0);
        return create(mb, ib, gb, sb, eb, 0, lines);
    }
    Lines.createEmpty = createEmpty;
    function fromMesh(mesh, lines) {
        const vb = mesh.vertexBuffer.ref.value;
        const ib = mesh.indexBuffer.ref.value;
        const gb = mesh.groupBuffer.ref.value;
        const builder = lines_builder_1.LinesBuilder.create(mesh.triangleCount * 3, mesh.triangleCount / 10, lines);
        // TODO avoid duplicate lines
        for (let i = 0, il = mesh.triangleCount * 3; i < il; i += 3) {
            const i0 = ib[i], i1 = ib[i + 1], i2 = ib[i + 2];
            const x0 = vb[i0 * 3], y0 = vb[i0 * 3 + 1], z0 = vb[i0 * 3 + 2];
            const x1 = vb[i1 * 3], y1 = vb[i1 * 3 + 1], z1 = vb[i1 * 3 + 2];
            const x2 = vb[i2 * 3], y2 = vb[i2 * 3 + 1], z2 = vb[i2 * 3 + 2];
            builder.add(x0, y0, z0, x1, y1, z1, gb[i0]);
            builder.add(x0, y0, z0, x2, y2, z2, gb[i0]);
            builder.add(x1, y1, z1, x2, y2, z2, gb[i1]);
        }
        return builder.getLines();
    }
    Lines.fromMesh = fromMesh;
    function hashCode(lines) {
        return (0, util_3.hashFnv32a)([
            lines.lineCount, lines.mappingBuffer.ref.version, lines.indexBuffer.ref.version,
            lines.groupBuffer.ref.version, lines.startBuffer.ref.version, lines.endBuffer.ref.version
        ]);
    }
    function fromArrays(mappings, indices, groups, starts, ends, lineCount) {
        const boundingSphere = (0, geometry_1.Sphere3D)();
        let groupMapping;
        let currentHash = -1;
        let currentGroup = -1;
        const lines = {
            kind: 'lines',
            lineCount,
            mappingBuffer: mol_util_1.ValueCell.create(mappings),
            indexBuffer: mol_util_1.ValueCell.create(indices),
            groupBuffer: mol_util_1.ValueCell.create(groups),
            startBuffer: mol_util_1.ValueCell.create(starts),
            endBuffer: mol_util_1.ValueCell.create(ends),
            get boundingSphere() {
                const newHash = hashCode(lines);
                if (newHash !== currentHash) {
                    const s = (0, util_2.calculateInvariantBoundingSphere)(lines.startBuffer.ref.value, lines.lineCount * 4, 4);
                    const e = (0, util_2.calculateInvariantBoundingSphere)(lines.endBuffer.ref.value, lines.lineCount * 4, 4);
                    geometry_1.Sphere3D.expandBySphere(boundingSphere, s, e);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (lines.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = (0, util_1.createGroupMapping)(lines.groupBuffer.ref.value, lines.lineCount, 4);
                    currentGroup = lines.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere(sphere) {
                geometry_1.Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(lines);
            }
        };
        return lines;
    }
    function update(mappings, indices, groups, starts, ends, lineCount, lines) {
        if (lineCount > lines.lineCount) {
            mol_util_1.ValueCell.update(lines.mappingBuffer, mappings);
            mol_util_1.ValueCell.update(lines.indexBuffer, indices);
        }
        lines.lineCount = lineCount;
        mol_util_1.ValueCell.update(lines.groupBuffer, groups);
        mol_util_1.ValueCell.update(lines.startBuffer, starts);
        mol_util_1.ValueCell.update(lines.endBuffer, ends);
        return lines;
    }
    function transform(lines, t) {
        const start = lines.startBuffer.ref.value;
        (0, util_1.transformPositionArray)(t, start, 0, lines.lineCount * 4);
        mol_util_1.ValueCell.update(lines.startBuffer, start);
        const end = lines.endBuffer.ref.value;
        (0, util_1.transformPositionArray)(t, end, 0, lines.lineCount * 4);
        mol_util_1.ValueCell.update(lines.endBuffer, end);
    }
    Lines.transform = transform;
    //
    Lines.Params = {
        ...base_1.BaseGeometry.Params,
        sizeFactor: param_definition_1.ParamDefinition.Numeric(2, { min: 0, max: 10, step: 0.1 }),
        lineSizeAttenuation: param_definition_1.ParamDefinition.Boolean(false),
    };
    Lines.Utils = {
        Params: Lines.Params,
        createEmpty,
        createValues,
        createValuesSimple,
        updateValues,
        updateBoundingSphere,
        createRenderableState: base_1.BaseGeometry.createRenderableState,
        updateRenderableState: base_1.BaseGeometry.updateRenderableState,
        createPositionIterator
    };
    function createPositionIterator(lines, transform) {
        const groupCount = lines.lineCount * 4;
        const instanceCount = transform.instanceCount.ref.value;
        const location = (0, location_iterator_1.PositionLocation)();
        const p = location.position;
        const s = lines.startBuffer.ref.value;
        const e = lines.endBuffer.ref.value;
        const m = transform.aTransform.ref.value;
        const getLocation = (groupIndex, instanceIndex) => {
            const v = groupIndex % 4 === 0 ? s : e;
            if (instanceIndex < 0) {
                linear_algebra_1.Vec3.fromArray(p, v, groupIndex * 3);
            }
            else {
                linear_algebra_1.Vec3.transformMat4Offset(p, v, m, 0, groupIndex * 3, instanceIndex * 16);
            }
            return location;
        };
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 2, getLocation);
    }
    function createValues(lines, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(lines, transform);
        const color = (0, color_data_1.createColors)(locationIt, positionIt, theme.color);
        const size = (0, size_data_1.createSizes)(locationIt, theme.size);
        const marker = props.instanceGranularity
            ? (0, marker_data_1.createMarkers)(instanceCount, 'instance')
            : (0, marker_data_1.createMarkers)(instanceCount * groupCount, 'groupInstance');
        const overpaint = (0, overpaint_data_1.createEmptyOverpaint)();
        const transparency = (0, transparency_data_1.createEmptyTransparency)();
        const emissive = (0, emissive_data_1.createEmptyEmissive)();
        const material = (0, substance_data_1.createEmptySubstance)();
        const clipping = (0, clipping_data_1.createEmptyClipping)();
        const counts = { drawCount: lines.lineCount * 2 * 3, vertexCount: lines.lineCount * 4, groupCount, instanceCount };
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(lines.boundingSphere);
        const boundingSphere = (0, util_2.calculateTransformBoundingSphere)(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return {
            dGeometryType: mol_util_1.ValueCell.create('lines'),
            aMapping: lines.mappingBuffer,
            aGroup: lines.groupBuffer,
            aStart: lines.startBuffer,
            aEnd: lines.endBuffer,
            elements: lines.indexBuffer,
            boundingSphere: mol_util_1.ValueCell.create(boundingSphere),
            invariantBoundingSphere: mol_util_1.ValueCell.create(invariantBoundingSphere),
            uInvariantBoundingSphere: mol_util_1.ValueCell.create(linear_algebra_1.Vec4.ofSphere(invariantBoundingSphere)),
            ...color,
            ...size,
            ...marker,
            ...overpaint,
            ...transparency,
            ...emissive,
            ...material,
            ...clipping,
            ...transform,
            ...base_1.BaseGeometry.createValues(props, counts),
            uSizeFactor: mol_util_1.ValueCell.create(props.sizeFactor),
            dLineSizeAttenuation: mol_util_1.ValueCell.create(props.lineSizeAttenuation),
            uDoubleSided: mol_util_1.ValueCell.create(true),
            dFlipSided: mol_util_1.ValueCell.create(false),
        };
    }
    function createValuesSimple(lines, props, colorValue, sizeValue, transform) {
        const s = base_1.BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(Lines.Params), ...props };
        return createValues(lines, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        base_1.BaseGeometry.updateValues(values, props);
        mol_util_1.ValueCell.updateIfChanged(values.uSizeFactor, props.sizeFactor);
        mol_util_1.ValueCell.updateIfChanged(values.dLineSizeAttenuation, props.lineSizeAttenuation);
    }
    function updateBoundingSphere(values, lines) {
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(lines.boundingSphere);
        const boundingSphere = (0, util_2.calculateTransformBoundingSphere)(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!geometry_1.Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!geometry_1.Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            mol_util_1.ValueCell.update(values.uInvariantBoundingSphere, linear_algebra_1.Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
    }
})(Lines || (exports.Lines = Lines = {}));
