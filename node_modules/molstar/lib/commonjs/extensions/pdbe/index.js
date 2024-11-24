"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDBeStructRefDomain = exports.PDBePreferredAssembly = exports.PDBeStructureQualityReport = void 0;
var behavior_1 = require("./structure-quality-report/behavior");
Object.defineProperty(exports, "PDBeStructureQualityReport", { enumerable: true, get: function () { return behavior_1.PDBeStructureQualityReport; } });
var preferred_assembly_1 = require("./preferred-assembly");
Object.defineProperty(exports, "PDBePreferredAssembly", { enumerable: true, get: function () { return preferred_assembly_1.PDBePreferredAssembly; } });
var struct_ref_domain_1 = require("./struct-ref-domain");
Object.defineProperty(exports, "PDBeStructRefDomain", { enumerable: true, get: function () { return struct_ref_domain_1.PDBeStructRefDomain; } });
