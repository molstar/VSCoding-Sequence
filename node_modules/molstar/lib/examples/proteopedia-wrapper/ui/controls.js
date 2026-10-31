import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as ReactDOM from 'react-dom';
import { PluginContextContainer } from '../../../mol-plugin-ui/plugin';
import { TransformUpdaterControl } from '../../../mol-plugin-ui/state/update-transform';
import { StateElements } from '../helpers';
export function volumeStreamingControls(plugin, parent) {
    ReactDOM.render(_jsx(PluginContextContainer, { plugin: plugin, children: _jsx(TransformUpdaterControl, { nodeRef: StateElements.VolumeStreaming }) }), parent);
}
