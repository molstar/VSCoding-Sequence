"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SbNcbrPartialCharges = void 0;
const behavior_1 = require("../../../mol-plugin/behavior");
const param_definition_1 = require("../../../mol-util/param-definition");
const color_1 = require("./color");
const property_1 = require("./property");
const labels_1 = require("./labels");
const preset_1 = require("./preset");
exports.SbNcbrPartialCharges = behavior_1.PluginBehavior.create({
    name: 'sb-ncbr-partial-charges',
    category: 'misc',
    display: {
        name: 'SB NCBR Partial Charges',
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.SbNcbrPartialChargesLociLabelProvider = (0, labels_1.SbNcbrPartialChargesLociLabelProvider)(this.ctx);
        }
        register() {
            this.ctx.customModelProperties.register(property_1.SbNcbrPartialChargesPropertyProvider, this.params.autoAttach);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(color_1.SbNcbrPartialChargesColorThemeProvider);
            this.ctx.managers.lociLabels.addProvider(this.SbNcbrPartialChargesLociLabelProvider);
            this.ctx.builders.structure.representation.registerPreset(preset_1.SbNcbrPartialChargesPreset);
        }
        unregister() {
            this.ctx.customModelProperties.unregister(property_1.SbNcbrPartialChargesPropertyProvider.descriptor.name);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(color_1.SbNcbrPartialChargesColorThemeProvider);
            this.ctx.managers.lociLabels.removeProvider(this.SbNcbrPartialChargesLociLabelProvider);
            this.ctx.builders.structure.representation.unregisterPreset(preset_1.SbNcbrPartialChargesPreset);
        }
    },
    params: () => ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(true),
        showToolTip: param_definition_1.ParamDefinition.Boolean(true),
    }),
});
