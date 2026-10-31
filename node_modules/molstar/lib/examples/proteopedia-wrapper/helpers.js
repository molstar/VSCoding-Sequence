/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ModelSymmetry } from '../../mol-model-formats/structure/property/symmetry';
export var ModelInfo;
(function (ModelInfo) {
    async function getPreferredAssembly(ctx, model) {
        if (model.entryId.length <= 3)
            return void 0;
        try {
            const id = model.entryId.toLowerCase();
            const src = await ctx.runTask(ctx.fetch({ url: `https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/${id}` }));
            const json = JSON.parse(src);
            const data = json && json[id];
            const assemblies = data[0] && data[0].assemblies;
            if (!assemblies || !assemblies.length)
                return void 0;
            for (const asm of assemblies) {
                if (asm.preferred) {
                    return asm.assembly_id;
                }
            }
            return void 0;
        }
        catch (e) {
            console.warn('getPreferredAssembly', e);
        }
    }
    async function get(ctx, model, checkPreferred) {
        const { _rowCount: residueCount } = model.atomicHierarchy.residues;
        const { offsets: residueOffsets } = model.atomicHierarchy.residueAtomSegments;
        const chainIndex = model.atomicHierarchy.chainAtomSegments.index;
        // const resn = SP.residue.label_comp_id, entType = SP.entity.type;
        const pref = checkPreferred
            ? getPreferredAssembly(ctx, model)
            : void 0;
        const hetResidues = [];
        const hetMap = new Map();
        for (let rI = 0; rI < residueCount; rI++) {
            const cI = chainIndex[residueOffsets[rI]];
            const eI = model.atomicHierarchy.index.getEntityFromChain(cI);
            const entityType = model.entities.data.type.value(eI);
            if (entityType !== 'non-polymer' && entityType !== 'branched')
                continue;
            const comp_id = model.atomicHierarchy.atoms.label_comp_id.value(residueOffsets[rI]);
            let lig = hetMap.get(comp_id);
            if (!lig) {
                lig = { name: comp_id, indices: [] };
                hetResidues.push(lig);
                hetMap.set(comp_id, lig);
            }
            lig.indices.push(rI);
        }
        const preferredAssemblyId = await pref;
        const symmetry = ModelSymmetry.Provider.get(model);
        return {
            hetResidues: hetResidues,
            assemblies: symmetry ? symmetry.assemblies.map(a => ({ id: a.id, details: a.details, isPreferred: a.id === preferredAssemblyId })) : [],
            preferredAssemblyId
        };
    }
    ModelInfo.get = get;
})(ModelInfo || (ModelInfo = {}));
export var StateElements;
(function (StateElements) {
    StateElements["Model"] = "model";
    StateElements["ModelProps"] = "model-props";
    StateElements["Assembly"] = "assembly";
    StateElements["VolumeStreaming"] = "volume-streaming";
    StateElements["Sequence"] = "sequence";
    StateElements["SequenceVisual"] = "sequence-visual";
    StateElements["Het"] = "het";
    StateElements["HetVisual"] = "het-visual";
    StateElements["Het3DSNFG"] = "het-3dsnfg";
    StateElements["Water"] = "water";
    StateElements["WaterVisual"] = "water-visual";
    StateElements["HetGroupFocus"] = "het-group-focus";
    StateElements["HetGroupFocusGroup"] = "het-group-focus-group";
})(StateElements || (StateElements = {}));
