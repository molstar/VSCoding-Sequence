/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginStateObject as SO } from '../../objects';
import { StateObject, StateTransform, State, StateObjectCell, StateTransformer } from '../../../mol-state';
import { StateTransforms } from '../../transforms';
export declare function buildVolumeHierarchy(state: State, previous?: VolumeHierarchy): {
    hierarchy: VolumeHierarchy;
    added: Set<string>;
    changed: boolean;
};
export interface VolumeHierarchy {
    volumes: VolumeRef[];
    lazyVolumes: LazyVolumeRef[];
    refs: Map<StateTransform.Ref, VolumeHierarchyRef>;
}
export declare function VolumeHierarchy(): VolumeHierarchy;
interface RefBase<K extends string = string, O extends StateObject = StateObject, T extends StateTransformer = StateTransformer> {
    kind: K;
    cell: StateObjectCell<O, StateTransform<T>>;
    version: StateTransform['version'];
}
export type VolumeHierarchyRef = VolumeRef | LazyVolumeRef | VolumeRepresentationRef;
export interface VolumeRef extends RefBase<'volume', SO.Volume.Data> {
    representations: VolumeRepresentationRef[];
}
export interface LazyVolumeRef extends RefBase<'lazy-volume', SO.Volume.Lazy> {
}
export interface VolumeRepresentationRef extends RefBase<'volume-representation', SO.Volume.Representation3D, StateTransforms['Representation']['VolumeRepresentation3D']> {
    volume: VolumeRef;
}
export {};
