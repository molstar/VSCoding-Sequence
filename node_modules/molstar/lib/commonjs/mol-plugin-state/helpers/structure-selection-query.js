"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureSelectionQueryRegistry = exports.StructureSelectionQueries = exports.StructureSelectionCategory = void 0;
exports.StructureSelectionQuery = StructureSelectionQuery;
exports.ResidueQuery = ResidueQuery;
exports.ElementSymbolQuery = ElementSymbolQuery;
exports.EntityDescriptionQuery = EntityDescriptionQuery;
exports.getElementQueries = getElementQueries;
exports.getNonStandardResidueQueries = getNonStandardResidueQueries;
exports.getPolymerAndBranchedEntityQueries = getPolymerAndBranchedEntityQueries;
exports.applyBuiltInSelection = applyBuiltInSelection;
const structure_1 = require("../../mol-model/structure");
const types_1 = require("../../mol-model/structure/model/types");
const builder_1 = require("../../mol-script/language/builder");
const compiler_1 = require("../../mol-script/runtime/query/compiler");
const set_1 = require("../../mol-util/set");
const transforms_1 = require("../transforms");
const types_2 = require("../../mol-model/structure/model/properties/atomic/types");
const secondary_structure_1 = require("../../mol-model-props/computed/secondary-structure");
var StructureSelectionCategory;
(function (StructureSelectionCategory) {
    StructureSelectionCategory["Type"] = "Type";
    StructureSelectionCategory["Structure"] = "Structure Property";
    StructureSelectionCategory["Atom"] = "Atom Property";
    StructureSelectionCategory["Bond"] = "Bond Property";
    StructureSelectionCategory["Residue"] = "Residue Property";
    StructureSelectionCategory["AminoAcid"] = "Amino Acid";
    StructureSelectionCategory["NucleicBase"] = "Nucleic Base";
    StructureSelectionCategory["Manipulate"] = "Manipulate Selection";
    StructureSelectionCategory["Validation"] = "Validation";
    StructureSelectionCategory["Misc"] = "Miscellaneous";
    StructureSelectionCategory["Internal"] = "Internal";
})(StructureSelectionCategory || (exports.StructureSelectionCategory = StructureSelectionCategory = {}));
function StructureSelectionQuery(label, expression, props = {}) {
    var _a;
    let _query;
    return {
        label,
        expression,
        description: props.description || '',
        category: (_a = props.category) !== null && _a !== void 0 ? _a : StructureSelectionCategory.Misc,
        isHidden: !!props.isHidden,
        priority: props.priority || 0,
        referencesCurrent: !!props.referencesCurrent,
        get query() {
            if (!_query)
                _query = (0, compiler_1.compile)(expression);
            return _query;
        },
        ensureCustomProperties: props.ensureCustomProperties,
        async getSelection(plugin, runtime, structure) {
            const current = plugin.managers.structure.selection.getStructure(structure);
            const currentSelection = current ? structure_1.StructureSelection.Sequence(structure, [current]) : structure_1.StructureSelection.Empty(structure);
            if (props.ensureCustomProperties) {
                await props.ensureCustomProperties({ runtime, assetManager: plugin.managers.asset }, structure);
            }
            if (!_query)
                _query = (0, compiler_1.compile)(expression);
            return _query(new structure_1.QueryContext(structure, { currentSelection }));
        }
    };
}
const all = StructureSelectionQuery('All', builder_1.MolScriptBuilder.struct.generator.all(), { category: '', priority: 1000 });
const current = StructureSelectionQuery('Current Selection', builder_1.MolScriptBuilder.internal.generator.current(), { category: '', referencesCurrent: true });
const polymer = StructureSelectionQuery('Polymer', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'entity-test': builder_1.MolScriptBuilder.core.logic.and([
            builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'polymer']),
            builder_1.MolScriptBuilder.core.str.match([
                builder_1.MolScriptBuilder.re('(polypeptide|cyclic-pseudo-peptide|peptide-like|nucleotide|peptide nucleic acid)', 'i'),
                builder_1.MolScriptBuilder.ammp('entitySubtype')
            ])
        ])
    })
]), { category: StructureSelectionCategory.Type });
const trace = StructureSelectionQuery('Trace', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.combinator.merge([
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'entity-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'polymer']),
                'chain-test': builder_1.MolScriptBuilder.core.set.has([
                    builder_1.MolScriptBuilder.set('sphere', 'gaussian'), builder_1.MolScriptBuilder.ammp('objectPrimitive')
                ])
            })
        ]),
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'entity-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'polymer']),
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set('CA', 'P'), builder_1.MolScriptBuilder.ammp('label_atom_id')])
            })
        ])
    ])
]), { category: StructureSelectionCategory.Structure });
const _proteinEntityTest = builder_1.MolScriptBuilder.core.logic.and([
    builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'polymer']),
    builder_1.MolScriptBuilder.core.str.match([
        builder_1.MolScriptBuilder.re('(polypeptide|cyclic-pseudo-peptide|peptide-like)', 'i'),
        builder_1.MolScriptBuilder.ammp('entitySubtype')
    ])
]);
const _nucleiEntityTest = builder_1.MolScriptBuilder.core.logic.and([
    builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'polymer']),
    builder_1.MolScriptBuilder.core.str.match([
        builder_1.MolScriptBuilder.re('(nucleotide|peptide nucleic acid)', 'i'),
        builder_1.MolScriptBuilder.ammp('entitySubtype')
    ])
]);
/**
 * this is to get non-polymer and peptide terminus components in polymer entities,
 * - non-polymer, e.g. PXZ in 4HIV or generally ACE
 * - carboxy terminus, e.g. FC0 in 4BP9, or ETA in 6DDE
 * - amino terminus, e.g. ARF in 3K4V, or 4MM in 3EGV
 */
const _nonPolymerResidueTest = builder_1.MolScriptBuilder.core.str.match([
    builder_1.MolScriptBuilder.re('non-polymer|(amino|carboxy) terminus|peptide-like', 'i'),
    builder_1.MolScriptBuilder.ammp('chemCompType')
]);
// TODO maybe pre-calculate backbone atom properties
const backbone = StructureSelectionQuery('Backbone', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.combinator.merge([
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'entity-test': _proteinEntityTest,
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'residue-test': builder_1.MolScriptBuilder.core.logic.not([_nonPolymerResidueTest]),
                'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...set_1.SetUtils.toArray(types_1.ProteinBackboneAtoms)), builder_1.MolScriptBuilder.ammp('label_atom_id')])
            })
        ]),
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'entity-test': _nucleiEntityTest,
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'residue-test': builder_1.MolScriptBuilder.core.logic.not([_nonPolymerResidueTest]),
                'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...set_1.SetUtils.toArray(types_1.NucleicBackboneAtoms)), builder_1.MolScriptBuilder.ammp('label_atom_id')])
            })
        ])
    ])
]), { category: StructureSelectionCategory.Structure });
// TODO maybe pre-calculate sidechain atom property
const sidechain = StructureSelectionQuery('Sidechain', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.combinator.merge([
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'entity-test': _proteinEntityTest,
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'residue-test': builder_1.MolScriptBuilder.core.logic.not([_nonPolymerResidueTest]),
                'atom-test': builder_1.MolScriptBuilder.core.logic.or([
                    builder_1.MolScriptBuilder.core.logic.not([
                        builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...set_1.SetUtils.toArray(types_1.ProteinBackboneAtoms)), builder_1.MolScriptBuilder.ammp('label_atom_id')])
                    ])
                ])
            })
        ]),
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'entity-test': _nucleiEntityTest,
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'residue-test': builder_1.MolScriptBuilder.core.logic.not([_nonPolymerResidueTest]),
                'atom-test': builder_1.MolScriptBuilder.core.logic.or([
                    builder_1.MolScriptBuilder.core.logic.not([
                        builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...set_1.SetUtils.toArray(types_1.NucleicBackboneAtoms)), builder_1.MolScriptBuilder.ammp('label_atom_id')])
                    ])
                ])
            })
        ])
    ])
]), { category: StructureSelectionCategory.Structure });
// TODO maybe pre-calculate sidechain atom property
const sidechainWithTrace = StructureSelectionQuery('Sidechain with Trace', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.combinator.merge([
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'entity-test': _proteinEntityTest,
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'residue-test': builder_1.MolScriptBuilder.core.logic.not([_nonPolymerResidueTest]),
                'atom-test': builder_1.MolScriptBuilder.core.logic.or([
                    builder_1.MolScriptBuilder.core.logic.not([
                        builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...set_1.SetUtils.toArray(types_1.ProteinBackboneAtoms)), builder_1.MolScriptBuilder.ammp('label_atom_id')])
                    ]),
                    builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('label_atom_id'), 'CA']),
                    builder_1.MolScriptBuilder.core.logic.and([
                        builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('auth_comp_id'), 'PRO']),
                        builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('label_atom_id'), 'N'])
                    ])
                ])
            })
        ]),
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'entity-test': _nucleiEntityTest,
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'residue-test': builder_1.MolScriptBuilder.core.logic.not([_nonPolymerResidueTest]),
                'atom-test': builder_1.MolScriptBuilder.core.logic.or([
                    builder_1.MolScriptBuilder.core.logic.not([
                        builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...set_1.SetUtils.toArray(types_1.NucleicBackboneAtoms)), builder_1.MolScriptBuilder.ammp('label_atom_id')])
                    ]),
                    builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('label_atom_id'), 'P'])
                ])
            })
        ])
    ])
]), { category: StructureSelectionCategory.Structure });
const protein = StructureSelectionQuery('Protein', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({ 'entity-test': _proteinEntityTest })
]), { category: StructureSelectionCategory.Type });
const nucleic = StructureSelectionQuery('Nucleic', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({ 'entity-test': _nucleiEntityTest })
]), { category: StructureSelectionCategory.Type });
const helix = StructureSelectionQuery('Helix', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'entity-test': _proteinEntityTest,
        'residue-test': builder_1.MolScriptBuilder.core.flags.hasAny([
            builder_1.MolScriptBuilder.ammp('secondaryStructureFlags'),
            builder_1.MolScriptBuilder.core.type.bitflags([2 /* SecondaryStructureType.Flag.Helix */])
        ])
    })
]), {
    category: StructureSelectionCategory.Structure,
    ensureCustomProperties: (ctx, structure) => {
        return secondary_structure_1.SecondaryStructureProvider.attach(ctx, structure);
    }
});
const beta = StructureSelectionQuery('Beta Strand/Sheet', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'entity-test': _proteinEntityTest,
        'residue-test': builder_1.MolScriptBuilder.core.flags.hasAny([
            builder_1.MolScriptBuilder.ammp('secondaryStructureFlags'),
            builder_1.MolScriptBuilder.core.type.bitflags([4 /* SecondaryStructureType.Flag.Beta */])
        ])
    })
]), {
    category: StructureSelectionCategory.Structure,
    ensureCustomProperties: (ctx, structure) => {
        return secondary_structure_1.SecondaryStructureProvider.attach(ctx, structure);
    }
});
const water = StructureSelectionQuery('Water', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'entity-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'water'])
    })
]), { category: StructureSelectionCategory.Type });
const ion = StructureSelectionQuery('Ion', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'entity-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entitySubtype'), 'ion'])
    })
]), { category: StructureSelectionCategory.Type });
const lipid = StructureSelectionQuery('Lipid', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'entity-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entitySubtype'), 'lipid'])
    })
]), { category: StructureSelectionCategory.Type });
const branched = StructureSelectionQuery('Carbohydrate', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'entity-test': builder_1.MolScriptBuilder.core.logic.or([
            builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'branched']),
            builder_1.MolScriptBuilder.core.logic.and([
                builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'non-polymer']),
                builder_1.MolScriptBuilder.core.str.match([
                    builder_1.MolScriptBuilder.re('oligosaccharide', 'i'),
                    builder_1.MolScriptBuilder.ammp('entitySubtype')
                ])
            ])
        ])
    })
]), { category: StructureSelectionCategory.Type });
const branchedPlusConnected = StructureSelectionQuery('Carbohydrate with Connected', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.includeConnected({
        0: branched.expression, 'layer-count': 1, 'as-whole-residues': true
    })
]), { category: StructureSelectionCategory.Internal, isHidden: true });
const branchedConnectedOnly = StructureSelectionQuery('Connected to Carbohydrate', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.exceptBy({
        0: branchedPlusConnected.expression,
        by: branched.expression
    })
]), { category: StructureSelectionCategory.Internal, isHidden: true });
const ligand = StructureSelectionQuery('Ligand', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.exceptBy({
        0: builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.combinator.merge([
                builder_1.MolScriptBuilder.struct.modifier.union([
                    builder_1.MolScriptBuilder.struct.generator.atomGroups({
                        'entity-test': builder_1.MolScriptBuilder.core.logic.and([
                            builder_1.MolScriptBuilder.core.logic.or([
                                builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'non-polymer']),
                                builder_1.MolScriptBuilder.core.rel.neq([builder_1.MolScriptBuilder.ammp('entityPrdId'), ''])
                            ]),
                            builder_1.MolScriptBuilder.core.logic.not([builder_1.MolScriptBuilder.core.str.match([
                                    builder_1.MolScriptBuilder.re('(oligosaccharide|lipid|ion)', 'i'),
                                    builder_1.MolScriptBuilder.ammp('entitySubtype')
                                ])])
                        ]),
                        'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                        'residue-test': builder_1.MolScriptBuilder.core.logic.not([
                            builder_1.MolScriptBuilder.core.str.match([builder_1.MolScriptBuilder.re('saccharide', 'i'), builder_1.MolScriptBuilder.ammp('chemCompType')])
                        ])
                    })
                ]),
                builder_1.MolScriptBuilder.struct.modifier.union([
                    builder_1.MolScriptBuilder.struct.generator.atomGroups({
                        'entity-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'polymer']),
                        'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                        'residue-test': _nonPolymerResidueTest
                    })
                ])
            ]),
        ]),
        by: builder_1.MolScriptBuilder.struct.combinator.merge([
            builder_1.MolScriptBuilder.struct.modifier.union([
                builder_1.MolScriptBuilder.struct.generator.atomGroups({
                    'entity-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'polymer']),
                    'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                    'residue-test': builder_1.MolScriptBuilder.core.set.has([
                        builder_1.MolScriptBuilder.set(...set_1.SetUtils.toArray(types_1.PolymerNames)), builder_1.MolScriptBuilder.ammp('label_comp_id')
                    ])
                }),
            ]),
            builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
                'residue-test': builder_1.MolScriptBuilder.core.set.has([
                    builder_1.MolScriptBuilder.set(...set_1.SetUtils.toArray(types_1.CommonProteinCaps)),
                    builder_1.MolScriptBuilder.ammp('label_comp_id'),
                ]),
            }),
        ])
    })
]), { category: StructureSelectionCategory.Type });
// don't include branched entities as they have their own link representation
const ligandPlusConnected = StructureSelectionQuery('Ligand with Connected', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.exceptBy({
        0: builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.modifier.includeConnected({
                0: ligand.expression,
                'layer-count': 1,
                'as-whole-residues': true,
                'bond-test': builder_1.MolScriptBuilder.core.flags.hasAny([
                    builder_1.MolScriptBuilder.struct.bondProperty.flags(),
                    builder_1.MolScriptBuilder.core.type.bitflags([
                        1 /* BondType.Flag.Covalent */ | 2 /* BondType.Flag.MetallicCoordination */
                    ])
                ])
            })
        ]),
        by: branched.expression
    })
]), { category: StructureSelectionCategory.Internal, isHidden: true });
const ligandConnectedOnly = StructureSelectionQuery('Connected to Ligand', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.exceptBy({
        0: ligandPlusConnected.expression,
        by: ligand.expression
    })
]), { category: StructureSelectionCategory.Internal, isHidden: true });
// residues connected to ligands or branched entities
const connectedOnly = StructureSelectionQuery('Connected to Ligand or Carbohydrate', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.combinator.merge([
        branchedConnectedOnly.expression,
        ligandConnectedOnly.expression
    ]),
]), { category: StructureSelectionCategory.Internal, isHidden: true });
const disulfideBridges = StructureSelectionQuery('Disulfide Bridges', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.combinator.merge([
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.modifier.wholeResidues([
                builder_1.MolScriptBuilder.struct.filter.isConnectedTo({
                    0: builder_1.MolScriptBuilder.struct.generator.atomGroups({
                        'residue-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set('CYS'), builder_1.MolScriptBuilder.ammp('auth_comp_id')]),
                        'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set('SG'), builder_1.MolScriptBuilder.ammp('label_atom_id')])
                    }),
                    target: builder_1.MolScriptBuilder.struct.generator.atomGroups({
                        'residue-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set('CYS'), builder_1.MolScriptBuilder.ammp('auth_comp_id')]),
                        'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set('SG'), builder_1.MolScriptBuilder.ammp('label_atom_id')])
                    }),
                    'bond-test': true
                })
            ])
        ]),
        builder_1.MolScriptBuilder.struct.modifier.union([
            builder_1.MolScriptBuilder.struct.modifier.wholeResidues([
                builder_1.MolScriptBuilder.struct.modifier.union([
                    builder_1.MolScriptBuilder.struct.generator.bondedAtomicPairs({
                        0: builder_1.MolScriptBuilder.core.flags.hasAny([
                            builder_1.MolScriptBuilder.struct.bondProperty.flags(),
                            builder_1.MolScriptBuilder.core.type.bitflags([8 /* BondType.Flag.Disulfide */])
                        ])
                    })
                ])
            ])
        ])
    ])
]), { category: StructureSelectionCategory.Bond });
const nosBridges = StructureSelectionQuery('NOS Bridges', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.wholeResidues([
        builder_1.MolScriptBuilder.struct.filter.isConnectedTo({
            0: builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'residue-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set('CSO', 'LYS'), builder_1.MolScriptBuilder.ammp('auth_comp_id')]),
                'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set('OD', 'NZ'), builder_1.MolScriptBuilder.ammp('label_atom_id')])
            }),
            target: builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'residue-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set('CSO', 'LYS'), builder_1.MolScriptBuilder.ammp('auth_comp_id')]),
                'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set('OD', 'NZ'), builder_1.MolScriptBuilder.ammp('label_atom_id')])
            }),
            'bond-test': true
        })
    ])
]), { category: StructureSelectionCategory.Bond });
const nonStandardPolymer = StructureSelectionQuery('Non-standard Residues in Polymers', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'entity-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('entityType'), 'polymer']),
        'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'atomistic']),
        'residue-test': builder_1.MolScriptBuilder.ammp('isNonStandard')
    })
]), { category: StructureSelectionCategory.Residue });
const coarse = StructureSelectionQuery('Coarse Elements', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'chain-test': builder_1.MolScriptBuilder.core.set.has([
            builder_1.MolScriptBuilder.set('sphere', 'gaussian'), builder_1.MolScriptBuilder.ammp('objectPrimitive')
        ])
    })
]), { category: StructureSelectionCategory.Type });
const ring = StructureSelectionQuery('Rings in Residues', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.rings()
]), { category: StructureSelectionCategory.Residue });
const aromaticRing = StructureSelectionQuery('Aromatic Rings in Residues', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.generator.rings({ 'only-aromatic': true })
]), { category: StructureSelectionCategory.Residue });
const surroundings = StructureSelectionQuery('Surrounding Residues (5 \u212B) of Selection', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.exceptBy({
        0: builder_1.MolScriptBuilder.struct.modifier.includeSurroundings({
            0: builder_1.MolScriptBuilder.internal.generator.current(),
            radius: 5,
            'as-whole-residues': true
        }),
        by: builder_1.MolScriptBuilder.internal.generator.current()
    })
]), {
    description: 'Select residues within 5 \u212B of the current selection.',
    category: StructureSelectionCategory.Manipulate,
    referencesCurrent: true
});
const surroundingLigands = StructureSelectionQuery('Surrounding Ligands (5 \u212B) of Selection', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.surroundingLigands({
        0: builder_1.MolScriptBuilder.internal.generator.current(),
        radius: 5,
        'include-water': true
    })
]), {
    description: 'Select ligand components within 5 \u212B of the current selection.',
    category: StructureSelectionCategory.Manipulate,
    referencesCurrent: true
});
const surroundingAtoms = StructureSelectionQuery('Surrounding Atoms (5 \u212B) of Selection', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.exceptBy({
        0: builder_1.MolScriptBuilder.struct.modifier.includeSurroundings({
            0: builder_1.MolScriptBuilder.internal.generator.current(),
            radius: 5,
            'as-whole-residues': false
        }),
        by: builder_1.MolScriptBuilder.internal.generator.current()
    })
]), {
    description: 'Select atoms within 5 \u212B of the current selection.',
    category: StructureSelectionCategory.Manipulate,
    referencesCurrent: true
});
const complement = StructureSelectionQuery('Inverse / Complement of Selection', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.exceptBy({
        0: builder_1.MolScriptBuilder.struct.generator.all(),
        by: builder_1.MolScriptBuilder.internal.generator.current()
    })
]), {
    description: 'Select everything not in the current selection.',
    category: StructureSelectionCategory.Manipulate,
    referencesCurrent: true
});
const covalentlyBonded = StructureSelectionQuery('Residues Covalently Bonded to Selection', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.includeConnected({
        0: builder_1.MolScriptBuilder.internal.generator.current(), 'layer-count': 1, 'as-whole-residues': true
    })
]), {
    description: 'Select residues covalently bonded to current selection.',
    category: StructureSelectionCategory.Manipulate,
    referencesCurrent: true
});
const covalentlyBondedComponent = StructureSelectionQuery('Covalently Bonded Component', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.includeConnected({
        0: builder_1.MolScriptBuilder.internal.generator.current(), 'fixed-point': true
    })
]), {
    description: 'Select covalently bonded component based on current selection.',
    category: StructureSelectionCategory.Manipulate,
    referencesCurrent: true
});
const covalentlyOrMetallicBonded = StructureSelectionQuery('Residues with Cov. or Metallic Bond to Selection', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.includeConnected({
        0: builder_1.MolScriptBuilder.internal.generator.current(),
        'layer-count': 1,
        'as-whole-residues': true,
        'bond-test': builder_1.MolScriptBuilder.core.flags.hasAny([
            builder_1.MolScriptBuilder.struct.bondProperty.flags(),
            builder_1.MolScriptBuilder.core.type.bitflags([
                1 /* BondType.Flag.Covalent */ | 2 /* BondType.Flag.MetallicCoordination */
            ])
        ])
    })
]), {
    description: 'Select residues with covalent or metallic bond to current selection.',
    category: StructureSelectionCategory.Manipulate,
    referencesCurrent: true
});
const wholeResidues = StructureSelectionQuery('Whole Residues of Selection', builder_1.MolScriptBuilder.struct.modifier.union([
    builder_1.MolScriptBuilder.struct.modifier.wholeResidues({
        0: builder_1.MolScriptBuilder.internal.generator.current()
    })
]), {
    description: 'Expand current selection to whole residues.',
    category: StructureSelectionCategory.Manipulate,
    referencesCurrent: true
});
const StandardAminoAcids = [
    [['HIS'], 'Histidine'],
    [['ARG'], 'Arginine'],
    [['LYS'], 'Lysine'],
    [['ILE'], 'Isoleucine'],
    [['PHE'], 'Phenylalanine'],
    [['LEU'], 'Leucine'],
    [['TRP'], 'Tryptophan'],
    [['ALA'], 'Alanine'],
    [['MET'], 'Methionine'],
    [['PRO'], 'Proline'],
    [['CYS'], 'Cysteine'],
    [['ASN'], 'Asparagine'],
    [['VAL'], 'Valine'],
    [['GLY'], 'Glycine'],
    [['SER'], 'Serine'],
    [['GLN'], 'Glutamine'],
    [['TYR'], 'Tyrosine'],
    [['ASP'], 'Aspartic Acid'],
    [['GLU'], 'Glutamic Acid'],
    [['THR'], 'Threonine'],
    [['SEC'], 'Selenocysteine'],
    [['PYL'], 'Pyrrolysine'],
    [['UNK'], 'Unknown'],
].sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
const StandardNucleicBases = [
    [['A', 'DA'], 'Adenosine'],
    [['C', 'DC'], 'Cytidine'],
    [['T', 'DT'], 'Thymidine'],
    [['G', 'DG'], 'Guanosine'],
    [['I', 'DI'], 'Inosine'],
    [['U', 'DU'], 'Uridine'],
    [['N', 'DN'], 'Unknown'],
].sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
function ResidueQuery([names, label], category, priority = 0) {
    const description = names.length === 1 && !StandardResidues.has(names[0])
        ? `[${names[0]}] ${label}`
        : `${label} (${names.join(', ')})`;
    return StructureSelectionQuery(description, builder_1.MolScriptBuilder.struct.modifier.union([
        builder_1.MolScriptBuilder.struct.generator.atomGroups({
            'residue-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...names), builder_1.MolScriptBuilder.ammp('auth_comp_id')])
        })
    ]), { category, priority, description });
}
function ElementSymbolQuery([names, label], category, priority) {
    const description = `${label} (${names.join(', ')})`;
    return StructureSelectionQuery(description, builder_1.MolScriptBuilder.struct.modifier.union([
        builder_1.MolScriptBuilder.struct.generator.atomGroups({
            'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...names), builder_1.MolScriptBuilder.acp('elementSymbol')])
        })
    ]), { category, priority, description });
}
function EntityDescriptionQuery([names, label], category, priority) {
    const description = `${label}`;
    return StructureSelectionQuery(`${label}`, builder_1.MolScriptBuilder.struct.modifier.union([
        builder_1.MolScriptBuilder.struct.generator.atomGroups({
            'entity-test': builder_1.MolScriptBuilder.core.list.equal([builder_1.MolScriptBuilder.list(...names), builder_1.MolScriptBuilder.ammp('entityDescription')])
        })
    ]), { category, priority, description });
}
const StandardResidues = set_1.SetUtils.unionMany(types_1.AminoAcidNamesL, types_1.RnaBaseNames, types_1.DnaBaseNames, types_1.WaterNames);
function getElementQueries(structures) {
    const uniqueElements = new Set();
    for (const structure of structures) {
        structure.uniqueElementSymbols.forEach(e => uniqueElements.add(e));
    }
    const queries = [];
    uniqueElements.forEach(e => {
        const label = types_2.ElementNames[e] || e;
        queries.push(ElementSymbolQuery([[e], label], 'Element Symbol', 0));
    });
    return queries;
}
function getNonStandardResidueQueries(structures) {
    const residueLabels = new Map();
    const uniqueResidues = new Set();
    for (const structure of structures) {
        structure.uniqueResidueNames.forEach(r => uniqueResidues.add(r));
        for (const m of structure.models) {
            structure.uniqueResidueNames.forEach(r => {
                const comp = m.properties.chemicalComponentMap.get(r);
                if (comp)
                    residueLabels.set(r, comp.name);
            });
        }
    }
    const queries = [];
    set_1.SetUtils.difference(uniqueResidues, StandardResidues).forEach(r => {
        const label = residueLabels.get(r) || r;
        queries.push(ResidueQuery([[r], label], 'Ligand/Non-standard Residue', 200));
    });
    return queries;
}
function getPolymerAndBranchedEntityQueries(structures) {
    const uniqueEntities = new Map();
    const l = structure_1.StructureElement.Location.create();
    for (const structure of structures) {
        l.structure = structure;
        for (const ug of structure.unitSymmetryGroups) {
            l.unit = ug.units[0];
            l.element = ug.elements[0];
            const entityType = structure_1.StructureProperties.entity.type(l);
            if (entityType === 'polymer' || entityType === 'branched') {
                const description = structure_1.StructureProperties.entity.pdbx_description(l);
                uniqueEntities.set(description.join(', '), description);
            }
        }
    }
    const queries = [];
    uniqueEntities.forEach((v, k) => {
        queries.push(EntityDescriptionQuery([v, k], 'Polymer/Carbohydrate Entities', 300));
    });
    return queries;
}
function applyBuiltInSelection(to, query, customTag) {
    return to.apply(transforms_1.StateTransforms.Model.StructureSelectionFromExpression, { expression: exports.StructureSelectionQueries[query].expression, label: exports.StructureSelectionQueries[query].label }, { tags: customTag ? [query, customTag] : [query] });
}
exports.StructureSelectionQueries = {
    all,
    current,
    polymer,
    trace,
    backbone,
    sidechain,
    sidechainWithTrace,
    protein,
    nucleic,
    helix,
    beta,
    water,
    ion,
    lipid,
    branched,
    branchedPlusConnected,
    branchedConnectedOnly,
    ligand,
    ligandPlusConnected,
    ligandConnectedOnly,
    connectedOnly,
    disulfideBridges,
    nosBridges,
    nonStandardPolymer,
    coarse,
    ring,
    aromaticRing,
    surroundings,
    surroundingLigands,
    surroundingAtoms,
    complement,
    covalentlyBonded,
    covalentlyOrMetallicBonded,
    covalentlyBondedComponent,
    wholeResidues,
};
class StructureSelectionQueryRegistry {
    add(q) {
        this.list.push(q);
        this.options.push([q, q.label, q.category]);
        this.version += 1;
    }
    remove(q) {
        const idx = this.list.indexOf(q);
        if (idx !== -1) {
            this.list.splice(idx, 1);
            this.options.splice(idx, 1);
            this.version += 1;
        }
    }
    constructor() {
        this.list = [];
        this.options = [];
        this.version = 1;
        // add built-in
        this.list.push(...Object.values(exports.StructureSelectionQueries), ...StandardAminoAcids.map(v => ResidueQuery(v, StructureSelectionCategory.AminoAcid)), ...StandardNucleicBases.map(v => ResidueQuery(v, StructureSelectionCategory.NucleicBase)));
        this.options.push(...this.list.map(q => [q, q.label, q.category]));
    }
}
exports.StructureSelectionQueryRegistry = StructureSelectionQueryRegistry;
