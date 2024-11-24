"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignColorVolume = exports.DownloadDensity = void 0;
const mol_state_1 = require("../../mol-state");
const mol_task_1 = require("../../mol-task");
const file_info_1 = require("../../mol-util/file-info");
const param_definition_1 = require("../../mol-util/param-definition");
const objects_1 = require("../objects");
const assets_1 = require("../../mol-util/assets");
const transforms_1 = require("../transforms");
const type_helpers_1 = require("../../mol-util/type-helpers");
const DownloadDensity = mol_state_1.StateAction.build({
    from: objects_1.PluginStateObject.Root,
    display: { name: 'Download Density', description: 'Load a density from the provided source and create its default visual.' },
    params: (a, ctx) => {
        const { options } = ctx.dataFormats;
        return {
            source: param_definition_1.ParamDefinition.MappedStatic('pdb-xray', {
                'pdb-xray': param_definition_1.ParamDefinition.Group({
                    provider: param_definition_1.ParamDefinition.Group({
                        id: param_definition_1.ParamDefinition.Text('1tqn', { label: 'Id' }),
                        server: param_definition_1.ParamDefinition.Select('pdbe', [['pdbe', 'PDBe']]),
                    }, { pivot: 'id' }),
                    type: param_definition_1.ParamDefinition.Select('2fofc', [['2fofc', '2Fo-Fc'], ['fofc', 'Fo-Fc']]),
                }, { isFlat: true }),
                'pdb-xray-ds': param_definition_1.ParamDefinition.Group({
                    provider: param_definition_1.ParamDefinition.Group({
                        id: param_definition_1.ParamDefinition.Text('1tqn', { label: 'Id' }),
                        server: param_definition_1.ParamDefinition.Select('pdbe', [['pdbe', 'PDBe'], ['rcsb', 'RCSB PDB']]),
                    }, { pivot: 'id' }),
                    detail: param_definition_1.ParamDefinition.Numeric(3, { min: 0, max: 6, step: 1 }, { label: 'Detail' }),
                }, { isFlat: true }),
                'pdb-emd-ds': param_definition_1.ParamDefinition.Group({
                    provider: param_definition_1.ParamDefinition.Group({
                        id: param_definition_1.ParamDefinition.Text('emd-8004', { label: 'Id' }),
                        server: param_definition_1.ParamDefinition.Select('pdbe', [['pdbe', 'PDBe'], ['rcsb', 'RCSB PDB']]),
                    }, { pivot: 'id' }),
                    detail: param_definition_1.ParamDefinition.Numeric(3, { min: 0, max: 6, step: 1 }, { label: 'Detail' }),
                }, { isFlat: true }),
                'url': param_definition_1.ParamDefinition.Group({
                    url: param_definition_1.ParamDefinition.Url(''),
                    isBinary: param_definition_1.ParamDefinition.Boolean(false),
                    format: param_definition_1.ParamDefinition.Select('auto', options),
                }, { isFlat: true })
            }, {
                options: [
                    ['pdb-xray', 'PDB X-ray maps'],
                    ['pdb-emd-ds', 'PDB EMD Density Server'],
                    ['pdb-xray-ds', 'PDB X-ray Density Server'],
                    ['url', 'URL']
                ]
            })
        };
    }
})(({ params }, plugin) => mol_task_1.Task.create('Download Density', async (taskCtx) => {
    var _a, _b;
    const src = params.source;
    let downloadParams;
    let provider;
    switch (src.name) {
        case 'url':
            downloadParams = src.params;
            break;
        case 'pdb-xray':
            downloadParams = {
                url: assets_1.Asset.Url(src.params.type === '2fofc'
                    ? `https://www.ebi.ac.uk/pdbe/coordinates/files/${src.params.provider.id.toLowerCase()}.ccp4`
                    : `https://www.ebi.ac.uk/pdbe/coordinates/files/${src.params.provider.id.toLowerCase()}_diff.ccp4`),
                isBinary: true,
                label: `PDBe X-ray map: ${src.params.provider.id}`
            };
            break;
        case 'pdb-emd-ds':
            downloadParams = src.params.provider.server === 'pdbe' ? {
                url: assets_1.Asset.Url(`https://www.ebi.ac.uk/pdbe/densities/emd/${src.params.provider.id.toLowerCase()}/cell?detail=${src.params.detail}`),
                isBinary: true,
                label: `PDBe EMD Density Server: ${src.params.provider.id}`
            } : {
                url: assets_1.Asset.Url(`https://maps.rcsb.org/em/${src.params.provider.id.toLowerCase()}/cell?detail=${src.params.detail}`),
                isBinary: true,
                label: `RCSB PDB EMD Density Server: ${src.params.provider.id}`
            };
            break;
        case 'pdb-xray-ds':
            downloadParams = src.params.provider.server === 'pdbe' ? {
                url: assets_1.Asset.Url(`https://www.ebi.ac.uk/pdbe/densities/x-ray/${src.params.provider.id.toLowerCase()}/cell?detail=${src.params.detail}`),
                isBinary: true,
                label: `PDBe X-ray Density Server: ${src.params.provider.id}`
            } : {
                url: assets_1.Asset.Url(`https://maps.rcsb.org/x-ray/${src.params.provider.id.toLowerCase()}/cell?detail=${src.params.detail}`),
                isBinary: true,
                label: `RCSB PDB X-ray Density Server: ${src.params.provider.id}`
            };
            break;
        default: (0, type_helpers_1.assertUnreachable)(src);
    }
    const data = await plugin.builders.data.download(downloadParams);
    let entryId = undefined;
    switch (src.name) {
        case 'url':
            downloadParams = src.params;
            provider = src.params.format === 'auto' ? plugin.dataFormats.auto((0, file_info_1.getFileNameInfo)(assets_1.Asset.getUrl(downloadParams.url)), (_a = data.cell) === null || _a === void 0 ? void 0 : _a.obj) : plugin.dataFormats.get(src.params.format);
            break;
        case 'pdb-xray':
            entryId = src.params.provider.id;
            provider = plugin.dataFormats.get('ccp4');
            break;
        case 'pdb-emd-ds':
        case 'pdb-xray-ds':
            entryId = src.params.provider.id;
            provider = plugin.dataFormats.get('dscif');
            break;
        default: (0, type_helpers_1.assertUnreachable)(src);
    }
    if (!provider) {
        plugin.log.warn('DownloadDensity: Format provider not found.');
        return;
    }
    const volumes = await provider.parse(plugin, data, { entryId });
    await ((_b = provider.visuals) === null || _b === void 0 ? void 0 : _b.call(provider, plugin, volumes));
}));
exports.DownloadDensity = DownloadDensity;
exports.AssignColorVolume = mol_state_1.StateAction.build({
    display: { name: 'Assign Volume Colors', description: 'Assigns another volume to be available for coloring.' },
    from: objects_1.PluginStateObject.Volume.Data,
    isApplicable(a) { return !a.data.colorVolume; },
    params(a, plugin) {
        const cells = plugin.state.data.select(mol_state_1.StateSelection.Generators.root.subtree().ofType(objects_1.PluginStateObject.Volume.Data).filter(cell => { var _a; return !!cell.obj && !((_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data.colorVolume) && cell.obj !== a; }));
        if (cells.length === 0)
            return { ref: param_definition_1.ParamDefinition.Text('', { isHidden: true, label: 'Volume' }) };
        return { ref: param_definition_1.ParamDefinition.Select(cells[0].transform.ref, cells.map(c => [c.transform.ref, c.obj.label]), { label: 'Volume' }) };
    }
})(({ ref, params, state }, plugin) => {
    return plugin.build().to(ref).apply(transforms_1.StateTransforms.Volume.AssignColorVolume, { ref: params.ref }, { dependsOn: [params.ref] }).commit();
});
