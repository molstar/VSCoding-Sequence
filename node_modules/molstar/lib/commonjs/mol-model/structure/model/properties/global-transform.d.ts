/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Mat4 } from '../../../../mol-math/linear-algebra';
import { FormatPropertyProvider } from '../../../../mol-model-formats/structure/common/property';
import { CifExportContext } from '../../structure';
import { Model } from '../model';
import { Column } from '../../../../mol-data/db';
import { CifWriter } from '../../../../mol-io/writer/cif';
export declare namespace GlobalModelTransformInfo {
    const Schema: {
        molstar_global_model_transform_info: {
            matrix: Column.Schema.Tensor;
        };
    };
    type Schema = typeof Schema;
    const Descriptor: {
        name: "molstar_global_model_transform_info";
        cifExport: {
            categories: {
                name: "molstar_global_model_transform_info";
                instance(ctx: CifExportContext): CifWriter.Category.Instance<any, any>;
            }[];
            prefix: string;
        };
    };
    const Provider: FormatPropertyProvider<Mat4>;
    function attach(model: Model, matrix: Mat4): void;
    function get(model: Model): Mat4 | undefined;
    function fromMmCif(model: Model): Mat4 | undefined;
    function hasData(model: Model): boolean;
    function writeMmCif(encoder: CifWriter.Encoder, matrix: Mat4): void;
}
