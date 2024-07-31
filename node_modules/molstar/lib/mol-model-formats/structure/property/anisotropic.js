/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { mmCIF_Schema } from '../../../mol-io/reader/cif/schema/mmcif';
import { CifWriter } from '../../../mol-io/writer/cif';
import { FormatPropertyProvider } from '../common/property';
import { MmcifFormat } from '../mmcif';
export { AtomSiteAnisotrop };
const Anisotrop = {
    U: mmCIF_Schema.atom_site_anisotrop.U,
    U_esd: mmCIF_Schema.atom_site_anisotrop.U_esd
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
                            return CifWriter.Category.Empty;
                        if (!MmcifFormat.is(ctx.firstModel.sourceData))
                            return CifWriter.Category.Empty;
                        // TODO filter to write only data for elements that exist in model
                        return CifWriter.Category.ofTable(ctx.firstModel.sourceData.data.db.atom_site_anisotrop);
                    }
                }]
        }
    };
    AtomSiteAnisotrop.Provider = FormatPropertyProvider.create(AtomSiteAnisotrop.Descriptor);
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
})(AtomSiteAnisotrop || (AtomSiteAnisotrop = {}));
