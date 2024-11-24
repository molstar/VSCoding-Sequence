/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StructureElement } from '../../mol-model/structure';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { StateSelection } from '../../mol-state';
import { isEmptyLoci, Loci } from '../../mol-model/loci';
import { Clipping } from '../../mol-theme/clipping';
const ClippingManagerTag = 'clipping-controls';
export async function setStructureClipping(plugin, components, groups, lociGetter, types) {
    await eachRepr(plugin, components, async (update, repr, clippingCell) => {
        if (types && types.length > 0 && !types.includes(repr.params.values.type.name))
            return;
        const structure = repr.obj.data.sourceData;
        // always use the root structure to get the loci so the clipping
        // stays applicable as long as the root structure does not change
        const loci = await lociGetter(structure.root);
        if (Loci.isEmpty(loci) || isEmptyLoci(loci))
            return;
        const layer = {
            bundle: StructureElement.Bundle.fromLoci(loci),
            groups
        };
        if (clippingCell) {
            const bundleLayers = [...clippingCell.params.values.layers, layer];
            const filtered = getFilteredBundle(bundleLayers, structure);
            update.to(clippingCell).update(Clipping.toBundle(filtered));
        }
        else {
            const filtered = getFilteredBundle([layer], structure);
            update.to(repr.transform.ref)
                .apply(StateTransforms.Representation.ClippingStructureRepresentation3DFromBundle, Clipping.toBundle(filtered), { tags: ClippingManagerTag });
        }
    });
}
async function eachRepr(plugin, components, callback) {
    const state = plugin.state.data;
    const update = state.build();
    for (const c of components) {
        for (const r of c.representations) {
            const clipping = state.select(StateSelection.Generators.ofTransformer(StateTransforms.Representation.ClippingStructureRepresentation3DFromBundle, r.cell.transform.ref).withTag(ClippingManagerTag));
            await callback(update, r.cell, clipping[0]);
        }
    }
    return update.commit({ doNotUpdateCurrent: true });
}
/** filter clipping layers for given structure */
function getFilteredBundle(layers, structure) {
    const clipping = Clipping.ofBundle(layers, structure.root);
    const merged = Clipping.merge(clipping);
    return Clipping.filter(merged, structure);
}
