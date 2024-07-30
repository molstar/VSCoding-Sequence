/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../mol-model/loci';
import { StructureElement } from '../mol-model/structure';
import { Script } from '../mol-script/script';
export { Emissive };
function Emissive(kind, layers) {
    return { kind, layers };
}
(function (Emissive) {
    Emissive.Empty = { kind: 'empty-loci', layers: [] };
    function areEqual(eA, eB) {
        if (eA.layers.length === 0 && eB.layers.length === 0)
            return true;
        if (eA.layers.length !== eB.layers.length)
            return false;
        for (let i = 0, il = eA.layers.length; i < il; ++i) {
            if (eA.layers[i].value !== eB.layers[i].value)
                return false;
            if (!Loci.areEqual(eA.layers[i].loci, eB.layers[i].loci))
                return false;
        }
        return true;
    }
    Emissive.areEqual = areEqual;
    function isEmpty(emissive) {
        return emissive.layers.length === 0;
    }
    Emissive.isEmpty = isEmpty;
    function remap(emissive, structure) {
        if (emissive.kind === 'element-loci') {
            const layers = [];
            for (const layer of emissive.layers) {
                let { loci, value } = layer;
                loci = StructureElement.Loci.remap(loci, structure);
                if (!StructureElement.Loci.isEmpty(loci)) {
                    layers.push({ loci, value });
                }
            }
            return { kind: 'element-loci', layers };
        }
        else {
            return emissive;
        }
    }
    Emissive.remap = remap;
    function merge(emissive) {
        if (isEmpty(emissive))
            return emissive;
        if (emissive.kind === 'element-loci') {
            const { structure } = emissive.layers[0].loci;
            const map = new Map();
            let shadowed = StructureElement.Loci.none(structure);
            for (let i = 0, il = emissive.layers.length; i < il; ++i) {
                let { loci, value } = emissive.layers[il - i - 1]; // process from end
                loci = StructureElement.Loci.subtract(loci, shadowed);
                shadowed = StructureElement.Loci.union(loci, shadowed);
                if (!StructureElement.Loci.isEmpty(loci)) {
                    if (map.has(value)) {
                        loci = StructureElement.Loci.union(loci, map.get(value));
                    }
                    map.set(value, loci);
                }
            }
            const layers = [];
            map.forEach((loci, value) => {
                layers.push({ loci, value });
            });
            return { kind: 'element-loci', layers };
        }
        else {
            return emissive;
        }
    }
    Emissive.merge = merge;
    function filter(emissive, filter) {
        if (isEmpty(emissive))
            return emissive;
        if (emissive.kind === 'element-loci') {
            const { structure } = emissive.layers[0].loci;
            const layers = [];
            for (const layer of emissive.layers) {
                let { loci, value } = layer;
                // filter by first map to the `filter` structure and
                // then map back to the original structure of the emissive loci
                const filtered = StructureElement.Loci.remap(loci, filter);
                loci = StructureElement.Loci.remap(filtered, structure);
                if (!StructureElement.Loci.isEmpty(loci)) {
                    layers.push({ loci, value });
                }
            }
            return { kind: 'element-loci', layers };
        }
        else {
            return emissive;
        }
    }
    Emissive.filter = filter;
    function ofScript(scriptLayers, structure) {
        const layers = [];
        for (let i = 0, il = scriptLayers.length; i < il; ++i) {
            const { script, value } = scriptLayers[i];
            const loci = Script.toLoci(script, structure);
            if (!StructureElement.Loci.isEmpty(loci)) {
                layers.push({ loci, value });
            }
        }
        return { kind: 'element-loci', layers };
    }
    Emissive.ofScript = ofScript;
    function ofBundle(bundleLayers, structure) {
        const layers = [];
        for (let i = 0, il = bundleLayers.length; i < il; ++i) {
            const { bundle, value } = bundleLayers[i];
            const loci = StructureElement.Bundle.toLoci(bundle, structure.root);
            layers.push({ loci, value });
        }
        return { kind: 'element-loci', layers };
    }
    Emissive.ofBundle = ofBundle;
    function toBundle(emissive) {
        const layers = [];
        for (let i = 0, il = emissive.layers.length; i < il; ++i) {
            const { loci, value } = emissive.layers[i];
            const bundle = StructureElement.Bundle.fromLoci(loci);
            layers.push({ bundle, value });
        }
        return { kind: 'element-loci', layers };
    }
    Emissive.toBundle = toBundle;
})(Emissive || (Emissive = {}));
