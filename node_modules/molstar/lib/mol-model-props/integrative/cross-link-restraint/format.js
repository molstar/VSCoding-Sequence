/**
 * Copyright (c) 2018-2020 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { FormatPropertyProvider } from '../../../mol-model-formats/structure/common/property';
export { ModelCrossLinkRestraint };
var ModelCrossLinkRestraint;
(function (ModelCrossLinkRestraint) {
    ModelCrossLinkRestraint.Descriptor = {
        name: 'ihm_cross_link_restraint',
        // TODO cifExport
    };
    ModelCrossLinkRestraint.Provider = FormatPropertyProvider.create(ModelCrossLinkRestraint.Descriptor);
    function fromTable(table, model) {
        const p1 = {
            entity_id: table.entity_id_1,
            asym_id: table.asym_id_1,
            seq_id: table.seq_id_1,
            atom_id: table.atom_id_1,
        };
        const p2 = {
            entity_id: table.entity_id_2,
            asym_id: table.asym_id_2,
            seq_id: table.seq_id_2,
            atom_id: table.atom_id_2,
        };
        function _add(map, element, row) {
            const indices = map.get(element);
            if (indices)
                indices.push(row);
            else
                map.set(element, [row]);
        }
        function add(row, ps) {
            const entityId = ps.entity_id.value(row);
            const asymId = ps.asym_id.value(row);
            const seqId = ps.seq_id.value(row);
            if (table.model_granularity.value(row) === 'by-atom') {
                const atomicElement = model.atomicHierarchy.index.findAtom({
                    auth_seq_id: seqId,
                    label_asym_id: asymId,
                    label_atom_id: ps.atom_id.value(row),
                    label_entity_id: entityId,
                });
                if (atomicElement >= 0)
                    _add(atomicElementMap, atomicElement, row);
            }
            else if (model.coarseHierarchy.isDefined) {
                const sphereElement = model.coarseHierarchy.spheres.findSequenceKey(entityId, asymId, seqId);
                if (sphereElement >= 0) {
                    _add(sphereElementMap, sphereElement, row);
                }
                else {
                    const gaussianElement = model.coarseHierarchy.gaussians.findSequenceKey(entityId, asymId, seqId);
                    if (gaussianElement >= 0)
                        _add(gaussianElementMap, gaussianElement, row);
                }
            }
        }
        function getMapByKind(kind) {
            switch (kind) {
                case 0 /* Unit.Kind.Atomic */: return atomicElementMap;
                case 1 /* Unit.Kind.Spheres */: return sphereElementMap;
                case 2 /* Unit.Kind.Gaussians */: return gaussianElementMap;
            }
        }
        /** map from atomic element to cross link indices */
        const atomicElementMap = new Map();
        /** map from sphere element to cross link indices */
        const sphereElementMap = new Map();
        /** map from gaussian element to cross link indices */
        const gaussianElementMap = new Map();
        const emptyIndexArray = [];
        for (let i = 0; i < table._rowCount; ++i) {
            add(i, p1);
            add(i, p2);
        }
        return {
            getIndicesByElement: (element, kind) => {
                const map = getMapByKind(kind);
                const idx = map.get(element);
                return idx !== undefined ? idx : emptyIndexArray;
            },
            data: table
        };
    }
    ModelCrossLinkRestraint.fromTable = fromTable;
})(ModelCrossLinkRestraint || (ModelCrossLinkRestraint = {}));
