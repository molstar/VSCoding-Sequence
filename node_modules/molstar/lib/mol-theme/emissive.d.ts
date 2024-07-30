/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../mol-model/loci';
import { Structure, StructureElement } from '../mol-model/structure';
import { Script } from '../mol-script/script';
export { Emissive };
type Emissive<T extends Loci = Loci> = {
    readonly kind: T['kind'];
    readonly layers: ReadonlyArray<Emissive.Layer<T>>;
};
declare function Emissive<T extends Loci>(kind: T['kind'], layers: ReadonlyArray<Emissive.Layer<T>>): Emissive;
declare namespace Emissive {
    type Layer<T extends Loci = Loci> = {
        readonly loci: T;
        readonly value: number;
    };
    const Empty: Emissive;
    function areEqual(eA: Emissive, eB: Emissive): boolean;
    function isEmpty(emissive: Emissive): boolean;
    function remap(emissive: Emissive, structure: Structure): Emissive;
    function merge(emissive: Emissive): Emissive;
    function filter(emissive: Emissive, filter: Structure): Emissive;
    type ScriptLayer = {
        script: Script;
        value: number;
    };
    function ofScript(scriptLayers: ScriptLayer[], structure: Structure): Emissive;
    type BundleLayer = {
        bundle: StructureElement.Bundle;
        value: number;
    };
    function ofBundle(bundleLayers: BundleLayer[], structure: Structure): Emissive;
    function toBundle(emissive: Emissive<StructureElement.Loci>): {
        kind: string;
        layers: BundleLayer[];
    };
}
