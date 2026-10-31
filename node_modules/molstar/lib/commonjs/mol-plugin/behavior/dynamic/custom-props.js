"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossLinkRestraint = exports.BestDatabaseSequenceMapping = exports.ValenceModel = exports.SecondaryStructure = exports.Interactions = exports.AccessibleSurfaceArea = exports.StructureInfo = void 0;
var structure_info_1 = require("./custom-props/structure-info");
Object.defineProperty(exports, "StructureInfo", { enumerable: true, get: function () { return structure_info_1.StructureInfo; } });
var accessible_surface_area_1 = require("./custom-props/computed/accessible-surface-area");
Object.defineProperty(exports, "AccessibleSurfaceArea", { enumerable: true, get: function () { return accessible_surface_area_1.AccessibleSurfaceArea; } });
var interactions_1 = require("./custom-props/computed/interactions");
Object.defineProperty(exports, "Interactions", { enumerable: true, get: function () { return interactions_1.Interactions; } });
var secondary_structure_1 = require("./custom-props/computed/secondary-structure");
Object.defineProperty(exports, "SecondaryStructure", { enumerable: true, get: function () { return secondary_structure_1.SecondaryStructure; } });
var valence_model_1 = require("./custom-props/computed/valence-model");
Object.defineProperty(exports, "ValenceModel", { enumerable: true, get: function () { return valence_model_1.ValenceModel; } });
var sifts_mapping_1 = require("./custom-props/sequence/sifts-mapping");
Object.defineProperty(exports, "BestDatabaseSequenceMapping", { enumerable: true, get: function () { return sifts_mapping_1.SIFTSMapping; } });
var cross_link_restraint_1 = require("./custom-props/integrative/cross-link-restraint");
Object.defineProperty(exports, "CrossLinkRestraint", { enumerable: true, get: function () { return cross_link_restraint_1.CrossLinkRestraint; } });
