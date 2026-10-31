/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as React from 'react';
import { Color } from '../../mol-util/color';
export type ColorAccent = 'cyan' | 'red' | 'gray' | 'green' | 'purple' | 'blue' | 'orange';
export declare class ControlGroup extends React.Component<{
    header: string;
    title?: string;
    initialExpanded?: boolean;
    hideExpander?: boolean;
    hideOffset?: boolean;
    topRightIcon?: React.FC;
    headerLeftMargin?: string;
    onHeaderClick?: () => void;
    noTopMargin?: boolean;
    childrenClassName?: string;
    maxHeight?: string;
    children?: any;
}, {
    isExpanded: boolean;
}> {
    state: {
        isExpanded: boolean;
    };
    headerClicked: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export interface TextInputProps<T> {
    className?: string;
    style?: React.CSSProperties;
    value: T;
    fromValue?(v: T): string;
    toValue?(s: string): T;
    isValid?(s: string): boolean;
    onChange(value: T): void;
    onEnter?(): void;
    onBlur?(): void;
    delayMs?: number;
    blurOnEnter?: boolean;
    blurOnEscape?: boolean;
    isDisabled?: boolean;
    placeholder?: string;
    numeric?: boolean;
}
interface TextInputState {
    originalValue: string;
    value: string;
}
export declare class TextInput<T = string> extends React.PureComponent<TextInputProps<T>, TextInputState> {
    private input;
    private delayHandle;
    private pendingValue;
    state: {
        originalValue: string;
        value: string;
    };
    onBlur: () => void;
    get isPending(): boolean;
    clearTimeout(): void;
    raiseOnChange: () => void;
    triggerChanged(formatted: string, converted: T): void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    static getDerivedStateFromProps(props: TextInputProps<any>, state: TextInputState): {
        originalValue: any;
        value: any;
    } | null;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class ExpandableControlRow extends React.Component<{
    label: string;
    colorStripe?: Color;
    pivot: JSX.Element;
    controls: JSX.Element;
}, {
    isExpanded: boolean;
}> {
    state: {
        isExpanded: boolean;
    };
    toggleExpanded: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare function SectionHeader(props: {
    icon?: React.FC;
    title: string | JSX.Element;
    desc?: string;
    accent?: ColorAccent;
}): import("react/jsx-runtime").JSX.Element;
export type ButtonProps = {
    style?: React.CSSProperties;
    className?: string;
    disabled?: boolean;
    title?: string;
    icon?: React.FC;
    commit?: boolean | 'on' | 'off';
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onContextMenu?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    inline?: boolean;
    'data-id'?: string;
    'data-color'?: Color;
    flex?: boolean | string | number;
    noOverflow?: boolean;
};
export declare function Button(props: ButtonProps): import("react/jsx-runtime").JSX.Element;
export declare function IconButton(props: {
    svg?: React.FC;
    small?: boolean;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    title?: string;
    toggleState?: boolean;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    'data-id'?: string;
    extraContent?: JSX.Element;
    flex?: boolean | string | number;
    transparent?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export type ToggleButtonProps = {
    style?: React.CSSProperties;
    inline?: boolean;
    className?: string;
    disabled?: boolean;
    label?: string | JSX.Element;
    title?: string;
    icon?: React.FC;
    isSelected?: boolean;
    toggle: () => void;
};
export declare class ToggleButton extends React.PureComponent<ToggleButtonProps> {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class ExpandGroup extends React.PureComponent<{
    children?: any;
    header: string;
    headerStyle?: React.CSSProperties;
    initiallyExpanded?: boolean;
    accent?: boolean;
    noOffset?: boolean;
    marginTop?: 0 | string;
    headerLeftMargin?: string;
}, {
    isExpanded: boolean;
}> {
    state: {
        isExpanded: boolean;
    };
    toggleExpanded: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export type ControlRowProps = {
    title?: string;
    label?: React.ReactNode;
    control?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
};
export declare function ControlRow(props: ControlRowProps): import("react/jsx-runtime").JSX.Element;
export {};
