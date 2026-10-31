/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { PluginContext } from '../../mol-plugin/context';
export interface ScreenshotPreviewProps {
    plugin: PluginContext;
    suspend?: boolean;
    cropFrameColor?: string;
    borderColor?: string;
    borderWidth?: number;
    customBackground?: string;
}
export declare const ScreenshotPreview: React.MemoExoticComponent<(props: ScreenshotPreviewProps) => import("react/jsx-runtime").JSX.Element>;
