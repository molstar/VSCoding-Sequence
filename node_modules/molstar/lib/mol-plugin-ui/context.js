/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginContext } from '../mol-plugin/context';
export class PluginUIContext extends PluginContext {
    initCustomParamEditors() {
        if (!this.spec.customParamEditors)
            return;
        for (const [t, e] of this.spec.customParamEditors) {
            this.customParamEditors.set(t.id, e);
        }
    }
    dispose(options) {
        super.dispose(options);
        this.layout.dispose();
    }
    constructor(spec) {
        super(spec);
        this.spec = spec;
        this.customParamEditors = new Map();
        this.initCustomParamEditors();
    }
}
