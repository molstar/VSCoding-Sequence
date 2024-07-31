/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
export const DEFAULT_VOLSEG_SERVER = 'https://molstarvolseg.ncbr.muni.cz/v2';
export class VolumeApiV2 {
    constructor(volumeServerUrl = DEFAULT_VOLSEG_SERVER) {
        this.volumeServerUrl = volumeServerUrl.replace(/\/$/, ''); // trim trailing slash
    }
    entryListUrl(maxEntries, keyword) {
        return `${this.volumeServerUrl}/list_entries/${maxEntries}/${keyword !== null && keyword !== void 0 ? keyword : ''}`;
    }
    metadataUrl(source, entryId) {
        return `${this.volumeServerUrl}/${source}/${entryId}/metadata`;
    }
    volumeUrl(source, entryId, box, maxPoints) {
        if (box) {
            const [[a1, a2, a3], [b1, b2, b3]] = box;
            return `${this.volumeServerUrl}/${source}/${entryId}/volume/box/${a1}/${a2}/${a3}/${b1}/${b2}/${b3}?max_points=${maxPoints}`;
        }
        else {
            return `${this.volumeServerUrl}/${source}/${entryId}/volume/cell?max_points=${maxPoints}`;
        }
    }
    latticeUrl(source, entryId, segmentation, box, maxPoints) {
        if (box) {
            const [[a1, a2, a3], [b1, b2, b3]] = box;
            return `${this.volumeServerUrl}/${source}/${entryId}/segmentation/box/${segmentation}/${a1}/${a2}/${a3}/${b1}/${b2}/${b3}?max_points=${maxPoints}`;
        }
        else {
            return `${this.volumeServerUrl}/${source}/${entryId}/segmentation/cell/${segmentation}?max_points=${maxPoints}`;
        }
    }
    meshUrl_Json(source, entryId, segment, detailLevel) {
        return `${this.volumeServerUrl}/${source}/${entryId}/mesh/${segment}/${detailLevel}`;
    }
    meshUrl_Bcif(source, entryId, segment, detailLevel) {
        return `${this.volumeServerUrl}/${source}/${entryId}/mesh_bcif/${segment}/${detailLevel}`;
    }
    volumeInfoUrl(source, entryId) {
        return `${this.volumeServerUrl}/${source}/${entryId}/volume_info`;
    }
    async getEntryList(maxEntries, keyword) {
        const response = await fetch(this.entryListUrl(maxEntries, keyword));
        return await response.json();
    }
    async getMetadata(source, entryId) {
        const url = this.metadataUrl(source, entryId);
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Failed to fetch metadata from ${url}`);
        return await response.json();
    }
}
