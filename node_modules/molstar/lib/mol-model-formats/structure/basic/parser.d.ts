/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { RuntimeContext } from '../../../mol-task';
import { ModelFormat } from '../../format';
import { BasicData } from './schema';
import { ArrayTrajectory } from '../../../mol-model/structure/trajectory';
export declare function createModels(data: BasicData, format: ModelFormat, ctx: RuntimeContext): Promise<ArrayTrajectory>;
