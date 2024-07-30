/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { CifCategory, CifFile } from '../../../mol-io/reader/cif';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { CustomProperty } from '../../../mol-model-props/common/custom-property';
import { Model } from '../../../mol-model/structure';
import { Structure, StructureElement } from '../../../mol-model/structure/structure';
import { Jsonable } from '../../../mol-util/json';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { MVSAnnotationRow, MVSAnnotationSchema } from '../helpers/schemas';
/** Parameter definition for custom model property "MVS Annotations" */
export type MVSAnnotationsParams = typeof MVSAnnotationsParams;
export declare const MVSAnnotationsParams: {
    annotations: PD.ObjectList<PD.Normalize<{
        source: PD.NamedParams<PD.Normalize<{
            url: any;
            format: any;
        }>, "url"> | PD.NamedParams<PD.Normalize<unknown>, "source-cif">;
        schema: "atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic";
        cifBlock: PD.NamedParams<PD.Normalize<{
            header: any;
        }>, "header"> | PD.NamedParams<PD.Normalize<{
            index: any;
        }>, "index">;
        cifCategory: string | undefined;
        id: string;
    }>>;
};
/** Parameter values for custom model property "MVS Annotations" */
export type MVSAnnotationsProps = PD.Values<MVSAnnotationsParams>;
/** Parameter values for a single annotation within custom model property "MVS Annotations" */
export type MVSAnnotationSpec = MVSAnnotationsProps['annotations'][number];
/** Data file with one or more (in case of CIF) annotations */
type MVSAnnotationFile = {
    format: 'json';
    data: Jsonable;
} | {
    format: 'cif';
    data: CifFile;
};
/** Data for a single annotation */
type MVSAnnotationData = {
    format: 'json';
    data: Jsonable;
} | {
    format: 'cif';
    data: CifCategory;
};
/** Provider for custom model property "Annotations" */
export declare const MVSAnnotationsProvider: CustomModelProperty.Provider<MVSAnnotationsParams, MVSAnnotations>;
/** Represents multiple annotations retrievable by their ID */
export declare class MVSAnnotations {
    private dict;
    private constructor();
    static fromSpecs(ctx: CustomProperty.Context, specs: MVSAnnotationSpec[], model?: Model): Promise<MVSAnnotations>;
    getAnnotation(id: string): MVSAnnotation | undefined;
    getAllAnnotations(): MVSAnnotation[];
}
/** Retrieve annotation with given `annotationId` from custom model property "MVS Annotations" and the model from which it comes */
export declare function getMVSAnnotationForStructure(structure: Structure, annotationId: string): {
    annotation: MVSAnnotation;
    model: Model;
} | {
    annotation: undefined;
    model: undefined;
};
/** Main class for processing MVS annotation */
export declare class MVSAnnotation {
    data: MVSAnnotationData;
    schema: MVSAnnotationSchema;
    /** Store mapping `ElementIndex` -> annotation row index for each `Model`, -1 means no row applies */
    private indexedModels;
    private rows;
    constructor(data: MVSAnnotationData, schema: MVSAnnotationSchema);
    /** Create a new `MVSAnnotation` based on specification `spec`. Use `file` if provided, otherwise download the file.
     * Throw error if download fails or problem with data. */
    static fromSpec(ctx: CustomProperty.Context, spec: MVSAnnotationSpec, file?: MVSAnnotationFile): Promise<MVSAnnotation>;
    static createEmpty(schema: MVSAnnotationSchema): MVSAnnotation;
    /** Reference implementation of `getAnnotationForLocation`, just for checking, DO NOT USE DIRECTLY */
    getAnnotationForLocation_Reference(loc: StructureElement.Location): MVSAnnotationRow | undefined;
    /** Return value of field `fieldName` assigned to location `loc`, if any */
    getValueForLocation(loc: StructureElement.Location, fieldName: string): string | undefined;
    /** Return value of field `fieldName` assigned to `i`-th annotation row, if any */
    getValueForRow(i: number, fieldName: string): string | undefined;
    /** Return cached `ElementIndex` -> `MVSAnnotationRow` mapping for `Model` (or create it if not cached yet) */
    private getIndexedModel;
    /** Create `ElementIndex` -> `MVSAnnotationRow` mapping for `Model` */
    private getRowForEachAtom;
    /** Parse and return all annotation rows in this annotation */
    private _getRows;
    /** Parse and return all annotation rows in this annotation, or return cached result if available */
    getRows(): readonly MVSAnnotationRow[];
}
export {};
