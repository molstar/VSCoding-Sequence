"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeStreaming = void 0;
const param_definition_1 = require("../../../../mol-util/param-definition");
const objects_1 = require("../../../../mol-plugin-state/objects");
const volume_1 = require("../../../../mol-model/volume");
const geometry_1 = require("../../../../mol-math/geometry");
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const color_1 = require("../../../../mol-util/color");
const behavior_1 = require("../../behavior");
const lru_cache_1 = require("../../../../mol-util/lru-cache");
const url_1 = require("../../../../mol-util/url");
const cif_1 = require("../../../../mol-io/reader/cif");
const density_server_1 = require("../../../../mol-model-formats/volume/density-server");
const commands_1 = require("../../../commands");
const mol_state_1 = require("../../../../mol-state");
const structure_1 = require("../../../../mol-model/structure");
const loci_1 = require("../../../../mol-model/loci");
const assets_1 = require("../../../../mol-util/assets");
const global_transform_1 = require("../../../../mol-model/structure/model/properties/global-transform");
const rxjs_1 = require("rxjs");
const single_async_queue_1 = require("../../../../mol-util/single-async-queue");
class VolumeStreaming extends objects_1.PluginStateObject.CreateBehavior({ name: 'Volume Streaming' }) {
}
exports.VolumeStreaming = VolumeStreaming;
(function (VolumeStreaming) {
    VolumeStreaming.RootTag = 'volume-streaming-info';
    function channelParam(label, color, defaultValue, stats, defaults = {}) {
        var _a, _b, _c, _d;
        return param_definition_1.ParamDefinition.Group({
            isoValue: volume_1.Volume.createIsoValueParam((_a = defaults.isoValue) !== null && _a !== void 0 ? _a : defaultValue, stats),
            color: param_definition_1.ParamDefinition.Color((_b = defaults.color) !== null && _b !== void 0 ? _b : color),
            wireframe: param_definition_1.ParamDefinition.Boolean((_c = defaults.wireframe) !== null && _c !== void 0 ? _c : false),
            opacity: param_definition_1.ParamDefinition.Numeric((_d = defaults.opacity) !== null && _d !== void 0 ? _d : 0.3, { min: 0, max: 1, step: 0.01 })
        }, { label, isExpanded: true });
    }
    const fakeSampling = {
        byteOffset: 0,
        rate: 1,
        sampleCount: [1, 1, 1],
        valuesInfo: [{ mean: 0, min: -1, max: 1, sigma: 0.1 }, { mean: 0, min: -1, max: 1, sigma: 0.1 }]
    };
    function createParams(options = {}) {
        const { data, defaultView, channelParams } = options;
        const map = new Map();
        if (data)
            data.entries.forEach(d => map.set(d.dataId, d));
        const names = data ? data.entries.map(d => [d.dataId, d.dataId]) : [];
        const defaultKey = data ? data.entries[0].dataId : '';
        return {
            entry: param_definition_1.ParamDefinition.Mapped(defaultKey, names, name => param_definition_1.ParamDefinition.Group(createEntryParams({ entryData: map.get(name), defaultView, structure: data && data.structure, channelParams }))),
        };
    }
    VolumeStreaming.createParams = createParams;
    function createEntryParams(options) {
        const { entryData, defaultView, structure, channelParams = {} } = options;
        // fake the info
        const info = entryData || { kind: 'em', header: { sampling: [fakeSampling], availablePrecisions: [{ precision: 0, maxVoxels: 0 }] }, emDefaultContourLevel: volume_1.Volume.IsoValue.relative(0) };
        const box = (structure && structure.boundary.box) || (0, geometry_1.Box3D)();
        return {
            view: param_definition_1.ParamDefinition.MappedStatic(defaultView || (info.kind === 'em' ? 'auto' : 'selection-box'), {
                'off': param_definition_1.ParamDefinition.Group({}),
                'box': param_definition_1.ParamDefinition.Group({
                    bottomLeft: param_definition_1.ParamDefinition.Vec3(box.min),
                    topRight: param_definition_1.ParamDefinition.Vec3(box.max),
                }, { description: 'Static box defined by cartesian coords.', isFlat: true }),
                'selection-box': param_definition_1.ParamDefinition.Group({
                    radius: param_definition_1.ParamDefinition.Numeric(5, { min: 0, max: 50, step: 0.5 }, { description: 'Radius in \u212B within which the volume is shown.' }),
                    bottomLeft: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(0, 0, 0), {}, { isHidden: true }),
                    topRight: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(0, 0, 0), {}, { isHidden: true }),
                }, { description: 'Box around focused element.', isFlat: true }),
                'camera-target': param_definition_1.ParamDefinition.Group({
                    radius: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.05 }, { description: 'Radius within which the volume is shown (relative to the field of view).' }),
                    // Minimal detail level for the inside of the zoomed region (real detail can be higher, depending on the region size)
                    dynamicDetailLevel: createDetailParams(info.header.availablePrecisions, 0, { label: 'Dynamic Detail' }),
                    bottomLeft: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(0, 0, 0), {}, { isHidden: true }),
                    topRight: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(0, 0, 0), {}, { isHidden: true }),
                }, { description: 'Box around camera target.', isFlat: true }),
                'cell': param_definition_1.ParamDefinition.Group({}),
                // Show selection-box if available and cell otherwise.
                'auto': param_definition_1.ParamDefinition.Group({
                    radius: param_definition_1.ParamDefinition.Numeric(5, { min: 0, max: 50, step: 0.5 }, { description: 'Radius in \u212B within which the volume is shown.' }),
                    selectionDetailLevel: createDetailParams(info.header.availablePrecisions, 6, { label: 'Selection Detail' }),
                    isSelection: param_definition_1.ParamDefinition.Boolean(false, { isHidden: true }),
                    bottomLeft: param_definition_1.ParamDefinition.Vec3(box.min, {}, { isHidden: true }),
                    topRight: param_definition_1.ParamDefinition.Vec3(box.max, {}, { isHidden: true }),
                }, { description: 'Box around focused element.', isFlat: true })
            }, { options: VolumeStreaming.ViewTypeOptions, description: 'Controls what of the volume is displayed. "Off" hides the volume alltogether. "Bounded box" shows the volume inside the given box. "Around Interaction" shows the volume around the focused element/atom. "Whole Structure" shows the volume for the whole structure.' }),
            detailLevel: createDetailParams(info.header.availablePrecisions, 3),
            channels: info.kind === 'em'
                ? param_definition_1.ParamDefinition.Group({
                    'em': channelParam('EM', (0, color_1.Color)(0x638F8F), info.emDefaultContourLevel || volume_1.Volume.IsoValue.relative(1), info.header.sampling[0].valuesInfo[0], channelParams['em'])
                }, { isFlat: true })
                : param_definition_1.ParamDefinition.Group({
                    '2fo-fc': channelParam('2Fo-Fc', (0, color_1.Color)(0x3362B2), volume_1.Volume.IsoValue.relative(1.5), info.header.sampling[0].valuesInfo[0], channelParams['2fo-fc']),
                    'fo-fc(+ve)': channelParam('Fo-Fc(+ve)', (0, color_1.Color)(0x33BB33), volume_1.Volume.IsoValue.relative(3), info.header.sampling[0].valuesInfo[1], channelParams['fo-fc(+ve)']),
                    'fo-fc(-ve)': channelParam('Fo-Fc(-ve)', (0, color_1.Color)(0xBB3333), volume_1.Volume.IsoValue.relative(-3), info.header.sampling[0].valuesInfo[1], channelParams['fo-fc(-ve)']),
                }, { isFlat: true }),
        };
    }
    VolumeStreaming.createEntryParams = createEntryParams;
    function createDetailParams(availablePrecisions, preferredPrecision, info) {
        return param_definition_1.ParamDefinition.Select(Math.min(preferredPrecision, availablePrecisions.length - 1), availablePrecisions.map((p, i) => [i, `${i + 1} [ ${Math.pow(p.maxVoxels, 1 / 3) | 0}^3 cells ]`]), {
            description: 'Determines the maximum number of voxels. Depending on the size of the volume options are in the range from 1 (0.52M voxels) to 7 (25.17M voxels).',
            ...info
        });
    }
    function copyParams(origParams) {
        return {
            entry: {
                name: origParams.entry.name,
                params: {
                    detailLevel: origParams.entry.params.detailLevel,
                    channels: origParams.entry.params.channels,
                    view: {
                        name: origParams.entry.params.view.name,
                        params: { ...origParams.entry.params.view.params },
                    }
                }
            }
        };
    }
    VolumeStreaming.copyParams = copyParams;
    VolumeStreaming.ViewTypeOptions = [['off', 'Off'], ['box', 'Bounded Box'], ['selection-box', 'Around Focus'], ['camera-target', 'Around Camera'], ['cell', 'Whole Structure'], ['auto', 'Auto']];
    VolumeStreaming.ChannelTypeOptions = [['em', 'em'], ['2fo-fc', '2fo-fc'], ['fo-fc(+ve)', 'fo-fc(+ve)'], ['fo-fc(-ve)', 'fo-fc(-ve)']];
    class Behavior extends behavior_1.PluginBehavior.WithSubscribers {
        get info() {
            return this.infoMap.get(this.params.entry.name);
        }
        async queryData(box) {
            let url = (0, url_1.urlCombine)(this.data.serverUrl, `${this.info.kind}/${this.info.dataId.toLowerCase()}`);
            if (box) {
                const { min: a, max: b } = box;
                url += `/box`
                    + `/${a.map(v => Math.round(1000 * v) / 1000).join(',')}`
                    + `/${b.map(v => Math.round(1000 * v) / 1000).join(',')}`;
            }
            else {
                url += `/cell`;
            }
            let detail = this.params.entry.params.detailLevel;
            if (this.params.entry.params.view.name === 'auto' && this.params.entry.params.view.params.isSelection) {
                detail = this.params.entry.params.view.params.selectionDetailLevel;
            }
            if (this.params.entry.params.view.name === 'camera-target' && box) {
                detail = this.decideDetail(box, this.params.entry.params.view.params.dynamicDetailLevel);
            }
            url += `?detail=${detail}`;
            const entry = lru_cache_1.LRUCache.get(this.cache, url);
            if (entry)
                return entry.data;
            const urlAsset = assets_1.Asset.getUrlAsset(this.plugin.managers.asset, url);
            const asset = await this.plugin.runTask(this.plugin.managers.asset.resolve(urlAsset, 'binary'));
            const data = await this.parseCif(asset.data);
            if (!data)
                return;
            const removed = lru_cache_1.LRUCache.set(this.cache, url, { data, asset });
            if (removed)
                removed.asset.dispose();
            return data;
        }
        async parseCif(data) {
            const parsed = await this.plugin.runTask(cif_1.CIF.parseBinary(data));
            if (parsed.isError) {
                this.plugin.log.error('VolumeStreaming, parsing CIF: ' + parsed.toString());
                return;
            }
            if (parsed.result.blocks.length < 2) {
                this.plugin.log.error('VolumeStreaming: Invalid data.');
                return;
            }
            const ret = {};
            for (let i = 1; i < parsed.result.blocks.length; i++) {
                const block = parsed.result.blocks[i];
                const densityServerCif = cif_1.CIF.schema.densityServer(block);
                const volume = await this.plugin.runTask((0, density_server_1.volumeFromDensityServerData)(densityServerCif));
                ret[block.header] = volume;
            }
            return ret;
        }
        async updateParams(box, autoIsSelection = false) {
            const newParams = copyParams(this.params);
            const viewType = newParams.entry.params.view.name;
            if (viewType !== 'off' && viewType !== 'cell') {
                newParams.entry.params.view.params.bottomLeft = (box === null || box === void 0 ? void 0 : box.min) || linear_algebra_1.Vec3.zero();
                newParams.entry.params.view.params.topRight = (box === null || box === void 0 ? void 0 : box.max) || linear_algebra_1.Vec3.zero();
            }
            if (viewType === 'auto') {
                newParams.entry.params.view.params.isSelection = autoIsSelection;
            }
            const state = this.plugin.state.data;
            const update = state.build().to(this.ref).update(newParams);
            await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: update, options: { doNotUpdateCurrent: true } });
        }
        getStructureRoot() {
            return this.plugin.state.data.select(mol_state_1.StateSelection.Generators.byRef(this.ref).rootOfType(objects_1.PluginStateObject.Molecule.Structure))[0];
        }
        register(ref) {
            this.ref = ref;
            this.subscribeObservable(this.plugin.state.events.object.removed, o => {
                if (!objects_1.PluginStateObject.Molecule.Structure.is(o.obj) || !structure_1.StructureElement.Loci.is(this.lastLoci))
                    return;
                if (this.lastLoci.structure === o.obj.data) {
                    this.lastLoci = loci_1.EmptyLoci;
                }
            });
            this.subscribeObservable(this.plugin.state.events.object.updated, o => {
                if (!objects_1.PluginStateObject.Molecule.Structure.is(o.oldObj) || !structure_1.StructureElement.Loci.is(this.lastLoci))
                    return;
                if (this.lastLoci.structure === o.oldObj.data) {
                    this.lastLoci = loci_1.EmptyLoci;
                }
            });
            this.subscribeObservable(this.plugin.managers.structure.focus.behaviors.current, (entry) => {
                if (!this.plugin.state.data.tree.children.has(this.ref))
                    return;
                const loci = entry ? entry.loci : loci_1.EmptyLoci;
                switch (this.params.entry.params.view.name) {
                    case 'auto':
                        this.updateAuto(loci);
                        break;
                    case 'selection-box':
                        this.updateSelectionBox(loci);
                        break;
                    default:
                        this.lastLoci = loci;
                        break;
                }
            });
        }
        unregister() {
            let entry = this.cache.entries.first;
            while (entry) {
                entry.value.data.asset.dispose();
                entry = entry.next;
            }
        }
        isCameraTargetSame(a, b) {
            if (!a || !b)
                return false;
            const targetSame = linear_algebra_1.Vec3.equals(a.target, b.target);
            const sqDistA = linear_algebra_1.Vec3.squaredDistance(a.target, a.position);
            const sqDistB = linear_algebra_1.Vec3.squaredDistance(b.target, b.position);
            const distanceSame = Math.abs(sqDistA - sqDistB) / sqDistA < 1e-3;
            return targetSame && distanceSame;
        }
        cameraTargetDistance(snapshot) {
            return linear_algebra_1.Vec3.distance(snapshot.target, snapshot.position);
        }
        getBoxFromLoci(loci) {
            var _a, _b, _c;
            if (loci_1.Loci.isEmpty(loci) || (0, loci_1.isEmptyLoci)(loci)) {
                return (0, geometry_1.Box3D)();
            }
            const parent = this.plugin.helpers.substructureParent.get(loci.structure, true);
            if (!parent)
                return (0, geometry_1.Box3D)();
            const root = this.getStructureRoot();
            if (!root || ((_a = root.obj) === null || _a === void 0 ? void 0 : _a.data) !== ((_b = parent.obj) === null || _b === void 0 ? void 0 : _b.data))
                return (0, geometry_1.Box3D)();
            const transform = global_transform_1.GlobalModelTransformInfo.get((_c = root.obj) === null || _c === void 0 ? void 0 : _c.data.models[0]);
            if (transform)
                linear_algebra_1.Mat4.invert(this._invTransform, transform);
            const extendedLoci = structure_1.StructureElement.Loci.extendToWholeResidues(loci);
            const box = structure_1.StructureElement.Loci.getBoundary(extendedLoci, transform && !Number.isNaN(this._invTransform[0]) ? this._invTransform : void 0).box;
            if (structure_1.StructureElement.Loci.size(extendedLoci) === 1) {
                geometry_1.Box3D.expand(box, box, linear_algebra_1.Vec3.create(1, 1, 1));
            }
            return box;
        }
        updateAuto(loci) {
            this.updateQueue.enqueue(async () => {
                this.lastLoci = loci;
                if ((0, loci_1.isEmptyLoci)(loci)) {
                    await this.updateParams(this.info.kind === 'x-ray' ? this.data.structure.boundary.box : void 0, false);
                }
                else {
                    await this.updateParams(this.getBoxFromLoci(loci), true);
                }
            });
        }
        updateSelectionBox(loci) {
            this.updateQueue.enqueue(async () => {
                if (loci_1.Loci.areEqual(this.lastLoci, loci)) {
                    this.lastLoci = loci_1.EmptyLoci;
                }
                else {
                    this.lastLoci = loci;
                }
                const box = this.getBoxFromLoci(this.lastLoci);
                await this.updateParams(box);
            });
        }
        updateCameraTarget(snapshot) {
            this.updateQueue.enqueue(async () => {
                var _a, _b, _c;
                const origManualReset = (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.props.camera.manualReset;
                try {
                    if (!origManualReset)
                        (_b = this.plugin.canvas3d) === null || _b === void 0 ? void 0 : _b.setProps({ camera: { manualReset: true } });
                    const box = this.boxFromCameraTarget(snapshot, true);
                    await this.updateParams(box);
                }
                finally {
                    if (!origManualReset)
                        (_c = this.plugin.canvas3d) === null || _c === void 0 ? void 0 : _c.setProps({ camera: { manualReset: origManualReset } });
                }
            });
        }
        boxFromCameraTarget(snapshot, boundByBoundarySize) {
            var _a;
            const target = snapshot.target;
            const distance = this.cameraTargetDistance(snapshot);
            const top = Math.tan(0.5 * snapshot.fov) * distance;
            let radius = top;
            const viewport = (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.camera.viewport;
            if (viewport && viewport.width > viewport.height) {
                radius *= viewport.width / viewport.height;
            }
            const relativeRadius = this.params.entry.params.view.name === 'camera-target' ? this.params.entry.params.view.params.radius : 0.5;
            radius *= relativeRadius;
            let radiusX, radiusY, radiusZ;
            if (boundByBoundarySize) {
                const bBoxSize = linear_algebra_1.Vec3.zero();
                geometry_1.Box3D.size(bBoxSize, this.data.structure.boundary.box);
                radiusX = Math.min(radius, 0.5 * bBoxSize[0]);
                radiusY = Math.min(radius, 0.5 * bBoxSize[1]);
                radiusZ = Math.min(radius, 0.5 * bBoxSize[2]);
            }
            else {
                radiusX = radiusY = radiusZ = radius;
            }
            return geometry_1.Box3D.create(linear_algebra_1.Vec3.create(target[0] - radiusX, target[1] - radiusY, target[2] - radiusZ), linear_algebra_1.Vec3.create(target[0] + radiusX, target[1] + radiusY, target[2] + radiusZ));
        }
        decideDetail(box, baseDetail) {
            const cellVolume = this.info.kind === 'x-ray'
                ? geometry_1.Box3D.volume(this.data.structure.boundary.box)
                : this.info.header.spacegroup.size.reduce((a, b) => a * b, 1);
            const boxVolume = geometry_1.Box3D.volume(box);
            let ratio = boxVolume / cellVolume;
            const maxDetail = this.info.header.availablePrecisions.length - 1;
            let detail = baseDetail;
            while (ratio <= 0.5 && detail < maxDetail) {
                ratio *= 2;
                detail += 1;
            }
            // console.log(`Decided dynamic detail: ${detail}, (base detail: ${baseDetail}, box/cell volume ratio: ${boxVolume / cellVolume})`);
            return detail;
        }
        async update(params) {
            const switchedToSelection = params.entry.params.view.name === 'selection-box' && this.params && this.params.entry && this.params.entry.params && this.params.entry.params.view && this.params.entry.params.view.name !== 'selection-box';
            this.params = params;
            let box = void 0, emptyData = false;
            if (params.entry.params.view.name !== 'camera-target' && this.cameraTargetSubscription) {
                this.cameraTargetSubscription.unsubscribe();
                this.cameraTargetSubscription = undefined;
            }
            switch (params.entry.params.view.name) {
                case 'off':
                    emptyData = true;
                    break;
                case 'box':
                    box = geometry_1.Box3D.create(params.entry.params.view.params.bottomLeft, params.entry.params.view.params.topRight);
                    emptyData = geometry_1.Box3D.volume(box) < 0.0001;
                    break;
                case 'selection-box': {
                    if (switchedToSelection) {
                        box = this.getBoxFromLoci(this.lastLoci) || (0, geometry_1.Box3D)();
                    }
                    else {
                        box = geometry_1.Box3D.create(linear_algebra_1.Vec3.clone(params.entry.params.view.params.bottomLeft), linear_algebra_1.Vec3.clone(params.entry.params.view.params.topRight));
                    }
                    const r = params.entry.params.view.params.radius;
                    emptyData = geometry_1.Box3D.volume(box) < 0.0001;
                    geometry_1.Box3D.expand(box, box, linear_algebra_1.Vec3.create(r, r, r));
                    break;
                }
                case 'camera-target':
                    if (!this.cameraTargetSubscription) {
                        this.cameraTargetSubscription = this.subscribeObservable(this.cameraTargetObservable, (e) => this.updateCameraTarget(e));
                    }
                    box = this.boxFromCameraTarget(this.plugin.canvas3d.camera.getSnapshot(), true);
                    break;
                case 'cell':
                    box = this.info.kind === 'x-ray'
                        ? this.data.structure.boundary.box
                        : void 0;
                    break;
                case 'auto':
                    box = params.entry.params.view.params.isSelection || this.info.kind === 'x-ray'
                        ? geometry_1.Box3D.create(linear_algebra_1.Vec3.clone(params.entry.params.view.params.bottomLeft), linear_algebra_1.Vec3.clone(params.entry.params.view.params.topRight))
                        : void 0;
                    if (box) {
                        emptyData = geometry_1.Box3D.volume(box) < 0.0001;
                        if (params.entry.params.view.params.isSelection) {
                            const r = params.entry.params.view.params.radius;
                            geometry_1.Box3D.expand(box, box, linear_algebra_1.Vec3.create(r, r, r));
                        }
                    }
                    break;
            }
            const data = emptyData ? {} : await this.queryData(box);
            if (!data)
                return false;
            const info = params.entry.params.channels;
            if (this.info.kind === 'x-ray') {
                this.channels['2fo-fc'] = this.createChannel(data['2FO-FC'] || volume_1.Volume.One, info['2fo-fc'], this.info.header.sampling[0].valuesInfo[0]);
                this.channels['fo-fc(+ve)'] = this.createChannel(data['FO-FC'] || volume_1.Volume.One, info['fo-fc(+ve)'], this.info.header.sampling[0].valuesInfo[1]);
                this.channels['fo-fc(-ve)'] = this.createChannel(data['FO-FC'] || volume_1.Volume.One, info['fo-fc(-ve)'], this.info.header.sampling[0].valuesInfo[1]);
            }
            else {
                this.channels['em'] = this.createChannel(data['EM'] || volume_1.Volume.One, info['em'], this.info.header.sampling[0].valuesInfo[0]);
            }
            return true;
        }
        createChannel(data, info, stats) {
            const i = info;
            return {
                data,
                color: i.color,
                wireframe: i.wireframe,
                opacity: i.opacity,
                isoValue: i.isoValue.kind === 'relative' ? i.isoValue : volume_1.Volume.IsoValue.toRelative(i.isoValue, stats)
            };
        }
        getDescription() {
            if (this.params.entry.params.view.name === 'selection-box')
                return 'Selection';
            if (this.params.entry.params.view.name === 'camera-target')
                return 'Camera';
            if (this.params.entry.params.view.name === 'box')
                return 'Static Box';
            if (this.params.entry.params.view.name === 'cell')
                return 'Cell';
            return '';
        }
        constructor(plugin, data) {
            super(plugin, {});
            this.plugin = plugin;
            this.data = data;
            this.cache = lru_cache_1.LRUCache.create(25);
            this.params = {};
            this.lastLoci = loci_1.EmptyLoci;
            this.ref = '';
            this.cameraTargetObservable = this.plugin.canvas3d.didDraw.pipe((0, rxjs_1.throttleTime)(500, undefined, { 'leading': true, 'trailing': true }), (0, rxjs_1.map)(() => { var _a; return (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.camera.getSnapshot(); }), (0, rxjs_1.distinctUntilChanged)((a, b) => this.isCameraTargetSame(a, b)), (0, rxjs_1.filter)(a => a !== undefined));
            this.cameraTargetSubscription = undefined;
            this.channels = {};
            this._invTransform = (0, linear_algebra_1.Mat4)();
            this.infoMap = new Map();
            this.data.entries.forEach(info => this.infoMap.set(info.dataId, info));
            this.updateQueue = new single_async_queue_1.SingleAsyncQueue();
        }
    }
    VolumeStreaming.Behavior = Behavior;
})(VolumeStreaming || (exports.VolumeStreaming = VolumeStreaming = {}));
