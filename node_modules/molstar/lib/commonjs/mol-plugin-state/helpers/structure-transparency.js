"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStructureTransparency = setStructureTransparency;
exports.clearStructureTransparency = clearStructureTransparency;
const structure_1 = require("../../mol-model/structure");
const transforms_1 = require("../../mol-plugin-state/transforms");
const mol_state_1 = require("../../mol-state");
const loci_1 = require("../../mol-model/loci");
const transparency_1 = require("../../mol-theme/transparency");
const TransparencyManagerTag = 'transparency-controls';
async function setStructureTransparency(plugin, components, value, lociGetter, types) {
    await eachRepr(plugin, components, async (update, repr, transparencyCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        const structure = repr.obj.data.sourceData;
        // always use the root structure to get the loci so the transparency
        // stays applicable as long as the root structure does not change
        const loci = await lociGetter(structure.root);
        if (loci_1.Loci.isEmpty(loci) || (0, loci_1.isEmptyLoci)(loci))
            return;
        const layer = {
            bundle: structure_1.StructureElement.Bundle.fromLoci(loci),
            value,
        };
        if (transparencyCell) {
            const bundleLayers = [...transparencyCell.params.values.layers, layer];
            const filtered = getFilteredBundle(bundleLayers, structure);
            update.to(transparencyCell).update(transparency_1.Transparency.toBundle(filtered));
        }
        else {
            const filtered = getFilteredBundle([layer], structure);
            update.to(repr.transform.ref)
                .apply(transforms_1.StateTransforms.Representation.TransparencyStructureRepresentation3DFromBundle, transparency_1.Transparency.toBundle(filtered), { tags: TransparencyManagerTag });
        }
    });
}
async function clearStructureTransparency(plugin, components, types) {
    await eachRepr(plugin, components, async (update, repr, transparencyCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        if (transparencyCell) {
            update.delete(transparencyCell.transform.ref);
        }
    });
}
async function eachRepr(plugin, components, callback) {
    const state = plugin.state.data;
    const update = state.build();
    for (const c of components) {
        for (const r of c.representations) {
            const transparency = state.select(mol_state_1.StateSelection.Generators.ofTransformer(transforms_1.StateTransforms.Representation.TransparencyStructureRepresentation3DFromBundle, r.cell.transform.ref).withTag(TransparencyManagerTag));
            await callback(update, r.cell, transparency[0]);
        }
    }
    return update.commit({ doNotUpdateCurrent: true });
}
/** filter transparency layers for given structure */
function getFilteredBundle(layers, structure) {
    const transparency = transparency_1.Transparency.ofBundle(layers, structure.root);
    const merged = transparency_1.Transparency.merge(transparency);
    return transparency_1.Transparency.filter(merged, structure);
}
