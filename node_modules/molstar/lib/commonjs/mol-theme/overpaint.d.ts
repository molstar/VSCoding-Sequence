/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../mol-model/loci';
import { Color } from '../mol-util/color';
import { Structure, StructureElement } from '../mol-model/structure';
import { Script } from '../mol-script/script';
export { Overpaint };
type Overpaint<T extends Loci = Loci> = {
    readonly kind: T['kind'];
    readonly layers: ReadonlyArray<Overpaint.Layer<T>>;
};
declare function Overpaint<T extends Loci>(kind: T['kind'], layers: ReadonlyArray<Overpaint.Layer<T>>): Overpaint<T>;
declare namespace Overpaint {
    type Layer<T extends Loci = Loci> = {
        readonly loci: T;
        readonly color: Color;
        readonly clear: boolean;
    };
    const Empty: Overpaint;
    function areEqual(oA: Overpaint, oB: Overpaint): boolean;
    function isEmpty(overpaint: Overpaint): boolean;
    function remap(overpaint: Overpaint, structure: Structure): Overpaint;
    function merge(overpaint: Overpaint): Overpaint;
    function filter(overpaint: Overpaint, filter: Structure): Overpaint;
    type ScriptLayer = {
        script: Script;
        color: Color;
        clear: boolean;
    };
    function ofScript(scriptLayers: ScriptLayer[], structure: Structure): Overpaint;
    type BundleLayer = {
        bundle: StructureElement.Bundle;
        color: Color;
        clear: boolean;
    };
    function ofBundle(bundleLayers: BundleLayer[], structure: Structure): Overpaint;
    function toBundle(overpaint: Overpaint<StructureElement.Loci>): {
        kind: string;
        layers: BundleLayer[];
    };
}
