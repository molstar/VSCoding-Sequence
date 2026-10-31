/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Table } from '../../../mol-data/db';
export function getModelGroupName(model_id, data) {
    const { ihm_model_group, ihm_model_group_link } = data;
    const link = Table.pickRow(ihm_model_group_link, i => ihm_model_group_link.model_id.value(i) === model_id);
    if (link) {
        const group = Table.pickRow(ihm_model_group, i => ihm_model_group.id.value(i) === link.group_id);
        if (group)
            return group.name;
    }
    return '';
}
//
function hasPresentValues(column) {
    for (let i = 0, il = column.rowCount; i < il; i++) {
        if (column.valueKind(i) === 0 /* Column.ValueKinds.Present */)
            return true;
    }
    return false;
}
function substUndefinedColumn(table, a, b) {
    if (!table[a].isDefined || !hasPresentValues(table[a]))
        table[a] = table[b];
    if (!table[b].isDefined || !hasPresentValues(table[b]))
        table[b] = table[a];
}
/** Fix possibly missing auth_/label_ columns */
export function getNormalizedAtomSite(atom_site) {
    const normalized = Table.ofColumns(atom_site._schema, atom_site);
    substUndefinedColumn(normalized, 'label_atom_id', 'auth_atom_id');
    substUndefinedColumn(normalized, 'label_comp_id', 'auth_comp_id');
    substUndefinedColumn(normalized, 'label_seq_id', 'auth_seq_id');
    substUndefinedColumn(normalized, 'label_asym_id', 'auth_asym_id');
    return normalized;
}
