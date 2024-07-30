/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { omitObjectKeys, pickObjectKeys } from '../../../../mol-util/object';
import { RequiredField, bool } from '../generic/params-schema';
import { TreeSchema } from '../generic/tree-schema';
import { FullMVSTreeSchema } from '../mvs/mvs-tree';
import { MolstarParseFormatT } from '../mvs/param-types';
/** Schema for `MolstarTree` (intermediate tree representation between `MVSTree` and a real Molstar state) */
export const MolstarTreeSchema = TreeSchema({
    rootKind: 'root',
    nodes: {
        ...FullMVSTreeSchema.nodes,
        download: {
            ...FullMVSTreeSchema.nodes.download,
            params: {
                ...FullMVSTreeSchema.nodes.download.params,
                is_binary: RequiredField(bool),
            },
        },
        parse: {
            ...FullMVSTreeSchema.nodes.parse,
            params: {
                format: RequiredField(MolstarParseFormatT),
            },
        },
        /** Auxiliary node corresponding to Molstar's TrajectoryFrom*. */
        trajectory: {
            description: "Auxiliary node corresponding to Molstar's TrajectoryFrom*.",
            parent: ['parse'],
            params: {
                format: RequiredField(MolstarParseFormatT),
                ...pickObjectKeys(FullMVSTreeSchema.nodes.structure.params, ['block_header', 'block_index']),
            },
        },
        /** Auxiliary node corresponding to Molstar's ModelFromTrajectory. */
        model: {
            description: "Auxiliary node corresponding to Molstar's ModelFromTrajectory.",
            parent: ['trajectory'],
            params: pickObjectKeys(FullMVSTreeSchema.nodes.structure.params, ['model_index']),
        },
        /** Auxiliary node corresponding to Molstar's StructureFromModel. */
        structure: {
            ...FullMVSTreeSchema.nodes.structure,
            parent: ['model'],
            params: omitObjectKeys(FullMVSTreeSchema.nodes.structure.params, ['block_header', 'block_index', 'model_index']),
        },
    }
});
