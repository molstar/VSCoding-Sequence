/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../mol-model/loci';
import { Structure, StructureElement } from '../mol-model/structure';
import { Script } from '../mol-script/script';
import { Material } from '../mol-util/material';
export { Substance };
type Substance<T extends Loci = Loci> = {
    readonly kind: T['kind'];
    readonly layers: ReadonlyArray<Substance.Layer<T>>;
};
declare function Substance<T extends Loci>(kind: T['kind'], layers: ReadonlyArray<Substance.Layer<T>>): Substance;
declare namespace Substance {
    type Layer<T extends Loci = Loci> = {
        readonly loci: T;
        readonly material: Material;
        readonly clear: boolean;
    };
    const Empty: Substance;
    function areEqual(sA: Substance, sB: Substance): boolean;
    function isEmpty(substance: Substance): boolean;
    function remap(substance: Substance, structure: Structure): Substance;
    function merge(substance: Substance): Substance;
    function filter(substance: Substance, filter: Structure): Substance;
    type ScriptLayer = {
        script: Script;
        material: Material;
        clear: boolean;
    };
    function ofScript(scriptLayers: ScriptLayer[], structure: Structure): Substance;
    type BundleLayer = {
        bundle: StructureElement.Bundle;
        material: Material;
        clear: boolean;
    };
    function ofBundle(bundleLayers: BundleLayer[], structure: Structure): Substance;
    function toBundle(overpaint: Substance<StructureElement.Loci>): {
        kind: string;
        layers: BundleLayer[];
    };
}
