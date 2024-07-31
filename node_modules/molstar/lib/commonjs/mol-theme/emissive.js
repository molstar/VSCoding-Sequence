"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emissive = Emissive;
const loci_1 = require("../mol-model/loci");
const structure_1 = require("../mol-model/structure");
const script_1 = require("../mol-script/script");
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
            if (!loci_1.Loci.areEqual(eA.layers[i].loci, eB.layers[i].loci))
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
                loci = structure_1.StructureElement.Loci.remap(loci, structure);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
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
            let shadowed = structure_1.StructureElement.Loci.none(structure);
            for (let i = 0, il = emissive.layers.length; i < il; ++i) {
                let { loci, value } = emissive.layers[il - i - 1]; // process from end
                loci = structure_1.StructureElement.Loci.subtract(loci, shadowed);
                shadowed = structure_1.StructureElement.Loci.union(loci, shadowed);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
                    if (map.has(value)) {
                        loci = structure_1.StructureElement.Loci.union(loci, map.get(value));
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
                const filtered = structure_1.StructureElement.Loci.remap(loci, filter);
                loci = structure_1.StructureElement.Loci.remap(filtered, structure);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
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
            const loci = script_1.Script.toLoci(script, structure);
            if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
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
            const loci = structure_1.StructureElement.Bundle.toLoci(bundle, structure.root);
            layers.push({ loci, value });
        }
        return { kind: 'element-loci', layers };
    }
    Emissive.ofBundle = ofBundle;
    function toBundle(emissive) {
        const layers = [];
        for (let i = 0, il = emissive.layers.length; i < il; ++i) {
            const { loci, value } = emissive.layers[i];
            const bundle = structure_1.StructureElement.Bundle.fromLoci(loci);
            layers.push({ bundle, value });
        }
        return { kind: 'element-loci', layers };
    }
    Emissive.toBundle = toBundle;
})(Emissive || (exports.Emissive = Emissive = {}));
