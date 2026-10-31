/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure } from '../mol-model/structure';
import { VisualQuality } from '../mol-geo/geometry/base';
import { Location } from '../mol-model/location';
export interface VisualUpdateState {
    updateTransform: boolean;
    updateMatrix: boolean;
    updateColor: boolean;
    updateSize: boolean;
    createGeometry: boolean;
    createNew: boolean;
    /** holds contextual info, is not reset  */
    info: {
        [k: string]: unknown;
    };
}
export declare namespace VisualUpdateState {
    function create(): VisualUpdateState;
    function reset(state: VisualUpdateState): void;
}
export type LocationCallback = (loc: Location, isSecondary: boolean) => void;
export interface QualityProps {
    quality: VisualQuality;
    detail: number;
    radialSegments: number;
    linearSegments: number;
    resolution: number;
    probePositions: number;
    doubleSided: boolean;
    xrayShaded: boolean | 'inverted';
    alpha: number;
    transparentBackfaces: 'off' | 'on' | 'opaque';
}
export declare const DefaultQualityThresholds: {
    lowestElementCount: number;
    lowerElementCount: number;
    lowElementCount: number;
    mediumElementCount: number;
    highElementCount: number;
    coarseGrainedFactor: number;
    elementCountFactor: number;
};
export type QualityThresholds = typeof DefaultQualityThresholds;
export declare function getStructureQuality(structure: Structure, tresholds?: Partial<QualityThresholds>): VisualQuality;
export declare function getQualityProps(props: Partial<QualityProps>, data?: any): {
    detail: number;
    radialSegments: number;
    linearSegments: number;
    resolution: number;
    probePositions: number;
    doubleSided: boolean;
};
