"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginUIContext = void 0;
const context_1 = require("../mol-plugin/context");
class PluginUIContext extends context_1.PluginContext {
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
exports.PluginUIContext = PluginUIContext;
