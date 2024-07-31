"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStructureClipping = setStructureClipping;
const structure_1 = require("../../mol-model/structure");
const transforms_1 = require("../../mol-plugin-state/transforms");
const mol_state_1 = require("../../mol-state");
const loci_1 = require("../../mol-model/loci");
const clipping_1 = require("../../mol-theme/clipping");
const ClippingManagerTag = 'clipping-controls';
async function setStructureClipping(plugin, components, groups, lociGetter, types) {
    await eachRepr(plugin, components, async (update, repr, clippingCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        const structure = repr.obj.data.sourceData;
        // always use the root structure to get the loci so the clipping
        // stays applicable as long as the root structure does not change
        const loci = await lociGetter(structure.root);
        if (loci_1.Loci.isEmpty(loci) || (0, loci_1.isEmptyLoci)(loci))
            return;
        const layer = {
            bundle: structure_1.StructureElement.Bundle.fromLoci(loci),
            groups
        };
        if (clippingCell) {
            const bundleLayers = [...clippingCell.params.values.layers, layer];
            const filtered = getFilteredBundle(bundleLayers, structure);
            update.to(clippingCell).update(clipping_1.Clipping.toBundle(filtered));
        }
        else {
            const filtered = getFilteredBundle([layer], structure);
            update.to(repr.transform.ref)
                .apply(transforms_1.StateTransforms.Representation.ClippingStructureRepresentation3DFromBundle, clipping_1.Clipping.toBundle(filtered), { tags: ClippingManagerTag });
        }
    });
}
async function eachRepr(plugin, components, callback) {
    const state = plugin.state.data;
    const update = state.build();
    for (const c of components) {
        for (const r of c.representations) {
            const clipping = state.select(mol_state_1.StateSelection.Generators.ofTransformer(transforms_1.StateTransforms.Representation.ClippingStructureRepresentation3DFromBundle, r.cell.transform.ref).withTag(ClippingManagerTag));
            await callback(update, r.cell, clipping[0]);
        }
    }
    return update.commit({ doNotUpdateCurrent: true });
}
/** filter clipping layers for given structure */
function getFilteredBundle(layers, structure) {
    const clipping = clipping_1.Clipping.ofBundle(layers, structure.root);
    const merged = clipping_1.Clipping.merge(clipping);
    return clipping_1.Clipping.filter(merged, structure);
}
