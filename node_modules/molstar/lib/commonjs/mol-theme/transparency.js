"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transparency = Transparency;
const loci_1 = require("../mol-model/loci");
const structure_1 = require("../mol-model/structure");
const script_1 = require("../mol-script/script");
function Transparency(kind, layers) {
    return { kind, layers };
}
(function (Transparency) {
    Transparency.Empty = { kind: 'empty-loci', layers: [] };
    function areEqual(tA, tB) {
        if (tA.layers.length === 0 && tB.layers.length === 0)
            return true;
        if (tA.layers.length !== tB.layers.length)
            return false;
        for (let i = 0, il = tA.layers.length; i < il; ++i) {
            if (tA.layers[i].value !== tB.layers[i].value)
                return false;
            if (!loci_1.Loci.areEqual(tA.layers[i].loci, tB.layers[i].loci))
                return false;
        }
        return true;
    }
    Transparency.areEqual = areEqual;
    function isEmpty(transparency) {
        return transparency.layers.length === 0;
    }
    Transparency.isEmpty = isEmpty;
    function remap(transparency, structure) {
        if (transparency.kind === 'element-loci') {
            const layers = [];
            for (const layer of transparency.layers) {
                const loci = structure_1.StructureElement.Loci.remap(layer.loci, structure);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
                    layers.push({ loci, value: layer.value });
                }
            }
            return { kind: 'element-loci', layers };
        }
        else {
            return transparency;
        }
    }
    Transparency.remap = remap;
    function merge(transparency) {
        if (isEmpty(transparency))
            return transparency;
        if (transparency.kind === 'element-loci') {
            const { structure } = transparency.layers[0].loci;
            const map = new Map();
            let shadowed = structure_1.StructureElement.Loci.none(structure);
            for (let i = 0, il = transparency.layers.length; i < il; ++i) {
                let { loci, value } = transparency.layers[il - i - 1]; // process from end
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
            return transparency;
        }
    }
    Transparency.merge = merge;
    function filter(transparency, filter) {
        if (isEmpty(transparency))
            return transparency;
        if (transparency.kind === 'element-loci') {
            const { structure } = transparency.layers[0].loci;
            const layers = [];
            for (const layer of transparency.layers) {
                let { loci, value } = layer;
                // filter by first map to the `filter` structure and
                // then map back to the original structure of the transparency loci
                const filtered = structure_1.StructureElement.Loci.remap(loci, filter);
                loci = structure_1.StructureElement.Loci.remap(filtered, structure);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
                    layers.push({ loci, value });
                }
            }
            return { kind: 'element-loci', layers };
        }
        else {
            return transparency;
        }
    }
    Transparency.filter = filter;
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
    Transparency.ofScript = ofScript;
    function ofBundle(bundleLayers, structure) {
        const layers = [];
        for (let i = 0, il = bundleLayers.length; i < il; ++i) {
            const { bundle, value } = bundleLayers[i];
            const loci = structure_1.StructureElement.Bundle.toLoci(bundle, structure.root);
            layers.push({ loci, value });
        }
        return { kind: 'element-loci', layers };
    }
    Transparency.ofBundle = ofBundle;
    function toBundle(transparency) {
        const layers = [];
        for (let i = 0, il = transparency.layers.length; i < il; ++i) {
            const { loci, value } = transparency.layers[i];
            const bundle = structure_1.StructureElement.Bundle.fromLoci(loci);
            layers.push({ bundle, value });
        }
        return { kind: 'element-loci', layers };
    }
    Transparency.toBundle = toBundle;
})(Transparency || (exports.Transparency = Transparency = {}));
