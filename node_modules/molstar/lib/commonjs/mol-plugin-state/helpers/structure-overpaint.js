"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStructureOverpaint = setStructureOverpaint;
exports.clearStructureOverpaint = clearStructureOverpaint;
const structure_1 = require("../../mol-model/structure");
const transforms_1 = require("../../mol-plugin-state/transforms");
const mol_state_1 = require("../../mol-state");
const overpaint_1 = require("../../mol-theme/overpaint");
const color_1 = require("../../mol-util/color");
const loci_1 = require("../../mol-model/loci");
const OverpaintManagerTag = 'overpaint-controls';
async function setStructureOverpaint(plugin, components, color, lociGetter, types) {
    await eachRepr(plugin, components, async (update, repr, overpaintCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        const structure = repr.obj.data.sourceData;
        // always use the root structure to get the loci so the overpaint
        // stays applicable as long as the root structure does not change
        const loci = await lociGetter(structure.root);
        if (loci_1.Loci.isEmpty(loci) || (0, loci_1.isEmptyLoci)(loci))
            return;
        const layer = {
            bundle: structure_1.StructureElement.Bundle.fromLoci(loci),
            color: color === -1 ? (0, color_1.Color)(0) : color,
            clear: color === -1
        };
        if (overpaintCell) {
            const bundleLayers = [...overpaintCell.params.values.layers, layer];
            const filtered = getFilteredBundle(bundleLayers, structure);
            update.to(overpaintCell).update(overpaint_1.Overpaint.toBundle(filtered));
        }
        else {
            const filtered = getFilteredBundle([layer], structure);
            update.to(repr.transform.ref)
                .apply(transforms_1.StateTransforms.Representation.OverpaintStructureRepresentation3DFromBundle, overpaint_1.Overpaint.toBundle(filtered), { tags: OverpaintManagerTag });
        }
    });
}
async function clearStructureOverpaint(plugin, components, types) {
    await eachRepr(plugin, components, async (update, repr, overpaintCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        if (overpaintCell) {
            update.delete(overpaintCell.transform.ref);
        }
    });
}
async function eachRepr(plugin, components, callback) {
    const state = plugin.state.data;
    const update = state.build();
    for (const c of components) {
        for (const r of c.representations) {
            const overpaint = state.select(mol_state_1.StateSelection.Generators.ofTransformer(transforms_1.StateTransforms.Representation.OverpaintStructureRepresentation3DFromBundle, r.cell.transform.ref).withTag(OverpaintManagerTag));
            await callback(update, r.cell, overpaint[0]);
        }
    }
    return update.commit({ doNotUpdateCurrent: true });
}
/** filter overpaint layers for given structure */
function getFilteredBundle(layers, structure) {
    const overpaint = overpaint_1.Overpaint.ofBundle(layers, structure.root);
    const merged = overpaint_1.Overpaint.merge(overpaint);
    return overpaint_1.Overpaint.filter(merged, structure);
}
