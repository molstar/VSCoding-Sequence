/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { Legend as LegendData, ScaleLegend as ScaleLegendData, TableLegend as TableLegendData } from '../../mol-util/legend';
export type LegendProps<L extends LegendData> = {
    legend: L;
};
export type Legend = React.ComponentClass<LegendProps<any>>;
export declare function legendFor(legend: LegendData): Legend | undefined;
export declare class ScaleLegend extends React.PureComponent<LegendProps<ScaleLegendData>> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class TableLegend extends React.PureComponent<LegendProps<TableLegendData>> {
    render(): import("react/jsx-runtime").JSX.Element;
}
