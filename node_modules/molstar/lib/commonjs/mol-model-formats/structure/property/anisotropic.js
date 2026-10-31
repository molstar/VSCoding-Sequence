"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomSiteAnisotrop = void 0;
const mmcif_1 = require("../../../mol-io/reader/cif/schema/mmcif");
const cif_1 = require("../../../mol-io/writer/cif");
const property_1 = require("../common/property");
const mmcif_2 = require("../mmcif");
const Anisotrop = {
    U: mmcif_1.mmCIF_Schema.atom_site_anisotrop.U,
    U_esd: mmcif_1.mmCIF_Schema.atom_site_anisotrop.U_esd
};
var AtomSiteAnisotrop;
(function (AtomSiteAnisotrop) {
    AtomSiteAnisotrop.Schema = Anisotrop;
    AtomSiteAnisotrop.Descriptor = {
        name: 'atom_site_anisotrop',
        cifExport: {
            prefix: '',
            categories: [{
                    name: 'atom_site_anisotrop',
                    instance(ctx) {
                        const p = AtomSiteAnisotrop.Provider.get(ctx.firstModel);
                        if (!p)
                            return cif_1.CifWriter.Category.Empty;
                        if (!mmcif_2.MmcifFormat.is(ctx.firstModel.sourceData))
                            return cif_1.CifWriter.Category.Empty;
                        // TODO filter to write only data for elements that exist in model
                        return cif_1.CifWriter.Category.ofTable(ctx.firstModel.sourceData.data.db.atom_site_anisotrop);
                    }
                }]
        }
    };
    AtomSiteAnisotrop.Provider = property_1.FormatPropertyProvider.create(AtomSiteAnisotrop.Descriptor);
    function getElementToAnsiotrop(atomId, ansioId) {
        const atomIdToElement = new Int32Array(atomId.rowCount);
        atomIdToElement.fill(-1);
        for (let i = 0, il = atomId.rowCount; i < il; i++) {
            atomIdToElement[atomId.value(i)] = i;
        }
        const elementToAnsiotrop = new Int32Array(atomId.rowCount);
        elementToAnsiotrop.fill(-1);
        for (let i = 0, il = ansioId.rowCount; i < il; ++i) {
            const ei = atomIdToElement[ansioId.value(i)];
            if (ei !== -1)
                elementToAnsiotrop[ei] = i;
        }
        return elementToAnsiotrop;
    }
    AtomSiteAnisotrop.getElementToAnsiotrop = getElementToAnsiotrop;
    function getElementToAnsiotropFromLabel(atomLabel, ansioLabel) {
        const atomLabelToElement = {};
        for (let i = 0, il = atomLabel.rowCount; i < il; i++) {
            atomLabelToElement[atomLabel.value(i)] = i;
        }
        const elementToAnsiotrop = new Int32Array(atomLabel.rowCount);
        elementToAnsiotrop.fill(-1);
        for (let i = 0, il = ansioLabel.rowCount; i < il; ++i) {
            const ei = atomLabelToElement[ansioLabel.value(i)];
            if (ei !== undefined)
                elementToAnsiotrop[ei] = i;
        }
        return elementToAnsiotrop;
    }
    AtomSiteAnisotrop.getElementToAnsiotropFromLabel = getElementToAnsiotropFromLabel;
})(AtomSiteAnisotrop || (exports.AtomSiteAnisotrop = AtomSiteAnisotrop = {}));
