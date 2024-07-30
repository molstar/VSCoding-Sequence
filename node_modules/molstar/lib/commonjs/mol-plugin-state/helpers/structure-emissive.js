"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStructureEmissive = setStructureEmissive;
exports.clearStructureEmissive = clearStructureEmissive;
const structure_1 = require("../../mol-model/structure");
const transforms_1 = require("../transforms");
const mol_state_1 = require("../../mol-state");
const loci_1 = require("../../mol-model/loci");
const emissive_1 = require("../../mol-theme/emissive");
const EmissiveManagerTag = 'emissive-controls';
async function setStructureEmissive(plugin, components, value, lociGetter, types) {
    await eachRepr(plugin, components, async (update, repr, emissiveCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        const structure = repr.obj.data.sourceData;
        // always use the root structure to get the loci so the emissive
        // stays applicable as long as the root structure does not change
        const loci = await lociGetter(structure.root);
        if (loci_1.Loci.isEmpty(loci) || (0, loci_1.isEmptyLoci)(loci))
            return;
        const layer = {
            bundle: structure_1.StructureElement.Bundle.fromLoci(loci),
            value,
        };
        if (emissiveCell) {
            const bundleLayers = [...emissiveCell.params.values.layers, layer];
            const filtered = getFilteredBundle(bundleLayers, structure);
            update.to(emissiveCell).update(emissive_1.Emissive.toBundle(filtered));
        }
        else {
            const filtered = getFilteredBundle([layer], structure);
            update.to(repr.transform.ref)
                .apply(transforms_1.StateTransforms.Representation.EmissiveStructureRepresentation3DFromBundle, emissive_1.Emissive.toBundle(filtered), { tags: EmissiveManagerTag });
        }
    });
}
async function clearStructureEmissive(plugin, components, types) {
    await eachRepr(plugin, components, async (update, repr, emissiveCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        if (emissiveCell) {
            update.delete(emissiveCell.transform.ref);
        }
    });
}
async function eachRepr(plugin, components, callback) {
    const state = plugin.state.data;
    const update = state.build();
    for (const c of components) {
        for (const r of c.representations) {
            const emissive = state.select(mol_state_1.StateSelection.Generators.ofTransformer(transforms_1.StateTransforms.Representation.EmissiveStructureRepresentation3DFromBundle, r.cell.transform.ref).withTag(EmissiveManagerTag));
            await callback(update, r.cell, emissive[0]);
        }
    }
    return update.commit({ doNotUpdateCurrent: true });
}
/** filter emissive layers for given structure */
function getFilteredBundle(layers, structure) {
    const emissive = emissive_1.Emissive.ofBundle(layers, structure.root);
    const merged = emissive_1.Emissive.merge(emissive);
    return emissive_1.Emissive.filter(merged, structure);
}
