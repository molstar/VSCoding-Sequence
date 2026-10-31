/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StateAction, StateSelection } from '../../mol-state';
import { Task } from '../../mol-task';
import { getFileNameInfo } from '../../mol-util/file-info';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject } from '../objects';
import { Asset } from '../../mol-util/assets';
import { StateTransforms } from '../transforms';
import { assertUnreachable } from '../../mol-util/type-helpers';
export { DownloadDensity };
const DownloadDensity = StateAction.build({
    from: PluginStateObject.Root,
    display: { name: 'Download Density', description: 'Load a density from the provided source and create its default visual.' },
    params: (a, ctx) => {
        const { options } = ctx.dataFormats;
        return {
            source: PD.MappedStatic('pdb-xray', {
                'pdb-xray': PD.Group({
                    provider: PD.Group({
                        id: PD.Text('1tqn', { label: 'Id' }),
                        server: PD.Select('pdbe', [['pdbe', 'PDBe']]),
                    }, { pivot: 'id' }),
                    type: PD.Select('2fofc', [['2fofc', '2Fo-Fc'], ['fofc', 'Fo-Fc']]),
                }, { isFlat: true }),
                'pdb-xray-ds': PD.Group({
                    provider: PD.Group({
                        id: PD.Text('1tqn', { label: 'Id' }),
                        server: PD.Select('pdbe', [['pdbe', 'PDBe'], ['rcsb', 'RCSB PDB']]),
                    }, { pivot: 'id' }),
                    detail: PD.Numeric(3, { min: 0, max: 6, step: 1 }, { label: 'Detail' }),
                }, { isFlat: true }),
                'pdb-emd-ds': PD.Group({
                    provider: PD.Group({
                        id: PD.Text('emd-8004', { label: 'Id' }),
                        server: PD.Select('pdbe', [['pdbe', 'PDBe'], ['rcsb', 'RCSB PDB']]),
                    }, { pivot: 'id' }),
                    detail: PD.Numeric(3, { min: 0, max: 6, step: 1 }, { label: 'Detail' }),
                }, { isFlat: true }),
                'url': PD.Group({
                    url: PD.Url(''),
                    isBinary: PD.Boolean(false),
                    format: PD.Select('auto', options),
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
})(({ params }, plugin) => Task.create('Download Density', async (taskCtx) => {
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
                url: Asset.Url(src.params.type === '2fofc'
                    ? `https://www.ebi.ac.uk/pdbe/coordinates/files/${src.params.provider.id.toLowerCase()}.ccp4`
                    : `https://www.ebi.ac.uk/pdbe/coordinates/files/${src.params.provider.id.toLowerCase()}_diff.ccp4`),
                isBinary: true,
                label: `PDBe X-ray map: ${src.params.provider.id}`
            };
            break;
        case 'pdb-emd-ds':
            downloadParams = src.params.provider.server === 'pdbe' ? {
                url: Asset.Url(`https://www.ebi.ac.uk/pdbe/densities/emd/${src.params.provider.id.toLowerCase()}/cell?detail=${src.params.detail}`),
                isBinary: true,
                label: `PDBe EMD Density Server: ${src.params.provider.id}`
            } : {
                url: Asset.Url(`https://maps.rcsb.org/em/${src.params.provider.id.toLowerCase()}/cell?detail=${src.params.detail}`),
                isBinary: true,
                label: `RCSB PDB EMD Density Server: ${src.params.provider.id}`
            };
            break;
        case 'pdb-xray-ds':
            downloadParams = src.params.provider.server === 'pdbe' ? {
                url: Asset.Url(`https://www.ebi.ac.uk/pdbe/densities/x-ray/${src.params.provider.id.toLowerCase()}/cell?detail=${src.params.detail}`),
                isBinary: true,
                label: `PDBe X-ray Density Server: ${src.params.provider.id}`
            } : {
                url: Asset.Url(`https://maps.rcsb.org/x-ray/${src.params.provider.id.toLowerCase()}/cell?detail=${src.params.detail}`),
                isBinary: true,
                label: `RCSB PDB X-ray Density Server: ${src.params.provider.id}`
            };
            break;
        default: assertUnreachable(src);
    }
    const data = await plugin.builders.data.download(downloadParams);
    let entryId = undefined;
    switch (src.name) {
        case 'url':
            downloadParams = src.params;
            provider = src.params.format === 'auto' ? plugin.dataFormats.auto(getFileNameInfo(Asset.getUrl(downloadParams.url)), (_a = data.cell) === null || _a === void 0 ? void 0 : _a.obj) : plugin.dataFormats.get(src.params.format);
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
        default: assertUnreachable(src);
    }
    if (!provider) {
        plugin.log.warn('DownloadDensity: Format provider not found.');
        return;
    }
    const volumes = await provider.parse(plugin, data, { entryId });
    await ((_b = provider.visuals) === null || _b === void 0 ? void 0 : _b.call(provider, plugin, volumes));
}));
export const AssignColorVolume = StateAction.build({
    display: { name: 'Assign Volume Colors', description: 'Assigns another volume to be available for coloring.' },
    from: PluginStateObject.Volume.Data,
    isApplicable(a) { return !a.data.colorVolume; },
    params(a, plugin) {
        const cells = plugin.state.data.select(StateSelection.Generators.root.subtree().ofType(PluginStateObject.Volume.Data).filter(cell => { var _a; return !!cell.obj && !((_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data.colorVolume) && cell.obj !== a; }));
        if (cells.length === 0)
            return { ref: PD.Text('', { isHidden: true, label: 'Volume' }) };
        return { ref: PD.Select(cells[0].transform.ref, cells.map(c => [c.transform.ref, c.obj.label]), { label: 'Volume' }) };
    }
})(({ ref, params, state }, plugin) => {
    return plugin.build().to(ref).apply(StateTransforms.Volume.AssignColorVolume, { ref: params.ref }, { dependsOn: [params.ref] }).commit();
});
