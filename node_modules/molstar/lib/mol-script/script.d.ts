/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Expression } from './language/expression';
import { StructureElement, StructureSelection, Structure, QueryFn, QueryContextOptions } from '../mol-model/structure';
import { MolScriptBuilder } from './language/builder';
export { Script };
interface Script {
    expression: string;
    language: Script.Language;
}
declare function Script(expression: string, language: Script.Language): Script;
declare namespace Script {
    const Info: {
        'mol-script': string;
        pymol: string;
        vmd: string;
        jmol: string;
    };
    type Language = keyof typeof Info;
    function is(x: any): x is Script;
    function areEqual(a: Script, b: Script): boolean;
    function toExpression(script: Script): Expression;
    function toQuery(script: Script): QueryFn<StructureSelection>;
    function toLoci(script: Script, structure: Structure): StructureElement.Loci;
    function getStructureSelection(expr: Expression | ((builder: typeof MolScriptBuilder) => Expression), structure: Structure, options?: QueryContextOptions): StructureSelection;
}
