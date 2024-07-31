/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { decodeMsgPack } from '../../mol-io/common/msgpack/decode';
export function DataFormatProvider(provider) { return provider; }
export function guessCifVariant(info, data) {
    if (info.ext === 'bcif') {
        try {
            // TODO: find a way to run msgpackDecode only once
            //      now it is run twice, here and during file parsing
            const { encoder } = decodeMsgPack(data);
            if (encoder.startsWith('VolumeServer'))
                return 'dscif';
            // TODO: assumes volseg-volume-server only serves segments
            if (encoder.startsWith('volseg-volume-server'))
                return 'segcif';
        }
        catch (e) {
            console.error(e);
        }
    }
    else if (info.ext === 'cif') {
        const str = data;
        if (str.startsWith('data_SERVER\n#\n_density_server_result'))
            return 'dscif';
        if (str.startsWith('data_SERVER\n#\ndata_SEGMENTATION_DATA'))
            return 'segcif';
        if (str.includes('atom_site_fract_x') || str.includes('atom_site.fract_x'))
            return 'coreCif';
    }
    return -1;
}
