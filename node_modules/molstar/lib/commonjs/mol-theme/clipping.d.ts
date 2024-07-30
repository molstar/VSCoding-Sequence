/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../mol-model/loci';
import { StructureElement, Structure } from '../mol-model/structure';
import { Script } from '../mol-script/script';
import { BitFlags } from '../mol-util/bit-flags';
export { Clipping };
type Clipping<T extends Loci = Loci> = {
    readonly kind: T['kind'];
    readonly layers: ReadonlyArray<Clipping.Layer<T>>;
};
declare function Clipping<T extends Loci>(kind: T['kind'], layers: ReadonlyArray<Clipping.Layer<T>>): Clipping<T>;
declare namespace Clipping {
    type Layer<T extends Loci = Loci> = {
        readonly loci: T;
        readonly groups: Groups;
    };
    const Empty: Clipping;
    type Groups = BitFlags<Groups.Flag>;
    namespace Groups {
        const is: (g: Groups, f: Flag) => boolean;
        enum Flag {
            None = 0,
            One = 1,
            Two = 2,
            Three = 4,
            Four = 8,
            Five = 16,
            Six = 32
        }
        function create(flags: Flag): Groups;
        const Names: {
            one: Flag;
            two: Flag;
            three: Flag;
            four: Flag;
            five: Flag;
            six: Flag;
        };
        type Names = keyof typeof Names;
        function isName(name: string): name is Names;
        function fromName(name: Names): Flag;
        function fromNames(names: Names[]): Flag;
        function toNames(groups: Groups): Names[];
    }
    function areEqual(cA: Clipping, cB: Clipping): boolean;
    /** Check if layers empty */
    function isEmpty(clipping: Clipping): boolean;
    /** Remap layers */
    function remap(clipping: Clipping, structure: Structure): Clipping;
    /** Merge layers */
    function merge(clipping: Clipping): Clipping;
    /** Filter layers */
    function filter(clipping: Clipping, filter: Structure): Clipping;
    type ScriptLayer = {
        script: Script;
        groups: Groups;
    };
    function ofScript(scriptLayers: ScriptLayer[], structure: Structure): Clipping;
    type BundleLayer = {
        bundle: StructureElement.Bundle;
        groups: Groups;
    };
    function ofBundle(bundleLayers: BundleLayer[], structure: Structure): Clipping;
    function toBundle(clipping: Clipping<StructureElement.Loci>): {
        kind: string;
        layers: BundleLayer[];
    };
}
