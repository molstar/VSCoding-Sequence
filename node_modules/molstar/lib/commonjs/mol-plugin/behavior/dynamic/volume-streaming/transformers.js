"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeStreamingVisual = exports.CreateVolumeStreamingBehavior = exports.CreateVolumeStreamingInfo = exports.BoxifyVolumeStreaming = exports.InitVolumeStreaming = void 0;
const objects_1 = require("../../../../mol-plugin-state/objects");
const model_1 = require("./model");
const param_definition_1 = require("../../../../mol-util/param-definition");
const mol_task_1 = require("../../../../mol-task");
const url_1 = require("../../../../mol-util/url");
const volume_1 = require("../../../../mol-model/volume");
const mol_state_1 = require("../../../../mol-state");
const util_1 = require("./util");
const behavior_1 = require("./behavior");
const representation_1 = require("../../../../mol-plugin-state/transforms/representation");
const registry_1 = require("../../../../mol-repr/volume/registry");
const theme_1 = require("../../../../mol-theme/theme");
const geometry_1 = require("../../../../mol-math/geometry");
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const config_1 = require("../../../config");
const structure_1 = require("../../../../mol-model/structure");
const global_transform_1 = require("../../../../mol-model/structure/model/properties/global-transform");
function addEntry(entries, method, dataId, emDefaultContourLevel) {
    entries.push({
        source: method === 'em'
            ? { name: 'em', params: { isoValue: volume_1.Volume.IsoValue.absolute(emDefaultContourLevel || 0) } }
            : { name: 'x-ray', params: {} },
        dataId
    });
}
exports.InitVolumeStreaming = mol_state_1.StateAction.build({
    display: { name: 'Volume Streaming' },
    from: objects_1.PluginStateObject.Molecule.Structure,
    params(a, plugin) {
        const method = (0, util_1.getStreamingMethod)(a && a.data);
        const ids = (0, util_1.getIds)(method, a && a.data);
        return {
            method: param_definition_1.ParamDefinition.Select(method, [['em', 'EM'], ['x-ray', 'X-Ray']]),
            entries: param_definition_1.ParamDefinition.ObjectList({ id: param_definition_1.ParamDefinition.Text(ids[0] || '') }, ({ id }) => id, { defaultValue: ids.map(id => ({ id })) }),
            defaultView: param_definition_1.ParamDefinition.Select(method === 'em' ? 'auto' : 'selection-box', behavior_1.VolumeStreaming.ViewTypeOptions),
            options: param_definition_1.ParamDefinition.Group({
                serverUrl: param_definition_1.ParamDefinition.Text(plugin.config.get(config_1.PluginConfig.VolumeStreaming.DefaultServer) || 'https://ds.litemol.org'),
                behaviorRef: param_definition_1.ParamDefinition.Text('', { isHidden: true }),
                emContourProvider: param_definition_1.ParamDefinition.Select('emdb', [['emdb', 'EMDB'], ['pdbe', 'PDBe']], { isHidden: true }),
                channelParams: param_definition_1.ParamDefinition.Value({}, { isHidden: true })
            })
        };
    },
    isApplicable: (a, _, plugin) => {
        const canStreamTest = plugin.config.get(config_1.PluginConfig.VolumeStreaming.CanStream);
        if (canStreamTest)
            return canStreamTest(a.data, plugin);
        return a.data.models.length === 1 && structure_1.Model.probablyHasDensityMap(a.data.models[0]);
    }
})(({ ref, state, params }, plugin) => mol_task_1.Task.create('Volume Streaming', async (taskCtx) => {
    const entries = [];
    for (let i = 0, il = params.entries.length; i < il; ++i) {
        const dataId = params.entries[i].id.toLowerCase();
        let emDefaultContourLevel;
        if (params.method === 'em') {
            // if pdb ids are given for method 'em', get corresponding emd ids
            // and continue the loop
            if (!dataId.toUpperCase().startsWith('EMD')) {
                await taskCtx.update('Getting EMDB info...');
                const emdbIds = await (0, util_1.getEmdbIds)(plugin, taskCtx, dataId);
                for (let j = 0, jl = emdbIds.length; j < jl; ++j) {
                    const emdbId = emdbIds[j];
                    let contourLevel;
                    try {
                        contourLevel = await (0, util_1.getContourLevel)(params.options.emContourProvider, plugin, taskCtx, emdbId);
                    }
                    catch (e) {
                        console.info(`Could not get map info for ${emdbId}: ${e}`);
                        continue;
                    }
                    addEntry(entries, params.method, emdbId, contourLevel || 0);
                }
                continue;
            }
            try {
                emDefaultContourLevel = await (0, util_1.getContourLevel)(params.options.emContourProvider, plugin, taskCtx, dataId);
            }
            catch (e) {
                console.info(`Could not get map info for ${dataId}: ${e}`);
                continue;
            }
        }
        addEntry(entries, params.method, dataId, emDefaultContourLevel || 0);
    }
    const infoTree = state.build().to(ref)
        .applyOrUpdateTagged(behavior_1.VolumeStreaming.RootTag, CreateVolumeStreamingInfo, {
        serverUrl: params.options.serverUrl,
        entries
    });
    await infoTree.commit();
    const info = infoTree.selector;
    if (!info.isOk)
        return;
    // clear the children in case there were errors
    const children = state.tree.children.get(info.ref);
    if ((children === null || children === void 0 ? void 0 : children.size) > 0)
        await plugin.managers.structure.hierarchy.remove(children === null || children === void 0 ? void 0 : children.toArray());
    const infoObj = info.cell.obj;
    const behTree = state.build().to(infoTree.ref).apply(CreateVolumeStreamingBehavior, param_definition_1.ParamDefinition.getDefaultValues(behavior_1.VolumeStreaming.createParams({ data: infoObj.data, defaultView: params.defaultView, channelParams: params.options.channelParams })), { ref: params.options.behaviorRef ? params.options.behaviorRef : void 0 });
    if (params.method === 'em') {
        behTree.apply(VolumeStreamingVisual, { channel: 'em' }, { state: { isGhost: true }, tags: 'em' });
    }
    else {
        behTree.apply(VolumeStreamingVisual, { channel: '2fo-fc' }, { state: { isGhost: true }, tags: '2fo-fc' });
        behTree.apply(VolumeStreamingVisual, { channel: 'fo-fc(+ve)' }, { state: { isGhost: true }, tags: 'fo-fc(+ve)' });
        behTree.apply(VolumeStreamingVisual, { channel: 'fo-fc(-ve)' }, { state: { isGhost: true }, tags: 'fo-fc(-ve)' });
    }
    await state.updateTree(behTree).runInContext(taskCtx);
}));
exports.BoxifyVolumeStreaming = mol_state_1.StateAction.build({
    display: { name: 'Boxify Volume Streaming', description: 'Make the current box permanent.' },
    from: behavior_1.VolumeStreaming,
    isApplicable: (a) => a.data.params.entry.params.view.name === 'selection-box'
})(({ a, ref, state }, plugin) => {
    const params = a.data.params;
    if (params.entry.params.view.name !== 'selection-box')
        return;
    const box = geometry_1.Box3D.create(linear_algebra_1.Vec3.clone(params.entry.params.view.params.bottomLeft), linear_algebra_1.Vec3.clone(params.entry.params.view.params.topRight));
    const r = params.entry.params.view.params.radius;
    geometry_1.Box3D.expand(box, box, linear_algebra_1.Vec3.create(r, r, r));
    const newParams = {
        ...params,
        entry: {
            name: params.entry.name,
            params: {
                ...params.entry.params,
                view: {
                    name: 'box',
                    params: {
                        bottomLeft: box.min,
                        topRight: box.max
                    }
                }
            }
        }
    };
    return state.updateTree(state.build().to(ref).update(newParams));
});
const InfoEntryParams = {
    dataId: param_definition_1.ParamDefinition.Text(''),
    source: param_definition_1.ParamDefinition.MappedStatic('x-ray', {
        'em': param_definition_1.ParamDefinition.Group({
            isoValue: volume_1.Volume.createIsoValueParam(volume_1.Volume.IsoValue.relative(1))
        }),
        'x-ray': param_definition_1.ParamDefinition.Group({})
    })
};
const CreateVolumeStreamingInfo = objects_1.PluginStateTransform.BuiltIn({
    name: 'create-volume-streaming-info',
    display: { name: 'Volume Streaming Info' },
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: model_1.VolumeServerInfo,
    params(a) {
        return {
            serverUrl: param_definition_1.ParamDefinition.Text('https://ds.litemol.org'),
            entries: param_definition_1.ParamDefinition.ObjectList(InfoEntryParams, ({ dataId }) => dataId, {
                defaultValue: [{ dataId: '', source: { name: 'x-ray', params: {} } }]
            }),
        };
    }
})({
    apply: ({ a, params }, plugin) => mol_task_1.Task.create('', async (taskCtx) => {
        const entries = [];
        for (let i = 0, il = params.entries.length; i < il; ++i) {
            const e = params.entries[i];
            const dataId = e.dataId;
            const emDefaultContourLevel = e.source.name === 'em' ? e.source.params.isoValue : volume_1.Volume.IsoValue.relative(1);
            await taskCtx.update('Getting server header...');
            const header = await plugin.fetch({ url: (0, url_1.urlCombine)(params.serverUrl, `${e.source.name}/${dataId.toLocaleLowerCase()}`), type: 'json' }).runInContext(taskCtx);
            entries.push({
                dataId,
                kind: e.source.name,
                header,
                emDefaultContourLevel
            });
        }
        const data = {
            serverUrl: params.serverUrl,
            entries,
            structure: a.data
        };
        return new model_1.VolumeServerInfo(data, { label: 'Volume Server', description: `${entries.map(e => e.dataId).join(', ')}` });
    })
});
exports.CreateVolumeStreamingInfo = CreateVolumeStreamingInfo;
const CreateVolumeStreamingBehavior = objects_1.PluginStateTransform.BuiltIn({
    name: 'create-volume-streaming-behavior',
    display: { name: 'Volume Streaming Behavior' },
    from: model_1.VolumeServerInfo,
    to: behavior_1.VolumeStreaming,
    params(a) {
        return behavior_1.VolumeStreaming.createParams({ data: a && a.data });
    }
})({
    canAutoUpdate: ({ oldParams, newParams }) => {
        return oldParams.entry.params.view === newParams.entry.params.view
            || newParams.entry.params.view.name === 'selection-box'
            || newParams.entry.params.view.name === 'camera-target'
            || newParams.entry.params.view.name === 'off';
    },
    apply: ({ a, params }, plugin) => mol_task_1.Task.create('Volume streaming', async (_) => {
        const behavior = new behavior_1.VolumeStreaming.Behavior(plugin, a.data);
        await behavior.update(params);
        return new behavior_1.VolumeStreaming(behavior, { label: 'Volume Streaming', description: behavior.getDescription() });
    }),
    update({ a, b, oldParams, newParams }) {
        return mol_task_1.Task.create('Update Volume Streaming', async (_) => {
            if (oldParams.entry.name !== newParams.entry.name) {
                if ('em' in newParams.entry.params.channels) {
                    const { emDefaultContourLevel } = b.data.infoMap.get(newParams.entry.name);
                    if (emDefaultContourLevel) {
                        newParams.entry.params.channels['em'].isoValue = emDefaultContourLevel;
                    }
                }
            }
            const ret = await b.data.update(newParams) ? mol_state_1.StateTransformer.UpdateResult.Updated : mol_state_1.StateTransformer.UpdateResult.Unchanged;
            b.description = b.data.getDescription();
            return ret;
        });
    }
});
exports.CreateVolumeStreamingBehavior = CreateVolumeStreamingBehavior;
const VolumeStreamingVisual = objects_1.PluginStateTransform.BuiltIn({
    name: 'create-volume-streaming-visual',
    display: { name: 'Volume Streaming Visual' },
    from: behavior_1.VolumeStreaming,
    to: objects_1.PluginStateObject.Volume.Representation3D,
    params: {
        channel: param_definition_1.ParamDefinition.Select('em', behavior_1.VolumeStreaming.ChannelTypeOptions, { isHidden: true })
    }
})({
    apply: ({ a, params: srcParams, spine }, plugin) => mol_task_1.Task.create('Volume Representation', async (ctx) => {
        var _a, _b;
        const channel = a.data.channels[srcParams.channel];
        if (!channel)
            return mol_state_1.StateObject.Null;
        const params = createVolumeProps(a.data, srcParams.channel);
        const provider = registry_1.VolumeRepresentationRegistry.BuiltIn.isosurface;
        const props = params.type.params || {};
        const repr = provider.factory({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.volume.themes }, provider.getParams);
        repr.setTheme(theme_1.Theme.create(plugin.representation.volume.themes, { volume: channel.data }, params));
        const structure = (_b = spine.getAncestorOfType(objects_1.PluginStateObject.Molecule.Structure)) === null || _b === void 0 ? void 0 : _b.data;
        const transform = (structure === null || structure === void 0 ? void 0 : structure.models.length) === 0 ? void 0 : global_transform_1.GlobalModelTransformInfo.get(structure === null || structure === void 0 ? void 0 : structure.models[0]);
        await repr.createOrUpdate(props, channel.data).runInContext(ctx);
        if (transform)
            repr.setState({ transform });
        return new objects_1.PluginStateObject.Volume.Representation3D({ repr, sourceData: channel.data }, { label: `${Math.round(channel.isoValue.relativeValue * 100) / 100} σ [${srcParams.channel}]` });
    }),
    update: ({ a, b, newParams, spine }, plugin) => mol_task_1.Task.create('Volume Representation', async (ctx) => {
        // TODO : check if params/underlying data/etc have changed; maybe will need to export "data" or some other "tag" in the Representation for this to work
        const channel = a.data.channels[newParams.channel];
        // TODO: is this correct behavior?
        if (!channel)
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        const visible = b.data.repr.state.visible;
        const params = createVolumeProps(a.data, newParams.channel);
        const props = { ...b.data.repr.props, ...params.type.params };
        b.data.repr.setTheme(theme_1.Theme.create(plugin.representation.volume.themes, { volume: channel.data }, params));
        await b.data.repr.createOrUpdate(props, channel.data).runInContext(ctx);
        b.data.repr.setState({ visible });
        b.data.sourceData = channel.data;
        // TODO: set the transform here as well in case the structure moves?
        //       doing this here now breaks the code for some reason...
        // const structure = spine.getAncestorOfType(SO.Molecule.Structure)?.data;
        // const transform = structure?.models.length === 0 ? void 0 : GlobalModelTransformInfo.get(structure?.models[0]!);
        // if (transform) b.data.repr.setState({ transform });
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    })
});
exports.VolumeStreamingVisual = VolumeStreamingVisual;
function createVolumeProps(streaming, channelName) {
    const channel = streaming.channels[channelName];
    return representation_1.VolumeRepresentation3DHelpers.getDefaultParamsStatic(streaming.plugin, 'isosurface', { isoValue: channel.isoValue, alpha: channel.opacity, visuals: channel.wireframe ? ['wireframe'] : ['solid'] }, 'uniform', { value: channel.color });
}
