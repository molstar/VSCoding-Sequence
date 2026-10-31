"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecondaryStructure = void 0;
const behavior_1 = require("../../../behavior");
const param_definition_1 = require("../../../../../mol-util/param-definition");
const secondary_structure_1 = require("../../../../../mol-model-props/computed/secondary-structure");
exports.SecondaryStructure = behavior_1.PluginBehavior.create({
    name: 'computed-secondary-structure-prop',
    category: 'custom-props',
    display: { name: 'Secondary Structure' },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = secondary_structure_1.SecondaryStructureProvider;
        }
        update(p) {
            const updated = (this.params.autoAttach !== p.autoAttach);
            this.params.autoAttach = p.autoAttach;
            this.ctx.customStructureProperties.setDefaultAutoAttach(this.provider.descriptor.name, this.params.autoAttach);
            return updated;
        }
        register() {
            this.ctx.customStructureProperties.register(this.provider, this.params.autoAttach);
        }
        unregister() {
            this.ctx.customStructureProperties.unregister(this.provider.descriptor.name);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(false)
    })
});
