/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../mol-model/loci';
import { StructureElement } from '../mol-model/structure';
import { Script } from '../mol-script/script';
import { Material } from '../mol-util/material';
import { shallowEqual } from '../mol-util/object';
export { Substance };
function Substance(kind, layers) {
    return { kind, layers };
}
(function (Substance) {
    Substance.Empty = { kind: 'empty-loci', layers: [] };
    function areEqual(sA, sB) {
        if (sA.layers.length === 0 && sB.layers.length === 0)
            return true;
        if (sA.layers.length !== sB.layers.length)
            return false;
        for (let i = 0, il = sA.layers.length; i < il; ++i) {
            if (sA.layers[i].clear !== sB.layers[i].clear)
                return false;
            if (!shallowEqual(sA.layers[i].material, sB.layers[i].material))
                return false;
            if (!Loci.areEqual(sA.layers[i].loci, sB.layers[i].loci))
                return false;
        }
        return true;
    }
    Substance.areEqual = areEqual;
    function isEmpty(substance) {
        return substance.layers.length === 0;
    }
    Substance.isEmpty = isEmpty;
    function remap(substance, structure) {
        if (substance.kind === 'element-loci') {
            const layers = [];
            for (const layer of substance.layers) {
                let { loci, material, clear } = layer;
                loci = StructureElement.Loci.remap(loci, structure);
                if (!StructureElement.Loci.isEmpty(loci)) {
                    layers.push({ loci, material, clear });
                }
            }
            return { kind: 'element-loci', layers };
        }
        else {
            return substance;
        }
    }
    Substance.remap = remap;
    function merge(substance) {
        if (isEmpty(substance))
            return substance;
        if (substance.kind === 'element-loci') {
            const { structure } = substance.layers[0].loci;
            let clearLoci = void 0;
            const map = new Map();
            let shadowed = StructureElement.Loci.none(structure);
            for (let i = 0, il = substance.layers.length; i < il; ++i) {
                let { loci, material, clear } = substance.layers[il - i - 1]; // process from end
                loci = StructureElement.Loci.subtract(loci, shadowed);
                shadowed = StructureElement.Loci.union(loci, shadowed);
                if (!StructureElement.Loci.isEmpty(loci)) {
                    if (clear) {
                        clearLoci = clearLoci
                            ? StructureElement.Loci.union(loci, clearLoci)
                            : loci;
                    }
                    else {
                        if (map.has(material)) {
                            loci = StructureElement.Loci.union(loci, map.get(material));
                        }
                        map.set(material, loci);
                    }
                }
            }
            const layers = [];
            if (clearLoci) {
                layers.push({ loci: clearLoci, material: Material(), clear: true });
            }
            map.forEach((loci, material) => {
                layers.push({ loci, material, clear: false });
            });
            return { kind: 'element-loci', layers };
        }
        else {
            return substance;
        }
    }
    Substance.merge = merge;
    function filter(substance, filter) {
        if (isEmpty(substance))
            return substance;
        if (substance.kind === 'element-loci') {
            const { structure } = substance.layers[0].loci;
            const layers = [];
            for (const layer of substance.layers) {
                let { loci, material, clear } = layer;
                // filter by first map to the `filter` structure and
                // then map back to the original structure of the substance loci
                const filtered = StructureElement.Loci.remap(loci, filter);
                loci = StructureElement.Loci.remap(filtered, structure);
                if (!StructureElement.Loci.isEmpty(loci)) {
                    layers.push({ loci, material, clear });
                }
            }
            return { kind: 'element-loci', layers };
        }
        else {
            return substance;
        }
    }
    Substance.filter = filter;
    function ofScript(scriptLayers, structure) {
        const layers = [];
        for (let i = 0, il = scriptLayers.length; i < il; ++i) {
            const { script, material, clear } = scriptLayers[i];
            const loci = Script.toLoci(script, structure);
            if (!StructureElement.Loci.isEmpty(loci)) {
                layers.push({ loci, material, clear });
            }
        }
        return { kind: 'element-loci', layers };
    }
    Substance.ofScript = ofScript;
    function ofBundle(bundleLayers, structure) {
        const layers = [];
        for (let i = 0, il = bundleLayers.length; i < il; ++i) {
            const { bundle, material, clear } = bundleLayers[i];
            const loci = StructureElement.Bundle.toLoci(bundle, structure.root);
            layers.push({ loci, material, clear });
        }
        return { kind: 'element-loci', layers };
    }
    Substance.ofBundle = ofBundle;
    function toBundle(overpaint) {
        const layers = [];
        for (let i = 0, il = overpaint.layers.length; i < il; ++i) {
            const { loci, material, clear } = overpaint.layers[i];
            const bundle = StructureElement.Bundle.fromLoci(loci);
            layers.push({ bundle, material, clear });
        }
        return { kind: 'element-loci', layers };
    }
    Substance.toBundle = toBundle;
})(Substance || (Substance = {}));
