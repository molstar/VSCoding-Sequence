"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Overpaint = Overpaint;
const loci_1 = require("../mol-model/loci");
const color_1 = require("../mol-util/color");
const structure_1 = require("../mol-model/structure");
const script_1 = require("../mol-script/script");
function Overpaint(kind, layers) {
    return { kind, layers };
}
(function (Overpaint) {
    Overpaint.Empty = { kind: 'empty-loci', layers: [] };
    function areEqual(oA, oB) {
        if (oA.layers.length === 0 && oB.layers.length === 0)
            return true;
        if (oA.layers.length !== oB.layers.length)
            return false;
        for (let i = 0, il = oA.layers.length; i < il; ++i) {
            if (oA.layers[i].clear !== oB.layers[i].clear)
                return false;
            if (oA.layers[i].color !== oB.layers[i].color)
                return false;
            if (!loci_1.Loci.areEqual(oA.layers[i].loci, oB.layers[i].loci))
                return false;
        }
        return true;
    }
    Overpaint.areEqual = areEqual;
    function isEmpty(overpaint) {
        return overpaint.layers.length === 0;
    }
    Overpaint.isEmpty = isEmpty;
    function remap(overpaint, structure) {
        if (overpaint.kind === 'element-loci') {
            const layers = [];
            for (const layer of overpaint.layers) {
                let { loci, color, clear } = layer;
                loci = structure_1.StructureElement.Loci.remap(loci, structure);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
                    layers.push({ loci, color, clear });
                }
            }
            return { kind: 'element-loci', layers };
        }
        else {
            return overpaint;
        }
    }
    Overpaint.remap = remap;
    function merge(overpaint) {
        if (isEmpty(overpaint))
            return overpaint;
        if (overpaint.kind === 'element-loci') {
            const { structure } = overpaint.layers[0].loci;
            const map = new Map();
            let shadowed = structure_1.StructureElement.Loci.none(structure);
            for (let i = 0, il = overpaint.layers.length; i < il; ++i) {
                let { loci, color, clear } = overpaint.layers[il - i - 1]; // process from end
                loci = structure_1.StructureElement.Loci.subtract(loci, shadowed);
                shadowed = structure_1.StructureElement.Loci.union(loci, shadowed);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
                    const colorOrClear = clear ? -1 : color;
                    if (map.has(colorOrClear)) {
                        loci = structure_1.StructureElement.Loci.union(loci, map.get(colorOrClear));
                    }
                    map.set(colorOrClear, loci);
                }
            }
            const layers = [];
            map.forEach((loci, colorOrClear) => {
                const clear = colorOrClear === -1;
                const color = clear ? (0, color_1.Color)(0) : colorOrClear;
                layers.push({ loci, color, clear });
            });
            return { kind: 'element-loci', layers };
        }
        else {
            return overpaint;
        }
    }
    Overpaint.merge = merge;
    function filter(overpaint, filter) {
        if (isEmpty(overpaint))
            return overpaint;
        if (overpaint.kind === 'element-loci') {
            const { structure } = overpaint.layers[0].loci;
            const layers = [];
            for (const layer of overpaint.layers) {
                let { loci, color, clear } = layer;
                // filter by first map to the `filter` structure and
                // then map back to the original structure of the overpaint loci
                const filtered = structure_1.StructureElement.Loci.remap(loci, filter);
                loci = structure_1.StructureElement.Loci.remap(filtered, structure);
                if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
                    layers.push({ loci, color, clear });
                }
            }
            return { kind: 'element-loci', layers };
        }
        else {
            return overpaint;
        }
    }
    Overpaint.filter = filter;
    function ofScript(scriptLayers, structure) {
        const layers = [];
        for (let i = 0, il = scriptLayers.length; i < il; ++i) {
            const { script, color, clear } = scriptLayers[i];
            const loci = script_1.Script.toLoci(script, structure);
            if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
                layers.push({ loci, color, clear });
            }
        }
        return { kind: 'element-loci', layers };
    }
    Overpaint.ofScript = ofScript;
    function ofBundle(bundleLayers, structure) {
        const layers = [];
        for (let i = 0, il = bundleLayers.length; i < il; ++i) {
            const { bundle, color, clear } = bundleLayers[i];
            const loci = structure_1.StructureElement.Bundle.toLoci(bundle, structure.root);
            layers.push({ loci, color, clear });
        }
        return { kind: 'element-loci', layers };
    }
    Overpaint.ofBundle = ofBundle;
    function toBundle(overpaint) {
        const layers = [];
        for (let i = 0, il = overpaint.layers.length; i < il; ++i) {
            const { loci, color, clear } = overpaint.layers[i];
            const bundle = structure_1.StructureElement.Bundle.fromLoci(loci);
            layers.push({ bundle, color, clear });
        }
        return { kind: 'element-loci', layers };
    }
    Overpaint.toBundle = toBundle;
})(Overpaint || (exports.Overpaint = Overpaint = {}));
