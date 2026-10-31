/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CifWriter } from '../mol-io/writer/cif';
import { CifExportContext } from './structure/export/mmcif';
import { QuerySymbolRuntime } from '../mol-script/runtime/query/compiler';
import { UUID } from '../mol-util';
export { CustomPropertyDescriptor, CustomProperties };
interface CustomPropertyDescriptor<ExportCtx = CifExportContext, Symbols extends {
    [name: string]: QuerySymbolRuntime;
} = {}> {
    readonly name: string;
    cifExport?: {
        prefix: string;
        context?: (ctx: CifExportContext) => ExportCtx | undefined;
        categories: CifWriter.Category<ExportCtx>[];
    };
    symbols?: Symbols;
}
declare function CustomPropertyDescriptor<Ctx, Desc extends CustomPropertyDescriptor<Ctx>>(desc: Desc): Desc;
declare namespace CustomPropertyDescriptor {
    function getUUID(prop: CustomPropertyDescriptor): UUID;
}
/**
 * Anything with a dispose method, used to despose of data assets or webgl resources
 */
type Asset = {
    dispose: () => void;
};
declare class CustomProperties {
    private _list;
    private _set;
    private _refs;
    private _assets;
    get all(): ReadonlyArray<CustomPropertyDescriptor>;
    add(desc: CustomPropertyDescriptor<any>): void;
    reference(desc: CustomPropertyDescriptor<any>, add: boolean): void;
    hasReference(desc: CustomPropertyDescriptor<any>): boolean;
    has(desc: CustomPropertyDescriptor<any>): boolean;
    /** Sets assets for a prop, disposes of existing assets for that prop */
    assets(desc: CustomPropertyDescriptor<any>, assets?: Asset[]): void;
    /** Disposes of all assets of all props */
    dispose(): void;
}
