/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { UUID } from '../../../mol-util';
export { Topology };
var Topology;
(function (Topology) {
    function create(label, basic, bonds, format) {
        return {
            id: UUID.create22(),
            label,
            basic,
            sourceData: format,
            bonds
        };
    }
    Topology.create = create;
})(Topology || (Topology = {}));
