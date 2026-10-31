/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Color } from '.';
import { ScaleLegend, TableLegend } from '../legend';
import { ParamDefinition as PD } from '../param-definition';
import { ColorListName } from './lists';
type PaletteType = 'generate' | 'colors';
declare const DefaultGetPaletteProps: {
    type: PaletteType;
    colorList: ColorListName;
};
type GetPaletteProps = typeof DefaultGetPaletteProps;
export declare function getPaletteParams(props?: Partial<GetPaletteProps>): {
    palette: PD.Mapped<PD.NamedParams<PD.Normalize<{
        maxCount: number;
        hue: [number, number];
        chroma: [number, number];
        luminance: [number, number];
        sort: "none" | "contrast";
        clusteringStepCount: number;
        minSampleCount: number;
        sampleCountFactor: number;
    }>, "generate"> | PD.NamedParams<PD.Normalize<{
        list: {
            kind: "interpolate" | "set";
            colors: import("./color").ColorListEntry[];
        };
    }>, "colors">>;
};
declare const DefaultPaletteProps: PD.Values<{
    palette: PD.Mapped<PD.NamedParams<PD.Normalize<{
        maxCount: number;
        hue: [number, number];
        chroma: [number, number];
        luminance: [number, number];
        sort: "none" | "contrast";
        clusteringStepCount: number;
        minSampleCount: number;
        sampleCountFactor: number;
    }>, "generate"> | PD.NamedParams<PD.Normalize<{
        list: {
            kind: "interpolate" | "set";
            colors: import("./color").ColorListEntry[];
        };
    }>, "colors">>;
}>;
type PaletteProps = typeof DefaultPaletteProps;
declare const DefaultLabelOptions: {
    valueLabel: (i: number) => string;
    minLabel: string;
    maxLabel: string;
};
type LabelOptions = typeof DefaultLabelOptions;
export interface Palette {
    color: (i: number) => Color;
    legend?: TableLegend | ScaleLegend;
}
export declare function getPalette(count: number, props: PaletteProps, labelOptions?: Partial<LabelOptions>): {
    color: (i: number) => Color;
    legend: TableLegend | ScaleLegend;
};
export {};
