/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../mol-model/loci';
import { StructureElement } from '../mol-model/structure';
import { Script } from '../mol-script/script';
import { BitFlags } from '../mol-util/bit-flags';
export { Clipping };
function Clipping(kind, layers) {
    return { kind, layers };
}
(function (Clipping) {
    Clipping.Empty = { kind: 'empty-loci', layers: [] };
    let Groups;
    (function (Groups) {
        Groups.is = BitFlags.has;
        let Flag;
        (function (Flag) {
            Flag[Flag["None"] = 0] = "None";
            Flag[Flag["One"] = 1] = "One";
            Flag[Flag["Two"] = 2] = "Two";
            Flag[Flag["Three"] = 4] = "Three";
            Flag[Flag["Four"] = 8] = "Four";
            Flag[Flag["Five"] = 16] = "Five";
            Flag[Flag["Six"] = 32] = "Six";
        })(Flag = Groups.Flag || (Groups.Flag = {}));
        function create(flags) {
            return BitFlags.create(flags);
        }
        Groups.create = create;
        Groups.Names = {
            'one': Flag.One,
            'two': Flag.Two,
            'three': Flag.Three,
            'four': Flag.Four,
            'five': Flag.Five,
            'six': Flag.Six,
        };
        function isName(name) {
            return name in Groups.Names;
        }
        Groups.isName = isName;
        function fromName(name) {
            switch (name) {
                case 'one': return Flag.One;
                case 'two': return Flag.Two;
                case 'three': return Flag.Three;
                case 'four': return Flag.Four;
                case 'five': return Flag.Five;
                case 'six': return Flag.Six;
            }
        }
        Groups.fromName = fromName;
        function fromNames(names) {
            let f = Flag.None;
            for (let i = 0, il = names.length; i < il; ++i) {
                f |= fromName(names[i]);
            }
            return f;
        }
        Groups.fromNames = fromNames;
        function toNames(groups) {
            const names = [];
            if (Groups.is(groups, Flag.One))
                names.push('one');
            if (Groups.is(groups, Flag.Two))
                names.push('two');
            if (Groups.is(groups, Flag.Three))
                names.push('three');
            if (Groups.is(groups, Flag.Four))
                names.push('four');
            if (Groups.is(groups, Flag.Five))
                names.push('five');
            if (Groups.is(groups, Flag.Six))
                names.push('six');
            return names;
        }
        Groups.toNames = toNames;
    })(Groups = Clipping.Groups || (Clipping.Groups = {}));
    function areEqual(cA, cB) {
        if (cA.layers.length !== cB.layers.length)
            return false;
        for (let i = 0, il = cA.layers.length; i < il; ++i) {
            if (cA.layers[i].groups !== cB.layers[i].groups)
                return false;
            if (!Loci.areEqual(cA.layers[i].loci, cB.layers[i].loci))
                return false;
        }
        return true;
    }
    Clipping.areEqual = areEqual;
    /** Check if layers empty */
    function isEmpty(clipping) {
        return clipping.layers.length === 0;
    }
    Clipping.isEmpty = isEmpty;
    /** Remap layers */
    function remap(clipping, structure) {
        if (clipping.kind === 'element-loci') {
            const layers = [];
            for (const layer of clipping.layers) {
                let { loci, groups } = layer;
                loci = StructureElement.Loci.remap(loci, structure);
                if (!StructureElement.Loci.isEmpty(loci)) {
                    layers.push({ loci, groups });
                }
            }
            return { kind: 'element-loci', layers };
        }
        else {
            return clipping;
        }
    }
    Clipping.remap = remap;
    /** Merge layers */
    function merge(clipping) {
        if (isEmpty(clipping))
            return clipping;
        if (clipping.kind === 'element-loci') {
            const { structure } = clipping.layers[0].loci;
            const map = new Map();
            let shadowed = StructureElement.Loci.none(structure);
            for (let i = 0, il = clipping.layers.length; i < il; ++i) {
                let { loci, groups } = clipping.layers[il - i - 1]; // process from end
                loci = StructureElement.Loci.subtract(loci, shadowed);
                shadowed = StructureElement.Loci.union(loci, shadowed);
                if (!StructureElement.Loci.isEmpty(loci)) {
                    if (map.has(groups)) {
                        loci = StructureElement.Loci.union(loci, map.get(groups));
                    }
                    map.set(groups, loci);
                }
            }
            const layers = [];
            map.forEach((loci, groups) => {
                layers.push({ loci, groups });
            });
            return { kind: 'element-loci', layers };
        }
        else {
            return clipping;
        }
    }
    Clipping.merge = merge;
    /** Filter layers */
    function filter(clipping, filter) {
        if (isEmpty(clipping))
            return clipping;
        if (clipping.kind === 'element-loci') {
            const { structure } = clipping.layers[0].loci;
            const layers = [];
            for (const layer of clipping.layers) {
                let { loci, groups } = layer;
                // filter by first map to the `filter` structure and
                // then map back to the original structure of the clipping loci
                const filtered = StructureElement.Loci.remap(loci, filter);
                loci = StructureElement.Loci.remap(filtered, structure);
                if (!StructureElement.Loci.isEmpty(loci)) {
                    layers.push({ loci, groups });
                }
            }
            return { kind: 'element-loci', layers };
        }
        else {
            return clipping;
        }
    }
    Clipping.filter = filter;
    function ofScript(scriptLayers, structure) {
        const layers = [];
        for (let i = 0, il = scriptLayers.length; i < il; ++i) {
            const { script, groups } = scriptLayers[i];
            const loci = Script.toLoci(script, structure);
            if (!StructureElement.Loci.isEmpty(loci)) {
                layers.push({ loci, groups });
            }
        }
        return { kind: 'element-loci', layers };
    }
    Clipping.ofScript = ofScript;
    function ofBundle(bundleLayers, structure) {
        const layers = [];
        for (let i = 0, il = bundleLayers.length; i < il; ++i) {
            const { bundle, groups } = bundleLayers[i];
            const loci = StructureElement.Bundle.toLoci(bundle, structure.root);
            layers.push({ loci, groups });
        }
        return { kind: 'element-loci', layers };
    }
    Clipping.ofBundle = ofBundle;
    function toBundle(clipping) {
        const layers = [];
        for (let i = 0, il = clipping.layers.length; i < il; ++i) {
            const { loci, groups } = clipping.layers[i];
            const bundle = StructureElement.Bundle.fromLoci(loci);
            layers.push({ bundle, groups });
        }
        return { kind: 'element-loci', layers };
    }
    Clipping.toBundle = toBundle;
})(Clipping || (Clipping = {}));
