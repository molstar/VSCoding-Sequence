/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { ParamDefinition } from '../../mol-util/param-definition';
export declare class ActionMenu extends React.PureComponent<ActionMenu.Props> {
    hide: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare namespace ActionMenu {
    type Props = {
        items: Items;
        onSelect: OnSelect | OnSelectMany;
        header?: string;
        title?: string;
        current?: Item;
        multiselect?: boolean;
        noOffset?: boolean;
        noAccent?: boolean;
    };
    type OnSelect = (item: Item | undefined, e?: React.MouseEvent<HTMLButtonElement>) => void;
    type OnSelectMany = (itemOrItems: Item[] | undefined, e?: React.MouseEvent<HTMLButtonElement>) => void;
    type Items = Header | Item | Items[];
    type Header = {
        kind: 'header';
        label: string;
        isIndependent?: boolean;
        initiallyExpanded?: boolean;
        description?: string;
    };
    type Item = {
        kind: 'item';
        label: string;
        icon?: React.FC;
        disabled?: boolean;
        selected?: boolean;
        value: unknown;
        addOn?: JSX.Element;
        description?: string;
    };
    function Header(label: string, options?: {
        isIndependent?: boolean;
        initiallyExpanded?: boolean;
        description?: string;
    }): Header;
    function Item(label: string, value: unknown, options?: {
        icon?: React.FC;
        description?: string;
    }): Item;
    interface CreateItemsParams<T> {
        filter?: (t: T) => boolean;
        label?: (t: T) => string;
        value?: (t: T) => any;
        category?: (t: T) => string | undefined;
        icon?: (t: T) => React.FC | undefined;
        selected?: (t: T) => boolean | undefined;
        addOn?: (t: T) => JSX.Element | undefined;
        description?: (t: T) => string | undefined;
    }
    function createItems<T>(xs: ArrayLike<T>, params?: CreateItemsParams<T>): Items[];
    function createItemsFromSelectOptions<O extends ParamDefinition.Select<any>['options']>(options: O, params?: CreateItemsParams<O[0]>): Items[];
    function hasSelectedItem(items: Items): boolean;
    function findItem(items: Items, value: any): Item | undefined;
    function getFirstItem(items: Items): Item | undefined;
}
