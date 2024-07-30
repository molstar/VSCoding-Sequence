/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginBehavior } from '../../mol-plugin/behavior/behavior';
import { ZenodoImportUI } from './ui';
export const ZenodoImport = PluginBehavior.create({
    name: 'extension-zenodo-import',
    category: 'misc',
    display: {
        name: 'Zenodo Export'
    },
    ctor: class extends PluginBehavior.Handler {
        register() {
            this.ctx.customImportControls.set('zenodo-import', ZenodoImportUI);
        }
        update() {
            return false;
        }
        unregister() {
            this.ctx.customImportControls.delete('zenodo-import');
        }
    },
    params: () => ({})
});
