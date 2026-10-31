/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Cai Huiyu <szmun.caihy@gmail.com>
 */
import { PluginStateObject as SO } from '../../objects';
import { StateObject, StateTransform, State, StateObjectCell, StateTransformer } from '../../../mol-state';
import { StateTransforms } from '../../transforms';
import { VolumeStreaming } from '../../../mol-plugin/behavior/dynamic/volume-streaming/behavior';
import { CreateVolumeStreamingBehavior } from '../../../mol-plugin/behavior/dynamic/volume-streaming/transformers';
export declare function buildStructureHierarchy(state: State, previous?: StructureHierarchy): {
    hierarchy: StructureHierarchy;
    added: Set<string>;
    changed: boolean;
};
export interface StructureHierarchy {
    trajectories: TrajectoryRef[];
    models: ModelRef[];
    structures: StructureRef[];
    refs: Map<StateTransform.Ref, StructureHierarchyRef>;
}
export declare function StructureHierarchy(): StructureHierarchy;
interface RefBase<K extends string = string, O extends StateObject = StateObject, T extends StateTransformer = StateTransformer> {
    kind: K;
    cell: StateObjectCell<O, StateTransform<T>>;
    version: StateTransform['version'];
}
export type StructureHierarchyRef = TrajectoryRef | ModelRef | ModelPropertiesRef | ModelUnitcellRef | StructureRef | StructurePropertiesRef | StructureTransformRef | StructureVolumeStreamingRef | StructureComponentRef | StructureRepresentationRef | GenericRepresentationRef;
export interface TrajectoryRef extends RefBase<'trajectory', SO.Molecule.Trajectory> {
    models: ModelRef[];
}
export interface ModelRef extends RefBase<'model', SO.Molecule.Model> {
    trajectory?: TrajectoryRef;
    properties?: ModelPropertiesRef;
    structures: StructureRef[];
    genericRepresentations?: GenericRepresentationRef[];
    unitcell?: ModelUnitcellRef;
}
export interface ModelPropertiesRef extends RefBase<'model-properties', SO.Molecule.Model, StateTransforms['Model']['CustomModelProperties']> {
    model: ModelRef;
}
export interface ModelUnitcellRef extends RefBase<'model-unitcell', SO.Shape.Representation3D, StateTransforms['Representation']['ModelUnitcell3D']> {
    model: ModelRef;
}
export interface StructureRef extends RefBase<'structure', SO.Molecule.Structure> {
    model?: ModelRef;
    properties?: StructurePropertiesRef;
    transform?: StructureTransformRef;
    components: StructureComponentRef[];
    genericRepresentations?: GenericRepresentationRef[];
    volumeStreaming?: StructureVolumeStreamingRef;
}
export interface StructurePropertiesRef extends RefBase<'structure-properties', SO.Molecule.Structure, StateTransforms['Model']['CustomStructureProperties']> {
    structure: StructureRef;
}
export interface StructureTransformRef extends RefBase<'structure-transform', SO.Molecule.Structure, StateTransforms['Model']['TransformStructureConformation']> {
    structure: StructureRef;
}
export interface StructureVolumeStreamingRef extends RefBase<'structure-volume-streaming', VolumeStreaming, CreateVolumeStreamingBehavior> {
    structure: StructureRef;
}
export interface StructureComponentRef extends RefBase<'structure-component', SO.Molecule.Structure, StateTransforms['Model']['StructureComponent']> {
    structure: StructureRef;
    key?: string;
    representations: StructureRepresentationRef[];
    genericRepresentations?: GenericRepresentationRef[];
}
export interface StructureRepresentationRef extends RefBase<'structure-representation', SO.Molecule.Structure.Representation3D, StateTransforms['Representation']['StructureRepresentation3D']> {
    component: StructureComponentRef;
}
export interface GenericRepresentationRef extends RefBase<'generic-representation', SO.Any> {
    parent: StructureHierarchyRef;
}
export {};
