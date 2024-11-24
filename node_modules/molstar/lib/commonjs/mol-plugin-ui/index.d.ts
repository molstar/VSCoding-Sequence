/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginUIContext } from './context';
import { PluginUISpec } from './spec';
export declare function createPluginUI(options: {
    target: HTMLElement;
    render: (component: any, container: Element) => any;
    spec?: PluginUISpec;
    onBeforeUIRender?: (ctx: PluginUIContext) => (Promise<void> | void);
}): Promise<PluginUIContext>;
