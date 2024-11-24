/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { UUID } from '../../../mol-util';
import { Column } from '../../../mol-data/db';
import { BasicData } from '../../../mol-model-formats/structure/basic/schema';
import { ModelFormat } from '../../../mol-model-formats/format';
export { Topology };
interface Topology {
    readonly id: UUID;
    readonly label: string;
    readonly basic: BasicData;
    readonly sourceData: ModelFormat;
    readonly bonds: {
        readonly indexA: Column<number>;
        readonly indexB: Column<number>;
        readonly order: Column<number>;
    };
}
declare namespace Topology {
    function create(label: string, basic: BasicData, bonds: Topology['bonds'], format: ModelFormat): Topology;
}
