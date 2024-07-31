"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Volume = void 0;
const grid_1 = require("./grid");
const int_1 = require("../../mol-data/int");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const boundary_helper_1 = require("../../mol-math/geometry/boundary-helper");
const cube_1 = require("../../mol-model-formats/volume/cube");
const common_1 = require("../../mol-math/linear-algebra/3d/common");
const custom_property_1 = require("../custom-property");
const param_definition_1 = require("../../mol-util/param-definition");
const number_1 = require("../../mol-util/number");
const density_server_1 = require("../../mol-model-formats/volume/density-server");
var Volume;
(function (Volume) {
    function is(x) {
        var _a, _b, _c, _d;
        // TODO: improve
        return (((_d = (_c = (_b = (_a = x === null || x === void 0 ? void 0 : x.grid) === null || _a === void 0 ? void 0 : _a.cells) === null || _b === void 0 ? void 0 : _b.space) === null || _c === void 0 ? void 0 : _c.dimensions) === null || _d === void 0 ? void 0 : _d.length) &&
            (x === null || x === void 0 ? void 0 : x.sourceData) &&
            (x === null || x === void 0 ? void 0 : x.customProperties) &&
            (x === null || x === void 0 ? void 0 : x._propertyData));
    }
    Volume.is = is;
    let IsoValue;
    (function (IsoValue) {
        function areSame(a, b, stats) {
            return (0, common_1.equalEps)(toAbsolute(a, stats).absoluteValue, toAbsolute(b, stats).absoluteValue, stats.sigma / 100);
        }
        IsoValue.areSame = areSame;
        function absolute(value) { return { kind: 'absolute', absoluteValue: value }; }
        IsoValue.absolute = absolute;
        function relative(value) { return { kind: 'relative', relativeValue: value }; }
        IsoValue.relative = relative;
        function calcAbsolute(stats, relativeValue) {
            return relativeValue * stats.sigma + stats.mean;
        }
        IsoValue.calcAbsolute = calcAbsolute;
        function calcRelative(stats, absoluteValue) {
            return stats.sigma === 0 ? 0 : ((absoluteValue - stats.mean) / stats.sigma);
        }
        IsoValue.calcRelative = calcRelative;
        function toAbsolute(value, stats) {
            return value.kind === 'absolute' ? value : { kind: 'absolute', absoluteValue: IsoValue.calcAbsolute(stats, value.relativeValue) };
        }
        IsoValue.toAbsolute = toAbsolute;
        function toRelative(value, stats) {
            return value.kind === 'relative' ? value : { kind: 'relative', relativeValue: IsoValue.calcRelative(stats, value.absoluteValue) };
        }
        IsoValue.toRelative = toRelative;
        function toString(value) {
            return value.kind === 'relative'
                ? `${value.relativeValue.toFixed(2)} σ`
                : `${value.absoluteValue.toPrecision(4)}`;
        }
        IsoValue.toString = toString;
    })(IsoValue = Volume.IsoValue || (Volume.IsoValue = {}));
    // Converts iso value to relative if using downsample VolumeServer data
    function adjustedIsoValue(volume, value, kind) {
        if (kind === 'relative')
            return IsoValue.relative(value);
        const absolute = IsoValue.absolute(value);
        if (density_server_1.DscifFormat.is(volume.sourceData)) {
            const stats = {
                min: volume.sourceData.data.volume_data_3d_info.min_source.value(0),
                max: volume.sourceData.data.volume_data_3d_info.max_source.value(0),
                mean: volume.sourceData.data.volume_data_3d_info.mean_source.value(0),
                sigma: volume.sourceData.data.volume_data_3d_info.sigma_source.value(0),
            };
            return Volume.IsoValue.toRelative(absolute, stats);
        }
        return absolute;
    }
    Volume.adjustedIsoValue = adjustedIsoValue;
    const defaultStats = { min: -1, max: 1, mean: 0, sigma: 0.1 };
    function createIsoValueParam(defaultValue, stats) {
        const sts = stats || defaultStats;
        const { min, max, mean, sigma } = sts;
        // using ceil/floor could lead to "ouf of bounds" when converting
        const relMin = (min - mean) / sigma;
        const relMax = (max - mean) / sigma;
        let def = defaultValue;
        if (defaultValue.kind === 'absolute') {
            if (defaultValue.absoluteValue < min)
                def = Volume.IsoValue.absolute(min);
            else if (defaultValue.absoluteValue > max)
                def = Volume.IsoValue.absolute(max);
        }
        else {
            if (defaultValue.relativeValue < relMin)
                def = Volume.IsoValue.relative(relMin);
            else if (defaultValue.relativeValue > relMax)
                def = Volume.IsoValue.relative(relMax);
        }
        return param_definition_1.ParamDefinition.Conditioned(def, {
            'absolute': param_definition_1.ParamDefinition.Converted((v) => Volume.IsoValue.toAbsolute(v, grid_1.Grid.One.stats).absoluteValue, (v) => Volume.IsoValue.absolute(v), param_definition_1.ParamDefinition.Numeric(mean, { min, max, step: (0, number_1.toPrecision)(sigma / 100, 2) }, { immediateUpdate: true })),
            'relative': param_definition_1.ParamDefinition.Converted((v) => Volume.IsoValue.toRelative(v, grid_1.Grid.One.stats).relativeValue, (v) => Volume.IsoValue.relative(v), param_definition_1.ParamDefinition.Numeric(Math.min(1, relMax), { min: relMin, max: relMax, step: (0, number_1.toPrecision)(Math.round(((max - min) / sigma)) / 100, 2) }, { immediateUpdate: true }))
        }, (v) => v.kind === 'absolute' ? 'absolute' : 'relative', (v, c) => c === 'absolute' ? Volume.IsoValue.toAbsolute(v, sts) : Volume.IsoValue.toRelative(v, sts), { isEssential: true });
    }
    Volume.createIsoValueParam = createIsoValueParam;
    Volume.IsoValueParam = createIsoValueParam(Volume.IsoValue.relative(2));
    Volume.One = {
        label: '',
        grid: grid_1.Grid.One,
        sourceData: { kind: '', name: '', data: {} },
        customProperties: new custom_property_1.CustomProperties(),
        _propertyData: Object.create(null),
    };
    function areEquivalent(volA, volB) {
        return grid_1.Grid.areEquivalent(volA.grid, volB.grid);
    }
    Volume.areEquivalent = areEquivalent;
    function isEmpty(vol) {
        return grid_1.Grid.isEmpty(vol.grid);
    }
    Volume.isEmpty = isEmpty;
    function isOrbitals(volume) {
        if (!cube_1.CubeFormat.is(volume.sourceData))
            return false;
        return volume.sourceData.data.header.orbitals;
    }
    Volume.isOrbitals = isOrbitals;
    function Loci(volume) { return { kind: 'volume-loci', volume }; }
    Volume.Loci = Loci;
    function isLoci(x) { return !!x && x.kind === 'volume-loci'; }
    Volume.isLoci = isLoci;
    function areLociEqual(a, b) { return a.volume === b.volume; }
    Volume.areLociEqual = areLociEqual;
    function isLociEmpty(loci) { return grid_1.Grid.isEmpty(loci.volume.grid); }
    Volume.isLociEmpty = isLociEmpty;
    function getBoundingSphere(volume, boundingSphere) {
        return grid_1.Grid.getBoundingSphere(volume.grid, boundingSphere);
    }
    Volume.getBoundingSphere = getBoundingSphere;
    let Isosurface;
    (function (Isosurface) {
        function Loci(volume, isoValue) { return { kind: 'isosurface-loci', volume, isoValue }; }
        Isosurface.Loci = Loci;
        function isLoci(x) { return !!x && x.kind === 'isosurface-loci'; }
        Isosurface.isLoci = isLoci;
        function areLociEqual(a, b) { return a.volume === b.volume && Volume.IsoValue.areSame(a.isoValue, b.isoValue, a.volume.grid.stats); }
        Isosurface.areLociEqual = areLociEqual;
        function isLociEmpty(loci) { return loci.volume.grid.cells.data.length === 0; }
        Isosurface.isLociEmpty = isLociEmpty;
        const bbox = (0, geometry_1.Box3D)();
        function getBoundingSphere(volume, isoValue, boundingSphere) {
            const value = Volume.IsoValue.toAbsolute(isoValue, volume.grid.stats).absoluteValue;
            const neg = value < 0;
            const c = [0, 0, 0];
            const getCoords = volume.grid.cells.space.getCoords;
            const d = volume.grid.cells.data;
            const [xn, yn, zn] = volume.grid.cells.space.dimensions;
            let minx = xn - 1, miny = yn - 1, minz = zn - 1;
            let maxx = 0, maxy = 0, maxz = 0;
            for (let i = 0, il = d.length; i < il; ++i) {
                if ((neg && d[i] <= value) || (!neg && d[i] >= value)) {
                    getCoords(i, c);
                    if (c[0] < minx)
                        minx = c[0];
                    if (c[1] < miny)
                        miny = c[1];
                    if (c[2] < minz)
                        minz = c[2];
                    if (c[0] > maxx)
                        maxx = c[0];
                    if (c[1] > maxy)
                        maxy = c[1];
                    if (c[2] > maxz)
                        maxz = c[2];
                }
            }
            linear_algebra_1.Vec3.set(bbox.min, minx - 1, miny - 1, minz - 1);
            linear_algebra_1.Vec3.set(bbox.max, maxx + 1, maxy + 1, maxz + 1);
            const transform = grid_1.Grid.getGridToCartesianTransform(volume.grid);
            geometry_1.Box3D.transform(bbox, bbox, transform);
            return geometry_1.Sphere3D.fromBox3D(boundingSphere || (0, geometry_1.Sphere3D)(), bbox);
        }
        Isosurface.getBoundingSphere = getBoundingSphere;
    })(Isosurface = Volume.Isosurface || (Volume.Isosurface = {}));
    let Cell;
    (function (Cell) {
        function Loci(volume, indices) { return { kind: 'cell-loci', volume, indices }; }
        Cell.Loci = Loci;
        function isLoci(x) { return !!x && x.kind === 'cell-loci'; }
        Cell.isLoci = isLoci;
        function areLociEqual(a, b) { return a.volume === b.volume && int_1.OrderedSet.areEqual(a.indices, b.indices); }
        Cell.areLociEqual = areLociEqual;
        function isLociEmpty(loci) { return int_1.OrderedSet.size(loci.indices) === 0; }
        Cell.isLociEmpty = isLociEmpty;
        const boundaryHelper = new boundary_helper_1.BoundaryHelper('98');
        const tmpBoundaryPos = (0, linear_algebra_1.Vec3)();
        function getBoundingSphere(volume, indices, boundingSphere) {
            boundaryHelper.reset();
            const transform = grid_1.Grid.getGridToCartesianTransform(volume.grid);
            const { getCoords } = volume.grid.cells.space;
            for (let i = 0, _i = int_1.OrderedSet.size(indices); i < _i; i++) {
                const o = int_1.OrderedSet.getAt(indices, i);
                getCoords(o, tmpBoundaryPos);
                linear_algebra_1.Vec3.transformMat4(tmpBoundaryPos, tmpBoundaryPos, transform);
                boundaryHelper.includePosition(tmpBoundaryPos);
            }
            boundaryHelper.finishedIncludeStep();
            for (let i = 0, _i = int_1.OrderedSet.size(indices); i < _i; i++) {
                const o = int_1.OrderedSet.getAt(indices, i);
                getCoords(o, tmpBoundaryPos);
                linear_algebra_1.Vec3.transformMat4(tmpBoundaryPos, tmpBoundaryPos, transform);
                boundaryHelper.radiusPosition(tmpBoundaryPos);
            }
            const bs = boundaryHelper.getSphere(boundingSphere);
            return geometry_1.Sphere3D.expand(bs, bs, linear_algebra_1.Mat4.getMaxScaleOnAxis(transform) * 10);
        }
        Cell.getBoundingSphere = getBoundingSphere;
    })(Cell = Volume.Cell || (Volume.Cell = {}));
    let Segment;
    (function (Segment) {
        function Loci(volume, segments) { return { kind: 'segment-loci', volume, segments: int_1.SortedArray.ofUnsortedArray(segments) }; }
        Segment.Loci = Loci;
        function isLoci(x) { return !!x && x.kind === 'segment-loci'; }
        Segment.isLoci = isLoci;
        function areLociEqual(a, b) { return a.volume === b.volume && int_1.SortedArray.areEqual(a.segments, b.segments); }
        Segment.areLociEqual = areLociEqual;
        function isLociEmpty(loci) { return loci.volume.grid.cells.data.length === 0 || loci.segments.length === 0; }
        Segment.isLociEmpty = isLociEmpty;
        const bbox = (0, geometry_1.Box3D)();
        function getBoundingSphere(volume, segments, boundingSphere) {
            const segmentation = Volume.Segmentation.get(volume);
            if (segmentation) {
                geometry_1.Box3D.setEmpty(bbox);
                for (let i = 0, il = segments.length; i < il; ++i) {
                    const b = segmentation.bounds[segments[i]];
                    geometry_1.Box3D.add(bbox, b.min);
                    geometry_1.Box3D.add(bbox, b.max);
                }
                const transform = grid_1.Grid.getGridToCartesianTransform(volume.grid);
                geometry_1.Box3D.transform(bbox, bbox, transform);
                return geometry_1.Sphere3D.fromBox3D(boundingSphere || (0, geometry_1.Sphere3D)(), bbox);
            }
            else {
                return Volume.getBoundingSphere(volume, boundingSphere);
            }
        }
        Segment.getBoundingSphere = getBoundingSphere;
        function Location(volume, segment) {
            return { kind: 'segment-location', volume: volume, segment: segment };
        }
        Segment.Location = Location;
        function isLocation(x) {
            return !!x && x.kind === 'segment-location';
        }
        Segment.isLocation = isLocation;
    })(Segment = Volume.Segment || (Volume.Segment = {}));
    Volume.PickingGranularity = {
        set(volume, granularity) {
            volume._propertyData['__picking_granularity__'] = granularity;
        },
        get(volume) {
            var _a;
            return (_a = volume._propertyData['__picking_granularity__']) !== null && _a !== void 0 ? _a : 'voxel';
        }
    };
    Volume.Segmentation = {
        set(volume, segmentation) {
            volume._propertyData['__segmentation__'] = segmentation;
        },
        get(volume) {
            return volume._propertyData['__segmentation__'];
        }
    };
})(Volume || (exports.Volume = Volume = {}));
