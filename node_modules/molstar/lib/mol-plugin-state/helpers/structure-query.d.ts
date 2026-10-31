/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Expression } from '../../mol-script/language/expression';
import { QueryFn, Structure, StructureSelection as Sel } from '../../mol-model/structure';
import { Script } from '../../mol-script/script';
import { PluginStateObject as SO } from '../objects';
export { StructureQueryHelper };
declare namespace StructureQueryHelper {
    interface CacheEntry {
        script?: Script;
        expression: Expression;
        compiled: QueryFn<Sel>;
        originalStructure: Structure;
        currentStructure: Structure;
    }
    function isUnchanged(entry: CacheEntry, query: Script | Expression, structure: Structure): boolean;
    function create(structure: Structure, query: Script | Expression): CacheEntry;
    function run(entry: CacheEntry, structure: Structure): Sel;
    function createAndRun(structure: Structure, query: Script | Expression): {
        entry: CacheEntry;
        selection: Sel;
    };
    function updateStructure(entry: CacheEntry, structure: Structure): Sel;
    function updateStructureObject(obj: SO.Molecule.Structure, selection: Sel, label?: string): void;
}
