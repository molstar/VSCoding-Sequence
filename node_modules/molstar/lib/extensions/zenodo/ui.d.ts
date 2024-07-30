/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CollapsableControls, CollapsableState } from '../../mol-plugin-ui/base';
import { PluginContext } from '../../mol-plugin/context';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
type ZenodoFile = {
    bucket: string;
    checksum: string;
    key: string;
    links: {
        [key: string]: string;
        self: string;
    };
    size: number;
    type: string;
};
type ZenodoRecord = {
    id: number;
    conceptdoi: string;
    conceptrecid: string;
    created: string;
    doi: string;
    files: ZenodoFile[];
    revision: number;
    updated: string;
    metadata: {
        title: string;
    };
};
interface State {
    busy?: boolean;
    recordValues: PD.Values<typeof ZenodoImportParams>;
    importValues?: PD.Values<ImportParams>;
    importParams?: ImportParams;
    record?: ZenodoRecord;
    files?: ZenodoFile[];
}
declare const ZenodoImportParams: {
    record: PD.Text<string>;
};
declare function createImportParams(files: ZenodoFile[], plugin: PluginContext): {
    type: PD.Mapped<PD.NamedParams<any, string> | PD.NamedParams<any, number>>;
};
type ImportParams = ReturnType<typeof createImportParams>;
export declare class ZenodoImportUI extends CollapsableControls<{}, State> {
    protected defaultState(): State & CollapsableState;
    private recordParamsOnChange;
    private importParamsOnChange;
    private loadRecord;
    private loadFile;
    private clearRecord;
    private renderLoadRecord;
    private renderRecordInfo;
    private renderImportFile;
    protected renderControls(): JSX.Element | null;
}
export {};
