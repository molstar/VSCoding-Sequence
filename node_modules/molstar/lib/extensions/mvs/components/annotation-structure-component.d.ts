/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Structure } from '../../../mol-model/structure';
import { PluginStateObject as SO } from '../../../mol-plugin-state/objects';
import { StateObject, StateTransformer } from '../../../mol-state';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
/** Parameter definition for `MVSAnnotationStructureComponent` transformer */
export declare const MVSAnnotationStructureComponentParams: {
    annotationId: PD.Text<string>;
    fieldName: PD.Text<string>;
    fieldValues: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "all"> | PD.NamedParams<PD.Normalize<{
        value: string;
    }>[], "selected">>;
    nullIfEmpty: PD.Base<boolean | undefined>;
    label: PD.Text<string>;
};
/** Parameter values for `MVSAnnotationStructureComponent` transformer */
export type MVSAnnotationStructureComponentProps = PD.ValuesFor<typeof MVSAnnotationStructureComponentParams>;
/** Transformer builder for MVS extension */
export declare const MVSTransform: StateTransformer.Builder.Root;
/** Transformer for creating a structure component based on custom model property "Annotations" */
export type MVSAnnotationStructureComponent = typeof MVSAnnotationStructureComponent;
export declare const MVSAnnotationStructureComponent: StateTransformer<SO.Molecule.Structure, SO.Molecule.Structure, PD.Normalize<{
    annotationId: string;
    fieldName: string;
    fieldValues: PD.NamedParams<PD.Normalize<unknown>, "all"> | PD.NamedParams<PD.Normalize<{
        value: any;
    }>[], "selected">;
    nullIfEmpty: boolean | undefined;
    label: string;
}>>;
/** Create a substructure based on `MVSAnnotationStructureComponentProps` */
export declare function createMVSAnnotationSubstructure(structure: Structure, params: MVSAnnotationStructureComponentProps): Structure;
/** Create a substructure PSO based on `MVSAnnotationStructureComponentProps` */
export declare function createMVSAnnotationStructureComponent(structure: Structure, params: MVSAnnotationStructureComponentProps): StateObject<any, any> | SO.Molecule.Structure;
/** Update a substructure PSO based on `MVSAnnotationStructureComponentProps` */
export declare function updateMVSAnnotationStructureComponent(a: Structure, b: SO.Molecule.Structure, oldParams: MVSAnnotationStructureComponentProps, newParams: MVSAnnotationStructureComponentProps): StateTransformer.UpdateResult.Unchanged | StateTransformer.UpdateResult.Updated | StateTransformer.UpdateResult.Recreate;
