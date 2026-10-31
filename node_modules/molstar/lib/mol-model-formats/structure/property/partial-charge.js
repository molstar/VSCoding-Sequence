/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { FormatPropertyProvider } from '../common/property';
export { AtomPartialCharge };
var AtomPartialCharge;
(function (AtomPartialCharge) {
    AtomPartialCharge.Descriptor = {
        name: 'atom_partial_charge',
    };
    AtomPartialCharge.Provider = FormatPropertyProvider.create(AtomPartialCharge.Descriptor);
})(AtomPartialCharge || (AtomPartialCharge = {}));
