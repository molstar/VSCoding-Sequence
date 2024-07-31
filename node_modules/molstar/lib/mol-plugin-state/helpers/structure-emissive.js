/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StructureElement } from '../../mol-model/structure';
import { StateTransforms } from '../transforms';
import { StateSelection } from '../../mol-state';
import { isEmptyLoci, Loci } from '../../mol-model/loci';
import { Emissive } from '../../mol-theme/emissive';
const EmissiveManagerTag = 'emissive-controls';
export async function setStructureEmissive(plugin, components, value, lociGetter, types) {
    await eachRepr(plugin, components, async (update, repr, emissiveCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        const structure = repr.obj.data.sourceData;
        // always use the root structure to get the loci so the emissive
        // stays applicable as long as the root structure does not change
        const loci = await lociGetter(structure.root);
        if (Loci.isEmpty(loci) || isEmptyLoci(loci))
            return;
        const layer = {
            bundle: StructureElement.Bundle.fromLoci(loci),
            value,
        };
        if (emissiveCell) {
            const bundleLayers = [...emissiveCell.params.values.layers, layer];
            const filtered = getFilteredBundle(bundleLayers, structure);
            update.to(emissiveCell).update(Emissive.toBundle(filtered));
        }
        else {
            const filtered = getFilteredBundle([layer], structure);
            update.to(repr.transform.ref)
                .apply(StateTransforms.Representation.EmissiveStructureRepresentation3DFromBundle, Emissive.toBundle(filtered), { tags: EmissiveManagerTag });
        }
    });
}
export async function clearStructureEmissive(plugin, components, types) {
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
            const emissive = state.select(StateSelection.Generators.ofTransformer(StateTransforms.Representation.EmissiveStructureRepresentation3DFromBundle, r.cell.transform.ref).withTag(EmissiveManagerTag));
            await callback(update, r.cell, emissive[0]);
        }
    }
    return update.commit({ doNotUpdateCurrent: true });
}
/** filter emissive layers for given structure */
function getFilteredBundle(layers, structure) {
    const emissive = Emissive.ofBundle(layers, structure.root);
    const merged = Emissive.merge(emissive);
    return Emissive.filter(merged, structure);
}
