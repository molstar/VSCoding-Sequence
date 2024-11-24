/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StateTransformer } from '../../mol-state';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject as SO } from '../objects';
export { CreateGroup };
type CreateGroup = typeof CreateGroup;
declare const CreateGroup: StateTransformer<never, SO.Group, PD.Normalize<{
    label: string;
    description: string | undefined;
}>>;
