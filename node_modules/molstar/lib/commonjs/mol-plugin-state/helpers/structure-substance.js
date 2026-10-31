"use strict";
/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStructureSubstance = setStructureSubstance;
exports.clearStructureSubstance = clearStructureSubstance;
const structure_1 = require("../../mol-model/structure");
const transforms_1 = require("../../mol-plugin-state/transforms");
const mol_state_1 = require("../../mol-state");
const substance_1 = require("../../mol-theme/substance");
const loci_1 = require("../../mol-model/loci");
const material_1 = require("../../mol-util/material");
const SubstanceManagerTag = 'substance-controls';
async function setStructureSubstance(plugin, components, material, lociGetter, types) {
    await eachRepr(plugin, components, async (update, repr, substanceCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        const structure = repr.obj.data.sourceData;
        // always use the root structure to get the loci so the substance
        // stays applicable as long as the root structure does not change
        const loci = await lociGetter(structure.root);
        if (loci_1.Loci.isEmpty(loci) || (0, loci_1.isEmptyLoci)(loci))
            return;
        const layer = {
            bundle: structure_1.StructureElement.Bundle.fromLoci(loci),
            material: material !== null && material !== void 0 ? material : (0, material_1.Material)(),
            clear: !material
        };
        if (substanceCell) {
            const bundleLayers = [...substanceCell.params.values.layers, layer];
            const filtered = getFilteredBundle(bundleLayers, structure);
            update.to(substanceCell).update(substance_1.Substance.toBundle(filtered));
        }
        else {
            const filtered = getFilteredBundle([layer], structure);
            update.to(repr.transform.ref)
                .apply(transforms_1.StateTransforms.Representation.SubstanceStructureRepresentation3DFromBundle, substance_1.Substance.toBundle(filtered), { tags: SubstanceManagerTag });
        }
    });
}
async function clearStructureSubstance(plugin, components, types) {
    await eachRepr(plugin, components, async (update, repr, substanceCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        if (substanceCell) {
            update.delete(substanceCell.transform.ref);
        }
    });
}
async function eachRepr(plugin, components, callback) {
    const state = plugin.state.data;
    const update = state.build();
    for (const c of components) {
        for (const r of c.representations) {
            const substance = state.select(mol_state_1.StateSelection.Generators.ofTransformer(transforms_1.StateTransforms.Representation.SubstanceStructureRepresentation3DFromBundle, r.cell.transform.ref).withTag(SubstanceManagerTag));
            await callback(update, r.cell, substance[0]);
        }
    }
    return update.commit({ doNotUpdateCurrent: true });
}
/** filter substance layers for given structure */
function getFilteredBundle(layers, structure) {
    const substance = substance_1.Substance.ofBundle(layers, structure.root);
    const merged = substance_1.Substance.merge(substance);
    return substance_1.Substance.filter(merged, structure);
}
