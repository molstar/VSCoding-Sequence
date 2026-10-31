/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import * as React from 'react';
import { ParamProps } from './parameters';
export declare class CombinedColorControl extends React.PureComponent<ParamProps<PD.Color> & {
    hideNameRow?: boolean;
}, {
    isExpanded: boolean;
    lightness: number;
}> {
    state: {
        isExpanded: boolean;
        lightness: number;
    };
    protected update(value: Color): void;
    toggleExpanded: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onClickSwatch: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onR: (v: number) => void;
    onG: (v: number) => void;
    onB: (v: number) => void;
    onRGB: (e: React.MouseEvent<HTMLInputElement>) => void;
    onLighten: () => void;
    onDarken: () => void;
    swatch(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare function ColorOptions(): any;
export declare function ColorValueOption(color: Color): import("react/jsx-runtime").JSX.Element | null;
