/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StateAction } from '../../mol-state';
import { Task } from '../../mol-task';
import { Asset } from '../../mol-util/assets';
import { getFileNameInfo } from '../../mol-util/file-info';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { unzip } from '../../mol-util/zip/zip';
import { PluginStateObject } from '../objects';
async function processFile(file, plugin, format, visuals) {
    var _a, _b, _c, _d;
    const info = getFileNameInfo((_b = (_a = file.file) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '');
    const isBinary = plugin.dataFormats.binaryExtensions.has(info.ext);
    const { data } = await plugin.builders.data.readFile({ file, isBinary });
    const provider = format === 'auto'
        ? plugin.dataFormats.auto(info, (_c = data.cell) === null || _c === void 0 ? void 0 : _c.obj)
        : plugin.dataFormats.get(format);
    if (!provider) {
        plugin.log.warn(`OpenFiles: could not find data provider for '${info.ext}'`);
        await plugin.state.data.build().delete(data).commit();
        return;
    }
    // need to await so that the enclosing Task finishes after the update is done.
    const parsed = await provider.parse(plugin, data);
    if (visuals) {
        await ((_d = provider.visuals) === null || _d === void 0 ? void 0 : _d.call(provider, plugin, parsed));
    }
}
;
export const OpenFiles = StateAction.build({
    display: { name: 'Open Files', description: 'Load one or more files and optionally create default visuals' },
    from: PluginStateObject.Root,
    params: (a, ctx) => {
        const { extensions, options } = ctx.dataFormats;
        return {
            files: PD.FileList({ accept: Array.from(extensions.values()).map(e => `.${e}`).join(',') + ',.gz,.zip', multiple: true }),
            format: PD.MappedStatic('auto', {
                auto: PD.EmptyGroup(),
                specific: PD.Select(options[0][0], options)
            }),
            visuals: PD.Boolean(true, { description: 'Add default visuals' }),
        };
    }
})(({ params, state }, plugin) => Task.create('Open Files', async (taskCtx) => {
    plugin.behaviors.layout.leftPanelTabName.next('data');
    await state.transaction(async () => {
        if (params.files === null) {
            plugin.log.error('No file(s) selected');
            return;
        }
        for (const file of params.files) {
            try {
                if (file.file && file.name.toLowerCase().endsWith('.zip')) {
                    const zippedFiles = await unzip(taskCtx, await file.file.arrayBuffer());
                    for (const [fn, filedata] of Object.entries(zippedFiles)) {
                        if (!(filedata instanceof Uint8Array) || filedata.length === 0)
                            continue;
                        const asset = Asset.File(new File([filedata], fn));
                        await processFile(asset, plugin, 'auto', params.visuals);
                    }
                }
                else {
                    const format = params.format.name === 'auto' ? 'auto' : params.format.params;
                    await processFile(file, plugin, format, params.visuals);
                }
            }
            catch (e) {
                console.error(e);
                plugin.log.error(`Error opening file '${file.name}'`);
            }
        }
    }).runInContext(taskCtx);
}));
export const DownloadFile = StateAction.build({
    display: { name: 'Download File', description: 'Load one or more file from an URL' },
    from: PluginStateObject.Root,
    params: (a, ctx) => {
        const options = [...ctx.dataFormats.options, ['zip', 'Zip'], ['gzip', 'Gzip']];
        return {
            url: PD.Url(''),
            format: PD.Select(options[0][0], options),
            isBinary: PD.Boolean(false),
            visuals: PD.Boolean(true, { description: 'Add default visuals' }),
        };
    }
})(({ params, state }, plugin) => Task.create('Open Files', async (taskCtx) => {
    plugin.behaviors.layout.leftPanelTabName.next('data');
    await state.transaction(async () => {
        var _a, _b, _c;
        try {
            if (params.format === 'zip' || params.format === 'gzip') {
                // TODO: add ReadZipFile transformer so this can be saved as a simple state snaphot,
                //       would need support for extracting individual files from zip
                const data = await plugin.builders.data.download({ url: params.url, isBinary: true });
                if (params.format === 'zip') {
                    const zippedFiles = await unzip(taskCtx, ((_a = data.obj) === null || _a === void 0 ? void 0 : _a.data).buffer);
                    for (const [fn, filedata] of Object.entries(zippedFiles)) {
                        if (!(filedata instanceof Uint8Array) || filedata.length === 0)
                            continue;
                        const asset = Asset.File(new File([filedata], fn));
                        await processFile(asset, plugin, 'auto', params.visuals);
                    }
                }
                else {
                    const url = Asset.getUrl(params.url);
                    const fileName = getFileNameInfo(url).name;
                    await processFile(Asset.File(new File([(_b = data.obj) === null || _b === void 0 ? void 0 : _b.data], fileName)), plugin, 'auto', params.visuals);
                }
            }
            else {
                const provider = plugin.dataFormats.get(params.format);
                if (!provider) {
                    plugin.log.warn(`DownloadFile: could not find data provider for '${params.format}'`);
                    return;
                }
                const data = await plugin.builders.data.download({ url: params.url, isBinary: params.isBinary });
                const parsed = await provider.parse(plugin, data);
                if (params.visuals) {
                    await ((_c = provider.visuals) === null || _c === void 0 ? void 0 : _c.call(provider, plugin, parsed));
                }
            }
        }
        catch (e) {
            console.error(e);
            plugin.log.error(`Error downloading '${typeof params.url === 'string' ? params.url : params.url.url}'`);
        }
    }).runInContext(taskCtx);
}));
