/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../mol-model/loci';
import { Color } from '../mol-util/color';
import { StructureElement } from '../mol-model/structure';
import { Script } from '../mol-script/script';
export { Overpaint };
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
            if (!Loci.areEqual(oA.layers[i].loci, oB.layers[i].loci))
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
                loci = StructureElement.Loci.remap(loci, structure);
                if (!StructureElement.Loci.isEmpty(loci)) {
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
            let shadowed = StructureElement.Loci.none(structure);
            for (let i = 0, il = overpaint.layers.length; i < il; ++i) {
                let { loci, color, clear } = overpaint.layers[il - i - 1]; // process from end
                loci = StructureElement.Loci.subtract(loci, shadowed);
                shadowed = StructureElement.Loci.union(loci, shadowed);
                if (!StructureElement.Loci.isEmpty(loci)) {
                    const colorOrClear = clear ? -1 : color;
                    if (map.has(colorOrClear)) {
                        loci = StructureElement.Loci.union(loci, map.get(colorOrClear));
                    }
                    map.set(colorOrClear, loci);
                }
            }
            const layers = [];
            map.forEach((loci, colorOrClear) => {
                const clear = colorOrClear === -1;
                const color = clear ? Color(0) : colorOrClear;
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
                const filtered = StructureElement.Loci.remap(loci, filter);
                loci = StructureElement.Loci.remap(filtered, structure);
                if (!StructureElement.Loci.isEmpty(loci)) {
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
            const loci = Script.toLoci(script, structure);
            if (!StructureElement.Loci.isEmpty(loci)) {
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
            const loci = StructureElement.Bundle.toLoci(bundle, structure.root);
            layers.push({ loci, color, clear });
        }
        return { kind: 'element-loci', layers };
    }
    Overpaint.ofBundle = ofBundle;
    function toBundle(overpaint) {
        const layers = [];
        for (let i = 0, il = overpaint.layers.length; i < il; ++i) {
            const { loci, color, clear } = overpaint.layers[i];
            const bundle = StructureElement.Bundle.fromLoci(loci);
            layers.push({ bundle, color, clear });
        }
        return { kind: 'element-loci', layers };
    }
    Overpaint.toBundle = toBundle;
})(Overpaint || (Overpaint = {}));
