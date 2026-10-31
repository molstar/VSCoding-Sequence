"use strict";
/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Substance = Substance;
const loci_1 = require("../mol-model/loci");
const structure_1 = require("../mol-model/structure");
const script_1 = require("../mol-script/script");
const material_1 = require("../mol-util/material");
const object_1 = require("../mol-util/object");
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
            if (!(0, object_1.shallowEqual)(sA.layers[i].material, sB.layers[i].material))
                return false;
            if (!loci_1.Loci.areEqual(sA.layers[i].loci, sB.layers[i].loci))
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
                loci = structure_1.StructureElement.Loci.remap(loci, structure);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
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
            let shadowed = structure_1.StructureElement.Loci.none(structure);
            for (let i = 0, il = substance.layers.length; i < il; ++i) {
                let { loci, material, clear } = substance.layers[il - i - 1]; // process from end
                loci = structure_1.StructureElement.Loci.subtract(loci, shadowed);
                shadowed = structure_1.StructureElement.Loci.union(loci, shadowed);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
                    if (clear) {
                        clearLoci = clearLoci
                            ? structure_1.StructureElement.Loci.union(loci, clearLoci)
                            : loci;
                    }
                    else {
                        if (map.has(material)) {
                            loci = structure_1.StructureElement.Loci.union(loci, map.get(material));
                        }
                        map.set(material, loci);
                    }
                }
            }
            const layers = [];
            if (clearLoci) {
                layers.push({ loci: clearLoci, material: (0, material_1.Material)(), clear: true });
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
                const filtered = structure_1.StructureElement.Loci.remap(loci, filter);
                loci = structure_1.StructureElement.Loci.remap(filtered, structure);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
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
            const loci = script_1.Script.toLoci(script, structure);
            if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
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
            const loci = structure_1.StructureElement.Bundle.toLoci(bundle, structure.root);
            layers.push({ loci, material, clear });
        }
        return { kind: 'element-loci', layers };
    }
    Substance.ofBundle = ofBundle;
    function toBundle(overpaint) {
        const layers = [];
        for (let i = 0, il = overpaint.layers.length; i < il; ++i) {
            const { loci, material, clear } = overpaint.layers[i];
            const bundle = structure_1.StructureElement.Bundle.fromLoci(loci);
            layers.push({ bundle, material, clear });
        }
        return { kind: 'element-loci', layers };
    }
    Substance.toBundle = toBundle;
})(Substance || (exports.Substance = Substance = {}));
