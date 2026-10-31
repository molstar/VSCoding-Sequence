/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../mol-model/loci';
import { StructureElement, Structure } from '../mol-model/structure';
import { Script } from '../mol-script/script';
export { Transparency };
type Transparency<T extends Loci = Loci> = {
    readonly kind: T['kind'];
    readonly layers: ReadonlyArray<Transparency.Layer<T>>;
};
declare function Transparency<T extends Loci>(kind: T['kind'], layers: ReadonlyArray<Transparency.Layer<T>>): Transparency<T>;
declare namespace Transparency {
    type Layer<T extends Loci = Loci> = {
        readonly loci: T;
        readonly value: number;
    };
    const Empty: Transparency;
    function areEqual(tA: Transparency, tB: Transparency): boolean;
    function isEmpty(transparency: Transparency): boolean;
    function remap(transparency: Transparency, structure: Structure): Transparency;
    function merge(transparency: Transparency): Transparency;
    function filter(transparency: Transparency, filter: Structure): Transparency;
    type ScriptLayer = {
        script: Script;
        value: number;
    };
    function ofScript(scriptLayers: ScriptLayer[], structure: Structure): Transparency<StructureElement.Loci>;
    type BundleLayer = {
        bundle: StructureElement.Bundle;
        value: number;
    };
    function ofBundle(bundleLayers: BundleLayer[], structure: Structure): Transparency<StructureElement.Loci>;
    function toBundle(transparency: Transparency<StructureElement.Loci>): {
        kind: string;
        layers: BundleLayer[];
    };
}
