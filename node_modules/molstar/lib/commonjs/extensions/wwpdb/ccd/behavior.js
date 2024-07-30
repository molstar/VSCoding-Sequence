"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.wwPDBChemicalComponentDictionary = void 0;
const behavior_1 = require("../../../mol-plugin/behavior/behavior");
const representation_1 = require("./representation");
exports.wwPDBChemicalComponentDictionary = behavior_1.PluginBehavior.create({
    name: 'wwpdb-chemical-component-dictionary',
    category: 'representation',
    display: {
        name: 'wwPDB Chemical Compontent Dictionary',
        description: 'Custom representation for data loaded from the CCD.'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.ctx.builders.structure.hierarchy.registerPreset(representation_1.ChemicalCompontentTrajectoryHierarchyPreset);
            this.ctx.builders.structure.representation.registerPreset(representation_1.ChemicalComponentPreset);
        }
        update() {
            return false;
        }
        unregister() {
            this.ctx.builders.structure.hierarchy.unregisterPreset(representation_1.ChemicalCompontentTrajectoryHierarchyPreset);
            this.ctx.builders.structure.representation.unregisterPreset(representation_1.ChemicalComponentPreset);
        }
    },
    params: () => ({})
});
