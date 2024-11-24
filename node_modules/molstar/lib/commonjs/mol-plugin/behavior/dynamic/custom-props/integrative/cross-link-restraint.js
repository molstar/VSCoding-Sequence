"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossLinkRestraint = void 0;
const behavior_1 = require("../../../behavior");
const format_1 = require("../../../../../mol-model-props/integrative/cross-link-restraint/format");
const mmcif_1 = require("../../../../../mol-model-formats/structure/mmcif");
const representation_1 = require("../../../../../mol-model-props/integrative/cross-link-restraint/representation");
const color_1 = require("../../../../../mol-model-props/integrative/cross-link-restraint/color");
exports.CrossLinkRestraint = behavior_1.PluginBehavior.create({
    name: 'integrative-cross-link-restraint',
    category: 'custom-props',
    display: { name: 'Cross Link Restraint' },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.provider = format_1.ModelCrossLinkRestraint.Provider;
        }
        register() {
            this.provider.formatRegistry.add('mmCIF', crossLinkRestraintFromMmcif);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(color_1.CrossLinkColorThemeProvider);
            this.ctx.representation.structure.registry.add(representation_1.CrossLinkRestraintRepresentationProvider);
        }
        unregister() {
            this.provider.formatRegistry.remove('mmCIF');
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(color_1.CrossLinkColorThemeProvider);
            this.ctx.representation.structure.registry.remove(representation_1.CrossLinkRestraintRepresentationProvider);
        }
    }
});
function crossLinkRestraintFromMmcif(model) {
    if (!mmcif_1.MmcifFormat.is(model.sourceData))
        return;
    const { ihm_cross_link_restraint } = model.sourceData.data.db;
    if (ihm_cross_link_restraint._rowCount === 0)
        return;
    return format_1.ModelCrossLinkRestraint.fromTable(ihm_cross_link_restraint, model);
}
