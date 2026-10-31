/**
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { MolScriptSymbolTable as SymbolTable } from './symbol-table';
export var MolScriptBuilder;
(function (MolScriptBuilder) {
    MolScriptBuilder.core = SymbolTable.core;
    MolScriptBuilder.struct = SymbolTable.structureQuery;
    MolScriptBuilder.internal = SymbolTable.internal;
    /** Atom-name constructor */
    function atomName(s) { return MolScriptBuilder.struct.type.atomName([s]); }
    MolScriptBuilder.atomName = atomName;
    /** Element-symbol constructor */
    function es(s) { return MolScriptBuilder.struct.type.elementSymbol([s]); }
    MolScriptBuilder.es = es;
    /** List constructor */
    function list(...xs) { return MolScriptBuilder.core.type.list(xs); }
    MolScriptBuilder.list = list;
    /** Set constructor */
    function set(...xs) { return MolScriptBuilder.core.type.set(xs); }
    MolScriptBuilder.set = set;
    /** RegEx constructor */
    function re(pattern, flags) { return MolScriptBuilder.core.type.regex([pattern, flags]); }
    MolScriptBuilder.re = re;
    /** Function constructor */
    function fn(x) { return MolScriptBuilder.core.ctrl.fn([x]); }
    MolScriptBuilder.fn = fn;
    function evaluate(x) { return MolScriptBuilder.core.ctrl.eval([x]); }
    MolScriptBuilder.evaluate = evaluate;
    const _acp = MolScriptBuilder.struct.atomProperty.core, _ammp = MolScriptBuilder.struct.atomProperty.macromolecular, _atp = MolScriptBuilder.struct.atomProperty.topology;
    /** atom core property */
    function acp(p) { return _acp[p](); }
    MolScriptBuilder.acp = acp;
    ;
    /** atom topology property */
    function atp(p) { return _atp[p](); }
    MolScriptBuilder.atp = atp;
    ;
    /** atom macromolecular property */
    function ammp(p) { return _ammp[p](); }
    MolScriptBuilder.ammp = ammp;
    ;
    const _aps = MolScriptBuilder.struct.atomSet.propertySet;
    /** atom core property set */
    function acpSet(p) { return _aps([acp(p)]); }
    MolScriptBuilder.acpSet = acpSet;
    ;
    /** atom topology property set */
    function atpSet(p) { return _aps([atp(p)]); }
    MolScriptBuilder.atpSet = atpSet;
    ;
    /** atom macromolecular property set */
    function ammpSet(p) { return _aps([ammp(p)]); }
    MolScriptBuilder.ammpSet = ammpSet;
    ;
})(MolScriptBuilder || (MolScriptBuilder = {}));
